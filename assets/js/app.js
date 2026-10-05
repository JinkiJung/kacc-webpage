(() => {
  const STORAGE_KEY = 'kacc-site-data-v2';
  const app = document.querySelector('#app');
  const themeSelect = document.querySelector('#theme-select');
  const pageSelect = document.querySelector('#page-select');
  const autoButton = document.querySelector('#auto-theme');
  const rotationStatus = document.querySelector('#rotation-status');
  const params = new URLSearchParams(location.search);
  let data;
  let destroyGuestbook;

  const esc = (value = '') => String(value).replace(/[&<>"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  })[char]);

  const pageMap = () => Object.fromEntries(data.pages.map(page => [page.id, page]));
  const currentPage = () => pageMap()[params.get('page')] ? params.get('page') : 'home';
  const pad = value => String(value).padStart(2, '0');

  function seoulParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: data.rotation.timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hourCycle: 'h23', weekday: 'short'
    }).formatToParts(date);
    return Object.fromEntries(parts.map(part => [part.type, part.value]));
  }

  function autoTheme(date = new Date()) {
    const p = seoulParts(date);
    const localMs = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
    const daysSinceMonday = (weekday + 6) % 7;
    let mondayOne = Date.UTC(+p.year, +p.month - 1, +p.day - daysSinceMonday, 1, 0, 0);
    if (daysSinceMonday === 0 && +p.hour < 1) mondayOne -= 7 * 86400000;
    const anchor = new Date(data.rotation.anchorMonday);
    const a = seoulParts(anchor);
    const anchorLocal = Date.UTC(+a.year, +a.month - 1, +a.day, 1, 0, 0);
    const week = Math.floor((mondayOne - anchorLocal) / (7 * 86400000));
    const pairIndex = ((week % data.rotation.pairs.length) + data.rotation.pairs.length) % data.rotation.pairs.length;
    const period = +p.hour >= 13 || +p.hour < 1 ? 1 : 0;
    return {
      id: data.rotation.pairs[pairIndex][period],
      pairIndex,
      period: period ? '오후' : '오전',
      clock: `${p.year}.${p.month}.${p.day} ${pad(p.hour)}:${p.minute} KST`,
      localMs
    };
  }

  function selectedTheme() {
    const requested = params.get('theme');
    return data.themes.find(theme => theme.id === requested) || data.themes.find(theme => theme.id === autoTheme().id);
  }

  function route(page, label, className = '') {
    const next = new URLSearchParams();
    const fixedTheme = params.get('theme');
    if (fixedTheme) next.set('theme', fixedTheme);
    if (page !== 'home') next.set('page', page);
    const query = next.toString();
    return `<a class="${className}" href="${query ? `?${query}` : './'}">${esc(label)}</a>`;
  }

  const photo = (item, index = 0) => `
    <figure class="photo-card photo-${index + 1}">
      <a href="${routeHref('gallery')}"><img src="${esc(item.src)}" alt="${esc(item.alt)}"></a>
      <figcaption><strong>${esc(item.title)}</strong><span>${esc(item.caption)}</span></figcaption>
    </figure>`;

  function routeHref(page) {
    const next = new URLSearchParams();
    if (params.get('theme')) next.set('theme', params.get('theme'));
    if (page !== 'home') next.set('page', page);
    return next.toString() ? `?${next}` : './';
  }

  function renderHeader(theme) {
    const menuPages = pageMap();
    const nav = theme.menu.map(id => route(id, menuPages[id].short, currentPage() === id ? 'active' : '')).join('');
    return `
      <header class="site-header">
        <div class="masthead-mark" aria-hidden="true">K<br>A<br>C<br>C</div>
        <div class="masthead-copy">
          <p class="eyebrow">${esc(data.meta.englishName)} · since ${esc(data.meta.established)}</p>
          <h1>${route('home', data.meta.siteName)}</h1>
          <p class="tagline">${esc(data.meta.tagline)}</p>
        </div>
      </header>
      <nav class="theme-nav" aria-label="주 메뉴">${nav}</nav>`;
  }

  function renderHero() {
    return `
      <section class="hero">
        <img src="${esc(data.photos[0].src)}" alt="${esc(data.photos[0].alt)}">
        <div class="hero-copy">
          <p class="eyebrow">오늘도 물 위에서 만나요</p>
          <h2>${esc(data.meta.tagline)}</h2>
          <p>${esc(data.meta.description)}</p>
          ${route('club', '모임을 소개합니다 →', 'text-link')}
        </div>
      </section>`;
  }

  function renderConditions() {
    const c = data.conditions;
    return `
      <section class="module conditions-module">
        <div class="module-heading"><p>River Desk</p><h2>오늘의 물길</h2></div>
        <div class="status-stamp">${esc(c.status)}</div>
        <dl class="condition-grid">
          <div><dt>장소</dt><dd>${esc(c.place)}</dd></div>
          <div><dt>기온 / 수온</dt><dd>${esc(c.temperature)} / ${esc(c.waterTemperature)}</dd></div>
          <div><dt>바람</dt><dd>${esc(c.wind)}</dd></div>
          <div><dt>수위 / 시야</dt><dd>${esc(c.waterLevel)} / ${esc(c.visibility)}</dd></div>
        </dl>
        <p class="advice">${esc(c.advice)} <small>${esc(c.updatedAt)} 갱신</small></p>
      </section>`;
  }

  function renderAnnouncements() {
    return `
      <section class="module notice-module">
        <div class="module-heading"><p>Club Notice</p><h2>공지</h2></div>
        <ul class="lined-list">${data.announcements.map(item => `
          <li><time>${esc(item.date)}</time><div><b>${esc(item.title)}</b><span>${esc(item.body)}</span></div></li>`).join('')}</ul>
        ${route('board', '공지 전체 보기 →', 'more-link')}
      </section>`;
  }

  function renderEvents() {
    return `
      <section class="module events-module">
        <div class="module-heading"><p>Calendar</p><h2>다가오는 일정</h2></div>
        <ol class="event-list">${data.events.slice(0, 3).map(item => `
          <li><time>${esc(item.date)}<small>${esc(item.time)}</small></time><div><b>${esc(item.title)}</b><span>${esc(item.place)} · ${esc(item.note)}</span></div></li>`).join('')}</ol>
        ${route('events', '행사 달력 펼치기 →', 'more-link')}
      </section>`;
  }

  function renderFeatures() {
    return `
      <section class="module feature-module">
        <div class="module-heading"><p>Water Stories</p><h2>물길 읽을거리</h2></div>
        <div class="feature-grid">${data.features.map((item, index) => `
          <article class="feature-card"><span class="feature-number">0${index + 1}</span><p>${esc(item.kicker)}</p><h3>${esc(item.title)}</h3><p>${esc(item.summary)}</p>${route(item.page, '읽어보기 →')}</article>`).join('')}</div>
      </section>`;
  }

  function renderGallery(limit = 4) {
    return `
      <section class="module gallery-module">
        <div class="module-heading"><p>Photo Album</p><h2>사진으로 보는 우리의 강</h2></div>
        <div class="photo-grid">${data.photos.slice(0, limit).map(photo).join('')}</div>
        ${route('gallery', '사진첩 더 보기 →', 'more-link')}
      </section>`;
  }

  function renderResources() {
    return `
      <section class="module resource-module">
        <div class="module-heading"><p>Club Cabinet</p><h2>강습과 자료함</h2></div>
        <div class="resource-columns">
          <div><h3>강습</h3>${data.courses.slice(0, 2).map(item => `<p><b>${esc(item.name)}</b><span>${esc(item.level)} · ${esc(item.duration)}</span></p>`).join('')}${route('courses', '강습 전체 →')}</div>
          <div><h3>자료</h3>${data.resources.slice(0, 2).map(item => `<p><b>${esc(item.title)}</b><span>${esc(item.type)}</span></p>`).join('')}${route('resources', '자료함 전체 →')}</div>
        </div>
      </section>`;
  }

  function renderGuestbook() {
    const entry = data.guestbook[0];
    return `
      <section class="module guestbook-module">
        <div class="pixel-paddler" aria-hidden="true">🚣</div>
        <div><p class="module-kicker">Guest Book</p><blockquote>“${esc(entry.message)}”</blockquote><p>— ${esc(entry.name)}, ${esc(entry.date)}</p>${route('guestbook', '방명록에 들르기 →')}</div>
      </section>`;
  }

  function renderHome() {
    return `<main id="main-content" class="home-grid">${renderHero()}${renderConditions()}${renderAnnouncements()}${renderEvents()}${renderFeatures()}${renderGallery()}${renderResources()}${renderGuestbook()}</main>`;
  }

  function articlePage(id) {
    const article = data.articles[id];
    return `<div class="article-lead"><p>${esc(article.lead)}</p></div><div class="article-sections">${article.sections.map((section, index) => `
      <section><span>0${index + 1}</span><h2>${esc(section.heading)}</h2><p>${esc(section.body)}</p></section>`).join('')}</div>`;
  }

  function eventsPage() {
    return `<div class="calendar-sheet">${data.events.map(item => `<article><time>${esc(item.date)}<small>${esc(item.time)}</small></time><div><h2>${esc(item.title)}</h2><p>${esc(item.place)} · ${esc(item.note)}</p></div></article>`).join('')}</div>`;
  }

  function galleryPage() {
    return `<div class="photo-grid full-gallery">${data.photos.map(photo).join('')}</div>`;
  }

  function clubPage() {
    return `<p class="large-intro">${esc(data.club.intro)}</p><div class="principle-grid">${data.club.principles.map((item, i) => `<div><b>0${i + 1}</b><p>${esc(item)}</p></div>`).join('')}</div><h2>클럽을 돌보는 사람들</h2><div class="people-grid">${data.club.officers.map(item => `<article><p>${esc(item.role)}</p><h3>${esc(item.name)}</h3><span>${esc(item.note)}</span></article>`).join('')}</div>`;
  }

  function conditionsPage() {
    return `${renderConditions()}<section class="reading-guide"><h2>물에 나가기 전 세 번 읽기</h2><ol><li><b>집에서</b> 기상과 수위, 해 지는 시간을 확인합니다.</li><li><b>물가에서</b> 실제 바람, 유속과 장애물을 다시 봅니다.</li><li><b>출발 직전</b> 동료와 회항 기준, 연락 방법을 소리 내 확인합니다.</li></ol></section>`;
  }

  function coursesPage() {
    return `<div class="course-list">${data.courses.map((item, i) => `<article><span>0${i + 1}</span><div><p>${esc(item.level)} · ${esc(item.duration)}</p><h2>${esc(item.name)}</h2><p>${esc(item.contents)}</p></div></article>`).join('')}</div>`;
  }

  function resourcesPage() {
    return `<div class="document-list">${data.resources.map((item, i) => `<article><span>DOC ${pad(i + 1)}</span><h2>${esc(item.title)}</h2><p>${esc(item.type)} · ${esc(item.note)}</p></article>`).join('')}</div>`;
  }

  function boardPage() {
    return `<div class="notice-list">${data.board.map(item => `<article class="notice-entry"><div class="notice-meta"><span>${esc(item.category)}</span><time>${esc(item.date)}</time></div><h2>${esc(item.title)}</h2><p>${esc(item.body)}</p><small>작성자 ${esc(item.author)}</small></article>`).join('')}</div>`;
  }

  function guestbookPage() { return window.KaccGuestbook.markup(); }

  function contactPage() {
    return `<div class="contact-card"><p class="contact-email"><a href="mailto:${esc(data.meta.email)}">${esc(data.meta.email)}</a></p><p>이메일을 보내주시면 확인 후 연락드리겠습니다.</p></div>`;
  }

  function pageBody(id) {
    if (data.articles[id]) return articlePage(id);
    return ({
      club: clubPage,
      conditions: conditionsPage,
      events: eventsPage,
      gallery: galleryPage,
      courses: coursesPage,
      resources: resourcesPage,
      board: boardPage,
      guestbook: guestbookPage,
      contact: contactPage
    }[id] || clubPage)();
  }

  function renderSubpageContent(id) {
    const page = pageMap()[id];
    const hideCompanionGallery = id === 'contact' || (id === 'gallery' && selectedTheme().id === '01');
    const gallery = hideCompanionGallery ? '' : `<section class="sub-gallery"><h2>함께 보는 사진</h2><div class="photo-grid">${data.photos.slice(0, 3).map(photo).join('')}</div></section>`;
    return `<header class="page-title"><p>${esc(page.short)} / KACC ARCHIVE</p><h1>${esc(page.label)}</h1><span>공통 콘텐츠 · 현재 테마의 조판</span></header>${pageBody(id)}${gallery}`;
  }

  function renderFooter() {
    return `<footer class="site-footer"><div><b>${esc(data.meta.siteName)}</b></div><nav aria-label="전체 페이지">${data.pages.map(page => route(page.id, page.short)).join('')}</nav><p>마지막 갱신 ${esc(data.meta.updated)} · ${esc(data.meta.email)}</p></footer>`;
  }

  function setupControls(theme) {
    themeSelect.innerHTML = data.themes.map(item => `<option value="${item.id}" ${item.id === theme.id ? 'selected' : ''}>${item.id}</option>`).join('');
    pageSelect.innerHTML = data.pages.map(item => `<option value="${item.id}" ${item.id === currentPage() ? 'selected' : ''}>${esc(item.label)}</option>`).join('');
    themeSelect.onchange = () => setRoute(themeSelect.value, pageSelect.value);
    pageSelect.onchange = () => setRoute(params.get('theme'), pageSelect.value);
    autoButton.onclick = () => setRoute(null, pageSelect.value);
    updateRotationLabel();
  }

  function setRoute(theme, page) {
    const next = new URLSearchParams();
    if (theme) next.set('theme', theme);
    if (page && page !== 'home') next.set('page', page);
    location.search = next.toString();
  }

  function updateRotationLabel() {
    const auto = autoTheme();
    const fixed = params.get('theme');
    rotationStatus.textContent = fixed
      ? `수동 ${fixed} · 자동은 ${auto.id} (${auto.period})`
      : `자동 ${auto.id} · ${auto.period} · ${auto.clock}`;
  }

  function render() {
    destroyGuestbook?.();
    const theme = selectedTheme();
    const legacy = window.createLegacyRenderer(data, { route, esc });
    document.body.dataset.theme = theme.id;
    document.body.className = legacy.themeClass(theme.id);
    document.title = `${currentPage() === 'home' ? theme.id : pageMap()[currentPage()].label} — ${data.meta.siteName}`;
    app.innerHTML = currentPage() === 'home'
      ? legacy.home(theme.id)
      : legacy.subpage(theme.id, renderSubpageContent(currentPage()));
    if (currentPage() === 'guestbook') destroyGuestbook = window.KaccGuestbook.mount(app.querySelector('.kacc-guestbook'));
    setupControls(theme);
    setInterval(updateRotationLabel, 30000);
  }

  fetch('site-data.json?v=10')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(json => {
      const saved = localStorage.getItem(STORAGE_KEY);
      data = saved ? JSON.parse(saved) : json;
      delete data.meta.notice;
      delete data.contact;
      const legacyOrganization = data.meta.webmaster === '이수민'
        || data.club?.officers?.some(item => ['김물결', '박노을', '이갈대', '최여울'].includes(item.name));
      if (legacyOrganization) {
        data.meta.webmaster = json.meta.webmaster;
        data.meta.description = json.meta.description;
        data.meta.established = json.meta.established;
        data.club = json.club;
        data.announcements = json.announcements;
        data.board = json.board;
      }
      const noticePage = data.pages.find(page => page.id === 'board');
      if (noticePage?.label === '공지와 이사회') noticePage.label = '공지';
      if (noticePage?.short === '소식') noticePage.short = '공지';
      if (data.meta.webmaster === '이수민') data.meta.webmaster = '정진기';
      if (data.meta.established === '1998') data.meta.established = '2026';
      if (data.announcements?.some(item => ['10월 이사회 알림', '한국 아마추어 카누 클럽 창립 안내'].includes(item.title))) data.announcements = json.announcements;
      if (data.board?.some(item => item.category === '이사회' || item.title === '한국 아마추어 카누 클럽이 문을 열었습니다')) data.board = json.board;
      data.board = (data.board || json.board).map(item => ({
        ...item,
        body: item.body || '',
        author: item.author || data.meta.webmaster
      }));
      if (!Array.isArray(data.photos) || data.photos.some(photo => photo.src?.startsWith('assets/photos/'))) data.photos = json.photos;
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
      data.themes.forEach(theme => {
        delete theme.name;
        delete theme.reference;
        if (!theme.content) return;
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
      });
      if (data.meta.description === '카누를 처음 만나는 사람부터 오래 노를 저어 온 사람까지, 물길의 정보와 이야기를 나누는 비영리 취미 모임의 웹사이트 목업입니다.') data.meta.description = json.meta.description;
      render();
    })
    .catch(error => {
      app.innerHTML = `<main class="load-error"><h1>데이터를 열 수 없습니다</h1><p>이 사이트는 로컬 웹 서버에서 열어야 합니다. <code>./serve.command</code>를 실행한 뒤 <code>http://localhost:5174</code>로 접속해 주세요.</p><small>${esc(error.message)}</small></main>`;
    });

  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY) return;
    location.reload();
  });
})();
