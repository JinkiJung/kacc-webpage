# 한국 아마추어 카누 클럽

프레임워크 없이 HTML, CSS, JavaScript와 단일 `site-data.json`으로 만든 정적 웹사이트입니다. 모든 테마와 서브페이지가 같은 데이터와 사진을 사용합니다.

- 로컬 저장소: `/Users/jinki/Documents/GitHub/kacc-webpage`
- GitHub 저장소: <https://github.com/JinkiJung/kacc-webpage>
- 공개 사이트: <https://jinkijung.github.io/kacc-webpage/>

## 바로 보기

Finder에서 `serve.command`를 더블클릭하거나, 이 폴더에서 다음 명령을 실행합니다.

```sh
./serve.command
```

브라우저에서 <http://localhost:5174>를 엽니다. JSON을 읽는 사이트이므로 `index.html`을 `file://` 주소로 직접 열지 말고 로컬 서버를 이용해야 합니다.

이 프로젝트의 로컬 개발·미리보기·브라우저 테스트는 항상 **5174 포트**를 사용합니다. `8080`이나 `5173` 등 다른 포트로 테스트하지 않습니다.

## 주소 규칙

- 첫 화면: `http://localhost:5174/`
- 서브페이지: `http://localhost:5174/?page=seasons`

공개 사이트와 로컬 미리보기는 준비가 끝날 때까지 항상 `01`번 테마를 사용합니다. `?theme=` 쿼리를 붙여도 다른 테마로 전환되지 않습니다. 나머지 테마 데이터와 디자인은 향후 사용을 위해 저장소에 보존합니다.

## 데이터 편집기

<http://localhost:5174/editor.html>에서 `site-data.json`을 폼으로 편집할 수 있습니다.

- **공용 데이터:** 사이트 소개, 물길 상태, 공지, 일정, 사진, 읽을거리, 클럽, 강습, 자료실, 방명록, 연락처와 로테이션
- **테마별 데이터:** 각 테마의 화면 제목, 부제, 환영 제목, 설명과 메뉴 구성
- **저장 및 즉시 적용:** 브라우저 저장소에 보관하며, 같은 주소로 열려 있는 사이트가 즉시 새 데이터를 불러옵니다.
- **site-data.json 내려받기:** GitHub Pages에 배포할 수 있는 JSON 파일을 생성합니다. 내려받은 파일로 저장소 루트의 `site-data.json`을 교체하고 커밋해야 전체 방문자에게 적용됩니다.

## 보류 중인 로테이션 규칙

- 현재 자동 로테이션은 비활성화되어 있으며 `01`번 테마만 표시합니다.
- 다시 활성화할 경우 한 주에는 순서대로 묶인 두 테마를 사용합니다: `01/02`, `03/04`, `05/06`, `07/08`, `09/10`.
- 매주 월요일 새벽 1시(한국 시간)에 다음 묶음으로 넘어갑니다.
- 오전 테마는 새벽 1시부터 오후 12시 59분까지, 오후 테마는 오후 1시부터 다음 날 오전 12시 59분까지 표시됩니다.
- 다섯 주 뒤에 다시 첫 묶음으로 돌아옵니다.

## 구조

- `site-data.json`: 공통 콘텐츠, 메뉴, 테마, 로테이션 설정
- `index.html`: 모든 화면의 공통 진입점
- `assets/js/app.js`: 라우팅, 렌더링, 시간 계산
- `assets/css/base.css`: 공통 레이아웃과 접근성
- `assets/css/themes.css`: 10개 테마의 서로 다른 시각 문법
- `assets/images/`: 로고와 모든 테마가 공유하는 원본 사진
- `ref/`: 기존 디자인 조사와 원본 샘플

모든 일정, 인물, 연락처, 장소는 디자인 검토를 위한 목업입니다.

## GitHub Pages 배포

저장소에는 `.github/workflows/pages.yml`이 포함되어 있습니다. `main` 브랜치에 푸시하면 별도의 빌드 없이 정적 파일 전체가 <https://jinkijung.github.io/kacc-webpage/>로 배포됩니다.

1. `/Users/jinki/Documents/GitHub/kacc-webpage`에서 변경 사항을 커밋합니다.
2. `main` 브랜치를 `JinkiJung/kacc-webpage`에 푸시합니다.
3. **Actions** 탭의 `Deploy to GitHub Pages` 작업이 완료되면 공개 사이트에서 확인합니다.

프로젝트 Pages 주소가 `https://사용자명.github.io/저장소명/` 형태여도 모든 파일이 상대 경로를 사용하므로 별도 경로 수정이 필요 없습니다. 서브페이지는 `?page=gallery` 같은 쿼리 주소를 사용하기 때문에 정적 호스팅에서도 새로고침할 수 있습니다.

공개 저장소에 올릴 경우 `ref/` 폴더를 포함한 저장소 파일도 공개된다는 점에 유의하세요.

## 방명록 프런트엔드

`assets/js/guestbook.js`는 방명록 페이지의 목업 데이터를 실제 API 화면으로 대체합니다. `guestbook-config.js`는 로컬에서 8787 포트와 Turnstile 공식 테스트 사이트 키를 사용하고, 공개 사이트에서는 기존 공개 API 게이트웨이와 운영 사이트 키를 사용합니다. Turnstile 비밀키는 절대 프런트엔드 파일에 넣지 않습니다.

로컬에서 확인하려면 방명록 Worker(8788), 게이트웨이(8787), 그리고 이 저장소의 `./serve.command`(5174)를 차례로 실행합니다. `http://localhost:5174`와 `http://127.0.0.1:5174`를 지원합니다. 방명록 백엔드의 설치·API·배포·복구 절차는 `/Users/jinki/Documents/playground/kacc-guestbook-worker/README.md`에 있습니다.

방문자는 글을 쓴 직후 무작위 삭제 키를 한 번만 받습니다. 키는 브라우저 저장소에 보관하지 않으며, 분실한 키는 복구할 수 없습니다. 폼 입력값이나 API 본문을 수집하는 분석 도구를 추가하지 않습니다.
