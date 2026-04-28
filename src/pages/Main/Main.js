import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Main.css";
import "../../pages/Main/recipeMatch.css";

import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Section from "../../components/Section/Section";
import customInstance from "../../api/api";

import { recipes3 as crawledRecipes } from "../../data/collection/recipes3";
import { Search, X, Plus } from "lucide-react";

// 인기 검색어 더미 데이터
const DUMMY_POPULAR_INGREDIENTS = [
  { name: "양파" }, { name: "마늘" }, { name: "계란" }, { name: "대파" }, { name: "감자" }
];

export default function Main() {
  const navigate = useNavigate();

  const [activeIngredients, setActiveIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [recommendedData, setRecommendedData] = useState([]);
  
  const [allIngredients, setAllIngredients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categories = ["전체", ...new Set(crawledRecipes.map(r => r.category))];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const ingRes = await customInstance({ url: "/api/ingredients", method: "GET" });
        const ingList = ingRes.data?.data?.content || [];
        setAllIngredients(ingList); 
        setActiveIngredients(ingList.map(item => item.name));
        
        // try {
        //   const bookmarkRes = await customInstance({ url: "/api/recipe/bookmarks", method: "GET" });
        //   setBookmarkedIds(bookmarkRes.data || []);
        // } catch (err) { console.warn("북마크 데이터 없음"); }
      } catch (err) { console.error("데이터 로드 실패:", err); }
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

  const suggestions = useMemo(() => {
    if (!searchTerm) return [];
    return allIngredients.filter(item => item.name.includes(searchTerm)).slice(0, 5);
  }, [searchTerm, allIngredients]);

  // [기능] 조회수 증가 및 페이지 이동 시뮬레이션
  const handleRecipeClick = async (recipeId, title) => {
    console.log(`[시뮬레이션] ${recipeId}번 레시피 조회수 증가 API 호출 준비 완료.`);
    // 나중에 백엔드 API가 준비되면 주석을 해제하세요.
    /*
    try {
      await customInstance({ url: `/api/recipes/${recipeId}/view`, method: "POST" });
    } catch (err) { console.error("조회수 증가 실패:", err); }
    */
    navigate(`/recipe/${encodeURIComponent(title)}`);
  };

  const toggleBookmark = async (e, recipeId) => {
    e.stopPropagation();
    const isBookmarked = bookmarkedIds.includes(recipeId);
    try {
      await customInstance({ url: `/api/recipes/${recipeId}/bookmark`, method: isBookmarked ? "DELETE" : "POST" });
      setBookmarkedIds(prev => isBookmarked ? prev.filter(id => id !== recipeId) : [...prev, recipeId]);
    } catch (err) { console.error(err); }
  };

  const handleAddIngredient = (name) => {
    const ingredientName = name || searchTerm.trim();
    if (ingredientName && !activeIngredients.includes(ingredientName)) {
      setActiveIngredients(prev => [...prev, ingredientName]);
      setSearchTerm("");
      setShowSuggestions(false);
    }
  };

  const recipesWithId = useMemo(() => {
    return crawledRecipes
      .filter(recipe => {
        if (activeIngredients.length > 0) {
          const recInfo = recommendedData.find(rec => rec.title.trim() === recipe.title.trim());
          return recInfo && recInfo.score === 100;
        }
        return true;
      })
      .filter(recipe => selectedCategory === "전체" || recipe.category === selectedCategory)
      .map((recipe, index) => ({ ...recipe, id: recipe.id || index }));
  }, [activeIngredients, recommendedData, selectedCategory]);

  return (
    <div className="main_page_container">
      <main className="con">
        <Section title="재료 검색 및 관리">
          <div className="fridge_header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <Button onClick={() => navigate("/reg")}><Plus size={16} /> 재료 등록</Button>
          </div>
          
          <div className="search_box" style={{ position: "relative" }}>
            <input 
              id="ingredient-search" 
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }} 
              placeholder="재료 입력" 
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestion_list">
                {suggestions.map((ing) => (
                  <li key={ing.ingredientId} onClick={() => handleAddIngredient(ing.name)}>
                    {ing.name}
                  </li>
                ))}
              </ul>
            )}
            <Button onClick={() => handleAddIngredient()}><Search size={16} /></Button>
          </div>

          <div className="popular_section" style={{ margin: "10px 0" }}>
            <p style={{ fontSize: "0.8rem", color: "#888" }}>🔥 인기 재료</p>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {DUMMY_POPULAR_INGREDIENTS.map((item) => (
                <button key={item.name} className="popular_tag_btn" onClick={() => handleAddIngredient(item.name)}>
                  {item.name}
                </button>
              ))}
            </div>
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
            {recipesWithId.map((recipe) => {
              const recInfo = recommendedData.find(item => item.title.trim() === recipe.title.trim());
              return (
                <div key={recipe.id} className="recipe-card-box">
                  <Card
                    title={recipe.title}
                    category={recipe.category}
                    thumbnailImageUrl={recipe.thumbnailImageUrl} 
                    isBookmarked={bookmarkedIds.includes(recipe.id)}
                    onToggleBookmark={(e) => toggleBookmark(e, recipe.id)}
                    onClick={() => handleRecipeClick(recipe.id, recipe.title)}
                  />
                  
                  {activeIngredients.length > 0 && recInfo && recInfo.score === 100 ? (
                    <div className="recipe_ingredients_box">
                      <p className="recipe_ingredients_text">재료: 
                        {Array.isArray(recInfo.ingredients) ? recInfo.ingredients.map((ing, idx) => {
                          const isOwned = activeIngredients.some(ownedIng => ing.includes(ownedIng));
                          return (
                            <span key={idx} className={`ingredient_item ${isOwned ? 'ingredient_owned' : ''}`}>
                              {ing}{idx < recInfo.ingredients.length - 1 ? ", " : ""}
                            </span>
                          );
                        }) : "정보 없음"}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Section>
      </main>
    </div>
  );
}