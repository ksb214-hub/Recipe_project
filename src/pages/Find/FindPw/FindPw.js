// src/pages/Find/FindPw/FindPw.js
import React, { useState } from "react";
import "./FindPw.css";
import { Link } from "react-router-dom";

function FindPw() {
  const [id, setId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("비밀번호 찾기:", id);
  };

  return (
    <div className="find-container">

      <main className="find-main">

        {/* 제목 */}
        <h3 className="main-title">비밀번호 찾기</h3>

        {/* 설명 */}
        <div className="description">
          <button type="button">
            <span className="margin-right">아이디를 입력하세요</span>
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>

          <div className="label-input">
            <div className="label-input-in">

              <label>아이디</label>

              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="아이디 입력"
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

export default FindPw;