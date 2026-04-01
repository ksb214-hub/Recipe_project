폴더 구조 

src/
│
├─ App.js                    # 🔥 전체 라우터 관리
├─ index.js                  # 앱 시작점
│
├─ styles/                  # 🎨 디자인 시스템 (핵심)
│   ├─ global.css           # 전체 공통 스타일
│   └─ variables.css        # 색상, 그림자, 폰트 변수
│
├─ components/              # 🔁 공통 컴포넌트
│   ├─ Header/
│   │   ├─ Header.js
│   │   └─ Header.css
│   │
│   ├─ Card/
│   │   ├─ Card.js
│   │   └─ Card.css
│   │
│   ├─ Button/
│   │   ├─ Button.js
│   │   └─ Button.css
│   │
│   └─ Input/
│       ├─ Input.js
│       └─ Input.css
│
├─ pages/                   # 📄 페이지 단위 (라우팅 기준)
│
│   ├─ Main/
│   │   ├─ Main.js
│   │   └─ Main.css
│   │
│   ├─ Login/
│   │   ├─ Login.js
│   │   └─ Login.css
│   │
│   ├─ Search/
│   │   ├─ SearchPage.js
│   │   └─ SearchPage.module.css
│   │
│   └─ Find/
│       ├─ FindId/
│       │   ├─ FindId.js
│       │   └─ FindId.css
│       │
│       └─ FindPw/
│           ├─ FindPw.js
│           └─ FindPw.css
│
├─ data/                    # 📦 더미 데이터 / mock 데이터
│   └─ recipes.js
│
├─ hooks/                   # ⚙️ 커스텀 훅
│   └─ useSearch.js
│
└─ utils/                   # 🧠 공통 함수
    └─ filterRecipes.js

목적: 레시피 메인 화면을 구현하는 것을 목표로 한다.
사용언어: react를 사용하고 언어는 js를 사용한다.

Main
├── 로그인 → Login
├── 검색 → SearchPage
└── 카드 → (추후) Detail

Login
├── 아이디 찾기 → FindId
├── 비밀번호 찾기 → FindPw
└── 회원가입 → Join (추후)

FindPw
└── 다음 → 비밀번호 재설정 페이지 (추후)





전체 기능 구조 (프로젝트 기능 맵)
[메인 페이지]
    ├── 네비게이션
    ├── 레시피 카드 리스트
    └── 검색 페이지 이동

[검색 페이지]
    ├── 검색 입력
    ├── 카테고리 필터
    ├── 실시간 필터링
    └── 검색 결과 리스트

[로그인 페이지]
    ├── 아이디 입력
    ├── 비밀번호 입력
    ├── 로그인 버튼
    ├── 아이디 찾기 이동
    ├── 비밀번호 찾기 이동
    └── 회원가입 이동

[아이디 찾기]
    ├── 이메일 입력
    └── 아이디 조회 요청

[비밀번호 찾기]
    ├── 아이디 입력
    └── 비밀번호 재설정 요청


구조 설명
styles (디자인 시스템)
디자인 통일의 핵심
    variables.css → 색상, 그림자
    global.css → 카드, 버튼, 레이아웃


components (재사용)
여러 페이지에서 공통 사용
    Header → 모든 페이지
    Button → 로그인 / 검색
    Input → 로그인 / 아이디찾기

pages (페이지 단위)
라우터 기준
    <Route path="/" element={<Main />} />
    <Route path="/login" element={<Login />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/find-id" element={<FindId />} />
    <Route path="/find-pw" element={<FindPw />} />

data

hooks
    useSearch()  // 검색 상태 관리

utils
필터 로직 분리
    filterRecipes(recipes, category, difficulty)


구조 흐름 (중요)
    App.js
        ↓
    pages/
        ↓
    components/
        ↓
    styles/

    ![alt text](image.png)
App.js 역할
    1. 라우팅 관리
    2. Layout 연결
    3. 페이지 연결
    4. 전체 앱 구조 컨트롤
