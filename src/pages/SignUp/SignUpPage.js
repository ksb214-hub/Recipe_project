import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { api } from "../../api/api";
import "./SignUpPage.css";

function SignUpPage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    loginId: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
  });
  const [errors, setErrors] = useState({});
  const [debouncedValue, setDebouncedValue] = useState("");

  // [최적화] 타이핑이 멈춘 후 500ms 뒤에 중복 체크 실행
  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentStep === 1) setDebouncedValue(form.loginId);
      if (currentStep === 3) setDebouncedValue(form.nickname);
    }, 500);
    return () => clearTimeout(handler);
  }, [form.loginId, form.nickname, currentStep]);

  useEffect(() => {
    if (debouncedValue.length >= 4) {
      if (currentStep === 1) checkDuplicate("id", debouncedValue);
      if (currentStep === 3) checkDuplicate("nickname", debouncedValue);
    }
  }, [debouncedValue, currentStep]);

  const checkDuplicate = async (type, value) => {
    try {
      const endpoint = type === "id" ? "/api/auth/check-id" : "/api/auth/check-nickname";
      const paramKey = type === "id" ? "loginId" : "nickname";

      const response = await api.get(endpoint, { params: { [paramKey]: value } });
      return response.data.isAvailable;
    } catch (error) {
      // 서버 에러(500)일 때는 중복 체크 결과를 알 수 없으므로, 
      // 아이디가 이미 사용 중이라는 메시지를 띄우지 않도록 처리
      console.error("중복 확인 API 에러:", error);
      return true; // 에러일 때는 일단 통과시키거나, 별도 에러 처리를 하는 것이 좋습니다.
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNext = async () => {
    // 다음 단계로 넘어가기 전 최종 검증
    if (currentStep === 1 && (!form.loginId || errors.loginId)) return;
    if (currentStep === 2 && (!form.password || form.password !== form.passwordConfirm)) {
      setErrors({ passwordConfirm: "비밀번호가 일치하지 않습니다." });
      return;
    }
    if (currentStep === 3 && (!form.nickname || errors.nickname)) return;

    if (currentStep === 3) handleSubmit();
    else setCurrentStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/api/auth/signup", {
        loginId: form.loginId,
        password: form.password,
        nickname: form.nickname
      });
      setCurrentStep(4);
    } catch (error) {
      alert("회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup_container">
      <div className="signup_box">
        {currentStep < 4 && (
          <>
            <h2 className="signup_title">제로냉 회원가입</h2>
            <div className="progress_bar_container">
              <div className="progress_bar">
                <motion.div className="progress_fill" animate={{ width: `${(currentStep / 3) * 100}%` }} />
              </div>
            </div>
          </>
        )}

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="step1" className="step_content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3>아이디를 정해주세요</h3>
              <input name="loginId" value={form.loginId} onChange={handleChange} placeholder="아이디 입력" 
                     className={errors.loginId ? "input_error" : "input_field"} autoComplete="username" />
              {errors.loginId && <p className="error_text">{errors.loginId}</p>}
              <button className="next_button" onClick={handleNext}>다음 단계 <ArrowRight size={18}/></button>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" className="step_content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3>비밀번호 설정</h3>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="비밀번호" className="input_field" autoComplete="new-password" />
              <input name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={handleChange} placeholder="비밀번호 확인" 
                     className={errors.passwordConfirm ? "input_error" : "input_field"} autoComplete="new-password" />
              {errors.passwordConfirm && <p className="error_text">{errors.passwordConfirm}</p>}
              <div className="button_group">
                <button className="prev_button" onClick={() => setCurrentStep(1)}>이전</button>
                <button className="next_button" onClick={handleNext}>다음</button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step3" className="step_content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3>거의 다 왔어요!</h3>
              <input name="nickname" value={form.nickname} onChange={handleChange} placeholder="닉네임 입력" 
                     className={errors.nickname ? "input_error" : "input_field"} autoComplete="nickname" />
              {errors.nickname && <p className="error_text">{errors.nickname}</p>}
              <div className="button_group">
                <button className="prev_button" onClick={() => setCurrentStep(2)}>이전</button>
                <button className="submit_button" onClick={handleNext} disabled={loading}>{loading ? "가입 중..." : "가입 완료"}</button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="success_content">
              <Check size={48} />
              <h2>반가워요, {form.nickname}님!</h2>
              <button className="login_redirect_button" onClick={() => navigate("/login")}>로그인하러 가기</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SignUpPage;