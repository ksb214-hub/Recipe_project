import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, ChevronRight, Refrigerator, Flame, Loader2 } from "lucide-react";
import "./RecipeRecommendPage.css";
import customInstance from "../../api/api";

export default function RecipeRecommendPage() {
  const navigate = useNavigate();
  
  // 서버로부터 받을 추천 카테고리별 상태 관리
  const [recommendData, setRecommendData] = useState({
    expiringIngredientBased: [], // 유통기한 임박 기반
    ingredientBased: [],         // 일반 보유 재료 기반
    popular: [],                 // 인기 레시피
  });
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     1. 데이터 로드 (GET: /api/recipes/recommendations)
     --------------------------------------------------------- */
  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      console.log("📡 추천 레시피 API 호출 중...");
      const res = await customInstance.get("/api/recipes/recommendations");
      
      if (res.data?.success) {
        console.log("✅ 추천 데이터 로드 완료:", res.data.data);
        setRecommendData({
          expiringIngredientBased: res.data.data.expiringIngredientBased || [],
          ingredientBased: res.data.data.ingredientBased || [],
          popular: res.data.data.popular || []
        });
      }
    } catch (err) {
      console.error("❌ 추천 데이터 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // 로딩 중 UI
  if (loading) {
    return (
      <div className="recommend_loading">
        <Loader2 className="spinner" size={40} />
        <p>성빈님의 냉장고를 분석하여 레시피를 찾고 있어요...</p>
      </div>
    );
  }

  return (
    <div className="recommend_container">
      {/* 상단 헤더 */}
      <header className="recommend_header">
        <h1><Refrigerator size={28} /> 스마트 식재료 관리</h1>
        <p>음식물 쓰레기를 줄이기 위한 맞춤 추천</p>
      </header>

      {/* 1. 유통기한 임박 재료 기반 추천 (expiringIngredientBased) */}
      <section className="recipe_section">
        <h2 className="title_red"><AlertCircle size={20} /> 유통기한 임박! 지금 만드세요</h2>
        <div className="recommend_list">
          {recommendData.expiringIngredientBased.length > 0 ? (
            // ✅ [수정] 고유 key={recipe.id} 속성을 추가하여 React 렌더링 에러를 방지합니다.
            recommendData.expiringIngredientBased.map((recipe, index) => (
              <RecipeRow 
                key={recipe.id || `expiring-${index}`} 
                recipe={recipe} 
                navigate={navigate} 
                tagType="urgent" 
              />
            ))
          ) : (
            <p className="empty_msg">현재 유통기한이 임박한 재료가 없습니다. 👍</p>
          )}
        </div>
      </section>

      {/* 2. 내 재료 기반 추천 (ingredientBased) */}
      <section className="recipe_section">
        <h2 className="title_green"><CheckCircle2 size={20} /> 내 냉장고 재료 맞춤 레시피</h2>
        <div className="recommend_list">
          {recommendData.ingredientBased.length > 0 ? (
            // ✅ [수정] 동일하게 고유 key 속성을 매핑해 줍니다.
            recommendData.ingredientBased.map((recipe, index) => (
              <RecipeRow 
                key={recipe.id || `ingredient-${index}`} 
                recipe={recipe} 
                navigate={navigate} 
                tagType="match" 
              />
            ))
          ) : (
            <p className="empty_msg">재료를 등록하고 맞춤 레시피를 확인해보세요!</p>
          )}
        </div>
      </section>

      {/* 3. 요즘 뜨는 인기 레시피 (popular) */}
      <section className="recipe_section">
        <h2 className="title_orange"><Flame size={20} /> 지금 가장 인기 있는 요리</h2>
        <div className="recommend_list">
          {recommendData.popular.map((recipe, index) => (
            // ✅ [수정] 동일하게 고유 key 속성을 바인딩해 줍니다.
            <RecipeRow 
              key={recipe.id || `popular-${index}`} 
              recipe={recipe} 
              navigate={navigate} 
              tagType="view" 
            />
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * 추천 리스트의 개별 행(Row) 컴포넌트
 */
function RecipeRow({ recipe, navigate, tagType }) {
  return (
    <div className="recommend_card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
      <div className="card_img">
        <img src={recipe.thumbnailImageUrl} alt={recipe.title} />
        {tagType === 'view' && recipe.viewCount !== undefined && (
          <div className="rate_layer">조회수 {recipe.viewCount}</div>
        )}
      </div>
      <div className="card_content">
        <h3>{recipe.title}</h3>
        <p className="author">By {recipe.authorNickname || "공공데이터"}</p>
        <div className="card_tags">
          <span className="tag_normal">#{recipe.id}</span>
          <span className="tag_date">
            {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : "날짜 정보 없음"}
          </span>
        </div>
      </div>
      <ChevronRight className="arrow" />
    </div>
  );
}