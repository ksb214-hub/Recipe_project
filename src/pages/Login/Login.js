import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import api from "../../api/api"; 

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  // 상태 관리: 서버 명세(login_id, password) 준수
  const [loginId, setLoginId] = useState("");
  const [pw, setPw] = useState("");
  const [idError, setIdError] = useState("");
  const [pwError, setPwError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 기존 유효성 검사 로직 (이메일 체크 대신 아이디 체크로 변경)
  const validateId = (value) => {
    if (!value) setIdError("아이디를 입력해주세요.");
    else setIdError("");
  };

  const validatePassword = (value) => {
    if (value.length < 8) setPwError("비밀번호는 8자 이상이어야 합니다.");
    else setPwError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    validateId(loginId);
    validatePassword(pw);

    if (!loginId || pw.length < 8 || idError || pwError) return;

    try {
      const res = await api.post("/login", {
        loginId: loginId,
        password: pw,
      });

      const { accessToken, refreshToken } = res.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      alert("로그인 성공!");
      navigate("/"); 

    } catch (err) {
      console.error(err);
      alert("로그인 실패. 아이디/비밀번호를 확인하세요.");
    }
  };

  return (
    <div className="login_container">
      <main className="login_main">
        {/* 기존 스타일을 위해 login_form 클래스를 유지합니다 */}
        <div className="login_form">
          <h2 className="login_title">로그인</h2>
          
          <form onSubmit={handleSubmit}>
            {/* 아이디 입력 */}
            <Input
              type="text"
              id="input-id"
              placeholder="Enter your ID"
              value={loginId}
              className={idError ? "input_error" : ""}
              onChange={(e) => {
                setLoginId(e.target.value);
                validateId(e.target.value);
              }}
            />
            {idError && <p className="hint_text">{idError}</p>}

            {/* 비밀번호 입력 */}
            <div className="password_wrapper">
              <Input
                type={showPassword ? "text" : "password"}
                id="input-password"
                placeholder="Enter your password"
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
                style={{ cursor: 'pointer' }} // 클릭 가능 표시
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>
            {pwError && <p className="hint_text">{pwError}</p>}

            <Button 
              type="submit" 
              variant="primary" 
              disabled={!loginId || !pw}
            >
              로그인
            </Button>
          </form>

          <div className="login_footer">
            <Link to="/find-id">아이디 찾기</Link>
            <Link to="/find-pw">비밀번호 찾기</Link>
            <Link to="/signup">회원가입</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;