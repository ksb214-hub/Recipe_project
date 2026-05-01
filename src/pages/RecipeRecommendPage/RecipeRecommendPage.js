import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, ChevronRight, Refrigerator } from "lucide-react";
import "./RecipeRecommendPage.css";

/* ---------------------------------------------------------
   1. 더미 데이터 (백엔드 연동 전 테스트용)
   --------------------------------------------------------- */
const DUMMY_MY_FRIDGE = [
  { ingredientId: 1, name: "계란", expiryDate: "2026-05-01" }, // D-1 (오늘 4월 30일 기준)
  { ingredientId: 2, name: "우유", expiryDate: "2026-05-01" }, // D-1
  { ingredientId: 3, name: "양파", expiryDate: "2026-05-05" }, // 여유
  { ingredientId: 4, name: "베이컨", expiryDate: "2026-05-02" }, // D-2
];

const DUMMY_RECIPES = [
  {
    id: 101,
    title: "초간단 계란 토스트",
    description: "유통기한 임박한 계란과 우유를 한 번에 소비하세요!",
    thumbnailImageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500",
    ingredients: [
      { ingredientId: 1, name: "계란" },
      { ingredientId: 2, name: "우유" },
      { ingredientId: 10, name: "식빵" }
    ]
  },
  {
    id: 102,
    title: "양파 베이컨 볶음",
    description: "남은 재료로 만드는 훌륭한 반찬",
    thumbnailImageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500",
    ingredients: [
      { ingredientId: 3, name: "양파" },
      { ingredientId: 4, name: "베이컨" }
    ]
  }
];

export default function RecipeRecommendPage() {
  const navigate = useNavigate();
  const [urgentIngredients, setUrgentIngredients] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  /* 2. 유통기한 계산 로직 */
  const calculateDDay = (expiryDate) => {
    const today = new Date("2026-04-30"); // 테스트용 오늘 날짜 고정
    const expire = new Date(expiryDate);
    const diff = expire - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    // A. 냉장고 재료 가공
    const myIngs = DUMMY_MY_FRIDGE.map(ing => ({
      ...ing,
      dDay: calculateDDay(ing.expiryDate)
    }));

    // B. D-1 이하 임박 재료만 필터링
    const urgentOnes = myIngs.filter(ing => ing.dDay <= 1);
    setUrgentIngredients(urgentOnes);

    // C. 추천 로직: 임박 재료가 포함된 레시피 매칭
    const urgentIds = urgentOnes.map(i => i.ingredientId);
    
    const matched = DUMMY_RECIPES.map(recipe => {
      const recipeIngIds = recipe.ingredients.map(ri => ri.ingredientId);
      const myAllIngIds = myIngs.map(i => i.ingredientId);
      
      // 내 전체 재료 중 이 레시피와 겹치는 개수
      const matchCount = recipeIngIds.filter(id => myAllIngIds.includes(id)).length;
      const matchRate = Math.round((matchCount / recipeIngIds.length) * 100);
      
      // 임박 재료가 포함되어 있는지 확인
      const hasUrgent = recipeIngIds.some(id => urgentIds.includes(id));

      return { ...recipe, matchRate, hasUrgent };
    })
    .filter(r => r.hasUrgent) // 임박 재료 있는 것만 노출
    .sort((a, b) => b.matchRate - a.matchRate);

    setRecommendations(matched);
  }, []);

  return (
    <div className="recommend_container">
      {/* 상단 헤더 */}
      <header className="recommend_header">
        <h1><Refrigerator size={28} /> 스마트 식재료 관리</h1>
        <p>음식물 쓰레기를 줄이기 위한 맞춤 추천</p>
      </header>

      {/* 1. 유통기한 임박 재료 (D-1) */}
      <section className="urgent_section">
        <h2 className="title_red"><AlertCircle size={20} /> 오늘 내로 사용 권장!</h2>
        <div className="ing_tag_list">
          {urgentIngredients.map(ing => (
            <div key={ing.ingredientId} className="urgent_tag">
              <span className="badge_d1">D-{ing.dDay}</span>
              <span className="name">{ing.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. 추천 레시피 리스트 */}
      <section className="recipe_section">
        <h2 className="title_green"><CheckCircle2 size={20} /> 임박 재료 활용 레시피</h2>
        <div className="recommend_list">
          {recommendations.map(recipe => (
            <div key={recipe.id} className="recommend_card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
              <div className="card_img">
                <img src={recipe.thumbnailImageUrl} alt={recipe.title} />
                <div className="rate_layer">{recipe.matchRate}% 일치</div>
              </div>
              <div className="card_content">
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>
                <div className="card_tags">
                  {recipe.ingredients.map(ri => (
                    <span key={ri.ingredientId} className={urgentIngredients.some(ui => ui.ingredientId === ri.ingredientId) ? "tag_urgent" : "tag_normal"}>
                      {ri.name}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight className="arrow" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}