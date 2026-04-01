// src/pages/Find/FindId/FindId.js
import React, { useState } from "react";
import "./FindId.css";
import { Link } from "react-router-dom";

function FindId() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("아이디 찾기:", email);
  };

  return (
    <div className="find-container">

      {/* MAIN */}
      <main className="find-main">

        {/* 제목 */}
        <h3 className="main-title">아이디 찾기</h3>

        {/* 설명 */}
        <div className="description">
          <button type="button">
            <span className="margin-right">이메일을 입력하세요</span>
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>

          {/* input 영역 */}
          <div className="label-input">
            <div className="label-input-in">

              <label>이메일</label>

              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
              />

            </div>
          </div>

          {/* 버튼 */}
          <div className="form-main-button">
            <button type="submit" className="primary-btn">
              다음
            </button>
          </div>

        </form>

        {/* 로그인 이동 */}
        <div className="bottom-link">
          <Link to="/login">로그인으로 돌아가기</Link>
        </div>

      </main>
    </div>
  );
}

export default FindId;