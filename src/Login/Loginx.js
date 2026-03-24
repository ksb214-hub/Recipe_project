// src/pages/Login.js
import React, { useState } from "react";
import Navbar from "/Navbar";

function Loginx() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const handleLogin = () => {
    if (!id || !pw) {
      alert("아이디와 비밀번호를 입력하세요.");
      return;
    }

    console.log("로그인 시도:", id, pw);
  };

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        <h2>로그인</h2>

        <input
          type="text"
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.loginBtn}>
          로그인
        </button>

        <button style={styles.signupBtn}>
          회원가입
        </button>
      </div>
    </>
  );
}

const styles = {
  container: {
    width: "300px",
    margin: "120px auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    textAlign: "center",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
  },
  loginBtn: {
    padding: "10px",
    backgroundColor: "#333",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  signupBtn: {
    padding: "10px",
    backgroundColor: "#ddd",
    border: "none",
    cursor: "pointer",
  },
};

export default Login;