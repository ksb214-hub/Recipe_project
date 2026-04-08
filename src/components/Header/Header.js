// src/components/Header/Header.js
import React from "react";
import { Link } from "react-router-dom";
// 필요한 아이콘들을 모두 import 합니다.
import { Home, Search, User, Refrigerator, Settings, LogOut } from "lucide-react"; 
import "./Header.css";

function Header() {
  // 로그아웃 핸들러 (필요 시 추가)
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      // 로그아웃 로직 처리 후 이동
      window.location.href = "/";
    }
  };

  return (
    <header className="header">
      <div className="header_container">
        {/* 로고 영역: 메인(Main) 페이지로 연결 */}
        <Link to="/main" className="logo">
          <Refrigerator className="logo_icon" size={24} color="white" strokeWidth={2.5} />
          <span className="logo_text">제로냉</span>
        </Link>

        {/* 내비게이션 메뉴: 402px 폭에 맞춰 간격 최적화 */}
        <nav className="nav_menu">
          <Link to="/main" className="nav_item" title="홈">
            <Home size={22} />
          </Link>
          <Link to="/search" className="nav_item" title="검색">
            <Search size={22} />
          </Link>
          {/* 마이페이지 혹은 로그인으로 연결 */}
          <Link to="/Login" className="nav_item" title="마이페이지">
            <User size={22} />
          </Link>
          {/* 설정 및 로그아웃 버튼 (선택 사항) */}
          <button onClick={handleLogout} className="nav_item logout_btn" title="로그아웃">
            <LogOut size={22} />
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;