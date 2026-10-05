(function () {
  const gallery = [
    ['galleryHeading', '갤러리 제목', '활동 갤러리'],
    ['galleryLink', '갤러리 링크 문구', '사진첩 전체 보기 →']
  ];
  const galleryPhotos = [
    ['gallery1', '갤러리 사진 1', 1], ['gallery2', '갤러리 사진 2', 3],
    ['gallery3', '갤러리 사진 3', 6], ['gallery4', '갤러리 사진 4', 7]
  ];

  window.KACC_THEME_OPTIONS = {
    '01': {
      texts: [
        ['welcomeHeading', '환영 제목', '우리 홈페이지에 오신 것을 환영합니다'],
        ['webmasterRole', '웹마스터 역할명', '웹마스터'],
        ['newsHeading', '최근 소식 제목', '최근 소식'],
        ['clubHeading', '클럽 소개 제목', '우리 모임은'],
        ['clubStoryLink', '옛 이야기 링크 문구', '클럽의 옛날 이야기 보기'],
        ['eventsHeading', '일정 제목', '다음 정기 패들'],
        ['footerOpened', '하단 개설일 문구', '처음 문을 연 날'],
        ['footerUpdated', '하단 갱신일 문구', '마지막 손질'],
        ['footerVisitors', '하단 방문자 문구', '방문자'],
        ...gallery
      ],
      photos: [['portrait', '오른쪽 대표 사진', 1], ['news', '최근 소식 사진', 2], ...galleryPhotos]
    },
    '02': {
      texts: [
        ['welcomeHeading', '환영 제목', '이번 주 강가에서 만나요!'],
        ['riverHeading', '오늘의 강 카드 제목', '오늘의 강'],
        ['nextHeading', '다음 모임 카드 제목', '다음 모임'],
        ['boardHeading', '공지 카드 제목', '공지'],
        ['boardText', '공지 카드 내용', '새로 문을 연 클럽의 첫 소식을 확인해 주세요.'],
        ['boardLink', '공지 링크 문구', '공지 읽기 →'],
        ['meetingHeading', '일정표 제목', '다음 모임'],
        ['guestbookLink', '방명록 링크 문구', '회원 이름을 남겨 주세요!'],
        ['beginnerLink', '초보자 링크 문구', '처음 타는 분도 환영합니다.'],
        ...gallery
      ],
      photos: [['feature', '중앙 대표 사진', 4], ...galleryPhotos]
    },
    '03': {
      texts: [
        ['heroSubtitle', '헤더 소개 문구', '… 한강 북쪽의 작은 카누 모임 …'],
        ['welcomeHeading', '환영 제목', '환영합니다'],
        ['scheduleHeading', '일정 상자 제목', '우리의 다음 일정'],
        ['resourceHeading', '자료 상자 제목', '자료 안내'],
        ['memberHeading', '회원 자료 제목', '… 회원을 위해'],
        ['beginnerHeading', '초보자 자료 제목', '… 처음 오신 분을 위해'],
        ['newsHeading', '최근 소식 제목', '최근 소식'],
        ...gallery
      ],
      photos: [['hero', '헤더 배경 사진', 0], ['main', '본문 대표 사진', 0], ['news', '최근 소식 사진', 4], ...galleryPhotos]
    },
    '04': {
      texts: [
        ['introSuffix', '도입문 추가 문구', '행사나 사진, 강에서 겪은 일을 공유하고 싶다면 아래 이메일로 보내 주세요.'],
        ['seasonNotice', '계절 행사 안내', '올해 등불 모임은 따뜻한 옷과 개인 조명을 준비해 주세요.'],
        ['safetySuffix', '안전 안내 추가 문구', '초보자는 반드시 두 명 이상 함께 출항합니다.'],
        ['equipmentHeading', '장비 소식 제목', '창고 정리 작업을 마쳤습니다'],
        ['equipmentText', '장비 소식 내용', '낡은 패들과 구명조끼를 꺼내 상태를 확인했습니다. 사진 속 물건을 알아보는 회원은 장비 담당자에게 알려 주세요.'],
        ...gallery
      ],
      photos: [['hero', '상단 넓은 사진', 0], ['news', '첫 소식 사진', 4], ['equipment', '장비 소식 사진', 5], ...galleryPhotos]
    },
    '05': {
      texts: [
        ['quickMember', '빠른 메뉴 1', '새 회원 등록'], ['quickWeather', '빠른 메뉴 2', '강 날씨'],
        ['quickBoard', '빠른 메뉴 3', '공지'], ['conditionsHeading', '강 상태 제목', '오늘의 강 상태'],
        ['calendarHeading', '일정 제목', '다가오는 일정'], ['availableText', '운항 상태 문구', '운항 가능'],
        ...gallery
      ],
      photos: [['hero', '헤더 배경 사진', 0], ...galleryPhotos]
    },
    '06': {
      texts: [
        ['greeting', '손글씨 환영 문구', '강을 좋아하는 이웃 여러분, 환영합니다.'],
        ['welcomeHeading', '소식 제목', '클럽에서 알려드립니다'],
        ['courseHeading', '강습 상자 제목', '강습 접수'], ['documentsHeading', '문서 상자 제목', '문서'], ...gallery
      ],
      photos: [['main', '본문 대표 사진', 1], ...galleryPhotos]
    },
    '07': {
      texts: [
        ['galleryHeading', '갤러리 제목', '사진으로 보는 우리의 강'],
        ['eventsHeading', '일정 제목', '다음 일정'], ['archiveHeading', '기록 제목', '오래된 기록'],
        ['onlineSince', '온라인 개설 문구', '온라인 시작'], ['guestbookHeading', '방명록 제목', 'GUESTBOOK'],
        ['guestbookWrite', '방명록 쓰기 문구', '글 남기기'], ['guestbookRead', '방명록 읽기 문구', '지난 글 읽기'],
        ...gallery.filter(([key]) => key !== 'galleryHeading')
      ],
      photos: [['hero', '헤더 배경 사진', 0], ...galleryPhotos]
    },
    '08': {
      texts: [
        ['utilityText', '상단 유틸리티 문구', '로그인　회원가입　회비납부　새 회원 안내'],
        ['riverLabel', '강 상태 제목', '오늘의 강'], ['windLabel', '바람 제목', '바람'], ['safetyLabel', '안전 제목', '안전'],
        ['noticeHeading', '공지 카드 제목', '공지'], ['boardHeading', '운영 공지 카드 제목', '운영 공지'],
        ['calendarHeading', '달력 카드 제목', '행사 달력'], ['chairName', '공지 작성자', '정진기'],
        ['chairText', '운영 공지 내용', '회장, 웹마스터, 행동대장은 모두 정진기가 맡습니다.'],
        ['equipmentName', '장비 담당명', '장비위원회'], ['equipmentText', '장비 알림 내용', '창고 선반과 오래된 카누 두 척을 정리했습니다.'],
        ...gallery
      ],
      photos: [['hero', '헤더 배경 사진', 0], ...galleryPhotos]
    },
    '09': {
      texts: [
        ['welcomeHeading', '환영 제목', '우리 홈페이지에 오신 것을 환영합니다'],
        ['eventsHeading', '일정 제목', '다음 일정'], ['newsHeading', '최근 소식 제목', '최근 소식'],
        ['resourcesHeading', '자료 제목', '회원과 초보자를 위한 자료'], ['guestbookHeading', '방명록 제목', 'GUESTBOOK'],
        ['guestbookWrite', '방명록 쓰기 문구', '방명록 쓰기'], ['guestbookRead', '방명록 읽기 문구', '방명록 읽기'],
        ['riverHeading', '오늘의 강 제목', '오늘의 강'], ['years', '연도 목록', '2003 · 2004 · 2005\n2010 · 2015 · 2026'],
        ...gallery
      ],
      photos: [['main', '본문 대표 사진', 0], ...galleryPhotos]
    },
    '10': {
      texts: [
        ['almanacTitle', '연감 제목', '한강 카누 계절 연감'],
        ['almanacSubtitle', '연감 부제', '강가의 계절과 사람을 모아 둔 기록장'],
        ['welcomeHeading', '환영 제목', '친애하는 강가의 이웃 여러분'],
        ['utilityText', '상단 유틸리티 문구', '회원 편지　|　연도별 기록　|　사진 보내기　|　회원 가입'],
        ['postcard1', '엽서 사진 1 설명', '등불이 켜진 가을 강'], ['postcard2', '엽서 사진 2 설명', '정기 패들의 아침'],
        ['postcard3', '엽서 사진 3 설명', '첫 강습을 마치고'],
        ['letterSuffix', '환영문 추가 문구', '이곳에는 찬 바람이 불기 전 함께할 일정과 초보 강습, 회원들이 보내온 짧은 엽서를 모았습니다.'],
        ['eventsHeading', '행사 연감 제목', '가을 행사 연감'], ['courseHeading', '강습 접수 제목', '강습 접수표'],
        ['editorHeading', '운영자 쪽지 제목', '운영자 쪽지'], ['editorText', '운영자 쪽지 내용', '사진 뒷면에 날짜와 장소를 적어 클럽 우편함에 넣어 주세요.'],
        ['archiveHeading', '연도 기록 제목', '연도별 기록'], ['years', '연도 목록', '2003 · 2008 · 2014 / 2020 · 2024 · 2026'],
        ...gallery
      ],
      photos: [['postcard1', '엽서 사진 1', 4], ['postcard2', '엽서 사진 2', 0], ['postcard3', '엽서 사진 3', 3], ['editor', '운영자 쪽지 사진', 5], ...galleryPhotos]
    }
  };
})();
