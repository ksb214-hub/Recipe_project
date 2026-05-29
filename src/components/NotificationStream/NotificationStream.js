import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EventSourcePolyfill, NativeEventSource } from "event-source-polyfill";
import axios from "axios"; // 💡 401 발생 시 토큰 재발급 API를 직접 호출하기 위해 axios 임포트

const API_BASE = "http://localhost:8081/";

function NotificationStream() {
  const navigate = useNavigate();

  useEffect(() => {
    const EventSource = EventSourcePolyfill || NativeEventSource;
    
    // 💡 변수를 useEffect 스코프 상단에 선언하여 클린업 및 재귀 호출 시 접근 가능하게 합니다.
    let eventSource = null;
    let reconnectTimeout = null;
    let isRefreshing = false; // 토큰 재발급 중복 요청 방지 플래그

    const connectSSE = () => {
      // 기존에 예약된 재연결 타이머가 있다면 제거합니다.
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      
      const token = localStorage.getItem("accessToken");

      // 1. 로그인 상태 체크
      if (!token) {
        console.warn("⚠️ [SSE] 토큰이 없어 실시간 알림 연결을 하지 않습니다. (비로그인 상태)");
        return; 
      }

      console.log("🚀 [SSE] 실시간 알림 연결 시도... (Token 보유 중)");

      try {
        eventSource = new EventSource(
          `${API_BASE}api/notifications/stream`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // JWT 토큰 주입
            },
            heartbeatTimeout: 120000, // 2분 동안 반응 없으면 재연결 시도
            withCredentials: true,
          }
        );

        // [연결 성공 이벤트]
        eventSource.onopen = () => {
          console.log("✅ [SSE] 서버 연결 성공! 실시간 알림 채널이 활성화되었습니다.");
        };

        // [실시간 메시지 수신 이벤트]
        eventSource.onmessage = (event) => {
          try {
            // 스프링부트 서버에서 연결 유지용으로 보내는 더미 데이터는 무시 처리합니다.
            if (event.data.includes("connected") || event.data.includes("dummy")) return;
            
            const data = JSON.parse(event.data);
            if (data.message) {
              alert(`🔔 새 알림: ${data.message}`); // 브라우저 상단 알림 피드백
              
              // 💡 만약 알림이 올 때마다 설정 페이지의 리스트를 실시간 새로고침하고 싶다면
              // 커스텀 이벤트(CustomEvent)나 전역 상태(Context/Redux)를 여기서 dispatch할 수 있습니다.
            }
          } catch (err) {
            console.error("❌ [SSE] 데이터 파싱 에러:", err);
          }
        };

        // [연결 에러 핸들링]
        eventSource.onerror = async (err) => {
          console.error("❌ [SSE] 연결 에러 발생:", err);

          // 🚫 401 Unauthorized (인증 만료) 감지 시 자동 토큰 재발급 로직 돌입
          if (err.status === 401) {
            console.warn("🚫 [SSE] Access Token 만료 감지. 토큰 재발급 절차를 시작합니다.");
            eventSource.close(); // 기존 만료된 스트림 안전하게 차단

            if (!isRefreshing) {
              isRefreshing = true;
              try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) throw new Error("RefreshToken이 없습니다.");

                console.log("📡 [SSE-Refresh] /api/auth/tokens 토큰 재발급 요청");
                // api.js의 간섭을 피하기 위해 가공되지 않은 순수 axios로 요청을 보냅니다.
                const refreshRes = await axios.post(`${API_BASE}api/auth/tokens`, {
                  refreshToken: refreshToken
                });

                const newAccessToken = refreshRes.data?.accessToken || refreshRes.data?.data?.accessToken;
                const newRefreshToken = refreshRes.data?.refreshToken || refreshRes.data?.data?.refreshToken;

                if (newAccessToken) {
                  localStorage.setItem("accessToken", newAccessToken);
                  if (newRefreshToken) {
                    localStorage.setItem("refreshToken", newRefreshToken);
                  }
                  console.log("🔄 [SSE-Refresh] 토큰 재발급 성공! 3초 후 실시간 스트림 재연결을 수행합니다.");
                  
                  // 새 토큰을 반영하여 SSE 재연결 실행
                  isRefreshing = false;
                  reconnectTimeout = setTimeout(connectSSE, 3000);
                  return;
                }
              } catch (refreshError) {
                console.error("❌ [SSE-Refresh] Refresh Token 만료 또는 재발급 실패. 세션 완전 만료 처리");
                isRefreshing = false;
                
                if (window.confirm("로그인 세션이 만료되었습니다. 로그인 페이지로 이동하시겠습니까?")) {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  localStorage.removeItem("userNickname");
                  navigate("/login");
                }
                return;
              }
            }
          }

          // 401 에러가 아닌 일반적인 네트워크 단절/서버 다운일 경우 5초 뒤 자동 재연결 시도
          eventSource.close();
          reconnectTimeout = setTimeout(connectSSE, 5000);
        };

      } catch (err) {
        console.error("❌ [SSE] 초기화 실패:", err);
      }
    };

    // 최초 콤포넌트 마운트 시 SSE 연결 프로세스 가동
    connectSSE();

    // 🔌 클린업: 다른 페이지로 이동하거나 컴포넌트가 언마운트될 때 스트림과 타이머를 안전하게 해제
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        console.log("🔌 [SSE] 실시간 연결 안전 종료 (클린업)");
        eventSource.close();
      }
    };
  }, [navigate]);

  return null; // 화면이 없는 백그라운드 스트림 컴포넌트이므로 null 리턴
}

export default NotificationStream;