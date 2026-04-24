import React, { useState, useEffect } from "react";
// [라이브러리] React Router: 페이지 전환 및 경로 관리
import { useNavigate } from "react-router-dom";
// [라이브러리] Axios: 서버와 데이터 통신
import axios from "axios";
import "./Main.css";
import "../../pages/Main/recipeMatch.css";

// [컴포넌트] 화면 구성 UI
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Section from "../../components/Section/Section";
import customInstance from "../../api/api"; 

import { recipes3 as crawledRecipes } from "../../data/collection/recipes3";
// [라이브러리] Lucide React: 아이콘
import { Search, X, Plus } from "lucide-react"; 

export default function Main() {
  const navigate = useNavigate();

  // [상태 관리]
  const [activeIngredients, setActiveIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState("전체"); 
  const [recommendedData, setRecommendedData] = useState([]);

  const categories = ["전체", ...new Set(crawledRecipes.map(r => r.category))];

  // [초기화] 데이터 로드
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const ingRes = await customInstance({ url: "/api/ingredients", method: "GET" });
        setActiveIngredients(ingRes.data?.data?.content.map(item => item.name) || []);
        try {
          const bookmarkRes = await customInstance({ url: "/api/bookmarks", method: "GET" });
          setBookmarkedIds(bookmarkRes.data || []);
        } catch (err) { console.warn("북마크 데이터 없음"); }
      } catch (err) { console.error("📍 초기 데이터 로드 실패:", err); }
    };
    fetchInitialData();
  }, []);

  // [추천 엔진] 재료 변경 시 서버 호출
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (activeIngredients.length === 0) {
        setRecommendedData([]);
        return;
      }
      try {
        const res = await axios.post("http://localhost:8001/recommend/ingredients", {
          ingredients: activeIngredients
        });
        setRecommendedData(Array.isArray(res.data) ? res.data : []);
      } catch (err) { console.error("📍 파이썬 추천 서버 연결 실패:", err); }
    };
    fetchRecommendations();
  }, [activeIngredients]);

  const toggleBookmark = async (e, recipeTitle) => {
    e.stopPropagation();
    const isBookmarked = bookmarkedIds.includes(recipeTitle);
    try {
      await customInstance({
        url: "/api/bookmarks",
        method: isBookmarked ? "DELETE" : "POST",
        params: { title: recipeTitle }
      });
      setBookmarkedIds(prev => isBookmarked ? prev.filter(id => id !== recipeTitle) : [...prev, recipeTitle]);
    } catch (err) { alert("북마크 처리 중 오류 발생"); }
  };

  const handleAddIngredient = () => {
    const trimmed = searchTerm.trim();
    if (trimmed && !activeIngredients.includes(trimmed)) {
      setActiveIngredients(prev => [...prev, trimmed]);
      setSearchTerm("");
    }
  };

  // [필터링 로직] 재료가 있을 땐 점수가 100점인 것만 필터링
  const filteredRecipes = crawledRecipes.filter(recipe => {
    if (activeIngredients.length > 0) {
      const recInfo = recommendedData.find(rec => rec.title.trim() === recipe.title.trim());
      return recInfo && recInfo.score === 100;
    }
    return true; 
  }).filter(recipe => selectedCategory === "전체" || recipe.category === selectedCategory);

  return (
    <div className="main_page_container">
      <main className="con">
        <Section title="재료 검색 및 관리">
          <div className="fridge_header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <Button onClick={() => navigate("/reg")}><Plus size={16} /> 재료 등록</Button>
          </div>
          <div className="search_box">
            <input id="ingredient-search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="재료 입력" />
            <Button onClick={handleAddIngredient}><Search size={16} /></Button>
          </div>
          <div className="tags_container">
            {activeIngredients.map((ing) => (
              <span key={ing} className="ingredient_tag">
                {ing} <X size={14} onClick={() => setActiveIngredients(prev => prev.filter(i => i !== ing))} />
              </span>
            ))}
          </div>
        </Section>

        <Section title="BEST 요리모음">
          <div className="filter_box">
            <select value={selectedCategory} className="drop_nav" onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="card-wrapper">
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => {
                const recInfo = recommendedData.find(item => item.title.trim() === recipe.title.trim());
                
                return (
                  <div key={recipe.title} className="recipe-card-box">
                    <Card
                      title={recipe.title}
                      category={recipe.category}
                      image={recipe.thumbnailImageUrl}
                      isBookmarked={bookmarkedIds.includes(recipe.title)}
                      onToggleBookmark={(e) => toggleBookmark(e, recipe.title)}
                      onClick={() => navigate(`/recipe/${encodeURIComponent(recipe.title)}`)}
                    />
                    
                    {/* [보유 재료 강조] 100점인 레시피만 상세 정보 노출 */}
                    {/* 보유 재료 하이라이트 로직 적용 부분 */}
                    {activeIngredients.length > 0 && recInfo && recInfo.score === 100 ? (
                      <div className="recipe_ingredients_box">
                        {/* 보유 재료 하이라이트 로직 */}
                        <p className="recipe_ingredients_text">재료: 
                          {Array.isArray(recInfo.ingredients) ? recInfo.ingredients.map((ing, idx) => {
                            // 사용자가 입력한(activeIngredients) 재료인지 확인
                            // [수정 후: "포함" 여부를 확인하는 로직]
                            // 성빈님이 입력한 재료(activeIngredients) 중 하나라도 
                            // 레시피 재료명(ing)에 포함되어 있는지 확인합니다.
                            const isOwned = activeIngredients.some(ownedIng => ing.includes(ownedIng));

                            return (
                              <span 
                                key={idx} 
                                // 보유 재료라면 'ingredient_owned' 클래스를 추가
                                className={`ingredient_item ${isOwned ? 'ingredient_owned' : ''}`}
                              >
                                {ing}{idx < recInfo.ingredients.length - 1 ? ", " : ""}
                              </span>
                            );
                          }) : "정보 없음"}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : <p>해당 재료에 포함 되는 레시피가 없습니다.</p>}
          </div>
        </Section>
      </main>
    </div>
  );
}