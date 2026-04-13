import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";

// 공통 UI 컴포넌트 임포트
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Section from "../../components/Section/Section";

// 인터셉터와 res.data 처리가 완료된 customInstance
import customInstance from "../../api/api"; 

function Main() {
  const navigate = useNavigate();

  // 상태 관리
  const [recipeList, setRecipeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * [Side Effect] 컴포넌트 마운트 시 데이터 로드
   */
  useEffect(() => {
    const fetchMainRecipes = async () => {
      try {
        setIsLoading(true);

        // 1. 토큰 가드 로직
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.warn("📍 [Main] 인증 토큰을 찾을 수 없습니다.");
          setRecipeList([]);
          setIsLoading(false);
          return;
        }

        // 2. API 호출 (서버의 새로운 JSON 규격 반영)
        const data = await customInstance({
          url: "/api/recipes",
          method: "GET"
        });
        
        /**
         * 서버 응답이 배열 형태인 경우 바로 저장하고, 
         * 만약 객체 내부의 특정 필드(예: data.content)에 있다면 수정이 필요할 수 있습니다.
         */
        setRecipeList(data || []); 
        
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
                  // 서버 데이터 규격(recipe.id 혹은 recipe.recipeId)에 맞춰 Key 설정
                  key={recipe.id || index} 
                  title={recipe.title}
                  // [수정] image -> thumbnailImageUrl 매핑
                  image={recipe.thumbnailImageUrl} 
                  // [추가] 설명글이 필요하다면 사용 (Card 컴포넌트 구현에 따라 가감)
                  description={recipe.description}
                  // 아래 값들은 서버 응답에 포함되어 있는지 확인 후 유지/수정
                  time={recipe.time || "30분"} 
                  difficulty={recipe.difficulty || "보통"}
                  servings={recipe.servings || "2인분"}
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