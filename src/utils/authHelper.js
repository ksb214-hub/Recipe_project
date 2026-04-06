// src/utils/authHelper.js

export const authService = {
  // 로그인 시뮬레이션
  login: (email, password) => {
    if (email === "seongbin@zero.com" && password === "1234") {
      localStorage.setItem("accessToken", MOCK_LOGIN_RESPONSE.accessToken);
      localStorage.setItem("user", JSON.stringify(MOCK_LOGIN_RESPONSE.user));
      return { success: true };
    }
    return { success: false, message: "이메일 또는 비밀번호가 틀렸습니다." };
  },

  // 로그아웃 시뮬레이션
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  // 현재 로그인 여부 확인
  isLoggedIn: () => !!localStorage.getItem("accessToken")
};