import axios from "axios";

// 1. 기본 주소에 /api를 추가하여 모든 요청이 http://localhost:8081/api로 가도록 설정
const API_BASE = "http://localhost:8081/api"; 

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// 요청 인터셉터: 모든 API 호출 전 실행
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // 2. 인증 헤더 추가 (Bearer 문자열과 토큰 사이에 공백 확인)
      config.headers["Authorization"] = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 발생 시 공통 처리
api.interceptors.response.use(
  (res) => res, // 성공 응답은 그대로 반환
  (err) => {
    // 3. 401(Unauthorized) 또는 403(Forbidden) 에러 발생 시 처리
    if (err.response?.status === 401 || err.response?.status === 403) {
      // 무한 루프 방지를 위해 로그인 페이지가 아닐 때만 작동
      if (!window.location.pathname.includes("/login")) {
        alert("인증이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.");
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;