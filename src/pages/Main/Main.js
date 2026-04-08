// src/pages/Main/Main.js

import React from "react";
import { useNavigate } from "react-router-dom";

import "./Main.css";

// 성빈님의 공통 컴포넌트들
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Section from "../../components/Section/Section";

// 데이터
import { recipes } from "../../data/recipes";

function Main() {
  const navigate = useNavigate();

  const goRegPage = () => navigate("/reg");
  const goRecipeReg = () => navigate("/recipe-reg");

  return (
    <div className="main_page_container">
      {/* 시연 시 통일감을 위해 상단에 Header를 따로 두지 않는다면 
          Section의 타이틀 영역이 헤더 역할을 하게 됩니다. */}
      
      <main className="con">
        <Section
          title="BEST 요리모음"
          actions={
            <div className="main_actions">
              {/* 성빈님 픽: #CCCCCC 혹은 그라데이션 버튼을 Button 컴포넌트가 처리 */}
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
          {/* 카드 리스트 영역 */}
          <div className="card-wrapper">
            {recipes.map((recipe) => (
              <Card
                key={recipe.id}
                title={recipe.title}
                image={recipe.image}
                time={recipe.time}
                difficulty={recipe.difficulty}
                servings={recipe.servings}
              />
            ))}
          </div>
        </Section>
      </main>
      
      {/* 하단 여백이나 플로팅 버튼이 필요하다면 여기에 추가 */}
    </div>
  );
}

export default Main;