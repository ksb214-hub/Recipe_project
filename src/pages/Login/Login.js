import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";

import authRequest from "../../api/authRequest"; // ★ API 인스턴스

import "./Login.css";

function Login() {

  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [idError, setIdError] = useState("");
  const [pwError, setPwError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (value) => {
    if (!value.includes("@")) setIdError("이메일 형식이 올바르지 않습니다.");
    else setIdError("");
  };

  const validatePassword = (value) => {
    if (value.length < 6) setPwError("비밀번호는 6자 이상이어야 합니다.");
    else setPwError("");
  };

  // 로그인 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    validateEmail(id);
    validatePassword(pw);

    if (idError || pwError) return;

    try {
      const res = await authRequest.post("/login", {
        email: id,
        password: pw,
      });

      // 서버에서 AT, RT 반환 가정
      const { accessToken, refreshToken } = res.data;

      // 로컬스토리지 저장
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      alert("로그인 성공!");
      navigate("/"); // 메인 페이지 이동

    } catch (err) {
      console.error(err);
      alert("로그인 실패. 아이디/비밀번호를 확인하세요.");
    }
  };

  return (
    <div className="login_container">
      <main className="login_main">
        <div className="login_form">
          <h2 className="login_title">로그인</h2>
          <form onSubmit={handleSubmit}>

            <Input
              type="text"
              id="input-id"
              placeholder="Enter your email"
              value={id}
              className={idError ? "input_error" : ""}
              onChange={(e) => {
                setId(e.target.value);
                validateEmail(e.target.value);
              }}
            />
            {idError && <p className="hint_text">{idError}</p>}

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
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>
            {pwError && <p className="hint_text">{pwError}</p>}

            <Button type="submit" variant="primary" disabled={!id || !pw}>
              로그인
            </Button>
          </form>

          <div className="login_footer">
            <Link to="/find-id">아이디 찾기</Link>
            <Link to="/find-pw">비밀번호 찾기</Link>
            <Link to="/join">회원가입</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;