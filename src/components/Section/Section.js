// src/components/Section/Section.js

import React from "react";
import "./Section.css";

function Section({ title, actions, children }) {

  return (
    <div className="section">

      <div className="section-header">
        <h3>{title}</h3>

        <div className="section-actions">
          {actions}
        </div>
      </div>

      {/* 🔥 이 부분이 없으면 카드가 안 보입니다 */}
      <div className="section-body">
        {children}
      </div>

    </div>
  );
}

export default Section;