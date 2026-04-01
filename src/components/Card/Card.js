// src/components/Card/Card.js
import React from "react";
import "./Card.css";

function Card({
  title,
  description,
  image,
  time,
  difficulty,
  servings,
  onClick,
}) {
  return (
    <div className="card" onClick={onClick}>
      
      {/* 썸네일 */}
      <div className="card_thumb">
        <img src={image} alt={title} />
      </div>

      {/* 내용 */}
      <div className="card_body">
        
        {/* 제목 */}
        <h3 className="card_title">{title}</h3>

        {/* 설명 */}
        {description && (
          <p className="card_desc">{description}</p>
        )}

        {/* 정보 */}
        <div className="card_info">
          {time && <span>{time}</span>}
          {difficulty && <span>{difficulty}</span>}
          {servings && <span>{servings}</span>}
        </div>

      </div>
    </div>
  );
}

export default Card;