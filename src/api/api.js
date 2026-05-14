import axios from "axios";

const API_BASE = "http://localhost:8081/"; 

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// [메모리 주입 함수]
export const setClientToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("💉 [Memory] 토큰 메모리 주입 완료");
  }
};

/**
 * [요청 인터셉터]
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    console.log(`🚀 [Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; 
      console.log("✅ [Request] Authorization 헤더 부착 성공");
    } else {
      console.log("⚠️ [Request] 토큰 없음 (LocalStorage is empty)");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * [응답 인터셉터]
 */
api.interceptors.response.use(
  (res) => {
    console.log(`✨ [Response] Success: ${res.config.url}`);
    return res;
  },
  (err) => {
    const { config, response } = err;
    const requestUrl = config?.url || "";
    const isAuthPath = requestUrl.includes("/api/auth/login") || requestUrl.includes("/api/auth/signup");

    if (response?.status === 401) {
      console.error("🚫 [Response] 401 Unauthorized 발생!");
      if (!isAuthPath) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userNickname");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// 🔥 핵심 수정 부분: axios 인스턴스 자체를 default로 내보냅니다.
const customInstance = api;
export default customInstance;
export { api };