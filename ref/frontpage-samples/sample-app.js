(function () {
  const D = window.CANOE_CLUB;
  const p = (n) => D.photos[n];
  const img = (n, cls = "") => `<img class="${cls}" src="${p(n).src}" alt="${p(n).alt}">`;
  const newsLinks = (limit = 5) => D.news.slice(0, limit).map(n => `<li><a href="#">${n.title}</a> <small>${n.date}</small></li>`).join("");
  const eventRows = (limit = 4) => D.events.slice(0, limit).map(e => `<li><strong>${e.date}</strong> ${e.title}<br><small>${e.time} · ${e.place}</small></li>`).join("");
  const nav = ["시작페이지","최근 소식","우리는 누구인가","카누 타는 곳","정기 모임","장비와 안전","활동 사진","옛날 기록","방명록","연락처","카누 링크"];
  const navLinks = () => nav.map(x => `<a href="#">${x}</a>`).join("");
  const gallery = (title = "활동 갤러리") => `<section class="shared-gallery"><h2>${title}</h2><div class="gallery-grid">${[1,3,2,5].map((n,i)=>`<figure>${img(n)}<figcaption>${i+1}. ${p(n).caption}</figcaption></figure>`).join("")}</div><p><a href="#">사진첩 전체 보기 →</a></p></section>`;
  const footerLink = `<a class="sample-switcher" href="index.html">10개 샘플 목록</a>`;

  const samples = {
    "01": () => `
      <a class="skip" href="#main">본문 바로가기</a>
      <div class="page"><aside class="side"><div class="tiny-logo">🛶<br>${D.shortName}</div><nav class="nav">${navLinks()}</nav></aside>
      <main id="main"><div class="banner">${D.name}</div>${img(1,"portrait")}<h1>우리 홈페이지에 오신 것을 환영합니다</h1><p>${D.welcome}</p><p class="signature">웹마스터 이수민<br>${D.location}</p>
      <section class="news"><div>${img(2)}<p class="photo-caption">${p(2).caption}</p></div><div><h2>최근 소식</h2><ul>${newsLinks()}</ul></div></section>
      <h2>우리 모임은</h2><p>2003년 강가에서 카누를 함께 타던 일곱 사람이 시작했습니다. 기록 사진, 강습 이야기와 장비 수리법을 천천히 모으고 있습니다. <a href="#">클럽의 옛날 이야기 보기</a></p>
      <h2>다음 정기 패들</h2><ul>${eventRows(3)}</ul>${gallery()}<footer>처음 문을 연 날 ${D.established} · 마지막 손질 ${D.updated} · 방문자 ${D.visitors}</footer></main></div>${footerLink}`,

    "02": () => `
      <main class="wrap"><center class="legacy-center legacy-center-top"><div class="guestbook-title"><span class="devil" aria-hidden="true">🛶</span><h1>THE CANOE GUESTBOOK</h1></div><p class="clubname">${D.name}</p><div class="road"></div>
      <div class="big-links"><a href="#">오늘의 강 상태 보기</a><a href="#">우리 방명록에 쓰기</a><a href="#">지난 방명록 읽기</a></div>
      <p class="years"><a href="#">2003</a>, <a href="#">2004</a>, <a href="#">2005</a>, <a href="#">2010</a>, <a href="#">2015</a>, <a href="#">2020</a>, <a href="#">2026</a></p><div class="road"></div></center>
      <center class="legacy-center legacy-center-main"><section class="sundet-cards"><article><h3>오늘의 강</h3><p>기온 ${D.weather.air}<br>수온 ${D.weather.water}<br>바람 ${D.weather.wind}</p></article><article><h3>다음 모임</h3><p><strong>${D.events[0].date}</strong><br>${D.events[0].title}<br>${D.events[0].time}</p></article><article><h3>회원 게시판</h3><p>토요일 오전 천천히 함께 탈 분을 찾습니다.</p><a href="#">게시판 읽기 →</a></article></section>
      <h2>이번 주 강가에서 만나요!</h2><p class="notice">${D.welcome}<br><strong>${D.weather.notice}</strong></p>${img(4,"photo")}<p>${p(4).caption}</p>
      <h2>다음 모임</h2><table>${D.events.map(e=>`<tr><td>${e.date}</td><td><a href="#">${e.title}</a></td><td>${e.time}</td></tr>`).join("")}</table>${gallery()}
      <div class="road"></div><p><a href="#">회원 이름을 남겨 주세요!</a><br><a href="#">처음 타는 분도 환영합니다.</a></p><p class="statusline">온라인 시작: ${D.established} / 마지막 수정: ${D.updated}</p></center></main>${footerLink}`,

    "03": () => `
      <div class="shell"><header class="hero">${img(0)}<h1>${D.name}</h1><p>… 한강 북쪽의 작은 카누 모임 …</p></header>
      <div class="columns"><aside><nav class="leftnav">${nav.slice(0,5).map(x=>`<a href="#">${x}</a>`).join("")}</nav><section class="schedule"><h3 class="redbar">우리의 다음 일정</h3><div class="boxbody"><ul class="plain-list">${eventRows(3)}</ul></div></section></aside>
      <main class="main"><h2>환영합니다</h2><p>${D.welcome}</p>${img(0,"main-photo")}<section class="info"><h3 class="redbar">자료 안내</h3><div class="boxbody"><strong>… 회원을 위해</strong><ul>${D.memberLinks.map(x=>`<li><a href="#">${x}</a></li>`).join("")}</ul><strong>… 처음 오신 분을 위해</strong><ul>${D.beginnerLinks.map(x=>`<li><a href="#">${x}</a></li>`).join("")}</ul></div></section>${gallery()}</main>
      <aside class="right"><section class="newsbox"><h3 class="redbar">최근 소식</h3>${img(4)}<div class="boxbody"><ul class="plain-list">${newsLinks(3)}</ul></div></section></aside></div><footer>갱신일 ${D.updated} · ${D.email}</footer></div>${footerLink}`,

    "04": () => `
      <div class="shell"><header class="top"><strong>KACC</strong>${["클럽 소개","회원 가입","행사 신청","달력","사진첩","링크"].map(x=>`<a href="#">${x}</a>`).join("")}</header>${img(0,"wide-photo")}
      <main><p>${D.welcome} 행사나 사진, 강에서 겪은 일을 공유하고 싶다면 ${D.email}로 보내 주세요.</p><div class="docbar">${D.documents.map(x=>`<a href="#">${x.replace('.pdf','')}</a>`).join("")}</div>
      <article><h2>${D.news[0].title}</h2>${img(4)}<p>${D.news[0].summary} 올해 등불 모임은 ${D.events[3].date} 저녁 ${D.events[3].time}에 시작합니다. 따뜻한 옷과 개인 조명을 준비해 주세요.</p></article>
      <article class="safety"><h2>${D.weather.notice}</h2><p>현재 기온 ${D.weather.air}, 수온 ${D.weather.water}, 바람 ${D.weather.wind}. 초보자는 반드시 두 명 이상 함께 출항합니다.</p></article>
      <article><h2>창고 정리 작업을 마쳤습니다</h2>${img(5)}<p>낡은 패들과 구명조끼를 꺼내 상태를 확인했습니다. 사진 속 물건을 알아보는 회원은 장비 담당자에게 알려 주세요.</p></article>${gallery()}</main></div>${footerLink}`,

    "05": () => `
      <div class="shell"><header class="top"><a href="#">⌂</a><a href="#">문서</a><a href="#">회원</a><a href="#">연락</a><a href="#">더 보기</a></header><div class="hero">${img(0)}<h1>${D.name}</h1></div>
      <div class="quick"><div>♙<br>새 회원 등록</div><div>⚑<br>강 날씨</div><div>▣<br>회원 게시판</div></div>
      <main class="dashboard"><section class="weather"><h2>오늘의 강 상태</h2><div>기온<br><strong>${D.weather.air}</strong></div><div>수온<br><strong>${D.weather.water}</strong></div><div>바람<br><strong>${D.weather.wind}</strong></div><div>${D.weather.level}<br><strong>운항 가능</strong></div></section>
      <section class="calendar"><h2>다가오는 일정</h2>${D.events.map(e=>`<div class="event"><strong>${e.date}</strong><span>${e.title}<br><small>${e.time}</small></span><b>›</b></div>`).join("")}</section>${gallery()}</main>
      <nav class="links">${["회비 납부","공용 카누 예약","장비 보관함","회원 문서","시설 안내","강습 신청","중고 장터","연락처"].map(x=>`<a href="#">${x}</a>`).join("")}</nav></div>${footerLink}`,

    "06": () => `
      <div class="office-shell"><aside><div class="office-logo">🛶<br>KACC</div><nav>${navLinks()}</nav><p>개설 ${D.established}<br>방문 ${D.visitors}</p></aside><main><h1>${D.name}</h1><p class="hand">강을 좋아하는 이웃 여러분, 환영합니다.</p>${img(1,"office-photo")}<p>${D.welcome}</p><h2>클럽에서 알려드립니다</h2>${D.news.map(n=>`<article><h3><a href="#">${n.title}</a></h3><time>${n.date}</time><p>${n.summary}</p></article>`).join("")}${gallery()}</main><aside class="course-desk"><h2>강습 접수</h2>${D.courses.map(c=>`<div><b>${c.name}</b><br>${c.date}<br>${c.fee}<br><em>${c.seats}</em><button>신청</button></div>`).join("")}<h2>문서</h2>${D.documents.map(x=>`<a href="#">${x}</a>`).join("")}</aside></div>${footerLink}`,

    "07": () => `
      <div class="archive-shell"><header>${img(0)}<h1>${D.name}</h1></header><nav>${["클럽","활동","강 이야기","사진 보관함","연락"].map(x=>`<a href="#">${x}</a>`).join("")}</nav><main>${gallery("사진으로 보는 우리의 강")}<aside><h2>다음 일정</h2><ul class="plain-list">${eventRows(4)}</ul><h2>오래된 기록</h2><p>온라인 시작 ${D.established}</p></aside></main><footer><h2>GUESTBOOK</h2><a href="#">글 남기기</a> · <a href="#">지난 글 읽기</a><p>2003 / 2004 / 2005 / 2010 / 2020 / 2026</p></footer></div>${footerLink}`,

    "08": () => `
      <div class="league"><div class="league-util">로그인　회원가입　회비납부　새 회원 안내</div><header class="league-photo-head"><div class="badge">KACC</div><div><h1>${D.name}</h1><p>${D.tagline}</p></div></header><nav>${["클럽소개","지역모임","위원회","회원게시판","달력","자료실"].map(x=>`<a href="#">${x}</a>`).join("")}</nav><section class="league-status"><div>오늘의 강<br><b>${D.weather.air} / ${D.weather.water}</b></div><div>바람<br><b>${D.weather.wind}</b></div><div>안전<br><b>${D.weather.notice}</b></div></section><main class="federation-boards"><section class="federation-board"><h2>공지사항</h2>${D.news.slice(0,4).map(n=>`<article class="post"><time>${n.date}</time><h3><a href="#">${n.title}</a></h3><p>${n.summary}</p></article>`).join("")}</section><section class="federation-board"><h2>이사회 알림</h2><article class="post"><strong>박정호 회장</strong><p>작업일 결과와 장비 구입 내역을 회원에게 공개합니다.</p><a href="#">회의록 보관함 →</a></article><article class="post"><strong>장비위원회</strong><p>창고 선반과 오래된 카누 두 척을 정리했습니다.</p><a href="#">장비 목록 보기 →</a></article></section><section class="federation-board"><h2>행사 달력</h2>${D.events.map(e=>`<article class="post league-event"><b>${e.date}</b><h3>${e.title}</h3><p>${e.time} · ${e.place}</p></article>`).join("")}</section>${gallery()}</main></div>${footerLink}`,

    "09": () => `
      <div class="deep-retro"><header><div class="paddlemark">🛶</div><h1>${D.name}</h1><p>${D.tagline}</p></header><div class="retro3"><aside><nav>${navLinks()}</nav><section><h3>다음 일정</h3><ul class="plain-list">${eventRows(3)}</ul></section></aside><main><h2>우리 홈페이지에 오신 것을 환영합니다</h2>${img(0)}<p>${D.welcome}</p><h2>최근 소식</h2><ul>${newsLinks(5)}</ul><h2>회원과 초보자를 위한 자료</h2><div class="linkpair"><ul>${D.memberLinks.map(x=>`<li><a href="#">${x}</a></li>`).join("")}</ul><ul>${D.beginnerLinks.map(x=>`<li><a href="#">${x}</a></li>`).join("")}</ul></div>${gallery()}</main><aside class="blue-guest"><h2>GUESTBOOK</h2><a href="#">방명록 쓰기</a><br><a href="#">방명록 읽기</a><div class="road"></div><p>2003 · 2004 · 2005<br>2010 · 2015 · 2026</p><h3>오늘의 강</h3><p>${D.weather.air}<br>${D.weather.water}<br>${D.weather.wind}</p></aside></div><footer>마지막 수정 ${D.updated} · 방문자 ${D.visitors}</footer></div>${footerLink}`,

    "10": () => `
      <div class="almanac-shell"><div class="almanac-utility">회원 편지　|　연도별 기록　|　사진 보내기　|　연락</div><header class="almanac-head"><div class="stamp">KACC<br>2003</div><div><small>강가의 계절과 사람을 모아 둔 기록장</small><h1>한강 카누 계절 연감</h1><p>${D.tagline}</p></div></header><nav class="almanac-nav">${["물 위의 옛 이야기","카누 런치 포인트","계절별 카누","카누와 카약","사진첩","연락"].map(x=>`<a href="#">${x}</a>`).join("")}</nav>
      <section class="postcard-strip">${[4,0,3].map((n,i)=>`<figure>${img(n)}<figcaption>${["등불이 켜진 가을 강","정기 패들의 아침","첫 강습을 마치고"][i]}</figcaption></figure>`).join("")}</section>
      <main class="almanac-main"><section class="almanac-letter"><h2>친애하는 강가의 이웃 여러분</h2><p class="dropcap">${D.welcome} 이곳에는 찬 바람이 불기 전 함께할 일정과 초보 강습, 회원들이 보내온 짧은 엽서를 모았습니다.</p><h2>가을 행사 연감</h2><div class="event-ledger">${D.events.map((e,i)=>`<article><b>${String(i+1).padStart(2,"0")}</b><time>${e.date} ${e.time}</time><span>${e.title}<small>${e.place}</small></span></article>`).join("")}</div><section class="almanac-features"><article><small>강과 사람의 기록</small><h2>물 위의 옛 이야기</h2><p>사라진 나루터, 이름을 가진 오래된 카누, 첫 운항을 기억하는 회원들의 이야기를 한 편씩 모읍니다.</p><a href="#">옛 이야기 읽기 »</a></article><article><small>지역별 물길 안내</small><h2>한국의 카누 런치 포인트 모음</h2><p>한강·북한강, 충청의 호수, 남부의 강과 잔잔한 포구를 지역별로 나누고 진입로와 운반 거리를 기록합니다.</p><a href="#">지역별 목록 보기 »</a></article><article><small>봄·여름·가을·겨울</small><h2>계절별 카누의 매력</h2><p>봄의 물가 식물, 여름 새벽, 가을 안개와 겨울 장비 손질까지 계절마다 다른 즐거움을 소개합니다.</p><a href="#">사계절 이야기 »</a></article><article><small>처음 타는 사람을 위해</small><h2>카누와 카약의 차이</h2><p>열린 선체와 앉는 방식, 한쪽날 패들과 양쪽날 패들, 짐을 싣는 방법과 운항 감각을 쉽게 비교합니다.</p><a href="#">차이 알아보기 »</a></article></section>${gallery("강가의 사진 기록")}</section>
      <aside class="almanac-side"><section class="notice-slip"><h2>강습 접수표</h2>${D.courses.map(c=>`<div><b>${c.name}</b><span>${c.date}</span><em>${c.fee} · ${c.seats}</em><a href="#">신청서</a></div>`).join("")}</section><section class="editor-note"><h2>운영자 쪽지</h2>${img(5)}<p>사진 뒷면에 날짜와 장소를 적어 클럽 우편함에 넣어 주세요.</p></section><section class="year-archive"><h2>연도별 기록</h2><p><a href="#">2003</a> · <a href="#">2008</a> · <a href="#">2014</a><br><a href="#">2020</a> · <a href="#">2024</a> · <a href="#">2025</a></p></section></aside></main><footer>한국 아마추어 카누 클럽 계절 기록장 · ${D.email} · 방문 ${D.visitors}</footer></div>${footerLink}`
  };

  window.renderSample = function (id) {
    const root = document.getElementById("sample-root");
    if (!root || !samples[id]) return;
    root.innerHTML = samples[id]();
  };
})();
