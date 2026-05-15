import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Main.css";
import "../../pages/Main/recipeMatch.css";

import Card from "../../components/Card/Card";
import Section from "../../components/Section/Section";
import customInstance from "../../api/api";

import { recipes3 as crawledRecipes } from "../../data/collection/recipes3";
import { Search, UtensilsCrossed, Refrigerator } from "lucide-react";

export default function Main() {
  const navigate = useNavigate();

  const [activeIngredients, setActiveIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recommendedData, setRecommendedData] = useState([]);
  
  const [recipes, setRecipes] = useState([]); 
  const [allIngredients, setAllIngredients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /* ---------------------------------------------------------
     1. 북마크 상태 관리
     --------------------------------------------------------- */
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    const saved = localStorage.getItem("localBookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("localBookmarks", JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  /* ---------------------------------------------------------
     2. 데이터 로드
     --------------------------------------------------------- */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const ingRes = await customInstance({ url: "/api/ingredients", method: "GET" });
        const ingList = ingRes.data?.data?.content || [];
        setAllIngredients(ingList); 
        setActiveIngredients(ingList.map(item => item.name));
        
        const recipeRes = await customInstance({ url: "/api/recipes", method: "GET" });
        const recipeList = recipeRes.data?.data?.content || [];
        setRecipes(recipeList);
      } catch (err) { 
        console.warn("데이터 로드 실패"); 
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (activeIngredients.length === 0) { setRecommendedData([]); return; }
      try {
        const res = await axios.post("http://localhost:8001/recommend/ingredients", { ingredients: activeIngredients });
        setRecommendedData(Array.isArray(res.data) ? res.data : []);
      } catch (err) { console.error("추천 실패:", err); }
    };
    fetchRecommendations();
  }, [activeIngredients]);

  /* ---------------------------------------------------------
     3. 핸들러
     --------------------------------------------------------- */
  const suggestions = useMemo(() => {
    if (!searchTerm) return [];
    return allIngredients.filter(item => item.name.includes(searchTerm)).slice(0, 5);
  }, [searchTerm, allIngredients]);

  const toggleBookmark = (e, recipeId) => {
    e.stopPropagation(); 
    setBookmarkedIds((prev) => 
      prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
    );
  };

  const handleAddIngredient = (name) => {
    const ingredientName = name || searchTerm.trim();
    if (ingredientName && !activeIngredients.includes(ingredientName)) {
      setActiveIngredients(prev => [...prev, ingredientName]);
      setSearchTerm("");
      setShowSuggestions(false);
    }
  };

  /* ---------------------------------------------------------
     4. 데이터 가공 (Key 충돌 방지를 위한 유니크 ID 생성)
     --------------------------------------------------------- */
  const processedRecipes = useMemo(() => {
    const baseList = recipes.length > 0 ? recipes : crawledRecipes;

    return baseList
      .filter(recipe => {
        if (activeIngredients.length > 0) {
          const recInfo = recommendedData.find(rec => rec.title.trim() === recipe.title.trim());
          return recInfo && recInfo.score === 100;
        }
        return true;
      })
      .map((recipe, index) => {
        // 고유 ID가 없을 경우 인덱스와 타이틀을 조합하여 절대 겹치지 않는 키 생성
        const uniqueId = recipe.id || `recipe-${index}-${recipe.title}`;
        return {
          ...recipe,
          id: uniqueId,
          recipetitle: recipe.title
        };
      });
  }, [recipes, activeIngredients, recommendedData]);

  return (
    <div className="main_page_container">
      <main className="con">
        
        <div className="quick_action_row">
          <div className="quick_card" onClick={() => navigate("/reg")}>
            <div className="quick_icon_circle"><Refrigerator size={20} /></div>
            <span>재료 등록</span>
          </div>
          <div className="quick_card" onClick={() => navigate("/recipe-reg")}>
            <div className="quick_icon_circle"><UtensilsCrossed size={20} /></div>
            <span>레시피 등록</span>
          </div>
        </div>

        <Section title="재료 검색 및 관리">
          <div className="search_box" style={{ position: "relative" }}>
            <input 
              id="ingredient-search"
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }} 
              placeholder="냉장고에 있는 재료를 검색해보세요" 
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestion_list">
                {suggestions.map((ing, idx) => (
                  // ingredientId가 없을 경우를 대비해 idx 조합
                  <li key={ing.ingredientId || `ing-${idx}`} onClick={() => handleAddIngredient(ing.name)}>
                    {ing.name}
                  </li>
                ))}
              </ul>
            )}
            <button className="search_inner_btn" onClick={() => handleAddIngredient()}>
              <Search size={18} />
            </button>
          </div>
        </Section>

        <Section title="오늘의 추천 레시피">
          <div className="card-wrapper">
            {processedRecipes.map((recipe) => (
              // map의 최상위 요소인 recipe-card-box에 고유 key 부여
              <div key={recipe.id} className="recipe-card-box">
                <Card
                  title={recipe.title}
                  category={recipe.category}
                  thumbnailImageUrl={recipe.thumbnailImageUrl} 
                  isBookmarked={bookmarkedIds.includes(recipe.id)}
                  onToggleBookmark={(e) => toggleBookmark(e, recipe.id)}
                  onClick={() => navigate(`/recipe/${encodeURIComponent(recipe.recipetitle)}`)}
                />
              </div>
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}