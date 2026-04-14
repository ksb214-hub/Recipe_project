import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// 아이콘 라이브러리
import { Home, Search, Refrigerator, LogOut, LogIn, Settings } from "lucide-react"; 
import { api, setClientToken } from "../../api/api"; 
import "./Header.css";

function Header() {
  /* =========================================================
     1. 상태 관리
     ========================================================= */
  const [nickname, setNickname] = useState(null);

  /* =========================================================
     2. 초기화 (Mount)
     - 페이지 로드 시 및 토큰 확인
     ========================================================= */
  useEffect(() => {
    const updateHeader = () => {
      const storedNickname = localStorage.getItem("userNickname");
      if (storedNickname && storedNickname !== "undefined") {
        setNickname(storedNickname);
      } else {
        setNickname(null);
      }
    };

    updateHeader();
    // 커스텀 이벤트나 탭 전환 시에도 동기화하고 싶다면 여기에 리스너를 추가할 수 있습니다.
  }, []);

  /* =========================================================
     3. 로그아웃 처리 (Logout Flow)
     ========================================================= */
  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;

    try {
      // 1. 서버에 로그아웃 요청 (인터셉터에서 토큰을 자동으로 실어 보냄)
      await api.post("/api/auth/logout");
      console.log("✅ 서버 세션 종료 성공");
    } catch (err) {
      // 401 Unauthorized 등 서버 실패 시에도 사용자에게 에러를 띄우지 않고 
      // 조용히 콘솔에만 기록하여 사용자 경험(UX)을 유지합니다.
      console.warn("⚠️ 서버 로그아웃 처리 건너뜀 (이미 만료됨):", err.response?.status);
    } finally {
      /* [핵심] 실패 여부와 상관없이 클라이언트 데이터는 무조건 삭제 */
      
      // 2. 브라우저 저장소 초기화
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userNickname");
      
      // 3. Axios 공통 헤더 초기화
      setClientToken(null);
      
      // 4. 전역 상태 초기화
      setNickname(null);

      alert("성공적으로 로그아웃되었습니다.");

      // 5. 페이지 이동 및 앱 상태 완전 초기화 (캐시/메모리 정리)
      window.location.href = "/main";
    }
  };

  /* =========================================================
     4. 화면 렌더링
     ========================================================= */
  return (
    <header className="header">
      <div className="header_container">
        
        {/* 로고 영역 */}
        <Link to="/main" className="logo">
          <Refrigerator className="logo_icon" size={24} color="white" />
          <span className="logo_text">제로냉</span>
        </Link>

        {/* 네비게이션 메뉴 */}
        <nav className="nav_menu">
          <Link to="/main" className="nav_item" title="홈">
            <Home size={22} />
          </Link>
          
          <Link to="/search" className="nav_item" title="검색">
            <Search size={22} />
          </Link>
          
          <Link to="/settings" className="nav_item" title="설정">
            <Settings size={22} />
          </Link>

          {/* 로그인 상태에 따른 조건부 렌더링 */}
          {nickname ? (
            <div className="header_user_info">
              <span className="user_welcome">
                <b>{nickname}</b>님
              </span>
              <button 
                onClick={handleLogout} 
                className="nav_item logout_btn" 
                title="로그아웃"
              >
                <LogOut size={22} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav_item" title="로그인">
              <LogIn size={22} />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;