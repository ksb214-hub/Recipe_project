import React from "react";
import { Bookmark } from "lucide-react"; // 아이콘 import
import "./Card.css";

function Card({
  title,
  description,
  image,
  time,
  difficulty,
  servings,
  onClick,
  isBookmarked,       // [추가] 북마크 여부
  onToggleBookmark,   // [추가] 북마크 클릭 핸들러
}) {
  
  const fallbackImage = "https://placehold.jp/150x150.png?text=No+Image";

  const getSafeImage = (src) => {
    if (!src || src.includes("via.placeholder.com")) {
      return fallbackImage;
    }
    return src;
  };

  return (
    <div className="card" onClick={onClick} style={{ position: "relative" }}>
      {/* 썸네일 */}
      <div className="card_thumb">
        <img 
          src={getSafeImage(image)} 
          alt={title || "Recipe Image"} 
          onError={(e) => {
            if (e.target.src !== fallbackImage) {
              e.target.onerror = null;
              e.target.src = fallbackImage;
            }
          }}
        />
      </div>

      {/* [추가] 북마크 버튼: 카드 우측 상단 배치 */}
      <button 
        type="button"
        className="bookmark_btn"
        onClick={onToggleBookmark} // e.stopPropagation()은 부모인 Card.js 호출부(Main.js)에서 처리되므로 여기선 호출만 함
        style={{ 
          position: "absolute", 
          top: "10px", 
          right: "10px", 
          background: "rgba(255, 255, 255, 0.8)", 
          border: "none", 
          borderRadius: "50%",
          padding: "6px",
          cursor: "pointer",
          zIndex: 10 // 카드 이미지 위로 버튼 노출
        }}
        aria-label="북마크"
      >
        <Bookmark 
          size={20} 
          fill={isBookmarked ? "#f1c40f" : "none"} 
          color={isBookmarked ? "#f1c40f" : "#333"} 
        />
      </button>

      {/* 내용 */}
      <div className="card_body">
        <h3 className="card_title">{title || "제목 없음"}</h3>
        {description && <p className="card_desc">{description}</p>}

        <div className="card_info">
          {time && <span className="card_meta">⏱ {time}</span>}
          {difficulty && <span className="card_meta">⭐ {difficulty}</span>}
          {servings && <span className="card_meta">👤 {servings}</span>}
        </div>
      </div>
    </div>
  );
}

export default Card;