# 프론트페이지 디자인 후보 10종

동일한 가상 클럽 데이터와 생성 사진을 사용해 레퍼런스별 문법 비중을 달리한 정적 프론트페이지다.

## 파일 구성

- `index.html`: 열 개 후보의 비교 목록
- `sample-01-*.html` ~ `sample-10-*.html`: 개별 프론트페이지
- `mock-data.js`: 모든 페이지가 공유하는 목업 데이터
- `sample-app.js`: 샘플별로 서로 다른 HTML 구조를 만드는 렌더러
- `shared.css`: 후보별 시각 문법과 모바일 규칙
- `assets/photos/`: 이미지 생성 도구로 만든 공통 사진첩 6장

## 샘플별 비중

1. Riddersholm 중심 개인 홈페이지
2. Sundet 파란 방명록 + Esrum Sø·GLX 회원 운영 카드
3. Dömitz 중심 3열 협회 홈
4. PALO 중심 회보·장문 공지
5. Esrum Sø 중심 날씨·달력 운영
6. Riddersholm + PALO + Pilen 동호회 사무실
7. Dömitz + Riesa + Sundet 강변 사진 아카이브
8. 한국아마추어무선연맹 + GLX + Esrum Sø 구조에 GLX형 사진 헤더·3열 카드 결합
9. Riddersholm + Sundet + Dömitz 딥 레트로 동호회
10. Jul i Dannevang + Pilen + Dömitz 계절 연감·엽서 — 옛 물 이야기, 한국의 런치 포인트, 계절별 매력, 카누·카약 비교

기존 사진 기록장 후보의 2열 사진·설명 문법은 모든 템플릿의 메인 갤러리로 통합했다. 10번은 기존 후보와 겹치지 않도록 계절 회보, 행사 연감, 강습 접수표와 사진 엽서를 한 화면에 조합했다.

외부 라이브러리나 네트워크 요청 없이 `index.html`을 브라우저에서 바로 열 수 있다.
