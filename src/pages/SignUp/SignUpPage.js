// src/pages/SignUp/SignUpPage.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api"; // axios 인스턴스 사용
import "./SignUpPage.css";

function SignUpPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userid: "",
    password: "",
    username: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // 유효성 검사
  const validate = () => {
    const newErrors = {};
    if (!form.userid) newErrors.userid = "아이디를 입력하세요";
    if (form.password.length < 8) newErrors.password = "비밀번호는 8자 이상";
    if (!form.username) newErrors.username = "이름을 입력하세요";
    if (!form.email.includes("@")) newErrors.email = "올바른 이메일을 입력하세요";
    if (!form.phone) newErrors.phone = "전화번호를 입력하세요";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 회원가입 + 자동 로그인
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      // 1️⃣ 회원가입 API 호출
      await api.post("/signup", form);

      // 2️⃣ 회원가입 성공 시 자동 로그인
      const loginRes = await api.post("/login", {
        username: form.userid, // 백엔드 필드 확인 필요
        password: form.password,
      });

      const { accessToken, refreshToken } = loginRes.data;

      // 3️⃣ 토큰 저장
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      alert("회원가입 및 로그인 완료!");
      navigate("/reg"); // 예: 재료 등록 페이지로 이동

    } catch (err) {
      console.error("회원가입/로그인 오류:", err);
      alert("회원가입 또는 로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup_container">
      <div className="signup_box">
        <h2 className="signup_title">회원가입</h2>
        <p className="signup_subtitle">서비스 이용을 위해 정보를 입력해주세요</p>

        <form className="signup_form" onSubmit={handleSubmit}>
          {/** 아이디 */}
          <div className="input_group">
            <label>아이디</label>
            <input
              type="text"
              name="userid"
              value={form.userid}
              onChange={handleChange}
              placeholder="아이디 입력"
              className={errors.userid ? "input_error" : ""}
            />
            <p className="hint_text">4~12자 영문 또는 숫자</p>
            {errors.userid && <p className="error_text">{errors.userid}</p>}
          </div>

          {/** 비밀번호 */}
          <div className="input_group">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호 입력"
              className={errors.password ? "input_error" : ""}
            />
            <p className="hint_text">8자 이상 입력하세요</p>
            {errors.password && <p className="error_text">{errors.password}</p>}
          </div>

          {/** 이름 */}
          <div className="input_group">
            <label>이름</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="이름 입력"
              className={errors.username ? "input_error" : ""}
            />
            {errors.username && <p className="error_text">{errors.username}</p>}
          </div>

          {/** 이메일 */}
          <div className="input_group">
            <label>이메일</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className={errors.email ? "input_error" : ""}
            />
            {errors.email && <p className="error_text">{errors.email}</p>}
          </div>

          {/** 전화번호 */}
          <div className="input_group">
            <label>전화번호</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              className={errors.phone ? "input_error" : ""}
            />
            {errors.phone && <p className="error_text">{errors.phone}</p>}
          </div>

          <button className="signup_button" type="submit" disabled={loading}>
            {loading ? "가입 중..." : "가입하기"}
          </button>
        </form>

        <div className="bottom_link">
          <Link to="/login">로그인으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;