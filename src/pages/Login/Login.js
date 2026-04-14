import React, { useState } from "react";
import { Link } from "react-router-dom"; 
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { api, setClientToken } from "../../api/api"; 
import "./Login.css";

function Login() {
  /* =========================================================
     1. 상태 관리 (State)
     ========================================================= */
  const [loginId, setLoginId] = useState("");
  const [pw, setPw] = useState("");
  const [idError, setIdError] = useState("");
  const [pwError, setPwError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* =========================================================
     2. 유효성 검사 (Validation)
     ========================================================= */
  const validateId = (value) => {
    if (!value) setIdError("아이디를 입력해주세요.");
    else setIdError("");
  };

  const validatePassword = (value) => {
    if (value.length > 0 && value.length < 8) {
      setPwError("비밀번호는 8자 이상이어야 합니다.");
    } else if (!value) {
      setPwError("비밀번호를 입력해주세요.");
    } else {
      setPwError("");
    }
  };

  /* =========================================================
     3. 로그아웃 처리 (Logout)
     ========================================================= */
  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;

    try {
      setIsLoading(true);
      await api.post("/api/auth/logout");
    } catch (err) {
      console.error("서버 로그아웃 중 오류 발생:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userNickname");
      setClientToken(null);
      alert("성공적으로 로그아웃되었습니다.");
      setIsLoading(false);
      window.location.href = "/";
    }
  };
  
  /* =========================================================
     4. 로그인 처리 (Login)
     ========================================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    validateId(loginId);
    validatePassword(pw);

    if (!loginId || pw.length < 8 || idError || pwError) return;

    setIsLoading(true);

    try {
      const res = await api.post("/api/auth/login", {
        loginId: loginId,
        password: pw,
      });
      
      const serverResponse = res.data; 
      const innerData = serverResponse.data; 
      const parsedData = typeof innerData === 'string' ? JSON.parse(innerData) : innerData;

      const token = parsedData?.accessToken || parsedData?.token;
      const nickname = parsedData?.nickname || "사용자";

      if (!token) throw new Error("토큰 추출 실패");

      localStorage.setItem("accessToken", token);
      localStorage.setItem("userNickname", nickname);
      setClientToken(token);
      
      alert(`${nickname}님, 환영합니다!`);
      
      setTimeout(() => {
        window.location.href = "/main";
      }, 100);

    } catch (err) {
      const errorMsg = err.response?.data?.message || "아이디 또는 비밀번호를 확인해주세요.";
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================
     5. 화면 렌더링 (View)
     ========================================================= */
  return (
    <div className="login_container">
      <main className="login_main">
        <div className="login_form">
          <h2 className="login_title">제로냉 로그인</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="input_group">
              <label htmlFor="input-id">ID</label>
              <Input
                id="input-id"
                type="text"
                placeholder="아이디 입력"
                value={loginId}
                onChange={(e) => { setLoginId(e.target.value); validateId(e.target.value); }}
              />
              {idError && <p className="hint_text_error">{idError}</p>}
            </div>

            <div className="input_group">
              <label htmlFor="input-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Input
                  id="input-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="비밀번호 입력"
                  value={pw}
                  onChange={(e) => { setPw(e.target.value); validatePassword(e.target.value); }}
                />
                <span 
                  onClick={() => setShowPassword(!showPassword)} 
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '18px' }}
                >
                  {showPassword ? "🙈" : "👁"}
                </span>
              </div>
              {pwError && <p className="hint_text_error">{pwError}</p>}
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              disabled={isLoading || !loginId || pw.length < 8} 
              style={{ width: '100%', marginTop: '20px' }}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          {/* 추가된 하단 링크 영역 */}
          <footer className="login_footer">
            <div className="find_account_links">
              <Link to="/find-id" className="footer_link">아이디 찾기</Link>
              <span className="footer_divider">|</span>
              <Link to="/find-pw" className="footer_link">비밀번호 찾기</Link>
            </div>

            <div className="signup_info">
              <span>아직 계정이 없으신가요?</span>
              <Link to="/join" className="signup_link">회원가입 하러가기</Link>
            </div>
          </footer>

          {localStorage.getItem("accessToken") && (
            <button 
              onClick={handleLogout} 
              className="logout_text_btn"
              style={{ marginTop: '20px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline' }}
            >
              로그아웃 테스트
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default Login;