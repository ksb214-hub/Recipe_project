import React from "react";
import { Bookmark, AlertTriangle } from "lucide-react"; 
import "./Card.css";

export default function Card({
  title,
  category,
  thumbnailImageUrl,
  onClick,
  isBookmarked,
  onToggleBookmark,
  onReport, // <--- Main에서 내려주는 이 함수가 중요합니다!
  matchingIngredients = [],
  activeIngredients = []
}) {
  const fallbackImage = "https://placehold.jp/150x150.png?text=No+Image";

  return (
    <div className="card" onClick={onClick}>
      {/* 1. 신고 버튼 (이미지 위 왼쪽 상단) */}
      <button 
        className="report_inner_btn"
        onClick={(e) => {
          e.stopPropagation(); // 카드 클릭 방지
          if (onReport) onReport(); // ✅ 여기서 Main의 모달을 띄웁니다
          else console.log("onReport 함수가 전달되지 않았습니다.");
        }}
      >
        <AlertTriangle size={14} color="#ef4444" />
      </button>

      <div className="card_thumb">
        <img 
          src={thumbnailImageUrl || fallbackImage} 
          alt={title} 
          onError={(e) => { e.target.src = fallbackImage; }}
        />
      </div>

      <div className="card_body">
        {category && <span className="card_category">{category}</span>}
        
        {/* 2. 제목 줄 (제목 옆에 북마크) */}
        <div className="card_title_row">
          <h3 className="card_title">{title}</h3>
          <button 
            className="bookmark_btn"
            onClick={(e) => {
              e.stopPropagation(); 
              onToggleBookmark?.(e);
            }}
          >
            <Bookmark 
              size={18} 
              fill={isBookmarked ? "#f1c40f" : "none"} 
              color={isBookmarked ? "#f1c40f" : "#333"} 
            />
          </button>
        </div>
        
        {/* 3. 재료 태그 */}
        {matchingIngredients.length > 0 && (
          <div className="card_ingredients_tags">
            {matchingIngredients.slice(0, 3).map((ing, idx) => {
              const isOwned = activeIngredients.some(owned => ing.includes(owned));
              return (
                <span key={idx} className={`ing_badge ${isOwned ? 'owned' : ''}`}>
                  {ing}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}