import React from "react";
import { Clock, Users, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom"; // react-router-dom 확인
import "./MatchedRecipeCard.css";
/**
 * [MatchedRecipeCard 컴포넌트]
 * - 냉장고 재료 매칭률을 시각적으로 보여주는 전용 카드입니다.
 */
export default function MatchedRecipeCard({ matchedRecipe }) {
  const navigate = useNavigate();

  // 데이터 구조 분해 할당
  // matchedRecipe: { recipe, matchedCount, totalCount, matchPercentage }
  const { recipe, matchedCount, totalCount, matchPercentage } = matchedRecipe;

  const handleClick = () => {
    // 레시피 제목을 기반으로 상세 페이지 이동
    navigate(`/recipe/${encodeURIComponent(recipe.title)}`);
  };

  return (
    <div className="matched_recipe_card" onClick={handleClick} style={{ cursor: "pointer" }}>
      {/* 카드 상단: 이미지와 배지 */}
      <div className="card_image_wrapper">
        <img 
          src={recipe.thumbnailImageUrl || recipe.image} 
          alt={recipe.title} 
          className="card_image" 
        />
        {/* 매칭률 배지 */}
        <div className="match_badge">
          <CheckCircle2 className="size-4" />
          <span>{matchPercentage}% 일치</span>
        </div>
        {/* 난이도 배지 */}
        <div className="card_badge">{recipe.difficulty || "보통"}</div>
      </div>
      
      {/* 카드 하단: 내용 */}
      <div className="card_content">
        <h4 className="card_title">{recipe.title}</h4>
        
        {/* 매칭 프로그레스 바 영역 */}
        <div className="match_info">
          <div className="match_indicator">
            <div className="match_bar_bg">
              <div 
                className="match_bar_fill" 
                style={{ 
                  width: `${matchPercentage}%`,
                  backgroundColor: matchPercentage > 70 ? "#764ba2" : "#a29bfe" 
                }}
              ></div>
            </div>
            <span className="match_text">
              {matchedCount}/{totalCount} 재료 보유
            </span>
          </div>
        </div>

        {/* 요리 정보 (시간, 인분) */}
        <div className="card_info">
          <div className="info_item">
            <Clock className="size-4" />
            <span>{recipe.cookTime || recipe.time || "15분"}</span>
          </div>
          <div className="info_item">
            <Users className="size-4" />
            <span>{recipe.servings || "1인분"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}