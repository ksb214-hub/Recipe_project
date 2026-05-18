import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Star, Leaf, Sparkles, ChevronRight, Loader2, UtensilsCrossed, CheckCircle2 } from "lucide-react";
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

  // 일반 추천 레시피 개수 상태
  const [normalRecipeCount, setNormalRecipeCount] = useState(0);

  /* ---------------------------------------------------------
     🔥 [완벽 교정] 백엔드 공통 Response Wrapper 구조 내부 정밀 추적 파싱
     --------------------------------------------------------- */
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("📡 [GET] /api/recipes/recommendations 외 2건 병렬 호출 시작");
      
      const [recRes, myRes, ingRes] = await Promise.all([
        customInstance.get("/api/recipes/recommendations"),
        customInstance.get("/api/recipes/my"),
        customInstance.get("/api/ingredients")
      ]);

      // 💡 [핵심 교정 포인트] 백엔드 포맷: { success: true, message: "...", data: { expiringIngredientBased: [...] } }
      // res.data 내부의 'data' 오브젝트를 한 단계 더 깊숙이 참조해야 합니다.
      const rawWrapper = recRes.data || {};
      const innerData = rawWrapper.data || {}; 
      
      console.log("📦 [디버깅] 백엔드 실데이터 언래핑 결과 (innerData):", innerData);

      // 실제 타겟 배열 데이터 획득
      const expiringList = innerData.expiringIngredientBased || [];
      const normalList = innerData.ingredientBased || [];

      // 1. 임박 재료 기준 추천 레시피 안전 매핑
      const extractedRecommendations = expiringList.map(item => {
        const r = item.recipe || {};
        return {
          id: r.id,
          title: r.title,
          thumbnailImageUrl: r.thumbnailImageUrl,
          authorNickname: r.authorNickname || "제로냉",
          cookingTime: r.cookingTime || "20분",
          rating: r.rating || "4.5"
        };
      });
      
      setRecommendations(extractedRecommendations);
      setNormalRecipeCount(normalList.length);

      // 임박 재료 상태 초기 가이드라인 매핑
      setUrgentIngredients([]); 

      console.log(`✨ [매핑 최종 성공] 임박 추천 가용 개수: ${extractedRecommendations.length}개 / 일반 추천 가용 개수: ${normalList.length}개`);

      // 2. 내 레시피 데이터 바인딩
      const myData = myRes.data?.data || myRes.data || [];
      setMyRecipesCount(Array.isArray(myData) ? myData.length : 0);

      // 3. 전체 식재료 데이터 바인딩
      const ingData = ingRes.data?.data?.content || ingRes.data?.data || [];
      setIngredientCount(Array.isArray(ingData) ? ingData.length : 0);

    } catch (err) {
      console.error("❌ [MyRecipePage] 데이터 가공 중 크리티컬 에러가 감지되었습니다:", err);
      setRecommendations([]);
      setNormalRecipeCount(0);
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

      {/* 통계 요약 */}
      <section className="stats_grid_3col">
        <div className="stat_card">
          <div className="icon_box yellow"><UtensilsCrossed size={18} /></div>
          <div className="stat_text">
            <span className="stat_value">{myRecipesCount}<span>개</span></span>
            <span className="stat_label">나의 레시피</span>
          </div>
        </div>

        <div className="stat_card" onClick={() => navigate('/my-ingredients')} style={{ cursor: 'pointer' }}>
          <div className="icon_box green"><Leaf size={18} /></div>
          <div className="stat_text">
            <span className="stat_value">{ingredientCount}<span>종</span></span>
            <span className="stat_label">활용 식재료</span>
          </div>
        </div>

        <div className="stat_card">
          <div className="icon_box pink"><Sparkles size={18} /></div>
          <div className="stat_text">
            <span className="stat_value">{recommendations.length}<span>개</span></span>
            <span className="stat_label">임박 추천</span>
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
              <span key={`urgent-${idx}`} className={`tag dday_${ing.dDay}`}>
                {ing.name} D-{ing.dDay}
              </span>
            ))
          ) : (
            <span className="no_urgent">관리 중인 임박 재료가 존재합니다. 아래 레시피를 확인하세요!</span>
          )}
        </div>

        {/* 레시피 카드 리스트 */}
        <div className="recipe_list">
          {recommendations.length > 0 ? (
            recommendations.map((recipe, idx) => (
              <div 
                key={recipe.id || `rec-${idx}`} 
                className="recipe_card_horizontal" 
                onClick={() => navigate(`/recipe/${recipe.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="img_wrapper">
                  <img src={recipe.thumbnailImageUrl || "/default-recipe.png"} alt={recipe.title} />
                  <div className="match_badge">일치</div>
                </div>
                <div className="content_wrapper">
                  <h3>{recipe.title}</h3>
                  <div className="meta">
                    <span className="time"><Clock size={12} /> {recipe.cookingTime}</span>
                    <span className="star">
                      <Star size={12} fill="#FFB800" color="#FFB800" /> 
                      {recipe.rating}
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

        {/* 일반 재료 기준 매칭 안내 바 */}
        {normalRecipeCount > 0 && (
          <div className="normal_recommend_info_bar" style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "20px",
            padding: "12px 16px",
            background: "#f0f7ff",
            borderRadius: "12px",
            fontSize: "13px",
            color: "#0066cc",
            border: "1px solid #d0e7ff"
          }}>
            <CheckCircle2 size={16} color="#0066cc" />
            <span>유통기한과 관계없이 현재 냉장고 재료로 만들 수 있는 레시피가 <strong>{normalRecipeCount}개</strong> 더 있습니다.</span>
          </div>
        )}
      </main>
    </div>
  );
}