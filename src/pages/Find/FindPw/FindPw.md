# 📄 FindPw 설계 문서

---

## 1. 개요 (Overview)

FindPw 페이지는 사용자가 비밀번호를 찾기 위해 아이디를 입력하는 페이지이다.

입력된 아이디를 기반으로 비밀번호 재설정 요청을 수행하며,
추후 이메일 인증 및 비밀번호 변경 페이지로 확장될 수 있는 구조이다.

---

## 2. 개발 환경

| 항목 | 내용 |
| ------ | ------ |
| Framework | React |
| Language | JavaScript |
| Routing | React Router |
| Component | Input, Button |
| Styling | CSS |

---

## 3. 폴더 구조 (Mermaid)

```mermaid
flowchart TD

A[src]
A --> B[pages]
B --> C[Login]
C --> D[find_pw]
D --> E[FindPw.js]
D --> F[FindPw.css]

C --> G[find_id]
G --> H[FindId.js]
G --> I[FindId.css]

A --> J[Login.js]
A --> K[Login.css]
A --> L[SearchPage]
A --> M[Main]
```

---

## 4. FindPw 목적 (Mermaid)

```mermaid
flowchart TD

A[FindPw Page]
A --> B[아이디 입력 기반 비밀번호 찾기]
A --> C[비밀번호 재설정 요청]
A --> D[이메일 인증 또는 다음 단계 이동]
```

---

## 5. 주요 기능 (Mermaid)

```mermaid
flowchart TD

A[User]
A --> B[아이디 입력]
B --> C[Input 컴포넌트]
C --> D[useState 저장]
D --> E[handleSubmit 실행]
E --> F[비밀번호 찾기 API 요청]
F --> G[응답 처리]
G --> H[다음 단계 이동]
```

---

## 6. UI 구조 (Mermaid)

```mermaid
flowchart TD

A[FindPw Page]

A --> B[Header]
B --> C[Logo]
B --> D[Login Link]

A --> E[Main]

E --> F[Title: 비밀번호 찾기]
E --> G[Description]
E --> H[Form]

H --> I[Input - 아이디]
H --> J[Button - 다음]

E --> K[Bottom Link]
```

---

## 7. 데이터 흐름 (Mermaid)

```mermaid
flowchart TD

A[User Input]
A --> B[Input State]
B --> C[handleSubmit]
C --> D[Backend API Request]
D --> E{ID 존재 여부}

E -->|YES| F[재설정 프로세스]
E -->|NO| G[에러 메시지]
```

---

## 8. DOM 구조 (Mermaid)

```mermaid
flowchart TD

A[find-container]

A --> B[find-main]

B --> C[main-title]
B --> D[description]

B --> E[form]

E --> F[label-input]
F --> G[input]

E --> H[form-main-button]
H --> I[button]

B --> J[bottom-link]
```

---

## 9. 전체 프로젝트 구조에서 위치 (Mermaid)

```mermaid
flowchart TD

A[src]

A --> B[App.js]
A --> C[Main]
A --> D[Login]
A --> E[SearchPage]

D --> F[find_id]
D --> G[find_pw]

G --> H[FindPw.js]
```

---

## 10. 한 줄 핵심

> FindPw 페이지는 아이디 입력을 기반으로 비밀번호 재설정을 시작하는 인증 보조 페이지이다.
