(function () {
  const classByTheme = {
    '01': 's01', '02': 's02', '03': 's03', '04': 's05', '05': 's06',
    '06': 's12', '07': 's13', '08': 's14', '09': 's16', '10': 's17'
  };

  window.createLegacyRenderer = function (source, helpers) {
    const { route, esc } = helpers;
    const D = {
      name: source.meta.siteName,
      shortName: source.meta.shortName,
      englishName: source.meta.englishName,
      welcome: source.meta.description,
      tagline: source.meta.tagline,
      location: source.meta.location,
      established: source.meta.established,
      updated: source.meta.updated,
      visitors: '018427',
      email: source.meta.email,
      webmaster: source.meta.webmaster,
      photos: source.photos,
      weather: {
        air: source.conditions.temperature,
        water: source.conditions.waterTemperature,
        wind: source.conditions.wind,
        level: `수위 ${source.conditions.waterLevel}`,
        notice: source.conditions.advice
      },
      news: source.announcements.map(item => ({ title: item.title, date: item.date, summary: item.body })),
      events: source.events,
      memberLinks: source.resources.map(item => item.title),
      beginnerLinks: source.features.map(item => item.title),
      documents: source.resources.map(item => `${item.title}.pdf`),
      courses: source.courses.map((item, index) => ({
        name: item.name,
        date: source.events[index % source.events.length].date,
        fee: '회원 무료',
        seats: index === 0 ? '정원 8명' : '접수 중'
      }))
    };

    const p = index => D.photos[index];
    const themeCopy = id => source.themes.find(theme => theme.id === id)?.content || {};
    const option = (id, type, key) => (window.KACC_THEME_OPTIONS?.[id]?.[type] || []).find(item => item[0] === key)?.[2];
    const front = (id, key, fallback = '') => themeCopy(id).frontpage?.[key] ?? option(id, 'texts', key) ?? fallback;
    const photoIndex = (id, key, fallback = 0) => Number(themeCopy(id).photos?.[key] ?? option(id, 'photos', key) ?? fallback);
    const img = (index, className = '') => `<img class="${className}" src="${esc(p(index).src)}" alt="${esc(p(index).alt)}">`;
    const themeImg = (id, key, fallback, className = '') => img(photoIndex(id, key, fallback), `${className} theme-photo`.trim());
    const logo = (className = 'club-logo') => `<img class="${className}" src="${esc(source.meta.logo || 'assets/images/kacc-logo.png')}" alt="${esc(D.name)} 로고">`;
    const navItems = [
      ['home', '시작페이지'], ['club', '회원 가입'], ['launch-points', '카누 런치 포인트'],
      ['seasons', '계절별 카누'], ['canoe-vs-kayak', '카누와 카약 차이'],
      ['board', '공지'], ['courses', '장비와 안전'],
      ['gallery', '활동 사진'], ['guestbook', '방명록'], ['contact', '연락처']
    ];
    const navLabel = (page, fallback) => source.pages.find(item => item.id === page)?.short || fallback;
    const navLinks = (items = navItems) => items.map(([page, label]) => route(page, navLabel(page, label))).join('');
    const newsLinks = (limit = 5) => D.news.slice(0, limit).map(item => `<li>${route('board', item.title)} <small>${esc(item.date)}</small></li>`).join('');
    const eventRows = (limit = 4) => D.events.slice(0, limit).map(item => `<li><strong>${esc(item.date)}</strong> ${route('events', item.title)}<br><small>${esc(item.time)} · ${esc(item.place)}</small></li>`).join('');
    const gallery = (themeId, title = front(themeId, 'galleryHeading', '활동 갤러리')) => {
      const indexes = ['gallery1','gallery2','gallery3','gallery4'].map((key, order) => photoIndex(themeId, key, [1,3,2,5][order]));
      return `<section class="shared-gallery"><h2>${esc(title)}</h2><div class="gallery-grid">${indexes.map((index, order) => `<figure>${img(index)}<figcaption>${order + 1}. ${esc(p(index).caption)}</figcaption></figure>`).join('')}</div><p>${route('gallery', front(themeId, 'galleryLink', '사진첩 전체 보기 →'))}</p></section>`;
    };
    const courseDesk = () => D.courses.map(item => `<div><b>${esc(item.name)}</b><br>${esc(item.date)}<br>${esc(item.fee)}<br><em>${esc(item.seats)}</em>${route('courses', '신청')}</div>`).join('');
    const pageHeading = content => `<div class="legacy-subpage-body">${content}</div>`;

    const homes = {
      '01': () => `
        <a class="skip" href="#main-content">본문 바로가기</a>
        <div class="page"><aside class="side"><div class="tiny-logo">${logo()}</div><nav class="nav">${navLinks()}</nav></aside>
        <main id="main-content"><div class="banner">${esc(D.name)}</div>${themeImg('01','portrait',1,'portrait')}<h1>${esc(front('01','welcomeHeading','우리 홈페이지에 오신 것을 환영합니다'))}</h1><p>${esc(D.welcome)}</p><p class="signature">${esc(front('01','webmasterRole','웹마스터'))} ${esc(D.webmaster)}<br>${esc(D.location)}</p>
        <section class="news"><div>${themeImg('01','news',2)}<p class="photo-caption">${esc(p(photoIndex('01','news',2)).caption)}</p></div><div><h2>${esc(front('01','newsHeading','최근 소식'))}</h2><ul>${newsLinks()}</ul></div></section>
        <h2>${esc(front('01','clubHeading','우리 모임은'))}</h2><p>${esc(source.club.intro)} ${route('stories', front('01','clubStoryLink','클럽의 옛날 이야기 보기'))}</p>
        <h2>${esc(front('01','eventsHeading','다음 정기 패들'))}</h2><ul>${eventRows(3)}</ul>${gallery('01')}<footer>${esc(front('01','footerOpened','처음 문을 연 날'))} ${esc(D.established)} · ${esc(front('01','footerUpdated','마지막 손질'))} ${esc(D.updated)} · ${esc(front('01','footerVisitors','방문자'))} ${D.visitors}</footer></main></div>`,

      '02': () => `
        <main id="main-content" class="wrap"><center class="legacy-center legacy-center-top"><div class="guestbook-title"><span class="devil">${logo()}</span><h1>${esc(D.englishName)}</h1></div><p class="clubname">${esc(D.name)}</p><div class="road"></div>
        <div class="big-links">${route('club', '회원 가입')}${route('launch-points', '카누 런치 포인트')}${route('seasons', '계절별 카누')}${route('canoe-vs-kayak', '카누와 카약 차이')}</div>
        <div class="road"></div></center>
        <center class="legacy-center legacy-center-main"><section class="sundet-cards"><article><h3>${esc(front('02','riverHeading','오늘의 강'))}</h3><p>기온 ${esc(D.weather.air)}<br>수온 ${esc(D.weather.water)}<br>바람 ${esc(D.weather.wind)}</p></article><article><h3>${esc(front('02','nextHeading','다음 모임'))}</h3><p><strong>${esc(D.events[0].date)}</strong><br>${esc(D.events[0].title)}<br>${esc(D.events[0].time)}</p></article><article><h3>${esc(front('02','boardHeading','공지'))}</h3><p>${esc(front('02','boardText','새로 문을 연 클럽의 첫 소식을 확인해 주세요.'))}</p>${route('board', front('02','boardLink','공지 읽기 →'))}</article></section>
        <h2>${esc(front('02','welcomeHeading','이번 주 강가에서 만나요!'))}</h2><p class="notice">${esc(D.welcome)}<br><strong>${esc(D.weather.notice)}</strong></p>${themeImg('02','feature',4,'photo')}<p>${esc(p(photoIndex('02','feature',4)).caption)}</p>
        <h2>${esc(front('02','meetingHeading','다음 모임'))}</h2><table>${D.events.map(item => `<tr><td>${esc(item.date)}</td><td>${route('events', item.title)}</td><td>${esc(item.time)}</td></tr>`).join('')}</table>${gallery('02')}
        <div class="road"></div><p>${route('guestbook', front('02','guestbookLink','회원 이름을 남겨 주세요!'))}<br>${route('courses', front('02','beginnerLink','처음 타는 분도 환영합니다.'))}</p><p class="statusline">온라인 시작: ${esc(D.established)} / 마지막 수정: ${esc(D.updated)}</p></center></main>`,

      '03': () => `
        <div class="shell"><header class="hero">${themeImg('03','hero',0)}<div class="hero-brand">${logo('theme-logo')}<div><h1>${esc(D.name)}</h1><p>${esc(front('03','heroSubtitle','… 한강 북쪽의 작은 카누 모임 …'))}</p></div></div></header>
        <div class="columns"><aside><nav class="leftnav">${navLinks(navItems.slice(0, 5))}</nav><section class="schedule"><h3 class="redbar">${esc(front('03','scheduleHeading','우리의 다음 일정'))}</h3><div class="boxbody"><ul class="plain-list">${eventRows(3)}</ul></div></section></aside>
        <main id="main-content" class="main"><h2>${esc(front('03','welcomeHeading','환영합니다'))}</h2><p>${esc(D.welcome)}</p>${themeImg('03','main',0,'main-photo')}<section class="info"><h3 class="redbar">${esc(front('03','resourceHeading','자료 안내'))}</h3><div class="boxbody"><strong>${esc(front('03','memberHeading','… 회원을 위해'))}</strong><ul>${D.memberLinks.map(item => `<li>${route('resources', item)}</li>`).join('')}</ul><strong>${esc(front('03','beginnerHeading','… 처음 오신 분을 위해'))}</strong><ul>${D.beginnerLinks.map((item, index) => `<li>${route(source.features[index].page, item)}</li>`).join('')}</ul></div></section>${gallery('03')}</main>
        <aside class="right"><section class="newsbox"><h3 class="redbar">${esc(front('03','newsHeading','최근 소식'))}</h3>${themeImg('03','news',4)}<div class="boxbody"><ul class="plain-list">${newsLinks(3)}</ul></div></section></aside></div><footer>갱신일 ${esc(D.updated)} · ${esc(D.email)}</footer></div>`,

      '04': () => `
        <div class="shell"><header class="top"><span class="top-logo">${logo()}</span>${navLinks([['club','회원 가입'],['launch-points','카누 런치 포인트'],['seasons','계절별 카누'],['canoe-vs-kayak','카누와 카약 차이'],['gallery','사진첩'],['events','달력']])}</header>${themeImg('04','hero',0,'wide-photo')}
        <main id="main-content"><p>${esc(D.welcome)} ${esc(front('04','introSuffix'))} ${esc(D.email)}</p><div class="docbar">${D.documents.map(item => route('resources', item.replace('.pdf', ''))).join('')}</div>
        <article><h2>${esc(D.news[0].title)}</h2>${themeImg('04','news',4)}<p>${esc(D.news[0].summary)} ${esc(D.events[3].date)} ${esc(D.events[3].time)} · ${esc(front('04','seasonNotice'))}</p></article>
        <article class="safety"><h2>${esc(D.weather.notice)}</h2><p>현재 기온 ${esc(D.weather.air)}, 수온 ${esc(D.weather.water)}, 바람 ${esc(D.weather.wind)}. ${esc(front('04','safetySuffix'))}</p></article>
        <article><h2>${esc(front('04','equipmentHeading'))}</h2>${themeImg('04','equipment',5)}<p>${esc(front('04','equipmentText'))}</p></article>${gallery('04')}</main></div>`,

      '05': () => `
        <div class="shell"><header class="top">${route('home','⌂')}${route('resources','문서')}${route('club','회원')}${route('contact','연락')}${route('board','더 보기')}</header><div class="hero">${themeImg('05','hero',0)}<div class="hero-brand">${logo('theme-logo')}<h1>${esc(D.name)}</h1></div></div>
        <div class="quick"><div>♙<br>${esc(front('05','quickMember'))}</div><div>⚑<br>${esc(front('05','quickWeather'))}</div><div>▣<br>${esc(front('05','quickBoard'))}</div></div>
        <main id="main-content" class="dashboard"><section class="weather"><h2>${esc(front('05','conditionsHeading'))}</h2><div>기온<br><strong>${esc(D.weather.air)}</strong></div><div>수온<br><strong>${esc(D.weather.water)}</strong></div><div>바람<br><strong>${esc(D.weather.wind)}</strong></div><div>${esc(D.weather.level)}<br><strong>${esc(front('05','availableText'))}</strong></div></section>
        <section class="calendar"><h2>${esc(front('05','calendarHeading'))}</h2>${D.events.map(item => `<div class="event"><strong>${esc(item.date)}</strong><span>${esc(item.title)}<br><small>${esc(item.time)}</small></span><b>›</b></div>`).join('')}</section>${gallery('05')}</main>
        <nav class="links">${navLinks([['contact','회비 납부'],['events','공용 카누 예약'],['resources','장비 보관함'],['resources','회원 문서'],['launch-points','카누 런치 포인트'],['club','회원 가입'],['seasons','계절별 카누'],['canoe-vs-kayak','카누와 카약 차이']])}</nav></div>`,

      '06': () => `
        <div class="office-shell"><aside><div class="office-logo">${logo()}</div><nav>${navLinks()}</nav><p>개설 ${esc(D.established)}<br>방문 ${D.visitors}</p></aside><main id="main-content"><h1>${esc(D.name)}</h1><p class="hand">${esc(front('06','greeting','강을 좋아하는 이웃 여러분, 환영합니다.'))}</p>${themeImg('06','main',1,'office-photo')}<p>${esc(D.welcome)}</p><h2>${esc(front('06','welcomeHeading','클럽에서 알려드립니다'))}</h2>${D.news.map(item => `<article><h3>${route('board', item.title)}</h3><time>${esc(item.date)}</time><p>${esc(item.summary)}</p></article>`).join('')}${gallery('06')}</main><aside class="course-desk"><h2>${esc(front('06','courseHeading'))}</h2>${courseDesk()}<h2>${esc(front('06','documentsHeading'))}</h2>${D.documents.map(item => route('resources', item)).join('')}</aside></div>`,

      '07': () => `
        <div class="archive-shell"><header>${themeImg('07','hero',0)}${logo('theme-logo')}<h1>${esc(D.name)}</h1></header><nav>${navLinks([['club','회원 가입'],['launch-points','카누 런치 포인트'],['seasons','계절별 카누'],['canoe-vs-kayak','카누와 카약 차이'],['gallery','사진첩']])}</nav><main id="main-content">${gallery('07')}<aside><h2>${esc(front('07','eventsHeading'))}</h2><ul class="plain-list">${eventRows(4)}</ul><h2>${esc(front('07','archiveHeading'))}</h2><p>${esc(front('07','onlineSince'))} ${esc(D.established)}</p></aside></main><footer><h2>${esc(front('07','guestbookHeading'))}</h2>${route('guestbook',front('07','guestbookWrite'))} · ${route('guestbook',front('07','guestbookRead'))}<p>2003 / 2004 / 2005 / 2010 / 2020 / 2026</p></footer></div>`,

      '08': () => `
        <div class="league"><div class="league-util">${esc(front('08','utilityText'))}</div><header class="league-photo-head" style="background-image:url('${esc(p(photoIndex('08','hero',0)).src)}')"><div class="badge">${logo()}</div><div><h1>${esc(D.name)}</h1><p>${esc(D.tagline)}</p></div></header><nav>${navLinks([['club','회원 가입'],['launch-points','카누 런치 포인트'],['seasons','계절별 카누'],['canoe-vs-kayak','카누와 카약 차이'],['board','공지'],['events','달력']])}</nav><section class="league-status"><div>${esc(front('08','riverLabel'))}<br><b>${esc(D.weather.air)} / ${esc(D.weather.water)}</b></div><div>${esc(front('08','windLabel'))}<br><b>${esc(D.weather.wind)}</b></div><div>${esc(front('08','safetyLabel'))}<br><b>${esc(D.weather.notice)}</b></div></section><main id="main-content" class="federation-boards"><section class="federation-board"><h2>${esc(front('08','noticeHeading'))}</h2>${D.news.slice(0,4).map(item => `<article class="post"><time>${esc(item.date)}</time><h3>${route('board', item.title)}</h3><p>${esc(item.summary)}</p></article>`).join('')}</section><section class="federation-board"><h2>${esc(front('08','boardHeading'))}</h2><article class="post"><strong>${esc(front('08','chairName'))}</strong><p>${esc(front('08','chairText'))}</p>${route('board','공지 전체 보기 →')}</article><article class="post"><strong>${esc(front('08','equipmentName'))}</strong><p>${esc(front('08','equipmentText'))}</p>${route('resources','장비 목록 보기 →')}</article></section><section class="federation-board"><h2>${esc(front('08','calendarHeading'))}</h2>${D.events.map(item => `<article class="post league-event"><b>${esc(item.date)}</b><h3>${esc(item.title)}</h3><p>${esc(item.time)} · ${esc(item.place)}</p></article>`).join('')}</section>${gallery('08')}</main></div>`,

      '09': () => `
        <div class="deep-retro"><header><div class="paddlemark">${logo()}</div><h1>${esc(D.name)}</h1><p>${esc(D.tagline)}</p></header><div class="retro3"><aside><nav>${navLinks()}</nav><section><h3>${esc(front('09','eventsHeading'))}</h3><ul class="plain-list">${eventRows(3)}</ul></section></aside><main id="main-content"><h2>${esc(front('09','welcomeHeading','우리 홈페이지에 오신 것을 환영합니다'))}</h2>${themeImg('09','main',0)}<p>${esc(D.welcome)}</p><h2>${esc(front('09','newsHeading'))}</h2><ul>${newsLinks(5)}</ul><h2>${esc(front('09','resourcesHeading'))}</h2><div class="linkpair"><ul>${D.memberLinks.map(item => `<li>${route('resources', item)}</li>`).join('')}</ul><ul>${D.beginnerLinks.map((item,index) => `<li>${route(source.features[index].page, item)}</li>`).join('')}</ul></div>${gallery('09')}</main><aside class="blue-guest"><h2>${esc(front('09','guestbookHeading'))}</h2>${route('guestbook',front('09','guestbookWrite'))}<br>${route('guestbook',front('09','guestbookRead'))}<div class="road"></div><p>${esc(front('09','years')).replace(/\n/g,'<br>')}</p><h3>${esc(front('09','riverHeading'))}</h3><p>${esc(D.weather.air)}<br>${esc(D.weather.water)}<br>${esc(D.weather.wind)}</p></aside></div><footer>마지막 수정 ${esc(D.updated)} · 방문자 ${D.visitors}</footer></div>`,

      '10': () => `
        <div class="almanac-shell"><div class="almanac-utility">${esc(front('10','utilityText'))}</div><header class="almanac-head"><div class="stamp">${logo()}</div><div><small>${esc(front('10','almanacSubtitle','강가의 계절과 사람을 모아 둔 기록장'))}</small><h1>${esc(front('10','almanacTitle','한강 카누 계절 연감'))}</h1><p>${esc(D.tagline)}</p></div></header><nav class="almanac-nav">${navLinks([['stories','물 위의 옛 이야기'],['launch-points','카누 런치 포인트'],['seasons','계절별 카누'],['canoe-vs-kayak','카누와 카약 차이'],['gallery','사진첩'],['club','회원 가입']])}</nav>
        <section class="postcard-strip">${['postcard1','postcard2','postcard3'].map(key => `<figure>${themeImg('10',key,0)}<figcaption>${esc(front('10',key))}</figcaption></figure>`).join('')}</section>
        <main id="main-content" class="almanac-main"><section class="almanac-letter"><h2>${esc(front('10','welcomeHeading','친애하는 강가의 이웃 여러분'))}</h2><p class="dropcap">${esc(D.welcome)} ${esc(front('10','letterSuffix'))}</p><h2>${esc(front('10','eventsHeading'))}</h2><div class="event-ledger">${D.events.map((item,index) => `<article><b>${String(index+1).padStart(2,'0')}</b><time>${esc(item.date)} ${esc(item.time)}</time><span>${esc(item.title)}<small>${esc(item.place)}</small></span></article>`).join('')}</div><section class="almanac-features">${source.features.map(item => `<article><small>${esc(item.kicker)}</small><h2>${esc(item.title)}</h2><p>${esc(item.summary)}</p>${route(item.page,'읽어보기 »')}</article>`).join('')}</section>${gallery('10','강가의 사진 기록')}</section>
        <aside class="almanac-side"><section class="notice-slip"><h2>${esc(front('10','courseHeading'))}</h2>${courseDesk()}</section><section class="editor-note"><h2>${esc(front('10','editorHeading'))}</h2>${themeImg('10','editor',5)}<p>${esc(front('10','editorText'))}</p></section><section class="year-archive"><h2>${esc(front('10','archiveHeading'))}</h2><p>${esc(front('10','years'))}</p></section></aside></main><footer>${esc(D.name)} 계절 기록장 · ${esc(D.email)} · 방문 ${D.visitors}</footer></div>`
    };

    function simpleChrome(themeId, content) {
      const sideNav = `<nav>${navLinks()}</nav>`;
      const blocks = {
        '01': `<div class="page"><aside class="side"><div class="tiny-logo">${logo()}</div><nav class="nav">${navLinks()}</nav></aside><main id="main-content"><div class="banner">${esc(D.name)}</div>${pageHeading(content)}</main></div>`,
        '02': `<main id="main-content" class="wrap"><center class="legacy-center"><div class="guestbook-title"><span class="devil">${logo()}</span><h1>${esc(D.name)}</h1></div><div class="road"></div></center>${pageHeading(content)}<center><div class="road"></div>${route('home','첫 화면으로')}</center></main>`,
        '03': `<div class="shell"><header class="hero">${themeImg('03','hero',0)}<div class="hero-brand">${logo('theme-logo')}<div><h1>${esc(D.name)}</h1><p>${esc(front('03','heroSubtitle','… 한강 북쪽의 작은 카누 모임 …'))}</p></div></div></header><div class="columns"><aside><nav class="leftnav">${navLinks(navItems.slice(0,5))}</nav><section class="schedule"><h3 class="redbar">${esc(front('03','scheduleHeading'))}</h3><div class="boxbody"><ul class="plain-list">${eventRows(3)}</ul></div></section></aside><main id="main-content" class="main">${pageHeading(content)}</main><aside class="right"><section class="newsbox"><h3 class="redbar">${esc(front('03','newsHeading'))}</h3>${themeImg('03','news',4)}<div class="boxbody"><ul class="plain-list">${newsLinks(3)}</ul></div></section></aside></div></div>`,
        '04': `<div class="shell"><header class="top"><span class="top-logo">${logo()}</span>${navLinks([['club','회원 가입'],['launch-points','카누 런치 포인트'],['seasons','계절별 카누'],['canoe-vs-kayak','카누와 카약 차이'],['gallery','사진첩'],['events','달력']])}</header>${themeImg('04','hero',0,'wide-photo')}<main id="main-content">${pageHeading(content)}</main></div>`,
        '05': `<div class="shell"><header class="top">${route('home','⌂')}${route('resources','문서')}${route('club','회원')}${route('contact','연락')}${route('board','더 보기')}</header><div class="hero">${themeImg('05','hero',0)}<div class="hero-brand">${logo('theme-logo')}<h1>${esc(D.name)}</h1></div></div><div class="quick"><div>♙<br>${esc(front('05','quickMember'))}</div><div>⚑<br>${esc(front('05','quickWeather'))}</div><div>▣<br>${esc(front('05','quickBoard'))}</div></div><main id="main-content" class="legacy-dashboard-page">${pageHeading(content)}</main></div>`,
        '06': `<div class="office-shell"><aside><div class="office-logo">${logo()}</div>${sideNav}</aside><main id="main-content">${pageHeading(content)}</main><aside class="course-desk"><h2>${esc(front('06','courseHeading'))}</h2>${courseDesk()}</aside></div>`,
        '07': `<div class="archive-shell"><header>${themeImg('07','hero',0)}${logo('theme-logo')}<h1>${esc(D.name)}</h1></header><nav>${navLinks([['club','회원 가입'],['launch-points','카누 런치 포인트'],['seasons','계절별 카누'],['canoe-vs-kayak','카누와 카약 차이'],['gallery','사진첩']])}</nav><main id="main-content" class="archive-subpage">${pageHeading(content)}</main><footer>${route('guestbook',front('07','guestbookHeading'))} · ${route('home','첫 화면')}</footer></div>`,
        '08': `<div class="league"><div class="league-util">${esc(front('08','utilityText'))}</div><header class="league-photo-head" style="background-image:url('${esc(p(photoIndex('08','hero',0)).src)}')"><div class="badge">${logo()}</div><div><h1>${esc(D.name)}</h1><p>${esc(D.tagline)}</p></div></header><nav>${navLinks([['club','회원 가입'],['launch-points','카누 런치 포인트'],['seasons','계절별 카누'],['canoe-vs-kayak','카누와 카약 차이'],['board','공지'],['events','달력']])}</nav><section class="league-status"><div>${esc(front('08','riverLabel'))}<br><b>${esc(D.weather.air)} / ${esc(D.weather.water)}</b></div><div>${esc(front('08','windLabel'))}<br><b>${esc(D.weather.wind)}</b></div><div>${esc(front('08','safetyLabel'))}<br><b>${esc(D.weather.notice)}</b></div></section><main id="main-content" class="league-subpage">${pageHeading(content)}</main></div>`,
        '09': `<div class="deep-retro"><header><div class="paddlemark">${logo()}</div><h1>${esc(D.name)}</h1><p>${esc(D.tagline)}</p></header><div class="retro3"><aside>${sideNav}</aside><main id="main-content">${pageHeading(content)}</main><aside class="blue-guest"><h2>${esc(front('09','guestbookHeading'))}</h2>${route('guestbook',front('09','guestbookWrite'))}<div class="road"></div><h3>${esc(front('09','riverHeading'))}</h3><p>${esc(D.weather.air)}<br>${esc(D.weather.water)}</p></aside></div></div>`,
        '10': `<div class="almanac-shell"><div class="almanac-utility">${esc(front('10','utilityText'))}</div><header class="almanac-head"><div class="stamp">${logo()}</div><div><small>${esc(front('10','almanacSubtitle','강가의 계절과 사람을 모아 둔 기록장'))}</small><h1>${esc(front('10','almanacTitle','한강 카누 계절 연감'))}</h1><p>${esc(D.tagline)}</p></div></header><nav class="almanac-nav">${navLinks([['stories','물 위의 옛 이야기'],['launch-points','카누 런치 포인트'],['seasons','계절별 카누'],['canoe-vs-kayak','카누와 카약 차이'],['gallery','사진첩'],['club','회원 가입']])}</nav><main id="main-content" class="almanac-subpage">${pageHeading(content)}</main></div>`
      };
      return blocks[themeId];
    }

    return {
      themeClass: themeId => classByTheme[themeId] || 's01',
      home: themeId => homes[themeId](),
      subpage: (themeId, content) => simpleChrome(themeId, content)
    };
  };
})();
