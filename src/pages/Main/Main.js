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

// 데이터
import { recipes as recipesData } from "../../data/recipes";
import { recipes2 } from "../../data/recipes2";
import { matchRecipesWithIngredients } from "../../utils/recipeMatch";
import { ChefHat, Package, Plus } from "lucide-react";

export default function Main() {
  const navigate = useNavigate();
  const [myIngredients, setMyIngredients] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. 데이터 로드 로직
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await customInstance({ url: "/api/ingredients", method: "GET" });
        const content = response.data?.data?.content || [];
        
        console.log("📍 [Main] 로드된 재료 데이터:", content);
        
        if (content && content.length > 0) {
          const names = content.map(item => item.name);
          setMyIngredients(names);

          // 레시피 매칭
          const matched = matchRecipesWithIngredients(recipes2, names);
          const recommended = matched.filter(mr => mr.matchPercentage >= 30).slice(0, 3);
          setRecommendedRecipes(recommended);
        } else {
          setMyIngredients([]);
          setRecommendedRecipes([]);
        }
      } catch (err) {
        console.error("📍 [Main] 에러 발생:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. 화면 렌더링
  return (
    <div className="main_page_container">
      <main className="con">
        
        <Section title="냉장고 관리">
          <div className="fridge_status_card">
            <div className="fridge_status_header">
              <Package className="fridge_icon" />
              <div className="fridge_status_text">
                <h4>내 냉장고 현황</h4>
                {/* 데이터 상태에 따라 확실히 텍스트 출력 */}
                <p style={{ fontWeight: 'bold', color: myIngredients.length > 0 ? '#2c3e50' : '#95a5a6' }}>
                  {isLoading 
                    ? "데이터를 불러오는 중..." 
                    : (myIngredients.length > 0 
                        ? `${myIngredients.length}개의 재료 보유 중: ${myIngredients.join(", ")}` 
                        : "등록된 재료가 없습니다")
                  }
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/reg")} className="add_ingredient_btn">
              <Plus size={16} /> 재료 관리
            </Button>
          </div>
        </Section>

        {!isLoading && myIngredients.length > 0 && (
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
            {recipesData.slice(0, 6).map((recipe) => (
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