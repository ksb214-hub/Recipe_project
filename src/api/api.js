import axios from "axios";

// 백엔드 기본 URL
const API_BASE = "http://localhost:8081";

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 시 accessToken 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;