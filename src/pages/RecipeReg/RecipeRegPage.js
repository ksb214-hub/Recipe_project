import React, { useState, useEffect } from "react";
import "./RecipeRegPage.css";

import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";

function RecipeRegPage() {

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [time, setTime] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [image, setImage] = useState("");

  const [recipes, setRecipes] = useState([]);

  const [editId, setEditId] = useState(null);

  /* LocalStorage load */

  useEffect(() => {
    const saved = localStorage.getItem("recipes");

    if (saved) {
      setRecipes(JSON.parse(saved));
    }
  }, []);

  /* LocalStorage save */

  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  /* 등록 */

  const handleRegister = () => {

    if (!title) return;

    if (editId) {

      const updated = recipes.map((item) =>
        item.id === editId
          ? { ...item, title, desc, time, difficulty, image }
          : item
      );

      setRecipes(updated);
      setEditId(null);

    } else {

      const newRecipe = {
        id: Date.now(),
        title,
        desc,
        time,
        difficulty,
        image
      };

      setRecipes([...recipes, newRecipe]);
    }

    setTitle("");
    setDesc("");
    setTime("");
    setDifficulty("");
    setImage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleRegister();
  };

  const handleDelete = (id) => {
    setRecipes(recipes.filter((item) => item.id !== id));
  };

  const handleEdit = (item) => {

    setTitle(item.title);
    setDesc(item.desc);
    setTime(item.time);
    setDifficulty(item.difficulty);
    setImage(item.image);

    setEditId(item.id);
  };

  return (

    <div className="recipe_reg_container">

      <div className="recipe_reg_box">

        <div className="recipe_header">
          <h2>레시피 등록</h2>
          <p>나만의 레시피를 등록하세요</p>
        </div>

        <form
          className="recipe_input_section"
          onSubmit={handleSubmit}
        >

          <Input
            label="레시피 이름"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            label="설명"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <Input
            label="조리 시간"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <Input
            label="난이도"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          />

          <Input
            label="이미지 URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <Button type="submit">
            {editId ? "수정 완료" : "+ 레시피 등록"}
          </Button>

        </form>

        <div className="divider"></div>

        <div className="recipe_list">

          {recipes.map((recipe) => (

            <div key={recipe.id} className="recipe_card">

              <Card
                title={recipe.title}
                image={recipe.image}
                time={recipe.time}
                difficulty={recipe.difficulty}
              />

              <div className="card_buttons">

                <button
                  onClick={() => handleEdit(recipe)}
                >
                  수정
                </button>

                <button
                  onClick={() => handleDelete(recipe.id)}
                >
                  삭제
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );
}

export default RecipeRegPage;