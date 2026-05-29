import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import  api  from "../../api/api";
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

  // [최적화] 타이핑 중단 500ms 후 중복 체크 대상값 업데이트
  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentStep === 1) setDebouncedValue(form.loginId);
      if (currentStep === 3) setDebouncedValue(form.nickname);
    }, 500);
    return () => clearTimeout(handler);
  }, [form.loginId, form.nickname, currentStep]);

  // [중복 체크 실행] 백엔드 조건에 맞는 최소 길이 이상일 때만 API 호출
  useEffect(() => {
    if (currentStep === 1 && debouncedValue.length >= 2 && debouncedValue.length <= 15) {
      checkDuplicate("id", debouncedValue);
    }
    if (currentStep === 3 && debouncedValue.length >= 1 && debouncedValue.length <= 12) {
      checkDuplicate("nickname", debouncedValue);
    }
  }, [debouncedValue, currentStep]);

  /**
   * [중복 확인 API 호출 로직 - 409 Conflict 및 응답 본문 파싱]
   * GET /api/auth/check-id?loginId=값
   * GET /api/auth/check-nickname?nickname=값
   */
  /**
   * [중복 확인 API 호출 로직 - 중복 시 alert 출력 버전]
   */
  const checkDuplicate = async (type, value) => {
    const isId = type === "id";
    const endpoint = isId ? "/api/auth/check-id" : "/api/auth/check-nickname";
    const paramKey = isId ? "loginId" : "nickname";

    try {
      const response = await api.get(endpoint, { params: { [paramKey]: value } });
      
      const isSuccess = response.data?.success;
      const isAvailable = response.data?.data?.available;

      if (isSuccess === false || isAvailable === false) {
        const serverMessage = response.data?.message || `이미 사용 중인 ${isId ? "아이디" : "닉네임"}입니다.`;
        
        // 💡 텍스트 대신 alert으로 알림 표시
        alert(serverMessage);
        
        // 중복된 값은 누적 에러로 기록하여 다음 단계 이동을 방지
        setErrors((prev) => ({ ...prev, [isId ? "loginId" : "nickname"]: serverMessage }));
      } else {
        // 사용 가능한 경우 에러 초기화
        setErrors((prev) => ({ ...prev, [isId ? "loginId" : "nickname"]: "" }));
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        const responseData = error.response.data;
        const serverMessage = responseData?.message || `이미 사용 중인 ${isId ? "아이디" : "닉네임"}입니다.`;
        
        // 💡 409 Conflict 에러 시에도 alert으로 표시
        alert(serverMessage);
        
        setErrors((prev) => ({ ...prev, [isId ? "loginId" : "nickname"]: serverMessage }));
      } else {
        console.error(`${type} 중복 확인 중 시스템 에러 발생:`, error);
      }
    }
  };

  /**
   * [입력 핸들러]
   * 백엔드 최대 길이 조건(아이디 15자, 닉네임 12자) 초과 시 타이핑 자체를 원천 차단
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "loginId" && value.length > 15) return;
    if (name === "nickname" && value.length > 12) return;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /**
   * [단계별 유효성 검사 및 다음 단계 이동]
   */
  const handleNext = async () => {
    // STEP 1: 아이디 검증 (2자 ~ 15자)
    if (currentStep === 1) {
      if (!form.loginId) {
        setErrors({ loginId: "아이디를 입력해 주세요." });
        return;
      }
      if (form.loginId.length < 2) {
        setErrors({ loginId: "아이디는 최소 2자 이상이어야 합니다." });
        return;
      }
      if (errors.loginId) return; // 실시간 중복 에러가 떠 있다면 다음 단계 이동 불가
    }

    // STEP 2: 비밀번호 검증 (10자 이상 + 영문/숫자 조합 필수)
    if (currentStep === 2) {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{10,}$/;

      if (!form.password) {
        setErrors({ password: "비밀번호를 입력해 주세요." });
        return;
      }
      if (!passwordRegex.test(form.password)) {
        setErrors({ password: "비밀번호는 10자 이상이며, 영문과 숫자를 모두 포함해야 합니다." });
        return;
      }
      if (form.password !== form.passwordConfirm) {
        setErrors({ passwordConfirm: "비밀번호가 일치하지 않습니다." });
        return;
      }
    }

    // STEP 3: 닉네임 검증 (빈 값 및 공백 불가, 최대 12자)
    if (currentStep === 3) {
      if (!form.nickname || form.nickname.trim() === "") {
        setErrors({ nickname: "닉네임은 필수 입력 항목입니다." });
        return;
      }
      if (errors.nickname) return; // 실시간 중복 에러가 떠 있다면 가입 불가
      
      handleSubmit(); // 최종 회원가입 진행
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  /**
   * [최종 회원가입 API 호출]
   * POST /api/auth/signup
   */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/api/auth/signup", {
        loginId: form.loginId,
        password: form.password,
        nickname: form.nickname,
      });
      setCurrentStep(4); // 성공 완료 화면으로 이동
    } catch (error) {
      console.error("회원가입 요청 중 에러 발생:", error);
      alert(error.response?.data?.message || "회원가입에 실패했습니다. 다시 시도해 주세요.");
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
                <motion.div 
                  className="progress_fill" 
                  animate={{ width: `${(currentStep / 3) * 100}%` }} 
                />
              </div>
            </div>
          </>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: 아이디 */}
          {currentStep === 1 && (
            <motion.div key="step1" className="step_content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3 className="signup_subtitle">아이디를 정해주세요</h3>
              <input 
                name="loginId" 
                value={form.loginId} 
                onChange={handleChange} 
                placeholder="아이디 입력 (2자 ~ 15자)" 
                className={errors.loginId ? "input_error" : "input_field"} 
              />
              {errors.loginId && <p className="error_text">{errors.loginId}</p>}
              <button className="next_button" onClick={handleNext}>
                다음 단계 <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 2: 비밀번호 */}
          {currentStep === 2 && (
            <motion.div key="step2" className="step_content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3 className="signup_subtitle">비밀번호 설정</h3>
              <input 
                name="password" 
                type="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder="비밀번호 (10자 이상, 영문+숫자 조합)" 
                className={errors.password ? "input_error" : "input_field"} 
              />
              {errors.password && <p className="error_text">{errors.password}</p>}
              
              <input 
                name="passwordConfirm" 
                type="password" 
                value={form.passwordConfirm} 
                onChange={handleChange} 
                placeholder="비밀번호 확인" 
                className={errors.passwordConfirm ? "input_error" : "input_field"} 
              />
              {errors.passwordConfirm && <p className="error_text">{errors.passwordConfirm}</p>}
              
              <div className="button_group">
                <button className="prev_button" onClick={() => setCurrentStep(1)}>이전</button>
                <button className="next_button" onClick={handleNext}>다음</button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: 닉네임 */}
          {currentStep === 3 && (
            <motion.div key="step3" className="step_content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3 className="signup_subtitle">거의 다 왔어요!</h3>
              <input 
                name="nickname" 
                value={form.nickname} 
                onChange={handleChange} 
                placeholder="닉네임 입력 (최대 12자)" 
                className={errors.nickname ? "input_error" : "input_field"} 
              />
              {errors.nickname && <p className="error_text">{errors.nickname}</p>}
              <div className="button_group">
                <button className="prev_button" onClick={() => setCurrentStep(2)}>이전</button>
                <button className="submit_button" onClick={handleNext} disabled={loading}>
                  {loading ? "가입 중..." : "가입 완료"}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: 완료 */}
          {currentStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="success_content">
              <Check size={48} color="#764ba2" style={{ marginBottom: "20px" }} />
              <h2 className="signup_title">반가워요, {form.nickname}님!</h2>
              <button className="login_redirect_button" onClick={() => navigate("/login")}>로그인하러 가기</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SignUpPage;