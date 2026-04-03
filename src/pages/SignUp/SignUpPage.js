import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api"; // Axios 인스턴스 (인터셉터 설정 포함)
import "./SignUpPage.css";

function SignUpPage() {
  const navigate = useNavigate();

  // 폼 상태 관리: DB 컬럼 명세(login_id, password, nickname)와 매핑
  const [form, setForm] = useState({
    loginId: "",    
    password: "",   
    nickname: "",   
  });

  const [errors, setErrors] = useState({}); // 유효성 검사 에러 메시지 저장
  const [loading, setLoading] = useState(false); // API 요청 중 버튼 비활성화용

  // 입력값 변경 시 호출: name 속성을 키로 사용하여 상태 업데이트
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // 클라이언트 측 유효성 검사: 서버 요청 전 필수 조건 확인
  const validate = () => {
    const newErrors = {};
    if (!form.loginId) newErrors.loginId = "아이디를 입력하세요";
    if (form.password.length < 8) newErrors.password = "비밀번호는 8자 이상이어야 합니다";
    if (!form.nickname) newErrors.nickname = "닉네임을 입력하세요";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // 에러가 없으면 true 반환
  };

  // 회원가입 제출 처리 (비동기 함수)
  const handleSubmit = async (e) => {
    e.preventDefault(); // 페이지 새로고침 방지
    if (!validate()) return; // 유효성 검사 실패 시 중단

    try {
      setLoading(true);

      /**
       * 단계 1: 회원가입 API 호출
       * - 서버 DB 테이블(MEMBER)의 명세에 맞춰 데이터 전송
       */
      await api.post("/signup", {
        loginId: form.loginId,
        password: form.password,
        nickname: form.nickname
      });

      /**
       * 단계 2: 자동 로그인 진행
       * - 가입 완료 후 사용자가 다시 로그인하는 번거로움을 제거
       */
      const loginRes = await api.post("/login", {
        loginId: form.loginId,
        password: form.password,
      });

      /**
       * 단계 3: 토큰 처리 및 저장
       * - 서버에서 발급한 AT/RT를 로컬 스토리지에 저장하여 이후 인증 요청에 사용
       */
      const { accessToken, refreshToken } = loginRes.data;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        
        alert(`${form.nickname}님, 환영합니다! 가입 및 로그인이 완료되었습니다.`);
        navigate("/reg"); // 재료 등록 페이지로 리다이렉트
      } else {
        alert("가입은 완료되었으나 자동 로그인에 실패했습니다. 직접 로그인해주세요.");
        navigate("/login");
      }

    } catch (err) {
      /**
       * 에러 처리:
       * - 404 (경로 없음), 409 (중복 데이터), 500 (서버 오류) 등 상황별 대응
       */
      console.error("인증 에러 상세:", err.response || err);
      const errorMsg = err.response?.data?.message || "회원가입 중 오류가 발생했습니다. 아이디 또는 닉네임 중복을 확인하세요.";
      alert(errorMsg);
    } finally {
      setLoading(false); // 요청 완료 후 로딩 상태 해제
    }
  };

  return (
    <div className="signup_container">
      <div className="signup_box">
        <h2 className="signup_title">회원가입</h2>
        <p className="signup_subtitle">새로운 미식 경험을 시작해보세요</p>

        <form className="signup_form" onSubmit={handleSubmit}>
          {/** 아이디 입력 영역 (login_id 연동) */}
          <div className="input_group">
            <label htmlFor="loginId">아이디</label>
            <input
              id="loginId"
              type="text"
              name="loginId"
              value={form.loginId}
              onChange={handleChange}
              placeholder="사용하실 아이디를 입력하세요"
              className={errors.loginId ? "input_error" : ""}
            />
            {errors.loginId && <p className="error_text">{errors.loginId}</p>}
          </div>

          {/** 비밀번호 입력 영역 (password 연동) */}
          <div className="input_group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="8자 이상 입력하세요"
              autoComplete="new-password"
              className={errors.password ? "input_error" : ""}
            />
            {errors.password && <p className="error_text">{errors.password}</p>}
          </div>

          {/** 닉네임 입력 영역 (nickname 연동) */}
          <div className="input_group">
            <label htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="활동하실 닉네임을 입력하세요"
              className={errors.nickname ? "input_error" : ""}
            />
            {errors.nickname && <p className="error_text">{errors.nickname}</p>}
          </div>

          <button className="signup_button" type="submit" disabled={loading}>
            {loading ? "가입 처리 중..." : "가입 및 시작하기"}
          </button>
        </form>

        <div className="bottom_link">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;