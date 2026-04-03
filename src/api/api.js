import axios from "axios";

const API_BASE = "http://localhost:8081/api"; 

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// 요청 인터셉터 (기존 로직 유지)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (기존 로직 유지)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      if (!window.location.pathname.includes("/login")) {
        alert("인증이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.");
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

/**
 * ⭐ Orval Mutator 설정
 * Orval이 생성하는 모든 API 함수는 최종적으로 이 함수를 거쳐서 나갑니다.
 */
export default function customInstance({ url, method, params, data, headers, responseType }) {
  return api({
    url,
    method,
    params,
    data,
    headers,
    responseType,
  }).then((res) => res.data); // 성공 시 data만 깔끔하게 반환
}

// 기존 수동 호출용 export도 유지
export { api };