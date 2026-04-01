// src/pages/Main/Main.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";

function Main() {

  const navigate = useNavigate();

  const goRegPage = () => {
    navigate("/reg");
  };

  const recipes = [
    {
      id: 1,
      title: "유부초밥 레시피 모음",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      title: "간단한 김치볶음밥",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 3,
      title: "초간단 토스트",
      image: "https://via.placeholder.com/150",
    },
  ];

  return (
    <main className="con">
      <div className="home_cont_cate">

        {/* 🔥 제목 + 버튼 */}
        <div className="section-header">
          <h3>BEST 요리모음</h3>

          <Button onClick={goRegPage}>
            + 재료 등록
          </Button>
        </div>

        {/* 카드 리스트 */}
        <div className="card-wrapper">
          {recipes.map((recipe) => (
            <Card
              key={recipe.id}
              title={recipe.title}
              image={recipe.image}
            />
          ))}
        </div>

      </div>
    </main>
  );
}

export default Main;