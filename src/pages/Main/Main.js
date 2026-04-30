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

const DUMMY_POPULAR_INGREDIENTS = [
  { name: "양파" }, { name: "마늘" }, { name: "계란" }, { name: "대파" }, { name: "감자" }
];

export default function Main() {
  const navigate = useNavigate();

  const [activeIngredients, setActiveIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [recommendedData, setRecommendedData] = useState([]);
  
  const [recipes, setRecipes] = useState([]); 
  const [allIngredients, setAllIngredients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /* ---------------------------------------------------------
     1. 북마크 상태 관리 (LocalStorage 활용)
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
     4. 데이터 가공
     --------------------------------------------------------- */
  const recipesWithId = useMemo(() => {
    const baseList = recipes.length > 0 ? recipes : crawledRecipes;
    return baseList
      .filter(recipe => {
        if (activeIngredients.length > 0) {
          const recInfo = recommendedData.find(rec => rec.title.trim() === recipe.title.trim());
          return recInfo && recInfo.score === 100;
        }
        return true;
      })
      .filter(recipe => selectedCategory === "전체" || recipe.category === selectedCategory)
      .map((recipe, index) => ({
        ...recipe,
        id: recipe.id || index + 10000 
      }));
  }, [recipes, activeIngredients, recommendedData, selectedCategory]);

  const categories = ["전체", ...new Set(crawledRecipes.map(r => r.category))];

  return (
    <div className="main_page_container">
      <main className="con">
        
        {/* 1. 재료 관리 섹션 */}
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
                  <li key={ing.ingredientId} onClick={() => handleAddIngredient(ing.name)}>{ing.name}</li>
                ))}
              </ul>
            )}
            <Button onClick={() => handleAddIngredient()}><Search size={16} /></Button>
          </div>

          <div className="tags_container">
            {activeIngredients.map((ing) => (
              <span key={ing} className="ingredient_tag">
                {ing} <X size={14} onClick={() => setActiveIngredients(prev => prev.filter(i => i !== ing))} />
              </span>
            ))}
          </div>
        </Section>

        {/* 2. BEST 요리모음 섹션 (등록 버튼 추가) */}
        <Section title="BEST 요리모음">
          <div className="section_header_actions" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            {/* 카테고리 필터 */}
            <div className="filter_box">
              <select 
                value={selectedCategory} 
                className="drop_nav" 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* 첫 번째 코드와 동일한 레시피 등록 버튼 추가 */}
            <Button
              onClick={() => navigate("/recipe-reg")}
              className="recipe_reg_btn"
              variant="outline"
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Plus size={16} />
              레시피 등록
            </Button>
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
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                  />
                  
                  {activeIngredients.length > 0 && recInfo && recInfo.score === 100 && (
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
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      </main>
    </div>
  );
}