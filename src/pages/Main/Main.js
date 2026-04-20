import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";
import "../../pages/Main/recipeMatch.css";

// 컴포넌트
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Section from "../../components/Section/Section"; 
import MatchedRecipeCard from "../../components/MatchedRecipeCard/MatchedRecipeCard";
import customInstance from "../../api/api"; 

// 데이터 및 유틸
import { recipes as recipesData } from "../../data/recipes";
import { recipes2 } from "../../data/recipes2";
import { matchRecipesWithIngredients } from "../../utils/recipeMatch";
import { ChefHat, Search, X } from "lucide-react"; // 사용 중인 아이콘만 유지

export default function Main() {
  const navigate = useNavigate();
  
  // 상태 관리
  const [activeIngredients, setActiveIngredients] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);

  // 1. 서버에서 재료 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await customInstance({ url: "/api/ingredients", method: "GET" });
        const content = response.data?.data?.content || [];
        
        if (content.length > 0) {
          setActiveIngredients(content.map(item => item.name));
        }
      } catch (err) {
        console.error("📍 [Main] 데이터 로드 실패:", err);
      }
    };
    fetchData();
  }, []);

  // 2. 재료 변경 시 레시피 재매칭
  useEffect(() => {
    const matched = matchRecipesWithIngredients(recipes2, activeIngredients);
    setRecommendedRecipes(matched.filter(mr => mr.matchPercentage >= 30));
  }, [activeIngredients]);

  // 재료 추가 핸들러
  const handleAddIngredient = () => {
    const trimmed = searchTerm.trim();
    if (trimmed && !activeIngredients.includes(trimmed)) {
      setActiveIngredients([...activeIngredients, trimmed]);
      setSearchTerm("");
    }
  };

  return (
    <div className="main_page_container">
      <main className="con">
        
        {/* 검색 및 태그 영역 */}
        <Section title="재료 검색 및 관리">
          <div className="search_box" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="재료 입력 (예: 양파)"
            />
            <Button onClick={handleAddIngredient}><Search size={16} /></Button>
          </div>
          
          <div className="tags_container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {activeIngredients.map((ing) => (
              <span 
                key={ing} 
                className="ingredient_tag" 
                style={{ background: '#eee', padding: '5px 10px', borderRadius: '15px', display: 'flex', alignItems: 'center' }}
              >
                {ing} 
                <X 
                  size={14} 
                  onClick={() => setActiveIngredients(activeIngredients.filter(i => i !== ing))} 
                  style={{ marginLeft: '5px', cursor: 'pointer' }} 
                />
              </span>
            ))}
          </div>
        </Section>

        {/* 추천 결과 영역 */}
        {recommendedRecipes.length > 0 && (
          <Section title={<div className="section_header"><ChefHat className="section_icon" /><h3>맞춤 추천 레시피</h3></div>}>
            <div className="card-wrapper">
              {recommendedRecipes.map((matchedRecipe) => (
                <MatchedRecipeCard 
                  key={matchedRecipe.recipe.id} 
                  matchedRecipe={matchedRecipe} 
                />
              ))}
            </div>
          </Section>
        )}

        <Section title="BEST 요리모음">
          <div className="card-wrapper">
            {recipesData.slice(0, 10).map((recipe) => (
              <Card
                key={recipe.id}
                title={recipe.title}
                image={recipe.image || recipe.thumbnailImageUrl}
                onClick={() => navigate(`/recipe/${encodeURIComponent(recipe.title)}`)}
              />
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}