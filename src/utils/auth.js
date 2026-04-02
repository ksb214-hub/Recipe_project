// src/utils/auth.js
import axios from "axios";

const API_URL = "http://localhost:8081";

export const loginAPI = async (userid, password) => {
  const res = await axios.post(`${API_URL}/login`, { userid, password });
  const { accessToken, refreshToken } = res.data;
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  return res.data;
};

export const signupAPI = async (userData) => {
  const res = await axios.post(`${API_URL}/signup`, userData);
  return res.data;
};

export const refreshTokenAPI = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const res = await axios.post(`${API_URL}/refresh`, { refreshToken });
  const { accessToken: newAT } = res.data;
  localStorage.setItem("accessToken", newAT);
  return newAT;
};

export const authRequest = async (config) => {
  try {
    const token = localStorage.getItem("accessToken");
    return await axios({ ...config, headers: { Authorization: `Bearer ${token}` } });
  } catch (err) {
    if (err.response?.status === 401) {
      const newToken = await refreshTokenAPI();
      return await axios({ ...config, headers: { Authorization: `Bearer ${newToken}` } });
    }
    throw err;
  }
};