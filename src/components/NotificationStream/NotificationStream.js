import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EventSourcePolyfill, NativeEventSource } from "event-source-polyfill";

function NotificationStream() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    // 1. 로그인 체크 로직
    if (!token) {
      console.warn("⚠️ [SSE] 토큰이 없어 연결하지 않습니다.");
      return; 
    }

    const EventSource = EventSourcePolyfill || NativeEventSource;
    
    // ✅ 중요: 변수를 useEffect 스코프 상단에 선언하여 어디서든 접근 가능하게 합니다.
    let eventSource = null;
    let reconnectTimeout = null;

    const connectSSE = () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      
      console.log("🚀 [SSE] 실시간 알림 연결 시도...");

      try {
        eventSource = new EventSource(
          "http://localhost:8081/api/notifications/stream",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            heartbeatTimeout: 120000, 
            withCredentials: true,
          }
        );

        eventSource.onopen = () => {
          console.log("✅ [SSE] 서버 연결 성공!");
        };

        eventSource.onmessage = (event) => {
          try {
            if (event.data.includes("connected") || event.data.includes("dummy")) return;
            const data = JSON.parse(event.data);
            if (data.message) alert(`🔔 새 알림: ${data.message}`);
          } catch (err) {
            console.error("❌ [SSE] 데이터 파싱 에러:", err);
          }
        };

        eventSource.onerror = (err) => {
          console.error("❌ [SSE] 연결 에러 발생:", err);

          if (err.status === 401) {
            console.error("🚫 [SSE] 인증 만료.");
            eventSource.close();
            if (window.confirm("세션이 만료되었습니다. 로그인 페이지로 이동할까요?")) {
              navigate("/login");
            }
            return; 
          }

          eventSource.close();
          reconnectTimeout = setTimeout(connectSSE, 5000);
        };

      } catch (err) {
        console.error("❌ [SSE] 초기화 실패:", err);
      }
    };

    connectSSE();

    // 🔌 클린업: 컴포넌트가 사라질 때 안전하게 닫기
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        console.log("🔌 [SSE] 연결 종료");
        eventSource.close();
      }
    };
  }, [navigate]);

  return null;
}

export default NotificationStream;