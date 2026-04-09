import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { api } from "../../api/api"; 
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  // 사용자가 입력할 값들을 저장하는 '상태(State)'
  const [loginId, setLoginId] = useState("");
  const [pw, setPw] = useState("");
  const [idError, setIdError] = useState("");
  const [pwError, setPwError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 아이디가 비었는지 검사하는 함수
  const validateId = (value) => {
    if (!value) setIdError("아이디를 입력해주세요.");
    else setIdError("");
  };

  // 비밀번호가 8자 이상인지 검사하는 함수
  const validatePassword = (value) => {
    if (value.length > 0 && value.length < 8) {
      setPwError("비밀번호는 8자 이상이어야 합니다.");
    } else if (!value) {
      setPwError("비밀번호를 입력해주세요.");
    } else {
      setPwError("");
    }
  };

  // 로그인 버튼을 눌렀을 때 실행되는 메인 함수
  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 기본 동작을 막음
    
    validateId(loginId);
    validatePassword(pw);

    // 에러가 있다면 서버에 요청을 보내지 않고 중단함
    if (!loginId || pw.length < 8 || idError || pwError) return;

    setIsLoading(true); // 로딩 중 상태로 변경

    try {
      // [흐름 1] 서버에 로그인 정보를 보냄
      const res = await api.post("", {
        loginId: loginId,
        password: pw,
      });

      // [흐름 2] 서버에서 준 데이터(토큰, 닉네임)를 변수에 담음
      const { accessToken, refreshToken, nickname } = res.data;

      // [흐름 3] 브라우저 로컬 스토리지에 저장 (컴퓨터를 꺼도 유지됨)
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userNickname", nickname || "사용자");

      alert(`${nickname || "사용자"}님, 환영합니다!`);
      
      // [흐름 4] 헤더의 상태를 갱신하기 위해 '페이지를 새로고침하며 이동'
      window.location.href = "/main";

    } catch (err) {
      console.error("로그인 실패:", err);
      alert("로그인 정보가 올바르지 않습니다.");
    } finally {
      setIsLoading(false); // 로딩 상태 해제
    }
  };

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
                  autoComplete="current-password" // 크롬 자동완성 경고 해결용
                  placeholder="비밀번호 입력"
                  value={pw}
                  onChange={(e) => { setPw(e.target.value); validatePassword(e.target.value); }}
                />
                <span onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                  {showPassword ? "🙈" : "👁"}
                </span>
              </div>
              {pwError && <p className="hint_text_error">{pwError}</p>}
            </div>

            <Button type="submit" variant="primary" disabled={isLoading || !loginId || pw.length < 8} style={{ width: '100%', marginTop: '20px' }}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Login;