import React, { useState } from "react";
import Header from "../../components/Header/Header"; 
import { Bell, Lock, Globe, Moon, Shield, HelpCircle, ChevronRight } from "lucide-react";
import "./SettingsPage.css";

export default function SettingsPage() {
  /**
   * [상태 관리: 다크 모드]
   * false: 라이트 모드 / true: 다크 모드
   */
  const [isDarkMode, setIsDarkMode] = useState(false);

  /**
   * [상태 관리: 소비기한 알림] - Sprint 2 핵심 기반
   * false: 알림 끔 / true: 알림 켬
   * 이 상태값은 나중에 useEffect 등에서 백엔드 API를 호출할지 결정하는 기준이 됩니다.
   */
  const [isNotificationOn, setIsNotificationOn] = useState(false);

  // 다크모드 스위치 핸들러
  const handleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 알림 스위치 핸들러
  const handleNotification = () => {
    const newState = !isNotificationOn;
    setIsNotificationOn(newState);
    
    // 알림을 켰을 때와 껐을 때 간단한 피드백을 줍니다.
    if (newState) {
      console.log("알림 기능이 활성화되었습니다. 소비기한을 체크합니다.");
    } else {
      console.log("알림 기능이 비활성화되었습니다.");
    }
  };

  return (
    <div className="settings_page">
      <Header />
      
      <main className="settings_container">
        <div className="settings_header">
          <h2>설정</h2>
        </div>

        {/* 1. 일반 설정 섹션 */}
        <section className="settings_section">
          <h3 className="settings_section_title">일반</h3>
          
          <div className="settings_list">
            {/* [수정] 알림 설정: 버튼에서 토글 스위치 방식으로 변경 */}
            <div className="setting_item">
              <div className="setting_left">
                <div className="setting_icon"><Bell size={20} /></div>
                <div className="setting_text_group">
                  <span className="setting_label">소비기한 알림</span>
                  {/* 작은 부연 설명을 추가하면 사용자가 더 이해하기 쉽습니다. */}
                  <p className="setting_sub_label">유통기한 임박 재료 알림 받기</p>
                </div>
              </div>
              <div className="setting_toggle">
                <input 
                  type="checkbox" 
                  id="notification_toggle" 
                  checked={isNotificationOn} 
                  onChange={handleNotification} 
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

        {/* 2. 보안 설정 섹션 */}
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

        {/* 3. 지원 섹션 */}
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