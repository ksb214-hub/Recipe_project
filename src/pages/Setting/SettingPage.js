import React, { useState } from "react";
import Header from "../../components/Header/Header"; 
import { Bell, Lock, Globe, Moon, Shield, HelpCircle, ChevronRight } from "lucide-react";
import "./SettingsPage.css";

export default function SettingsPage() {
  /**
   * [흐름 설명: 다크 모드 제어]
   * isDarkMode라는 변수가 스위치 역할을 합니다.
   * false면 일반 모드, true면 다크 모드입니다.
   */
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 스위치를 딸깍거릴 때마다 상태를 반대로(true <-> false) 바꿔줍니다.
  const handleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // 나중에 여기에 다크모드 전용 CSS를 입히는 코드가 들어갈 예정입니다.
  };

  return (
    <div className="settings_page">
      {/* 상단 공통 헤더를 불러옵니다. */}
      <Header />
      
      <main className="settings_container">
        <div className="settings_header">
          <h2>설정</h2>
        </div>

        {/* 1. 일반 설정 섹션: 알림과 언어, 테마를 관리합니다. */}
        <section className="settings_section">
          <h3 className="settings_section_title">일반</h3>
          
          <div className="settings_list">
            {/* 알림 설정: 추후 유통기한 알림 기능을 여기에서 켜고 끌 수 있게 확장합니다. */}
            <button className="setting_item" onClick={() => alert("알림 설정 페이지는 준비 중입니다!")}>
              <div className="setting_left">
                <div className="setting_icon"><Bell size={20} /></div>
                <span className="setting_label">알림 설정</span>
              </div>
              <ChevronRight size={20} className="setting_arrow" />
            </button>

            {/* 언어 설정 섹션 */}
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

            {/* 다크 모드 스위치: 눈을 편안하게 하기 위한 기능입니다. */}
            <div className="setting_item">
              <div className="setting_left">
                <div className="setting_icon"><Moon size={20} /></div>
                <span className="setting_label">다크 모드</span>
              </div>
              <div className="setting_toggle">
                {/* 체크박스가 체크되면 handleDarkMode 함수가 실행됩니다. */}
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

        {/* 2. 보안 설정 섹션: 개인정보와 비밀번호를 관리합니다. */}
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

        {/* 3. 지원 섹션: 도움이 필요할 때 찾는 곳입니다. */}
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

        {/* 하단 버전 정보 표시 */}
        <div className="app_version">
          <p>제로냉 버전 1.0.0</p>
        </div>
      </main>
    </div>
  );
}