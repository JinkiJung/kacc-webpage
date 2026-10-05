(() => {
  let scriptPromise;
  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (!scriptPromise) scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      const timer = setTimeout(() => { script.remove(); scriptPromise = null; reject(new Error('보안 확인 로딩이 지연됩니다. 페이지를 새로고침해 주세요.')); }, 15000);
      script.onload = () => { clearTimeout(timer); window.turnstile ? resolve(window.turnstile) : reject(new Error('위젯 로딩 실패')); };
      script.onerror = () => { clearTimeout(timer); script.remove(); scriptPromise = null; reject(new Error('보안 확인을 불러오지 못했습니다. 페이지를 새로고침해 주세요.')); };
      document.head.append(script);
    });
    return scriptPromise;
  }
  function errorMessage(error) {
    if (error.status === 429) return `요청이 많습니다. 약 ${error.wait || 60}초 후 다시 시도해 주세요.`;
    if (error.status === 400) return '입력 내용이나 목록 요청이 올바르지 않습니다. 내용을 확인하거나 새로고침해 주세요.';
    if (error.status === 413) return '입력 내용이 너무 큽니다.';
    const messages = {
      DELETE_DENIED: '삭제 키가 맞지 않거나 이미 삭제된 글입니다.',
      TURNSTILE_FAILED: '보안 확인을 다시 완료해 주세요.',
      INVALID_INPUT: '이름은 1~40자, 메시지는 1~1,000자로 입력해 주세요.',
      PAYLOAD_TOO_LARGE: '입력 내용이 너무 큽니다.',
      SERVER_CONFIGURATION: '방명록 서비스를 준비 중입니다. 잠시 후 다시 방문해 주세요.',
      GUESTBOOK_UNAVAILABLE: '방명록 서비스를 준비 중입니다. 잠시 후 다시 방문해 주세요.',
      ORIGIN_DENIED: '이 주소에서는 방명록에 접근할 수 없습니다.',
    };
    return messages[error.code] || (error.status >= 500 ? '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.' : '네트워크 연결을 확인한 뒤 다시 시도해 주세요.');
  }
  window.KaccGuestbook = {
    markup() {
      // Static markup only. All server-provided content is inserted with textContent.
      return `<section class="guestbook-sheet kacc-guestbook" aria-label="방명록">
        <p>글을 남기면 삭제 키가 한 번 표시됩니다. 삭제할 때 필요하니 직접 보관해 주세요. 키를 가진 사람은 누구나 글을 삭제할 수 있으며, 분실한 키는 복구할 수 없습니다.</p>
        <div class="guestbook-toolbar"><button type="button" data-refresh>새로고침</button></div>
        <p data-list-status role="status" aria-live="polite"></p><div data-list></div>
        <button type="button" data-more hidden>더 보기</button>
        <form class="mock-form" data-create>
          <h2>한 줄 남기기</h2>
          <label>이름<input name="name" required autocomplete="nickname" placeholder="물길 별명"></label>
          <label>메시지<textarea name="message" required rows="4" placeholder="메시지를 입력하세요."></textarea></label>
          <div data-turnstile></div><p data-widget-status role="status" aria-live="polite"></p>
          <button type="submit" data-submit disabled>글 남기기</button>
          <p data-create-status role="status" aria-live="polite"></p>
        </form>
        <section data-key-panel class="guestbook-key-panel" aria-label="삭제 키 보관" hidden>
          <h2>삭제 키를 보관해 주세요</h2>
          <p>이 창을 닫으면 키를 다시 볼 수 없습니다. 다른 사람에게 공유하지 마세요.</p>
          <label>방금 작성한 글의 삭제 키<input data-created-key readonly autocomplete="off" spellcheck="false"></label>
          <button type="button" data-copy>키 복사</button>
          <button type="button" data-ack>키를 보관했습니다</button>
          <p data-copy-status role="status" aria-live="polite"></p>
        </section>
      </section>`;
    },
    mount(root) {
      const config = window.KACC_GUESTBOOK_CONFIG;
      const controller = new AbortController();
      const find = selector => root.querySelector(selector);
      const list = find('[data-list]'), listStatus = find('[data-list-status]');
      const form = find('[data-create]'), submit = find('[data-submit]'), more = find('[data-more]');
      const refresh = find('[data-refresh]'), createStatus = find('[data-create-status]');
      const keyPanel = find('[data-key-panel]'), keyInput = find('[data-created-key]');
      let cursor = null, token = '', widget, loading = false, posting = false, deleting = 0, alive = true;
      const seen = new Set();
      function updateSubmit() {
        submit.disabled = posting || loading || deleting > 0 || !token || !keyPanel.hidden;
        refresh.disabled = more.disabled = posting || loading || deleting > 0;
      }
      function validEntry(entry) { return entry && typeof entry.id === 'string' && typeof entry.name === 'string' && typeof entry.message === 'string' && typeof entry.createdAt === 'string' && Number.isFinite(Date.parse(entry.createdAt)); }
      const beforeUnload = event => { if (posting || !keyPanel.hidden) { event.preventDefault(); event.returnValue = ''; } };
      window.addEventListener('beforeunload', beforeUnload);
      async function api(path, method = 'GET', value) {
        const response = await fetch(`${config.apiBase}/api/guestbook${path}`, {
          method, headers: value ? { 'Content-Type': 'application/json' } : {},
          body: value ? JSON.stringify(value) : undefined, credentials: 'omit', cache: 'no-store', signal: controller.signal,
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          const error = new Error('API request failed');
          error.status = response.status; error.code = data?.error?.code;
          const seconds = Number(response.headers.get('Retry-After'));
          const dateWait = Math.ceil((Date.parse(response.headers.get('Retry-After')) - Date.now()) / 1000);
          error.wait = Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : dateWait > 0 ? dateWait : 60;
          throw error;
        }
        return response.status === 204 ? null : response.json();
      }
      function entryNode(entry) {
        const article = document.createElement('article'); article.dataset.entryId = entry.id;
        const avatar = document.createElement('div'); avatar.className = 'avatar'; avatar.textContent = '🚣';
        const content = document.createElement('div'); content.className = 'guestbook-entry-content';
        const title = document.createElement('h2'); title.textContent = entry.name;
        const time = document.createElement('time'); time.dateTime = entry.createdAt;
        time.textContent = new Intl.DateTimeFormat('ko-KR',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Seoul'}).format(new Date(entry.createdAt)) + ' KST';
        const message = document.createElement('p'); message.className = 'guestbook-message'; message.textContent = entry.message;
        const details = document.createElement('details');
        const summary = document.createElement('summary'); summary.textContent = '이 글 삭제';
        const deletion = document.createElement('form'); deletion.className = 'guestbook-delete-form';
        const label = document.createElement('label'); label.textContent = '작성할 때 받은 삭제 키';
        const input = document.createElement('input'); input.type = 'password'; input.required = true; input.autocomplete = 'off'; input.spellcheck = false; input.maxLength = 43;
        label.append(input);
        const button = document.createElement('button'); button.type = 'submit'; button.textContent = '삭제';
        const status = document.createElement('p'); status.setAttribute('role','status'); status.setAttribute('aria-live','polite');
        deletion.append(label,button,status); details.append(summary,deletion);
        deletion.addEventListener('submit',async event => {
          event.preventDefault(); if (button.disabled) return;
          const deletionKey = input.value.trim(); input.value = '';
          if (!/^[A-Za-z0-9_-]{43}$/.test(deletionKey)) { status.textContent = '보관한 삭제 키 43자를 입력해 주세요.'; return; }
          if (loading || posting) { status.textContent = '진행 중인 요청이 끝난 뒤 다시 시도해 주세요.'; return; }
          deleting++; updateSubmit(); button.disabled = true; status.textContent = '삭제 중…';
          try {
            await api('/'+encodeURIComponent(entry.id),'DELETE',{deletionKey});
            if (!alive) return;
            article.remove(); seen.delete(entry.id); listStatus.textContent = '글을 삭제했습니다.';
          } catch(error) { if(alive) status.textContent = errorMessage(error); }
          finally { deleting--; if(alive) { button.disabled = false; updateSubmit(); } }
        });
        content.append(title,time,message,details); article.append(avatar,content); return article;
      }
      async function load(reset = false) {
        if(loading || posting || deleting) return;
        loading=true; updateSubmit(); refresh.disabled=true; more.disabled=true; list.setAttribute('aria-busy','true'); listStatus.textContent='방명록을 불러오는 중…';
        try {
          const data=await api('?limit=20'+(!reset && cursor ? '&cursor='+encodeURIComponent(cursor) : ''));
          if(!alive) return;
          if (!Array.isArray(data?.items) || !data.items.every(validEntry) || !(data.nextCursor === null || typeof data.nextCursor === 'string')) throw new Error('Invalid list response');
          if(reset) { list.replaceChildren(); seen.clear(); }
          for(const item of data.items) if(!seen.has(item.id)) { list.append(entryNode(item)); seen.add(item.id); }
          cursor=data.nextCursor; more.hidden=!cursor;
          listStatus.textContent=seen.size ? `${seen.size}개의 글을 표시했습니다.` : '아직 글이 없습니다. 첫 인사를 남겨 주세요.';
        } catch(error) { if(alive) listStatus.textContent=errorMessage(error)+' 새로고침 버튼으로 다시 시도할 수 있습니다.'; }
        finally { loading=false; if(alive) {updateSubmit();refresh.disabled=false;more.disabled=false;list.setAttribute('aria-busy','false');} }
      }
      refresh.addEventListener('click',()=>load(true)); more.addEventListener('click',()=>load());
      form.addEventListener('submit',async event => {
        event.preventDefault(); if(posting || loading || deleting || !keyPanel.hidden) return;
        const name=form.elements.name.value.normalize('NFC').trim(), message=form.elements.message.value.normalize('NFC').trim();
        if(!name || [...name].length>40 || !message || [...message].length>1000) {createStatus.textContent='이름은 1~40자, 메시지는 1~1,000자로 입력해 주세요.';return;}
        if(!token) {createStatus.textContent='보안 확인을 먼저 완료해 주세요.';return;}
        const payload = {name,message,turnstileToken:token};
        if (new TextEncoder().encode(JSON.stringify(payload)).byteLength > 8192) { createStatus.textContent = '입력 내용이 너무 큽니다. 내용을 줄여 주세요.'; return; }
        posting=true;updateSubmit();createStatus.textContent='글을 등록하는 중…';
        try {
          const result=await api('','POST',payload);
          if(!alive) return;
          if (typeof result?.deletionKey !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(result.deletionKey)) throw new Error('Invalid creation response');
          keyInput.value=result.deletionKey; keyPanel.hidden=false; keyInput.focus();
          form.reset(); createStatus.textContent='등록했습니다. 아래 삭제 키를 보관해 주세요.';
          // Keep the new entry visible without racing an outstanding paginated request.
          if(validEntry(result.entry) && !seen.has(result.entry.id)) {list.prepend(entryNode(result.entry));seen.add(result.entry.id);}
          listStatus.textContent=`${seen.size}개의 글을 표시했습니다.`;
        } catch(error) {
          if(alive) createStatus.textContent=errorMessage(error)+(!error.status || error.status>=500 ? ' 등록은 완료됐을 수도 있으니 목록을 확인하세요. 응답을 받지 못한 글의 삭제 키는 복구할 수 없습니다.' : '');
        } finally {
          posting=false;token='';
          if(alive) {
            if(widget!==undefined) {
              try { window.turnstile.reset(widget); }
              catch { find('[data-widget-status]').textContent='보안 확인을 다시 불러오려면 페이지를 새로고침해 주세요.'; }
            }
            updateSubmit();
          }
        }
      });
      find('[data-copy]').addEventListener('click',async()=>{
        if (keyPanel.hidden || !keyInput.value) return;
        try {await navigator.clipboard.writeText(keyInput.value);find('[data-copy-status]').textContent='복사했습니다. 안전한 곳에 붙여넣어 보관해 주세요.';}
        catch {keyInput.focus();keyInput.select();find('[data-copy-status]').textContent='키를 선택했습니다. 직접 복사해 주세요.';}
      });
      find('[data-ack]').addEventListener('click',()=>{keyInput.value='';keyPanel.hidden=true;find('[data-copy-status]').textContent='';createStatus.textContent='삭제 키 보관을 확인했습니다.';updateSubmit();submit.focus();});
      load(true);
      if(!config.turnstileSiteKey) find('[data-widget-status]').textContent='글쓰기 보안 설정을 준비 중입니다. 목록 조회는 사용할 수 있습니다.';
      else loadTurnstile().then(turnstile=>{
        if(!alive)return;
        widget=turnstile.render(find('[data-turnstile]'),{sitekey:config.turnstileSiteKey,action:'guestbook-create',size:'flexible',
          callback:value=>{token=value;find('[data-widget-status]').textContent='보안 확인 완료';updateSubmit();},
          'expired-callback':()=>{token='';updateSubmit();find('[data-widget-status]').textContent='보안 확인이 만료되었습니다. 다시 확인해 주세요.';},
          'error-callback':()=>{token='';updateSubmit();find('[data-widget-status]').textContent='보안 확인에 실패했습니다. 페이지를 새로고침해 주세요.';},
        });
      }).catch(error=>{if(alive)find('[data-widget-status]').textContent=error.message;});
      return () => {alive=false;controller.abort();window.removeEventListener('beforeunload',beforeUnload);if(widget!==undefined)window.turnstile?.remove(widget);keyInput.value='';};
    },
  };
})();
