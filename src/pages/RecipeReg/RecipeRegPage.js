import React, { useState, useEffect } from "react";
import "./RecipeRegPage.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
// Card 컴포넌트 대신 커스텀 리스트 레이아웃을 사용합니다.

function RecipeRegPage() {
  /* ===============================
     1. 상태 관리 (State)
  =============================== */
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [time, setTime] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [image, setImage] = useState("");

  const [recipes, setRecipes] = useState([]);
  const [editId, setEditId] = useState(null);

  /* ===============================
     2. 데이터 보존 (LocalStorage)
     - 브라우저를 새로고침해도 데이터가 유지되도록 로직을 구성합니다.
  =============================== */
  useEffect(() => {
    const saved = localStorage.getItem("recipes");
    if (saved) {
      setRecipes(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  /* ===============================
     3. 비즈니스 로직 (CRUD)
  =============================== */
  
  // 등록 및 수정 실행
  const handleRegister = () => {
    if (!title) return alert("레시피 이름을 입력해주세요.");

    if (editId) {
      // (U) 수정: 기존 배열에서 동일 ID만 교체
      const updated = recipes.map((item) =>
        item.id === editId
          ? { ...item, title, desc, time, difficulty, image }
          : item
      );
      setRecipes(updated);
      setEditId(null);
    } else {
      // (C) 등록: 새 레시피 객체 생성 후 배열 앞에 추가
      const newRecipe = {
        id: Date.now(),
        title,
        desc,
        time,
        difficulty,
        image: image || "https://placehold.jp/150x150.png?text=No+Image"
      };
      setRecipes([newRecipe, ...recipes]);
    }

    // 입력 필드 초기화
    setTitle(""); setDesc(""); setTime(""); setDifficulty(""); setImage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleRegister();
  };

  // 삭제 실행
  const handleDelete = (id) => {
    if (window.confirm("레시피를 삭제할까요?")) {
      setRecipes(recipes.filter((item) => item.id !== id));
    }
  };

  // 수정 모드 진입
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
      {/* Header는 App.js에서 공통으로 나오므로 여기선 제외했습니다. */}
      
      <main className="recipe_main_content">
        <div className="recipe_header">
          <h2>레시피 마스터 관리</h2>
          <p>나만의 요리 비법을 리스트로 관리하세요.</p>
        </div>

        {/* 입력 폼 섹션 */}
        <form className="recipe_input_section" onSubmit={handleSubmit}>
          <Input label="레시피 이름" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="요약 설명" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <div className="input_row">
            <Input label="조리 시간" value={time} onChange={(e) => setTime(e.target.value)} />
            <Input label="난이도" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
          </div>
          <Input label="이미지 URL" value={image} onChange={(e) => setImage(e.target.value)} />

          <div className="button_group">
            <Button type="submit" variant="primary">
              {editId ? "수정 완료" : "+ 레시피 등록"}
            </Button>
            {editId && (
              <button className="cancel_btn" onClick={() => setEditId(null)}>취소</button>
            )}
          </div>
        </form>

        <div className="divider"></div>

        {/* [변경] 레시피 리스트 섹션 */}
        <div className="recipe_list">
          <h3 className="list_title">저장된 레시피 ({recipes.length})</h3>
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe_list_item">
              <img 
                src={recipe.image} 
                className="list_item_img" 
                alt={recipe.title} 
                onError={(e) => e.target.src="https://placehold.jp/150x150.png?text=No+Image"}
              />
              <div className="list_item_info">
                <div className="info_top">
                  <span className="info_title">{recipe.title}</span>
                  <span className="info_badge">{recipe.difficulty}</span>
                </div>
                <p className="info_desc">{recipe.desc}</p>
                <div className="info_bottom">
                  <span className="info_time">⏱ {recipe.time}</span>
                  <div className="info_buttons">
                    <button onClick={() => handleEdit(recipe)}>수정</button>
                    <button onClick={() => handleDelete(recipe.id)} className="del_text">삭제</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default RecipeRegPage;