import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// 설정(Settings) 아이콘을 추가로 불러왔습니다.
import { Home, Search, Refrigerator, LogOut, LogIn, Settings } from "lucide-react"; 
import "./Header.css";

function Header() {
  // 사용자의 이름을 담는 변수입니다. 이름이 있으면 로그인 상태로 판단합니다.
  const [nickname, setNickname] = useState(null);

  /**
   * [흐름 설명]
   * 페이지가 처음 켜질 때 브라우저의 '서랍(localStorage)'을 열어봅니다.
   * 저장된 이름이 있다면 닉네임 변수에 넣어 화면을 '로그인 상태'로 바꿉니다.
   */
  useEffect(() => {
    const storedNickname = localStorage.getItem("userNickname");
    if (storedNickname && storedNickname !== "undefined") {
      setNickname(storedNickname);
    }
  }, []);

  // 로그아웃을 누르면 서랍을 비우고 페이지를 새로고침해서 초기화합니다.
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.clear();
      setNickname(null);
      window.location.href = "/main";
    }
  };

  return (
    <header className="header">
      <div className="header_container">
        {/* 로고: 누르면 언제든 메인으로 돌아갑니다. */}
        <Link to="/main" className="logo">
          <Refrigerator className="logo_icon" size={24} color="white" />
          <span className="logo_text">제로냉</span>
        </Link>

        <nav className="nav_menu">
          {/* 각 메뉴 아이콘들입니다. */}
          <Link to="/main" className="nav_item" title="홈"><Home size={22} /></Link>
          <Link to="/search" className="nav_item" title="검색"><Search size={22} /></Link>
          
          {/* [추가된 부분] 설정 페이지로 이동하는 톱니바퀴 아이콘입니다. */}
          <Link to="/settings" className="nav_item" title="설정"><Settings size={22} /></Link>

          {/* 로그인 상태에 따라 '사용자 이름' 혹은 '로그인 아이콘'을 보여주는 스위치입니다. */}
          {nickname ? (
            <>
              <span className="user_welcome"><b>{nickname}</b>님</span>
              <button onClick={handleLogout} className="nav_item logout_btn">
                <LogOut size={22} />
              </button>
            </>
          ) : (
            <Link to="/Login" className="nav_item"><LogIn size={22} /></Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;