import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";

// 공통 UI 컴포넌트 임포트
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Section from "../../components/Section/Section";

// ✅ 1. 크롤링으로 생성된 로컬 데이터 임포트
import { recipes as localRecipes } from "../../data/recipes";

// 백엔드 연동을 위한 인스턴스 (현재는 주석 처리하여 유지)
// import customInstance from "../../api/api"; 

function Main() {
  const navigate = useNavigate();

  // 상태 관리
  const [recipeList, setRecipeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * [Side Effect] 데이터 로드 로직
   */
  useEffect(() => {
    const fetchMainRecipes = async () => {
      try {
        setIsLoading(true);

        /* ==========================================================
           [백엔드 연동 시 아래 주석을 해제하세요]
           ----------------------------------------------------------
           const token = localStorage.getItem("accessToken");
           if (!token) {
             setRecipeList([]);
             setIsLoading(false);
             return;
           }

           const data = await customInstance({ url: "/api/recipes", method: "GET" });
           setRecipeList(data || []); 
           ========================================================== */

        // ✅ 2. 현재는 로컬 recipes.js 데이터를 사용
        // 크롤링 데이터가 바로 반영되도록 설정
        setRecipeList(localRecipes || []);
        
      } catch (err) {
        console.error("📍 [Main] 레시피 로드 중 오류 발생:", err);
        setRecipeList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMainRecipes();
  }, []); 

  const goRegPage = () => navigate("/reg");
  const goRecipeReg = () => navigate("/recipe-reg");

  return (
    <div className="main_page_container">
      <main className="con">
        <Section
          title="BEST 요리모음"
          actions={
            <div className="main_actions">
              <Button onClick={goRegPage} className="action_btn">
                + 재료 등록
              </Button>
              <Button
                variant="outline"
                onClick={goRecipeReg}
                className="action_btn"
              >
                레시피 등록
              </Button>
            </div>
          }
        >
          <div className="card-wrapper">
            {isLoading ? (
              <p className="loading_msg">맛있는 레시피를 불러오는 중...</p>
            ) : recipeList.length > 0 ? (
              recipeList.map((recipe, index) => (
                <Card
                  // 로컬 데이터는 id가 없을 수 있으므로 index와 조합
                  key={recipe.id || index} 
                  title={recipe.title}
                  // ✅ 크롤링 데이터의 'image' 필드를 사용 (백엔드 연동 시 thumbnailImageUrl로 변경 가능)
                  image={recipe.image || recipe.thumbnailImageUrl} 
                  
                  // 로컬 데이터에 없는 값들은 기본값으로 처리
                  time={recipe.time || "15분"} 
                  difficulty={recipe.difficulty || "쉬움"}
                  servings={recipe.servings || "1인분"}
                />
              ))
            ) : (
              <p className="empty_msg">등록된 레시피가 없습니다. 첫 레시피를 등록해보세요!</p>
            )}
          </div>
        </Section>
      </main>
    </div>
  );
}

export default Main;