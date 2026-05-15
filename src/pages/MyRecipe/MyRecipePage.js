import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Star, Leaf, Sparkles, ChevronRight, Loader2, UtensilsCrossed } from "lucide-react";
import customInstance from "../../api/api";
import "./MyRecipePage.css";

export default function MyRecipePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // 상태 관리
  const [urgentIngredients, setUrgentIngredients] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [ingredientCount, setIngredientCount] = useState(0); 
  const [myRecipesCount, setMyRecipesCount] = useState(0);

  // 데이터 로드 함수
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      
      // API 병렬 호출
      const [recRes, myRes, ingRes] = await Promise.all([
        customInstance.get("/api/recipes/recommendations"),
        customInstance.get("/api/recipes/my"),
        customInstance.get("/api/ingredients")
      ]);

      // 1. 추천 & 임박 재료 바인딩
      const recData = recRes.data?.data || recRes.data;
      setUrgentIngredients(recData.urgentIngredients || []);
      setRecommendations(recData.recommendations || []);

      // 2. 내 레시피 데이터 바인딩
      const myData = myRes.data?.data || myRes.data || [];
      setMyRecipesCount(myData.length);

      // 3. 전체 식재료 데이터 바인딩 (페이징 구조 대응)
      const ingData = ingRes.data?.data?.content || ingRes.data?.data || [];
      setIngredientCount(ingData.length);

    } catch (err) {
      console.error("데이터 로드 중 오류 발생:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (loading) return (
    <div className="page_loader_container">
      <Loader2 className="spinner" size={32} />
      <p>나의 요리 데이터를 불러오고 있습니다...</p>
    </div>
  );

  return (
    <div className="mobile_container">
      {/* 상단 비주얼 배너 */}
      <section className="hero_banner">
        <div className="hero_overlay"></div>
        <div className="hero_content">
          <span className="sub_title">MY RECIPE COLLECTION</span>
          <h1>내 레시피 목록</h1>
          <p>보유한 재료와 나만의 비법으로<br/>더 맛있는 식사를 준비해보세요.</p>
        </div>
      </section>

      {/* 통계 요약 (3개 카드) */}
      <section className="stats_grid_3col">
        {/* 1. 나의 레시피 카드 */}
        <div className="stat_card">
          <div className="icon_box yellow"><UtensilsCrossed size={18} /></div>
          <div className="stat_text">
            <span className="stat_value">{myRecipesCount}<span>개</span></span>
            <span className="stat_label">나의 레시피</span>
          </div>
        </div>

        {/* 2. 활용 식재료 카드 (수정됨: 클릭 시 이동) */}
        <div 
          className="stat_card" 
          onClick={() => navigate('/my-ingredients')} 
          style={{ cursor: 'pointer' }}
        >
          <div className="icon_box green"><Leaf size={18} /></div>
          <div className="stat_text">
            <span className="stat_value">{ingredientCount}<span>종</span></span>
            <span className="stat_label">활용 식재료</span>
          </div>
        </div>

        {/* 3. 맞춤 추천 카드 */}
        <div className="stat_card">
          <div className="icon_box pink"><Sparkles size={18} /></div>
          <div className="stat_text">
            <span className="stat_value">{recommendations.length}<span>개</span></span>
            <span className="stat_label">맞춤 추천</span>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 영역 */}
      <main className="recipe_main">
        <div className="section_header">
          <div className="title_group">
            <span className="badge_alert">유통기한 임박 알림</span>
            <h2>바로 요리 가능한 레시피</h2>
          </div>
          <button className="btn_text" onClick={() => navigate('/recommend')}>
            전체보기 <ChevronRight size={14}/>
          </button>
        </div>

        {/* 임박 재료 가로 스크롤 */}
        <div className="urgent_scroll">
          <span className="label">임박:</span>
          {urgentIngredients.length > 0 ? (
            urgentIngredients.map((ing, idx) => (
              <span key={idx} className={`tag dday_${ing.dDay}`}>
                {ing.name} D-{ing.dDay}
              </span>
            ))
          ) : (
            <span className="no_urgent">관리 중인 임박 재료가 없습니다.</span>
          )}
        </div>

        {/* 레시피 카드 리스트 */}
        <div className="recipe_list">
          {recommendations.length > 0 ? (
            recommendations.map((recipe) => (
              <div 
                key={recipe.id} 
                className="recipe_card_horizontal" 
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                <div className="img_wrapper">
                  <img src={recipe.thumbnailImageUrl || "/default-recipe.png"} alt={recipe.title} />
                  <div className="match_badge">일치</div>
                </div>
                <div className="content_wrapper">
                  <h3>{recipe.title}</h3>
                  <div className="meta">
                    <span className="time"><Clock size={12} /> {recipe.cookingTime || '20분'}</span>
                    <span className="star">
                      <Star size={12} fill="#FFB800" color="#FFB800" /> 
                      {recipe.rating || '4.5'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty_state">
              <p>현재 재료로 추천할 수 있는 레시피가 없습니다.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}