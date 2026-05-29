import React, { useState, useEffect, useCallback } from "react";
import { Bell, Lock, Globe, Moon, Shield, HelpCircle, ChevronRight, Loader2, Info } from "lucide-react";
import "./SettingsPage.css";
import customInstance from "../../api/api"; // 📡 자동 토큰 주입 및 401 재발급 기능이 포함된 Axios 인스턴스

export default function SettingsPage() {
  /**
   * [상태 관리: 일반 설정 관련]
   */
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationOn, setIsNotificationOn] = useState(false);
  
  /**
   * [상태 관리: 알림 목록 및 로딩 상태]
   */
  const [notifications, setNotifications] = useState([]); // 📡 백엔드에서 받아올 알림 리스트 상태
  const [isLoading, setIsLoading] = useState(false);       // 전체 API 조회 프로세스 로딩바 핸들링

  // 다크모드 스위치 핸들러
  const handleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  /* ==========================================================
     1. [GET] /api/users/settings 유저 설정 정보 조회 (스위치 상태 동기화)
     ========================================================== */
  

  /* ==========================================================
     2. [GET] /api/notifications 최신 알림 목록 조회 API
     ========================================================== */
  const fetchNotifications = useCallback(async () => {
    try {
      console.log("📡 [GET] /api/notifications 알림 목록 조회 시작");
      const res = await customInstance.get("/api/notifications");
      console.log("📦 알림 응답 데이터:", res.data);

      // 💡 수정된 부분: res.data.data.items 배열을 추출합니다.
      const finalData = res.data?.data?.items || [];
      
      console.log("💡 최종 추출된 알림 목록:", finalData);
      setNotifications(finalData);
    } catch (err) {
      console.error("❌ 알림 로딩 실패:", err);
      setNotifications([]); // 에러 시 빈 배열 처리
    }
  }, []);

  // 페이지 진입 시 설정 플래그와 알림 스택을 동시에 호출 및 갱신
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* ==========================================================
     3. [PATCH] 알림 스위치 토글 핸들러 (서버 상태 반영)
     ========================================================== */
  const handleNotification = async () => {
    const nextState = !isNotificationOn;
    setIsNotificationOn(nextState); // 비동기 지연 현상을 막기 위한 낙관적 업데이트 기법

    try {
      console.log(`📡 [PATCH] /api/users/settings 알림 상태 수정 전송 -> ${nextState}`);
      const requestPayload = { isNotificationOn: nextState };
      await customInstance.patch("/api/users/settings", requestPayload);
      console.log("✅ 서버 알림 설정 업데이트 완료");
    } catch (err) {
      console.error("❌ 서버 알림 설정 저장 실패 - 상태를 롤백합니다.", err);
      setIsNotificationOn(!nextState); // 에러 발생 시 원래 상태로 복구
      alert("알림 설정 변경 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <div className="settings_page">
      
      <main className="settings_container">
        <div className="settings_header" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h2>설정</h2>
          {isLoading && <Loader2 className="animate-spin" size={16} color="#764ba2" />}
        </div>

        {/* 1. 일반 설정 섹션 */}
        <section className="settings_section">
          <h3 className="settings_section_title">일반</h3>
          
          <div className="settings_list">
            {/* 알림 동의 스위치 */}
            <div className="setting_item">
              <div className="setting_left">
                <div className="setting_icon"><Bell size={20} /></div>
                <div className="setting_text_group">
                  <span className="setting_label">소비기한 알림</span>
                  <p className="setting_sub_label">유통기한 임박 재료 알림 받기</p>
                </div>
              </div>
              <div className="setting_toggle">
                <input 
                  type="checkbox" 
                  id="notification_toggle" 
                  checked={isNotificationOn} 
                  onChange={handleNotification}
                  disabled={isLoading} // API 조회 도중 무분별한 연속 클릭 차단
                />
                <label htmlFor="notification_toggle" className="toggle_switch"></label>
              </div>
            </div>

            {/* 언어 설정 */}
            <button className="setting_item">
              <div className="setting_left">
                <div className="setting_icon"><Globe size={20} /></div>
                <span className="setting_label">언어</span>
              </div>
              <div className="setting_right">
                <span className="setting_value">한국어</span>
                <ChevronRight size={20} className="setting_arrow" />
              </div>
            </button>

            {/* 다크 모드 스위치 */}
            <div className="setting_item">
              <div className="setting_left">
                <div className="setting_icon"><Moon size={20} /></div>
                <span className="setting_label">다크 모드</span>
              </div>
              <div className="setting_toggle">
                <input 
                  type="checkbox" 
                  id="dark_mode" 
                  checked={isDarkMode} 
                  onChange={handleDarkMode} 
                />
                <label htmlFor="dark_mode" className="toggle_switch"></label>
              </div>
            </div>
          </div>
        </section>

        {/* 🔥 [신규 통합] 2. 수신된 최신 알림 내역 리스트 섹션 */}
        <section className="settings_section">
          <h3 className="settings_section_title">최신 알림 내역</h3>
          <div className="settings_notification_list" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((notif) => ( // 설정 페이지 밸런스를 위해 최신 5개까지만 축약 표시
                <div 
                  key={notif.id} 
                  className={`settings_notif_card ${notif.isRead ? "read" : "unread"}`}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: notif.isRead ? "#f8fafc" : "#ffffff",
                    border: notif.isRead ? "1px solid #e2e8f0" : "1px solid #dcd3ff",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    boxShadow: notif.isRead ? "none" : "0 2px 8px rgba(118, 75, 162, 0.03)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: notif.isRead ? "#64748b" : "#1e293b" }}>
                      {notif.title}
                    </span>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {notif.createdAt ? notif.createdAt.slice(5, 10).replace("-", "/") : ""}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: notif.isRead ? "#94a3b8" : "#475569", lineHeight: "1.4" }}>
                    {notif.message}
                  </p>
                </div>
              ))
            ) : (
              /* 수신 내역 배열이 완전히 텅 비어있을 때 표출할 가이드 박스 */
              <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: "13px", display: "flex", alignItems: "center", justifyCenter: "center", gap: "6px", border: "1px dashed #cbd5e1", borderRadius: "10px", justifyContent: "center" }}>
                <Info size={16} />
                <span>새로운 알림 메시지가 없습니다.</span>
              </div>
            )}
          </div>
        </section>

        {/* 3. 보안 설정 섹션 */}
        <section className="settings_section">
          <h3 className="settings_section_title">보안</h3>
          <div className="settings_list">
            <button className="setting_item">
              <div className="setting_left">
                <div className="setting_icon"><Lock size={20} /></div>
                <span className="setting_label">비밀번호 변경</span>
              </div>
              <ChevronRight size={20} className="setting_arrow" />
            </button>
            <button className="setting_item">
              <div className="setting_left">
                <div className="setting_icon"><Shield size={20} /></div>
                <span className="setting_label">개인정보 처리방침</span>
              </div>
              <ChevronRight size={20} className="setting_arrow" />
            </button>
          </div>
        </section>

        {/* 4. 지원 섹션 */}
        <section className="settings_section">
          <h3 className="settings_section_title">지원</h3>
          <div className="settings_list">
            <button className="setting_item">
              <div className="setting_left">
                <div className="setting_icon"><HelpCircle size={20} /></div>
                <span className="setting_label">도움말</span>
              </div>
              <ChevronRight size={20} className="setting_arrow" />
            </button>
          </div>
        </section>

        <div className="app_version">
          <p>제로냉 버전 1.0.0</p>
        </div>
      </main>
    </div>
  );
}