(function () {
  const STORAGE_KEY = 'kacc-site-data-v2';
  const commonPanel = document.querySelector('#common-panel');
  const themesPanel = document.querySelector('#themes-panel');
  const jsonPreview = document.querySelector('#json-preview');
  const saveState = document.querySelector('#save-state');
  let state;
  let fileData;

  const clone = value => JSON.parse(JSON.stringify(value));
  const normalize = value => {
    delete value.meta.notice;
    delete value.contact;
    const legacyOrganization = value.meta.webmaster === '이수민'
      || value.club?.officers?.some(item => ['김물결', '박노을', '이갈대', '최여울'].includes(item.name));
    if (legacyOrganization) {
      value.meta.webmaster = fileData.meta.webmaster;
      value.meta.description = fileData.meta.description;
      value.meta.established = fileData.meta.established;
      value.club = clone(fileData.club);
      value.announcements = clone(fileData.announcements);
      value.board = clone(fileData.board);
    }
    if (value.meta.description === '카누를 처음 만나는 사람부터 오래 노를 저어 온 사람까지, 물길의 정보와 이야기를 나누는 비영리 취미 모임의 웹사이트 목업입니다.') value.meta.description = fileData.meta.description;
    if (!value.meta.logo || value.meta.logo === 'assets/images/kacc-logo.png') value.meta.logo = fileData.meta.logo;
    value.meta.webmaster ||= fileData.meta.webmaster;
    if (value.meta.email === 'paddle@example.org') value.meta.email = fileData.meta.email;
    const noticePage = value.pages.find(page => page.id === 'board');
    if (noticePage?.label === '공지와 이사회') noticePage.label = '공지';
    if (noticePage?.short === '소식') noticePage.short = '공지';
    value.board ||= clone(fileData.board);
    value.board = value.board.map(item => ({
      ...item,
      category: item.category === '이사회' ? '운영' : item.category,
      body: item.body || '',
      author: item.author || value.meta.webmaster
    }));
    const legacyThemeFields = {
      '01': [['welcomeHeading','welcomeHeading']],
      '02': [['welcomeHeading','welcomeHeading']],
      '03': [['subtitle','heroSubtitle'],['welcomeHeading','welcomeHeading']],
      '06': [['subtitle','greeting'],['welcomeHeading','welcomeHeading']],
      '07': [['welcomeHeading','galleryHeading']],
      '09': [['welcomeHeading','welcomeHeading']],
      '10': [['headerTitle','almanacTitle'],['subtitle','almanacSubtitle'],['welcomeHeading','welcomeHeading']]
    };
    const noticeCopyMigrations = {
      '02': {
        boardHeading: ['회원 게시판', '공지'],
        boardText: ['토요일 오전 천천히 함께 탈 분을 찾습니다.', '새로 문을 연 클럽의 첫 소식을 확인해 주세요.'],
        boardLink: ['게시판 읽기 →', '공지 읽기 →']
      },
      '05': { quickBoard: ['회원 게시판', '공지'] },
      '08': {
        noticeHeading: ['공지사항', '공지'],
        boardHeading: ['이사회 알림', '운영 공지'],
        chairName: ['박정호 회장', '정진기'],
        chairText: ['작업일 결과와 장비 구입 내역을 회원에게 공개합니다.', '회장, 웹마스터, 행동대장은 모두 정진기가 맡습니다.']
      }
    };
    value.themes.forEach(theme => {
      delete theme.name;
      delete theme.reference;
      theme.content ||= {};
      theme.content.frontpage ||= {};
      delete theme.content.frontpage.masthead;
      (legacyThemeFields[theme.id] || []).forEach(([oldKey,newKey]) => {
        if (theme.content[oldKey]) theme.content.frontpage[newKey] = theme.content[oldKey];
      });
      delete theme.content.headerTitle;
      delete theme.content.subtitle;
      delete theme.content.welcomeHeading;
      delete theme.content.footerNote;
      Object.entries(noticeCopyMigrations[theme.id] || {}).forEach(([key, [before, after]]) => {
        if (theme.content.frontpage[key] === before) theme.content.frontpage[key] = after;
      });
      theme.content.photos ||= {};
      const options = window.KACC_THEME_OPTIONS?.[theme.id] || {texts:[],photos:[]};
      options.texts.forEach(([key,,fallback]) => { theme.content.frontpage[key] ??= fallback; });
      options.photos.forEach(([key,,fallback]) => { theme.content.photos[key] ??= fallback; });
    });
    return value;
  };
  const esc = (value = '') => String(value).replace(/[&<>"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[char]);
  const pathAttr = path => esc(JSON.stringify(path));
  const get = path => path.reduce((value, key) => value?.[key], state);
  const set = (path, value) => {
    let target = state;
    path.slice(0, -1).forEach(key => { target = target[key]; });
    target[path[path.length - 1]] = value;
  };

  const objectSections = [
    {
      id:'meta', kicker:'COMMON 01', title:'사이트 기본 정보', note:'사이트 전체와 모든 테마에 공통으로 표시됩니다.', open:true,
      fields:[
        ['siteName','사이트 이름'], ['shortName','짧은 이름'], ['logo','로고 이미지 경로'], ['englishName','영문 이름'], ['webmaster','웹마스터 이름'], ['tagline','한 줄 소개','textarea'],
        ['description','소개문','textarea','full'], ['established','개설 연도'], ['location','활동 지역'], ['email','이메일'],
        ['updated','마지막 갱신일']
      ]
    },
    {
      id:'conditions', kicker:'COMMON 02', title:'오늘의 물길', note:'날씨·수온·운항 카드에서 공통으로 사용합니다.', open:true,
      fields:[
        ['place','장소'], ['status','상태'], ['temperature','기온'], ['waterTemperature','수온'],
        ['wind','바람'], ['waterLevel','수위'], ['visibility','시야'], ['updatedAt','갱신 시각'],
        ['advice','운항 안내','textarea','full']
      ]
    }
  ];

  const arraySchemas = {
    announcements: { kicker:'COMMON 03', title:'공지 요약', note:'첫 화면의 공지 영역에서 사용합니다.', fields:[['date','날짜'],['title','제목'],['body','내용','textarea','full']] },
    events: { kicker:'COMMON 04', title:'행사 일정', note:'모든 달력과 다음 일정 영역에서 사용합니다.', fields:[['date','날짜'],['time','시간'],['title','행사명'],['place','장소'],['note','비고','textarea','full']] },
    photos: { kicker:'COMMON 05', title:'사진', note:'경로는 저장소 루트 기준 상대 경로로 입력합니다.', fields:[['src','이미지 경로'],['alt','대체 텍스트'],['title','사진 제목'],['caption','설명','textarea','full']] },
    features: { kicker:'COMMON 06', title:'핵심 읽을거리', note:'네 개의 주요 콘텐츠 카드입니다.', fields:[['page','연결 페이지','page'],['kicker','작은 분류'],['title','제목'],['summary','요약','textarea','full']] },
    courses: { kicker:'COMMON 08', title:'강습', note:'강습 접수표와 안전 페이지에 사용합니다.', fields:[['name','강습명'],['level','단계'],['duration','소요 시간'],['contents','내용','textarea','full']] },
    resources: { kicker:'COMMON 09', title:'자료실', note:'문서 목록과 회원용 링크에 사용합니다.', fields:[['title','자료명'],['type','형식'],['note','설명','textarea','full']] },
    board: { kicker:'COMMON 10', title:'공지', note:'공지 페이지에 표시할 분류·날짜·제목·내용·작성자를 입력합니다.', fields:[['category','분류'],['date','날짜'],['title','제목','textarea','full'],['body','내용','textarea','full'],['author','작성자']] },
    guestbook: { kicker:'COMMON 11', title:'방명록', note:'초기 웹 스타일의 방명록 항목입니다.', fields:[['name','이름'],['date','날짜'],['message','메시지','textarea','full']] }
  };

  const emptyFor = fields => Object.fromEntries(fields.map(([key]) => [key, '']));

  function field(path, label, type = 'text', width = '') {
    const value = get(path) ?? '';
    const classes = `field ${width === 'full' || type === 'textarea' ? 'full' : ''}`;
    if (type === 'textarea') return `<label class="${classes}"><span>${esc(label)}</span><textarea data-path="${pathAttr(path)}">${esc(value)}</textarea></label>`;
    if (type === 'page') return `<label class="${classes}"><span>${esc(label)}</span><select data-path="${pathAttr(path)}">${state.pages.map(page => `<option value="${esc(page.id)}" ${page.id === value ? 'selected' : ''}>${esc(page.label)}</option>`).join('')}</select></label>`;
    return `<label class="${classes}"><span>${esc(label)}</span><input type="${type}" value="${esc(value)}" data-path="${pathAttr(path)}"></label>`;
  }

  function sectionHeader(section) {
    return `<summary><div><p>${esc(section.kicker)}</p><h2>${esc(section.title)}</h2><span class="section-note">${esc(section.note)}</span></div></summary>`;
  }

  function renderObjectSection(section) {
    return `<details class="data-section" ${section.open ? 'open' : ''}>${sectionHeader(section)}<div class="field-grid">${section.fields.map(([key,label,type,width]) => field([section.id,key],label,type,width)).join('')}</div></details>`;
  }

  function renderArraySection(key, schema) {
    const items = state[key] || [];
    return `<details class="data-section">${sectionHeader(schema)}<div class="repeater">${items.length ? items.map((item,index) => `
      <article class="repeat-card"><h3 class="repeat-title">${esc(item.title || item.name || `${schema.title} ${index + 1}`)}</h3><button type="button" class="remove-item" data-remove="${pathAttr([key,index])}">삭제</button><div class="field-grid">${schema.fields.map(([prop,label,type,width]) => field([key,index,prop],label,type,width)).join('')}</div></article>`).join('') : '<p class="empty-message">아직 항목이 없습니다.</p>'}<button type="button" class="add-item" data-add="${pathAttr([key])}" data-schema="${esc(key)}">＋ ${esc(schema.title)} 추가</button></div></details>`;
  }

  function renderRotation() {
    const rotation = state.rotation;
    return `<details class="data-section">${sectionHeader({kicker:'COMMON 13',title:'테마 로테이션',note:'한국 시간 기준 주간 묶음과 오전·오후 전환 시간입니다.'})}<div class="field-grid">${field(['rotation','timezone'],'시간대')}${field(['rotation','anchorMonday'],'순환 기준 월요일')}${field(['rotation','morningStarts'],'오전 시작')}${field(['rotation','afternoonStarts'],'오후 시작')}</div><div class="repeater"><h3>5주 순환 묶음</h3>${rotation.pairs.map((pair,index) => `<div class="repeat-card"><h3 class="repeat-title">${index + 1}주차</h3><div class="field-grid">${themeSelect(['rotation','pairs',index,0],'오전 테마',pair[0])}${themeSelect(['rotation','pairs',index,1],'오후 테마',pair[1])}</div></div>`).join('')}</div></details>`;
  }

  function themeSelect(path, label, value) {
    return `<label class="field"><span>${esc(label)}</span><select data-path="${pathAttr(path)}">${state.themes.map(theme => `<option value="${theme.id}" ${theme.id === value ? 'selected' : ''}>${theme.id}</option>`).join('')}</select></label>`;
  }

  function photoSelect(path, label, value) {
    return `<label class="field"><span>${esc(label)}</span><select data-path="${pathAttr(path)}">${state.photos.map((photo,index) => `<option value="${index}" ${Number(value) === index ? 'selected' : ''}>${index + 1}. ${esc(photo.title || photo.alt)}</option>`).join('')}</select></label>`;
  }

  function renderClub() {
    const club = state.club;
    return `<details class="data-section">${sectionHeader({kicker:'COMMON 07',title:'클럽 소개',note:'소개문, 운영 원칙과 담당자를 편집합니다.'})}<div class="field-grid">${field(['club','intro'],'클럽 소개문','textarea','full')}</div><div class="repeater"><h3>운영 원칙</h3>${club.principles.map((item,index) => `<article class="repeat-card"><button type="button" class="remove-item" data-remove="${pathAttr(['club','principles',index])}">삭제</button>${field(['club','principles',index],`원칙 ${index + 1}`,'textarea','full')}</article>`).join('')}<button type="button" class="add-item" data-add="${pathAttr(['club','principles'])}" data-schema="string">＋ 원칙 추가</button></div><div class="repeater"><h3>담당자</h3>${club.officers.map((item,index) => `<article class="repeat-card"><button type="button" class="remove-item" data-remove="${pathAttr(['club','officers',index])}">삭제</button><div class="field-grid">${field(['club','officers',index,'role'],'역할')}${field(['club','officers',index,'name'],'이름')}${field(['club','officers',index,'note'],'담당 내용','textarea','full')}</div></article>`).join('')}<button type="button" class="add-item" data-add="${pathAttr(['club','officers'])}" data-schema="officer">＋ 담당자 추가</button></div></details>`;
  }

  function renderArticles() {
    return `<details class="data-section">${sectionHeader({kicker:'COMMON 14',title:'상세 읽을거리',note:'옛 이야기·런치 포인트·사계절·카누와 카약 상세 본문입니다.'})}${Object.entries(state.articles).map(([key,article]) => `<article class="article-block"><h3>${esc(article.title)}</h3><div class="field-grid">${field(['articles',key,'title'],'페이지 제목')}${field(['articles',key,'lead'],'도입문','textarea','full')}</div><div class="repeater">${article.sections.map((section,index) => `<article class="repeat-card"><button type="button" class="remove-item" data-remove="${pathAttr(['articles',key,'sections',index])}">삭제</button><div class="field-grid">${field(['articles',key,'sections',index,'heading'],'소제목')}${field(['articles',key,'sections',index,'body'],'본문','textarea','full')}</div></article>`).join('')}<button type="button" class="add-item" data-add="${pathAttr(['articles',key,'sections'])}" data-schema="articleSection">＋ 본문 단락 추가</button></div></article>`).join('')}</details>`;
  }

  function renderPages() {
    return `<details class="data-section">${sectionHeader({kicker:'COMMON 00',title:'페이지와 메뉴 이름',note:'모든 테마의 메뉴와 상세 페이지 제목에 공통으로 사용합니다.'})}<div class="repeater">${state.pages.map((page,index) => `<article class="repeat-card"><h3 class="repeat-title">${esc(page.id)}</h3><div class="field-grid">${field(['pages',index,'label'],'전체 페이지 이름')}${field(['pages',index,'short'],'메뉴의 짧은 이름')}</div></article>`).join('')}</div></details>`;
  }

  function renderCommon() {
    commonPanel.innerHTML = objectSections.map(renderObjectSection).join('')
      + renderPages()
      + Object.entries(arraySchemas).slice(0,4).map(([key,schema]) => renderArraySection(key,schema)).join('')
      + renderClub()
      + Object.entries(arraySchemas).slice(4).map(([key,schema]) => renderArraySection(key,schema)).join('')
      + renderArticles()
      + renderRotation();
  }

  function renderThemes() {
    themesPanel.innerHTML = `<div class="section-head"><div><p>THEME-SPECIFIC</p><h2>10개 테마별 데이터</h2></div></div><p class="section-note">사이트 이름·한 줄 소개·소개문·활동 지역·웹마스터·공지·일정·사진 원본은 공용 데이터를 모든 테마가 그대로 재사용합니다. 여기에는 디자인마다 다른 문구, 사진 배치와 메뉴만 있습니다.</p>${state.themes.map((theme,index) => {
      const options = window.KACC_THEME_OPTIONS?.[theme.id] || {texts:[],photos:[]};
      return `<article class="theme-card"><header><b>${theme.id}</b></header><div class="theme-body"><h3>프론트페이지 고유 문구</h3><div class="field-grid">${options.texts.map(([key,label]) => field(['themes',index,'content','frontpage',key],label,'textarea')).join('')}</div><h3>프론트페이지 사진 배치</h3><div class="field-grid">${options.photos.map(([key,label]) => photoSelect(['themes',index,'content','photos',key],label,theme.content.photos[key])).join('')}</div><h3>이 테마의 상단 메뉴</h3><div class="menu-checks">${state.pages.map(page => `<label><input type="checkbox" data-theme-menu="${index}" value="${esc(page.id)}" ${theme.menu.includes(page.id) ? 'checked' : ''}>${esc(page.short)}</label>`).join('')}</div></div></article>`;
    }).join('')}`;
  }

  function renderJson() {
    jsonPreview.textContent = JSON.stringify(state, null, 2);
  }

  function renderAll() {
    renderCommon();
    renderThemes();
    renderJson();
  }

  function markChanged() {
    saveState.className = 'save-state changed';
    saveState.textContent = '저장하지 않은 변경이 있습니다.';
    renderJson();
  }

  document.addEventListener('input', event => {
    const input = event.target.closest('[data-path]');
    if (!input) return;
    set(JSON.parse(input.dataset.path), input.value);
    markChanged();
  });

  document.addEventListener('change', event => {
    const input = event.target.closest('[data-path]');
    if (input) {
      set(JSON.parse(input.dataset.path), input.value);
      markChanged();
    }
    const menu = event.target.closest('[data-theme-menu]');
    if (menu) {
      const theme = state.themes[Number(menu.dataset.themeMenu)];
      theme.menu = menu.checked ? [...new Set([...theme.menu, menu.value])] : theme.menu.filter(id => id !== menu.value);
      markChanged();
    }
  });

  document.addEventListener('click', event => {
    const add = event.target.closest('[data-add]');
    const remove = event.target.closest('[data-remove]');
    if (add) {
      const path = JSON.parse(add.dataset.add);
      const target = get(path);
      const schema = add.dataset.schema;
      const value = schema === 'string' ? '' : schema === 'officer' ? {role:'',name:'',note:''} : schema === 'articleSection' ? {heading:'',body:''} : emptyFor(arraySchemas[schema].fields);
      target.push(value);
      renderAll(); markChanged();
    }
    if (remove) {
      const path = JSON.parse(remove.dataset.remove);
      const parent = get(path.slice(0,-1));
      parent.splice(Number(path[path.length-1]),1);
      renderAll(); markChanged();
    }
  });

  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-tab]').forEach(item => item.classList.toggle('active', item === button));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelector(`#${button.dataset.tab}-panel`).classList.add('active');
    if (button.dataset.tab === 'json') renderJson();
  }));

  document.querySelector('#save-data').addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    saveState.className = 'save-state saved';
    saveState.textContent = `저장 완료 · ${new Intl.DateTimeFormat('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())} · 열려 있는 사이트에 즉시 반영됩니다.`;
  });

  document.querySelector('#download-data').addEventListener('click', () => {
    const blob = new Blob([`${JSON.stringify(state,null,2)}\n`], {type:'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'site-data.json';
    link.click();
    URL.revokeObjectURL(link.href);
  });

  document.querySelector('#copy-json').addEventListener('click', async () => {
    await navigator.clipboard.writeText(JSON.stringify(state,null,2));
    saveState.className = 'save-state saved';
    saveState.textContent = 'JSON을 클립보드에 복사했습니다.';
  });

  document.querySelector('#import-data').addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed.meta || !Array.isArray(parsed.themes) || !Array.isArray(parsed.pages)) throw new Error('필수 데이터가 없습니다.');
        state = normalize(parsed); renderAll(); markChanged();
      } catch (error) {
        saveState.className = 'save-state error';
        saveState.textContent = `불러오기 실패: ${error.message}`;
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  });

  document.querySelector('#reset-data').addEventListener('click', () => {
    if (!confirm('브라우저에 저장한 편집본을 지우고 저장소의 site-data.json으로 돌아갈까요?')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = normalize(clone(fileData));
    renderAll();
    saveState.className = 'save-state saved';
    saveState.textContent = '브라우저 저장본을 지우고 원본으로 돌아왔습니다.';
  });

  fetch('site-data.json', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
    .then(json => {
      fileData = json;
      state = normalize(clone(json));
      renderAll();
      saveState.className = 'save-state saved';
      saveState.textContent = '저장소의 site-data.json을 초기값으로 불러왔습니다.';
    })
    .catch(error => {
      saveState.className = 'save-state error';
      saveState.textContent = `데이터를 열 수 없습니다: ${error.message}`;
    });
})();
