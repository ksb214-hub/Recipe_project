import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
// import api from "../../api/api"; // 백엔드 연결 시 주석 해제

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  // 상태 관리
  const [loginId, setLoginId] = useState("");
  const [pw, setPw] = useState("");
  const [idError, setIdError] = useState("");
  const [pwError, setPwError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  // 유효성 검사 로직
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

  // 로그인 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    validateId(loginId);
    validatePassword(pw);

    if (!loginId || pw.length < 8 || idError || pwError) return;

    setIsLoading(true); // 로딩 시작

    try {
      // --- [시연용 더미 로직] 1초 후 로그인 성공 시뮬레이션 ---
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 시연용 계정: admin / 12345678
      if (loginId === "admin" && pw === "12345678") {
        const dummyData = {
          accessToken: "mock-access-token-seongbin-0624",
          refreshToken: "mock-refresh-token-seongbin-0624",
          nickname: "성빈님",
        };

        // 로컬 스토리지 저장 (인터셉터 및 헤더 표시용)
        localStorage.setItem("accessToken", dummyData.accessToken);
        localStorage.setItem("refreshToken", dummyData.refreshToken);
        localStorage.setItem("userNickname", dummyData.nickname);

        alert(`${dummyData.nickname}님, 환영합니다!`);
        navigate("/"); // 메인 페이지로 이동
      } else {
        alert("아이디 또는 비밀번호가 틀렸습니다.\n(시연용: admin / 12345678)");
      }

      /* // --- [백엔드 연결 시 사용할 실제 코드] ---
      const res = await api.post("/login", {
        loginId: loginId,
        password: pw,
      });
      const { accessToken, refreshToken } = res.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      navigate("/"); 
      */

    } catch (err) {
      console.error(err);
      alert("서버 연결에 실패했습니다. 네트워크를 확인해주세요.");
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  return (
    <div className="login_container">
      <main className="login_main">
        <div className="login_form">
          <h2 className="login_title">제로냉 로그인</h2>
          
          <form onSubmit={handleSubmit}>
            {/* 아이디 입력 영역 */}
            <div className="input_group">
              <label htmlFor="input-id">ID</label>
              <Input
                type="text"
                id="input-id"
                placeholder="아이디를 입력하세요 (admin)"
                value={loginId}
                className={idError ? "input_error" : ""}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  validateId(e.target.value);
                }}
              />
              {idError && <p className="hint_text_error">{idError}</p>}
            </div>

            {/* 비밀번호 입력 영역 */}
            <div className="input_group">
              <label htmlFor="input-password">Password</label>
              <div className="password_wrapper" style={{ position: 'relative' }}>
                <Input
                  type={showPassword ? "text" : "password"}
                  id="input-password"
                  placeholder="비밀번호를 입력하세요 (12345678)"
                  value={pw}
                  className={pwError ? "input_error" : ""}
                  onChange={(e) => {
                    setPw(e.target.value);
                    validatePassword(e.target.value);
                  }}
                />
                <span
                  className="password_toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
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

          <div className="login_footer">
            <Link to="/find-id">아이디 찾기</Link>
            <span className="divider">|</span>
            <Link to="/find-pw">비밀번호 찾기</Link>
            <span className="divider">|</span>
            <Link to="/join">회원가입</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;