# MainPage 설계 문서

---

## 1. 개요 (Overview)

Main 페이지는 zero-naeng-fe 서비스의 메인 화면을 제공하는 페이지이다.  

사용자는 보유한 식재료를 기반으로 맞춤 레시피를 추천받을 수 있으며,  
BEST 요리 목록도 함께 확인할 수 있다.  

또한 재료 관리 페이지 및 레시피 등록 페이지로 이동할 수 있는  
허브 역할을 수행한다.

---

## 2. 개발 환경

| 항목       | 내용            |
|------------|-----------------|
| Framework  | React           |
| Language   | JavaScript      |
| Routing    | React Router    |
| Component  | Card, Button, Section |
| Styling    | CSS             |

---

## 3. 폴더 구조 (Mermaid)

```mermaid
flowchart TD
    src --> Main
    Main --> Main_js[Main.js]
    Main --> Main_css[Main.css]
    Main --> match_css[recipeMatch.css]
```

---

## 4. MainPage 목적

- 사용자 보유 재료 기반 맞춤 레시피 추천 제공  
- BEST 레시피 목록 제공  
- 재료 관리 및 레시피 등록 페이지로 이동 기능 제공  
- 서비스의 메인 진입점(허브) 역할 수행  

---

## 5. 주요 기능 (Mermaid)

```mermaid
flowchart TD
    A[페이지 진입] --> B[LocalStorage 재료 불러오기]
    B --> C[재료 이름 배열 변환]
    C --> D[레시피 매칭 함수 실행]
    D --> E[추천 레시피 필터링]
    E --> F[상위 3개 추출]
    F --> G[UI 렌더링]

    G --> H[냉장고 상태 표시]
    G --> I[맞춤 추천 레시피]
    G --> J[BEST 레시피 목록]

    I --> K[레시피 클릭]
    J --> K
    K --> L[상세 페이지 이동]
```

---

## 6. UI 구조 (Mermaid)

```mermaid
flowchart TD
    MainPage
    MainPage --> Section1[냉장고 관리]
    MainPage --> Section2[맞춤 추천 레시피]
    MainPage --> Section3[추천 없음 안내]
    MainPage --> Section4[BEST 요리모음]

    Section1 --> FridgeCard[냉장고 상태 카드]
    Section2 --> MatchedRecipeList[추천 레시피 리스트]
    Section3 --> EmptyState[추천 없음 UI]
    Section4 --> RecipeCardList[레시피 카드 리스트]
```

---

## 7. 컴포넌트 구조 (Mermaid)

```mermaid
flowchart TD
    MainPage
    MainPage --> Section
    Section --> FridgeStatusCard
    Section --> MatchedRecipeCard
    Section --> Card
    Section --> Button
```

---

## 8. 데이터 흐름 (Mermaid)

```mermaid
flowchart TD
    A[LocalStorage myIngredients] --> B[JSON 파싱]
    B --> C[ingredientNames 배열 생성]
    C --> D[matchRecipesWithIngredients 실행]
    D --> E[매칭 결과 생성]
    E --> F[30% 이상 필터링]
    F --> G[상위 3개 추천 선택]
    G --> H[recommendedRecipes state 저장]
    H --> I[MatchedRecipeCard 렌더링]

    J[recipesData] --> K[BEST 레시피 슬라이싱]
    K --> L[Card 컴포넌트 렌더링]
```

---

## 9. DOM 구조

```mermaid
flowchart TD
    A[div.main_page_container]
    A --> B[main.con]

    B --> C[section.fridge]
    C --> C1[div.fridge_status_card]
    C1 --> C2[냉장고 아이콘]
    C1 --> C3[재료 개수 텍스트]
    C1 --> C4[재료 관리 버튼]

    B --> D[section.recommend]
    D --> D1[추천 설명 텍스트]
    D --> D2[div.card-wrapper]
    D2 --> D3[MatchedRecipeCard]

    B --> E[section.no_result]
    E --> E1[안내 아이콘]
    E --> E2[안내 텍스트]
    E --> E3[재료 추가 버튼]

    B --> F[section.best]
    F --> F1[div.card-wrapper]
    F1 --> F2[Card]
```

---

## 10. 전체 프로젝트 구조에서 위치 (Mermaid)

```mermaid
flowchart TD
    App --> MainPage
    App --> LoginPage
    App --> SearchPage
    App --> RegPage
    App --> RecipeRegPage
    App --> RecipeDetail

    MainPage --> RegPage
    MainPage --> RecipeDetail
    MainPage --> RecipeRegPage
```

---

## 11. 핵심 설계 포인트

- LocalStorage 기반으로 사용자 재료 데이터를 유지하여 상태 지속성 확보  
- 재료 기반 레시피 매칭 로직(matchRecipesWithIngredients)으로 개인화 추천 구현  
- 조건부 렌더링을 통해 추천 결과 유무에 따른 UX 분기 처리  
- Section 컴포넌트를 활용한 일관된 레이아웃 구조 설계  
- Card / MatchedRecipeCard 분리로 재사용성과 확장성 확보  
- 메인 페이지에서 재료 관리, 추천, 탐색 기능을 통합 제공  

---

## 12. 한 줄 핵심

> 사용자 재료를 기반으로 맞춤 레시피를 추천하고 서비스의 중심 역할을 수행하는 메인 페이지
