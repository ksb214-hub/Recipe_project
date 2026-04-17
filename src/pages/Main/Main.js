import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";
import "../../pages/Main/recipeMatch.css";

// 컴포넌트 임포트
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Section from "../../components/Section/Section"; 
import MatchedRecipeCard from "../../components/MatchedRecipeCard/MatchedRecipeCard";

// 데이터 및 로직
import { recipes as recipesData } from "../../data/recipes";
import { recipes2 } from "../../data/recipes2";
import { matchRecipesWithIngredients } from "../../utils/recipeMatch";

// 아이콘
import { ChefHat, Package, Plus } from "lucide-react";

export default function Main() {
  const navigate = useNavigate();
  const [myIngredients, setMyIngredients] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initMain = () => {
      try {
        setIsLoading(true);
        const saved = localStorage.getItem("myIngredients");
        if (saved) {
          const ingredients = JSON.parse(saved);
          const ingredientNames = ingredients.map((ing) => 
            typeof ing === 'string' ? ing : ing.name
          );
          setMyIngredients(ingredientNames);

          const matched = matchRecipesWithIngredients(recipes2, ingredientNames);
          const recommended = matched
            .filter((mr) => mr.matchPercentage >= 30)
            .slice(0, 3);
          setRecommendedRecipes(recommended);
        }
      } catch (err) {
        console.error("📍 [Main] 로드 오류:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initMain();
  }, []);

  return (
    <div className="main_page_container">
      <main className="con">
        
        {/* 1. 내 냉장고 현황 섹션 (Section 내부에 스타일 div 배치) */}
        <Section title="냉장고 관리">
          <div className="fridge_status_card">
            <div className="fridge_status_header">
              <Package className="fridge_icon" />
              <div className="fridge_status_text">
                <h4>내 냉장고 현황</h4>
                <p>
                  {myIngredients.length > 0 
                    ? `${myIngredients.length}개의 재료 보유 중`
                    : "등록된 재료가 없습니다"
                  }
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/reg")} 
              className="add_ingredient_btn"
            >
              <Plus size={16} /> 재료 관리
            </Button>
          </div>
        </Section>

        {/* 2. 맞춤 추천 레시피 섹션 */}
        {myIngredients.length > 0 && recommendedRecipes.length > 0 && (
          <Section 
            title={
              <div className="section_header">
                <ChefHat className="section_icon" />
                <h3>맞춤 추천 레시피</h3>
              </div>
            }
          >
            <p className="section_description">
              보유 재료 기반 매칭 결과입니다.
            </p>
            <div className="card-wrapper">
              {recommendedRecipes.map((matchedRecipe) => (
                <MatchedRecipeCard 
                  key={`match-${matchedRecipe.recipe.id}`} 
                  matchedRecipe={matchedRecipe} 
                />
              ))}
            </div>
          </Section>
        )}

        {/* 3. 매칭 결과가 없을 때 안내 섹션 */}
        {myIngredients.length > 0 && recommendedRecipes.length === 0 && !isLoading && (
          <Section title="추천 결과">
            <div className="no_match_card">
              <Package className="no_match_icon" />
              <h4>추천 레시피가 없습니다</h4>
              <p>더 많은 재료를 등록해보세요!</p>
              <Button onClick={() => navigate("/reg")}>재료 추가하기</Button>
            </div>
          </Section>
        )}

        {/* 4. BEST 요리모음 섹션 */}
        <Section
          title="BEST 요리모음"
          actions={
            <Button variant="outline" onClick={() => navigate("/recipe-reg")} className="action_btn">
              레시피 등록
            </Button>
          }
        >
          <div className="card-wrapper">
            {isLoading ? (
              <p className="loading_msg">불러오는 중...</p>
            ) : (
              recipesData.slice(0, 6).map((recipe) => (
                <Card
                  key={recipe.id}
                  title={recipe.title}
                  image={recipe.image || recipe.thumbnailImageUrl}
                  time={recipe.time || "20분"}
                  difficulty={recipe.difficulty || "보통"}
                  servings={recipe.servings || "1인분"}
                  onClick={() => navigate(`/recipe/${encodeURIComponent(recipe.title)}`)}
                />
              ))
            )}
          </div>
        </Section>
      </main>
    </div>
  );
}