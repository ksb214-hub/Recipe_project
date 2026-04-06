import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import api from "../../api/api"; // 백엔드 연결 시 주석 해제
import "./SignUpPage.css";

function SignUpPage() {
  const navigate = useNavigate();

  // 폼 상태 관리
  const [form, setForm] = useState({
    loginId: "",    
    password: "",   
    nickname: "",   
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // 입력 시 실시간으로 에러 메시지 제거
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // 유효성 검사
  const validate = () => {
    const newErrors = {};
    if (!form.loginId) newErrors.loginId = "아이디를 입력하세요";
    if (form.password.length < 8) newErrors.password = "비밀번호는 8자 이상이어야 합니다";
    if (!form.nickname) newErrors.nickname = "닉네임을 입력하세요";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 회원가입 제출 처리 (시연용 더미 로직)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      // --- [시연 시나리오 1: 회원가입 시뮬레이션] ---
      console.log("회원가입 요청 중...", form);
      await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5초 대기

      // 아이디 중복 체크 시연 (아이디가 'admin'이면 실패하게 설정)
      if (form.loginId === "admin") {
        alert("이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.");
        setLoading(false);
        return;
      }

      // --- [시연 시나리오 2: 자동 로그인 시뮬레이션] ---
      console.log("자동 로그인 진행 중...");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 추가 대기

      // 가짜 토큰 및 정보 저장
      const dummyToken = "mock-token-" + Math.random().toString(36).substring(7);
      localStorage.setItem("accessToken", dummyToken);
      localStorage.setItem("userNickname", form.nickname);
      localStorage.setItem("isLoggedIn", "true");

      alert(`${form.nickname}님, 제로냉에 오신 것을 환영합니다! 🥕`);
      
      // 시연용 리다이렉트 (재료 등록 페이지나 메인으로)
      navigate("/reg"); 

      /* // --- [실제 백엔드 연결용 코드] ---
      await api.post("/signup", form);
      const loginRes = await api.post("/login", { loginId: form.loginId, password: form.password });
      localStorage.setItem("accessToken", loginRes.data.accessToken);
      navigate("/reg");
      */

    } catch (err) {
      console.error(err);
      alert("회원가입 처리 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup_container">
      <div className="signup_box">
        <h2 className="signup_title">제로냉 회원가입</h2>
        <p className="signup_subtitle">나만의 냉장고를 스마트하게 관리해보세요</p>

        <form className="signup_form" onSubmit={handleSubmit}>
          {/* 아이디 입력 */}
          <div className="input_group">
            <label htmlFor="loginId">아이디</label>
            <input
              id="loginId"
              type="text"
              name="loginId"
              value={form.loginId}
              onChange={handleChange}
              placeholder="사용하실 아이디 (예: admin은 중복됨)"
              className={errors.loginId ? "input_error" : ""}
            />
            {errors.loginId && <p className="error_text">{errors.loginId}</p>}
          </div>

          {/* 비밀번호 입력 */}
          <div className="input_group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="8자 이상 안전한 비밀번호"
              autoComplete="new-password"
              className={errors.password ? "input_error" : ""}
            />
            {errors.password && <p className="error_text">{errors.password}</p>}
          </div>

          {/* 닉네임 입력 */}
          <div className="input_group">
            <label htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="친구들이 부를 닉네임"
              className={errors.nickname ? "input_error" : ""}
            />
            {errors.nickname && <p className="error_text">{errors.nickname}</p>}
          </div>

          <button className="signup_button" type="submit" disabled={loading}>
            {loading ? (
              <span className="loading_text">가입 정보 처리 중...</span>
            ) : (
              "가입하고 바로 시작하기"
            )}
          </button>
        </form>

        <div className="bottom_link">
          이미 계정이 있으신가여? <Link to="/login">로그인하기</Link>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;