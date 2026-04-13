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
      // Bearer와 토큰 사이에 공백이 있는지, 토큰이 문자열 "null"이 아닌지 확인
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
    
    // 로그인, 회원가입, 레시피 목록(로그인 없이 보는 경우 등) 예외처리 확인 필요
    const isAuthPath = requestUrl.includes("/api/auth/login") || requestUrl.includes("/api/auth/signup");

    if (response?.status === 401) {
      console.error("🚫 [Response] 401 Unauthorized 발생!");
      console.error("실패한 URL:", requestUrl);
      console.error("보냈던 토큰:", config.headers["Authorization"]);

      if (!isAuthPath) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        // 세션/로컬스토리지 완전 초기화
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userNickname");
        
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(err);
  }
);

export default function customInstance({ url, method, params, data, headers, responseType }) {
  // api 인스턴스를 직접 사용하여 호출
  return api({ url, method, params, data, headers, responseType }).then((res) => res.data);
}

export { api };