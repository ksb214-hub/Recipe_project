# 2026.04.03
# 🛠️ 오늘 진행한 작업 요약

## 주요 기술 스택
- Orval (v7.3.0)
- Axios
- TypeScript
- Swagger / OpenAPI Specification

---

# 🎯 핵심 목표

백엔드 API 명세(Swagger / OpenAPI)를 기반으로  
**프론트엔드 API 호출 코드와 TypeScript 타입을 자동 생성하는 환경 구축**

이를 통해

- API 호출 코드 자동 생성
- 타입 안정성 확보
- 프론트-백엔드 협업 효율 향상

을 목표로 작업을 진행하였다.

---

# 1️⃣ Orval 환경 설정 및 트러블슈팅

## 버전 문제 해결

최신 버전에서 발생한 오류

Failed to resolve input

문제 해결 방법

- Orval 버전을 안정적인 **v7.3.0**으로 다운그레이드


npm install orval@7.3.0

---

## 설정 파일 호환성 해결

기존 설정 파일

orval.config.js

Node.js 환경 호환 문제 해결을 위해

orval.config.cjs

**CommonJS 형식으로 변경**

---

## Swagger 경로 문제 해결

Swagger URL을 파일 경로로 오인하는 문제가 발생하였다.

문제 해결 방법

1. Swagger JSON을 로컬로 다운로드
2. `openapi.json` 파일 생성
3. 해당 파일을 기준으로 Orval 코드 생성

openapi.json

---

# 2️⃣ Axios Mutator (커스텀 인스턴스) 통합

기존 프로젝트에서 사용하던 Axios 인터셉터 로직을  
Orval이 생성하는 API 함수들과 **연결하기 위한 브릿지 구조를 구현**

기존 Axios 설정

api.js

주요 기능

- Bearer Token 자동 주입
- 401 / 403 인증 오류 처리

---

## customInstance 구현

Orval에서 생성된 API 함수들이  
기존 Axios 인스턴스를 그대로 사용할 수 있도록 **Mutator 구조 구현**

```javascript
export const customInstance = (config) => {
  return api(config).then((res) => res.data);
};
```


# 2026.04.06
# 🛠️ 오늘 진행한 작업 요약

sprint2 계획 및 목록화, 화면 설계 수정 및 추가