import React from "react";
import { Bookmark } from "lucide-react"; 
import "./Card.css";

/**
 * Card 컴포넌트
 * - 레시피 상세 정보를 표시하며 북마크 기능을 포함합니다.
 * - @param {string} thumbnailImageUrl - 이미지 경로 (SearchPage와 이름 통일)
 */
function Card({
  title,
  description,
  category,
  thumbnailImageUrl, // [수정] image에서 thumbnailImageUrl로 이름 통일
  time,
  difficulty,
  servings,
  onClick,
  isBookmarked,
  onToggleBookmark,
}) {
  
  // 이미지가 없을 때 사용할 기본 이미지 경로
  const fallbackImage = "https://placehold.jp/150x150.png?text=No+Image";

  // 이미지 유효성 검사 및 기본 이미지 반환 로직
  const getSafeImage = (src) => {
    if (!src || src.includes("via.placeholder.com")) {
      return fallbackImage;
    }
    return src;
  };

  return (
    <div className="card" onClick={onClick} style={{ position: "relative" }}>
      {/* 썸네일 섹션 */}
      <div className="card_thumb">
        <img 
          src={getSafeImage(thumbnailImageUrl)} 
          alt={title || "Recipe Image"} 
          onError={(e) => {
            // 이미지 로드 실패 시 fallback 이미지로 자동 교체
            if (e.target.src !== fallbackImage) {
              e.target.onerror = null;
              e.target.src = fallbackImage;
            }
          }}
        />
      </div>

      {/* 북마크 버튼 */}
      <button 
        type="button"
        className="bookmark_btn"
        onClick={(e) => {
          e.stopPropagation(); // 카드 클릭 이벤트와 충돌 방지
          onToggleBookmark?.(e);
        }}
        style={{ 
          position: "absolute", 
          top: "10px", 
          right: "10px", 
          background: "rgba(255, 255, 255, 0.8)", 
          border: "none", 
          borderRadius: "50%",
          padding: "6px",
          cursor: "pointer",
          zIndex: 10 
        }}
        aria-label="북마크"
      >
        <Bookmark 
          size={20} 
          fill={isBookmarked ? "#f1c40f" : "none"} 
          color={isBookmarked ? "#f1c40f" : "#333"} 
        />
      </button>

      {/* 내용 섹션 */}
      <div className="card_body">
        {category && <span className="card_category">{category}</span>}
        
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