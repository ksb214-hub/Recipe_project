---
title: zero-naeng-fe
description: 식재료 관리 및 레시피 추천 서비스
date: 2026-04-02
version: 1.0
status: development
stack:
  - React
  - React Router
  - JavaScript
  - CSS
  - Spring Boot
  - MySQL
  - Docker
sprint:
  - Sprint1: 인증 / 식재료 CRUD / 레시피 CRUD
  - Sprint2: 검색 / 음성인식 / 이미지 업로드
---

# 🧊 zero-naeng-fe

냉장고 식재료 관리 및 레시피 추천 서비스

사용자가 보유한 식재료를 관리하고 해당 재료로 만들 수 있는 레시피를 추천하여  
**식재료 소비 효율을 높이는 통합 서비스**입니다.

---

# 🎯 서비스 목표

### 1️⃣ 식재료 관리

- 냉장고 재료 등록
- 식재료 소비기한 관리
- 식재료 조회 기능

### 2️⃣ 레시피 추천

- 보유 식재료 기반 레시피 추천
- 레시피 등록 및 관리

### 3️⃣ 식비 관리

- 식재료 구매 비용 기록
- 식비 관리 지원

### 4️⃣ 통합 식생활 관리

식재료 관리 + 레시피 활용 + 식비 관리 기능을 하나의 서비스에서 제공

---

# 🚀 Sprint 계획

## 🟢 Sprint 1

핵심 CRUD 기능 구현

- 회원가입
- 로그인
- 식재료 등록
- 식재료 조회
- 레시피 등록
- 레시피 수정 / 삭제

### 서비스 흐름
flowchart TD
    A[회원가입] --> B[로그인]
    B --> C{로그인 성공?}

    C -->|Yes| D[식재료 등록]
    C -->|No| B

    D --> E[식재료 조회]
    E --> F[레시피 등록]
    F --> G[레시피 수정 / 삭제]

---

## 🟡 Sprint 2

서비스 확장 기능

- 이미지 업로드
- 음성 인식
- 카테고리 필터
- 검색 기능

---

# 🏗 시스템 아키텍처
flowchart TD
    A[사용자 Browser] --> B[React Frontend]
    B --> C[React Router]
    C --> D[Layout]

    D --> E[Header]
    D --> F[Pages]

    F --> G[Main]
    F --> H[Login]
    F --> I[SearchPage]

    H --> J[FindId]
    H --> K[FindPw]

---

# ⚛ React 컴포넌트 구조
flowchart TD
    A[App.js] --> B[Layout]
    B --> C[Header]
    B --> D[Main 영역]
    D --> E[Main]
    E --> E1[RecipeCard]
    E --> E2[RecipeList]
    D --> F[Login]
    D --> G[FindId]
    D --> H[FindPw]
    D --> I[SearchPage]
    I --> I1[SearchInput]
    I --> I2[CategoryFilter]
    I --> I3[DifficultyFilter]
    I --> I4[RecipeResults]

---

# 🔎 검색 기능 데이터 흐름
flowchart TD
    A[사용자 입력] --> B[Search Input]
    B --> C["searchQuery (State)"]
    C --> D["handleSearch()"]
    D --> E["filterRecipes()"]
    E --> F[Filtered Results]
    F --> G[React 렌더링]
    G --> H[Recipe Card 출력]


---

# 📁 프로젝트 폴더 구조
flowchart TD
    A[src] --> B[App.js]
    A --> C[layout]
    C --> C1[Layout.js]
    A --> D[components]
    D --> D1[Header]
    D --> D2[Card]
    D --> D3[Button]
    D --> D4[Input]
    A --> E[pages]
    E --> E1[Main]
    E --> E2[Login]
    E --> E3[Search]
    E --> E4[Find]
    A --> F[data]
    F --> F1[recipes.json]
    A --> G[styles]
    G --> G1[global.css]
    G --> G2[variables.css]
    A --> H[utils]
    H --> H1[filterRecipes.js]


---

# 🎨 디자인 시스템

### variables.css

- 색상
- 폰트
- spacing
- shadow

### global.css

- 전체 레이아웃
- 카드 스타일
- 버튼 스타일

---

# 🧠 핵심 기능 구조

flowchart TD
    A[레시피 서비스] --> B[사용자 기능]
    B --> B1[로그인]
    B --> B2[아이디 찾기]
    B --> B3[비밀번호 찾기]
    A --> C[검색 기능]
    C --> C1[검색어 입력]
    C --> C2[카테고리 필터]
    C --> C3[난이도 필터]
    A --> D[데이터]
    D --> D1[추천 레시피]
    D --> D2[크롤링 데이터]

---

# 🛠 기술 스택

## Frontend

- React
- React Router
- JavaScript
- CSS (Design System)

## Backend

- Spring Boot
- MySQL
- Docker

## API

- REST API
- Orval

---

# 🔄 서비스 흐름

flowchart TD
    A[사용자 접속] --> B[React App]
    B --> C[Router]
    C --> D[Layout]
    D --> E[Header + Page]
    E --> F["사용자 행동<br/>(검색 / 로그인)"]
    F --> G[State 변경]
    G --> H[UI 업데이트]

---

# 📌 실행 방법

### 1️⃣ 프로젝트 설치
### 2️⃣ 개발 서버 실행
### 3️⃣ 접속
---

# 📦 Backend 실행

Docker 실행
Backend 서버

---

# 📚 참고 자료

React 프로젝트 구조 참고

https://grape-curiosity-e94.notion.site/35b86a30c543458c9af716c50a331b77

---

# 📌 프로젝트 한 줄 정리
구성