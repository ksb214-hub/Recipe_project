import React, { useState, useEffect } from "react";
// 1. useNavigate 경고/에러 해결을 위해 Link만 남기고 제거했습니다.
import { Link } from "react-router-dom"; 
import { 
  User, 
  Settings, 
  LogOut, 
  Search, 
  Wallet, 
  LogIn 
} from "lucide-react";
import "./Header.css";

/**
 * [Header 컴포넌트]
 * - 성빈님의 '제로냉' 서비스 전체 네비게이션을 담당합니다.
 * - 로그인 상태(닉네임)를 감지하여 메뉴를 유동적으로 변경합니다.
 */
export default function Header() {
  // 2. 사용하지 않는 navigate 선언부를 삭제하여 ESLint 경고를 해결했습니다.
  const [nickname, setNickname] = useState(null);

  /* =========================================================
     1. 초기화 (Mount)
     - 로컬 스토리지에서 닉네임을 읽어와 상태에 저장합니다.
     ========================================================= */
  useEffect(() => {
    const updateHeader = () => {
      const storedNickname = localStorage.getItem("userNickname");
      // 유효하지 않은 값(undefined, null 문자열) 체크
      if (storedNickname && storedNickname !== "undefined" && storedNickname !== "null") {
        setNickname(storedNickname);
      } else {
        setNickname(null);
      }
    };

    updateHeader();
  }, []);

  /* =========================================================
     2. 안전한 로그아웃 핸들러
     - 서버 응답과 관계없이 클라이언트 데이터를 확실히 비웁니다.
     ========================================================= */
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      // 1. 브라우저 저장 정보 삭제
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userNickname");
      
      // 2. 리액트 상태 초기화
      setNickname(null);
      
      alert("성공적으로 로그아웃되었습니다.");
      
      // 3. 페이지 새로고침과 함께 메인으로 이동 (navigate 대신 사용하여 상태 완전 박멸)
      window.location.href = "/main";
    }
  };

  return (
    <header className="header">
      <div className="header_container">
        {/* 로고 영역 */}
        <Link to="/main" className="logo">
          <span className="logo_icon">❄️</span>
          <span className="logo_text">제로냉</span>
        </Link>

        {/* 네비게이션 메뉴 영역 */}
        <nav className="nav_menu">
          
          <Link to="/search" className="nav_item" title="레시피 검색">
            <Search className="size-5" />
          </Link>
          
          <Link to="/expense" className="nav_item" title="지출 관리">
            <Wallet className="size-5" />
          </Link>

          {/* 로그인 상태에 따른 조건부 메뉴 */}
          {nickname ? (
            <>
              <Link to="/profile" className="nav_item user_profile_link" title="프로필">
                <User className="size-5" />
              </Link>
              <button 
                onClick={handleLogout} 
                className="nav_item logout_btn" 
                title="로그아웃"
              >
                <LogOut className="size-5" />
              </button>
            </>
          ) : (
            <Link to="/login" className="nav_item login_link" title="로그인">
              <LogIn className="size-5" />
            </Link>
          )}

          <Link to="/settings" className="nav_item" title="설정">
            <Settings className="size-5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}