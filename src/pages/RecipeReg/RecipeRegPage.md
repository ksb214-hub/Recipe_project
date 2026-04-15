# RecipeRegPage 설계 문서

---

## 1. 개요 (Overview)

RecipeRegPage는 사용자가 직접 레시피를 등록하고 관리할 수 있는 페이지이다.

사용자는 다음 정보를 입력하여 자신만의 레시피를 생성할 수 있다:

- 레시피 이름
- 설명
- 조리 시간
- 난이도
- 이미지 URL

등록된 레시피는 Card 컴포넌트 형태로 화면에 출력되며,
수정 및 삭제 기능을 통해 관리할 수 있다.

또한 LocalStorage를 활용하여 새로고침 이후에도 데이터가 유지된다.

---

## 2. 개발 환경

| 항목 | 내용 |
| ------ | ------ |
| Framework | React |
| Language | JavaScript |
| Routing | React Router |
| Component | Input, Button, Card |
| Styling | CSS |
| Storage | LocalStorage |

---

## 3. 폴더 구조

```mermaid
flowchart TD

A[src]
A --> B[pages]
B --> C[RecipeReg]
C --> D[RecipeRegPage.js]
C --> E[RecipeRegPage.css]
```

### 구성 요소

- RecipeRegPage.js : 레시피 등록 / 수정 / 삭제 로직
- RecipeRegPage.css : UI 스타일

---

## 4. RecipeRegPage 목적

RecipeRegPage는 다음 기능을 제공한다:

- 레시피 등록
- 레시피 수정
- 레시피 삭제
- 레시피 카드 출력
- LocalStorage 저장

→ 사용자가 개인 레시피를 관리할 수 있는 CRUD 페이지

---

## 5. 주요 기능

```mermaid
flowchart TD

A[RecipeRegPage 기능]

A --> B[레시피 입력]
B --> B1[이름]
B --> B2[설명]
B --> B3[조리 시간]
B --> B4[난이도]
B --> B5[이미지 URL]

A --> C[레시피 등록]
C --> C1[Enter 등록]
C --> C2[버튼 등록]

A --> D[레시피 수정]
D --> D1[기존 데이터 자동 입력]

A --> E[레시피 삭제]

A --> F[LocalStorage 저장]

A --> G[Card 출력]
```

---

## 6. UI 구조

```mermaid
flowchart TD

A[RecipeRegPage UI]

A --> B[Header]
B --> B1[Title]
B --> B2[Description]

A --> C[Input Section]
C --> C1[이름 Input]
C --> C2[설명 Input]
C --> C3[시간 Input]
C --> C4[난이도 Input]
C --> C5[이미지 Input]

A --> D[Register Button]

A --> E[Divider]

A --> F[Recipe List]
F --> F1[Card Component]
```

---

## 7. 데이터 흐름

```mermaid
flowchart TD

A[User Input]
A --> B[Input Component]
B --> C[useState 저장]
C --> D[handleRegister 실행]
D --> E[recipes state 업데이트]
E --> F[LocalStorage 저장]
F --> G[Card 렌더링]
```

---

## 8. DOM 구조

```mermaid
flowchart TD

A[RecipeRegPage]

A --> B[Container]

B --> C[Header]
C --> C1[Title]
C --> C2[Description]

B --> D[Input Section]
D --> D1[Input fields]

B --> E[Button]
E --> E1[등록 / 수정]

B --> F[Divider]

B --> G[Card List]
G --> G1[Recipe Cards]
```

---

## 9. 전체 프로젝트 구조에서 위치

```mermaid
flowchart TD

A[App]

A --> B[Layout]
B --> C[Header]
B --> D[Router]

D --> E[Main Page]
D --> F[Login Page]
D --> G[RecipeRegPage]
D --> H[SearchPage]
D --> I[ExpensePage]
D --> J[SettingsPage]
```

---

## 10. 한 줄 핵심

> RecipeRegPage는 사용자가 레시피를 생성, 수정, 삭제하고 LocalStorage로 관리하는 CRUD 기반 페이지이다.
