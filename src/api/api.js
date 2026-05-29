import axios from "axios";

// 💡 CORS 에러 해결 및 package.json proxy 설정을 활성화하기 위해 상대 경로로 수정
const API_BASE = "/"; 

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

/**
 * 🔒 [JWT 토큰 로컬 유효성 자체 검증 함수]
 * QA 명세서 규칙: 시스템이 변조된 토큰을 그대로 통과시키지 않고, 
 * 프론트엔드 자체 검증을 통해 차단 및 세션 만료 처리를 진행합니다.
 */
const isTokenMalformed = (token) => {
  if (!token) return false;
  // JWT는 구조적으로 2개의 점('.')을 포함하여 총 3파트로 나뉩니다.
  const parts = token.split(".");
  if (parts.length !== 3) return true; // 형식이 깨진 변조 토큰

  try {
    // Base64 디코딩을 통해 JSON 구조가 올바른지 자체 검증합니다.
    const payload = JSON.parse(atob(parts[1]));
    if (!payload || typeof payload !== "object") return true;
  } catch (e) {
    return true; // 디코딩 실패 시 변조된 토큰으로 판단
  }
  return false;
};

/**
 * [메모리 Authorization 주입 함수]
 */
export const setClientToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("💉 [Memory] 토큰 메모리 주입 완료");
  }
};

/**
 * 🚀 [요청 인터셉터 - Request Interceptor]
 * 서버로 요청을 보내기 전 변조 여부를 1차 필터링합니다.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    console.log(`🚀 [Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    // 🎯 [QA 명세 반영]: 로컬 스토리지의 accessToken 변조 여부 체크
    if (token && isTokenMalformed(token)) {
      console.error("🚨 [Security Alert] 변조된 구조의 토큰이 감지되었습니다.");
      
      // 즉시 세션 파기 및 경고창 출력
      alert("로그인 세션이 만료되었습니다.\n다시 로그인해주세요.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userNickname");
      window.location.href = "/login";
      
      return Promise.reject(new Error("Malformed token blocked by frontend validation."));
    }

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
 * ✨ [응답 인터셉터 - Response Interceptor]
 * 401 Unauthorized 에러 발생 시 POST /api/auth/tokens 자동 재발급 및 자동 재시도 로직 수행
 */
api.interceptors.response.use(
  (res) => {
    console.log(`✨ [Response] Success: ${res.config.url}`);
    return res;
  },
  async (err) => {
    const { config, response } = err;
    
    // 원래 요청 정보가 없거나 응답이 없는 경우는 예외 처리
    if (!config || !response) {
      return Promise.reject(err);
    }

    // 🎯 [QA 명세 반영]: 인증 실패(401) 처리 스펙 및 자동 재발급 연동
    if (response.status === 401 && !config._retry) {
      config._retry = true; // 무한 루프 방지 플래그 설정
      console.log("🔄 [401 Unauthorized] 토큰 만료 감지 -> 자동 액세스 토큰 재발급 프로세스 시작");

      try {
        // 백엔드 명세 규칙: POST /api/auth/tokens 호출
        // 프론트 쿠키에 세션 정보가 함께 전달되도록 withCredentials 옵션을 켜두는 것이 정석입니다.
        const refreshRes = await axios.post(
          "/api/auth/tokens", 
          {}, 
          { withCredentials: true } 
        );

        console.log("📦 토큰 재발급 응답 결과:", refreshRes.data);

        // 백엔드 응답 포맷 통합 파싱
        const newAccessToken = refreshRes.data?.accessToken || refreshRes.data?.data?.accessToken;
        const newRefreshToken = refreshRes.data?.refreshToken || refreshRes.data?.data?.refreshToken;

        if (newAccessToken) {
          // 1. 새 토큰 로컬 스토리지 동기화 및 메모리 주입 업데이트
          localStorage.setItem("accessToken", newAccessToken);
          setClientToken(newAccessToken);
          
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          console.log("🔄 [Success] 토큰 자동 갱신 완료. 기존 요청 즉시 재시도 수행");

          // 2. 원래 실패했던 요청 헤더에 새 토큰을 교체 장착하여 실시간 재요청 처리
          config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axios(config); 
        }
      } catch (refreshError) {
        console.error("❌ [Failure] 재발급 API 호출 실패 또는 만료 완료 처리:", refreshError);
        
        // 재발급 인프라가 작동하지 않거나 만료된 상태라면 최종 만료 안내 후 로그인 이동
        alert("로그인 세션이 만료되었습니다.\n다시 로그인해주세요.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userNickname");
        window.location.href = "/login";
        
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(err);
  }
);

export default api;