// src/pages/Login/Login.js
import React, { useState } from "react";
import { Link } from "react-router-dom";

import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";

import "./Login.css";

function Login() {

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const [idError, setIdError] = useState("");
  const [pwError, setPwError] = useState("");

  // 👁 비밀번호 보기 상태
  const [showPassword, setShowPassword] = useState(false);

  // 이메일 검사
  const validateEmail = (value) => {
    if (!value.includes("@")) {
      setIdError("이메일 형식이 올바르지 않습니다.");
    } else {
      setIdError("");
    }
  };

  // 비밀번호 검사
  const validatePassword = (value) => {
    if (value.length < 6) {
      setPwError("비밀번호는 6자 이상이어야 합니다.");
    } else {
      setPwError("");
    }
  };

  // 로그인 처리
  const handleSubmit = (e) => {
    e.preventDefault();

    validateEmail(id);
    validatePassword(pw);

    if (idError || pwError) return;

    console.log("로그인:", id, pw);
  };

  return (
    <div className="login_container">

      <main className="login_main">

        <div className="login_form">

          <h2 className="login_title">로그인</h2>

          {/* 🔥 form 안에 있으면 Enter 자동 실행 */}
          <form onSubmit={handleSubmit}>

            {/* 아이디 */}
            <Input
              type="text"
              id="input-id"
              placeholder="Enter your email"
              value={id}
              className={idError ? "input_error" : ""}
              onChange={(e) => {
                const value = e.target.value;
                setId(value);
                validateEmail(value);
              }}
            />

            {idError && <p className="hint_text">{idError}</p>}

            {/* 비밀번호 + 👁 */}
            <div className="password_wrapper">

              <Input
                type={showPassword ? "text" : "password"}
                id="input-password"
                placeholder="Enter your password"
                value={pw}
                className={pwError ? "input_error" : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setPw(value);
                  validatePassword(value);
                }}
              />

              {/* 👁 버튼 */}
              <span
                className="password_toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </span>

            </div>

            {pwError && <p className="hint_text">{pwError}</p>}

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              variant="primary"
              disabled={!id || !pw}
            >
              로그인
            </Button>
          </form>

          {/* footer */}
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