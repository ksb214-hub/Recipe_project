import axios from "axios";

// 백엔드 서버의 기본 주소입니다.
const API_BASE = "http://localhost:8081/"; 

// axios 인스턴스를 만듭니다. (반복되는 설정을 미리 해두는 것)
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

/**
 * [요청 인터셉터]
 * 서버로 요청을 보내기 '직전'에 가로채서 실행됩니다.
 */
api.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 로그인할 때 저장해둔 토큰을 꺼냅니다.
    const token = localStorage.getItem("accessToken");
    if (token) {
      // 서버가 "누구세요?"라고 물을 때 쓸 수 있도록 헤더에 토큰을 넣어줍니다.
      config.headers["Authorization"] = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * [응답 인터셉터]
 * 서버에서 응답이 온 '직후'에 실행됩니다.
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 만약 서버에서 401(인증 만료) 에러를 보냈다면
    if (err.response?.status === 401) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      localStorage.clear(); // 낡은 정보는 다 지우고
      window.location.href = "/login"; // 로그인 페이지로 쫓아냅니다.
    }
    return Promise.reject(err);
  }
);

// Orval이라는 도구와 호환되기 위한 설정 (성공 시 데이터만 쏙 빼서 줌)
export default function customInstance({ url, method, params, data, headers, responseType }) {
  return api({ url, method, params, data, headers, responseType }).then((res) => res.data);
}

// 우리가 직접 Login.js 등에서 쓸 수 있게 api를 내보냅니다.
export { api };