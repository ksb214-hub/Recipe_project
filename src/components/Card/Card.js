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
  
  // 1. 더 안정적인 대체 이미지 서비스 (placehold.jp는 via.placeholder보다 안정적입니다)
  const fallbackImage = "https://placehold.jp/150x150.png?text=No+Image";

  // 2. 문제가 발생하는 via.placeholder.com 주소를 사전에 차단하거나 교체하는 함수
  const getSafeImage = (src) => {
    if (!src || src.includes("via.placeholder.com")) {
      return fallbackImage; // 에러가 자주 나는 도메인이면 처음부터 대체 이미지 사용
    }
    return src;
  };

  return (
    <div className="card" onClick={onClick}>

      {/* 썸네일 */}
      <div className="card_thumb">
        <img 
          // 처음부터 안전한 주소로 렌더링하여 콘솔 에러 발생 빈도를 낮춤
          src={getSafeImage(image)} 
          alt={title || "Recipe Image"} 
          
          // 네트워크 에러(ERR_CONNECTION_CLOSED 등) 발생 시 최종 방어
          onError={(e) => {
            if (e.target.src !== fallbackImage) {
              e.target.onerror = null; // 무한 루프 방지
              e.target.src = fallbackImage;
            }
          }}
        />
      </div>

      {/* 내용 */}
      <div className="card_body">
        {/* 제목 */}
        <h3 className="card_title">{title || "제목 없음"}</h3>

        {/* 설명 */}
        {description && (
          <p className="card_desc">{description}</p>
        )}

        {/* 🔥 레시피 정보 */}
        <div className="card_info">
          {time && (
            <span className="card_meta">
              ⏱ {time}
            </span>
          )}

          {difficulty && (
            <span className="card_meta">
              ⭐ {difficulty}
            </span>
          )}

          {servings && (
            <span className="card_meta">
              👤 {servings}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;