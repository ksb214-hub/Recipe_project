import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import "./SignUpPage.css";

function SignUpPage() {
  const navigate = useNavigate();
  
  // --- [상태 관리] ---
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    loginId: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
  });
  const [errors, setErrors] = useState({});

  // --- [유효성 검사 로직] ---
  const validateStep = async () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!form.loginId) newErrors.loginId = "아이디를 입력해주세요";
      else if (form.loginId.length < 4) newErrors.loginId = "4자 이상 입력해주세요";
      else if (form.loginId === "admin") newErrors.loginId = "이미 사용 중인 아이디입니다";
    } else if (currentStep === 2) {
      if (form.password.length < 8) newErrors.password = "비밀번호는 8자 이상이어야 합니다";
      if (form.password !== form.passwordConfirm) newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다";
    } else if (currentStep === 3) {
      if (!form.nickname) newErrors.nickname = "닉네임을 입력해주세요";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- [핸들러 함수] ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleNext = async () => {
    if (await validateStep()) {
      if (currentStep === 3) handleSubmit();
      else setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(4);
    }, 1500);
  };

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction > 0 ? -50 : 50, opacity: 0 }),
  };

  return (
    <div className="signup_container">
      <div className="signup_box">
        {currentStep < 4 && (
          <>
            <h2 className="signup_title">제로냉 회원가입</h2>
            <p className="signup_subtitle">나만의 냉장고를 스마트하게 관리해보세요</p>
            
            {/* 진행 표시 바 영역 (CSS: .progress_bar_container) */}
            <div className="progress_bar_container">
              <div className="progress_bar">
                <motion.div 
                  className="progress_fill" 
                  animate={{ width: `${(currentStep / 3) * 100}%` }} 
                />
              </div>
              <p className="progress_text">단계 {currentStep} / 3</p>
            </div>
          </>
        )}

        <AnimatePresence mode="wait" custom={1}>
          {/* 1단계 */}
          {currentStep === 1 && (
            <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" className="step_content">
              <div className="step_header">
                <h3 className="step_title">아이디를 정해주세요</h3>
                <p className="step_description">로그인할 때 사용할 아이디입니다.</p>
              </div>
              <div className="input_group">
                <label htmlFor="loginId">아이디</label>
                <input 
                  id="loginId"
                  name="loginId" 
                  value={form.loginId} 
                  onChange={handleChange} 
                  placeholder="아이디 입력 (admin 제외)" 
                  className={errors.loginId ? "input_error" : ""}
                />
                {errors.loginId && <p className="error_text">{errors.loginId}</p>}
              </div>
              <div className="button_group">
                <button className="next_button" onClick={handleNext}>
                  다음 단계 <ArrowRight size={18}/>
                </button>
              </div>
            </motion.div>
          )}

          {/* 2단계 */}
          {currentStep === 2 && (
            <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" className="step_content">
              <div className="step_header">
                <h3 className="step_title">비밀번호 설정</h3>
                <p className="step_description">안전한 비밀번호를 입력해주세요.</p>
              </div>
              <div className="input_group">
                <label>비밀번호</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="8자 이상 비밀번호" />
                <input name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={handleChange} placeholder="비밀번호 확인" className={errors.passwordConfirm ? "input_error" : ""}/>
                {errors.passwordConfirm && <p className="error_text">{errors.passwordConfirm}</p>}
              </div>
              <div className="button_group">
                <button className="prev_button" onClick={handlePrev}><ArrowLeft size={18}/> 이전</button>
                <button className="next_button" onClick={handleNext}>다음 단계</button>
              </div>
            </motion.div>
          )}

          {/* 3단계 */}
          {currentStep === 3 && (
            <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" className="step_content">
              <div className="step_header">
                <h3 className="step_title">거의 다 왔어요!</h3>
                <p className="step_description">제로냉에서 사용할 닉네임을 적어주세요.</p>
              </div>
              <div className="input_group">
                <label>닉네임</label>
                <input name="nickname" value={form.nickname} onChange={handleChange} placeholder="예: 냉장고요정" className={errors.nickname ? "input_error" : ""} />
                {errors.nickname && <p className="error_text">{errors.nickname}</p>}
              </div>
              <div className="button_group">
                <button className="prev_button" onClick={handlePrev}>이전</button>
                <button className="submit_button" onClick={handleNext} disabled={loading}>
                  {loading ? "처리 중..." : "가입 완료"}
                </button>
              </div>
            </motion.div>
          )}

          {/* 4단계: 성공 화면 (CSS: .success_content) */}
          {currentStep === 4 && (
            <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="success_content">
              <div className="success_icon"><Check size={40} color="white"/></div>
              <h2 className="success_title">반가워요, {form.nickname}님!</h2>
              <p className="success_message">이제 제로냉과 함께<br/>스마트한 살림을 시작해볼까요?</p>
              <button className="login_redirect_button" onClick={() => navigate("/login")}>로그인하러 가기</button>
            </motion.div>
          )}
        </AnimatePresence>

        {currentStep < 4 && (
          <div className="bottom_link">이미 계정이 있나요? <Link to="/login">로그인하기</Link></div>
        )}
      </div>
    </div>
  );
}

export default SignUpPage;