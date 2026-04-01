// src/pages/Main/Main.js

import React from "react";
import { useNavigate } from "react-router-dom";

import "./Main.css";

import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Section from "../../components/Section/Section";

import { recipes } from "../../data/recipes";

function Main() {

  const navigate = useNavigate();

  const goRegPage = () => {
    navigate("/reg");
  };

  const goRecipeReg = () => {
    navigate("/recipe-reg");
  };

  return (

    <main className="con">

      <Section
        title="BEST 요리모음"

        actions={
          <>
            <Button onClick={goRegPage}>
              + 재료 등록
            </Button>

            <Button
              variant="outline"
              onClick={goRecipeReg}
            >
              레시피 등록
            </Button>
          </>
        }
      >

        {/* 카드 리스트 */}
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

  );
}

export default Main;