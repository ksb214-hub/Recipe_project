import React, { useState, useEffect } from "react";
import "./RecipeRegPage.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import customInstance from "../../api/api"; 

function RecipeRegPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState("");
  const [ingredients, setIngredients] = useState([{ ingredientId: "", amount: "" }]);
  const [steps, setSteps] = useState([{ stepNo: 1, description: "", cookingImageUrl: "" }]);
  
  const [recipes, setRecipes] = useState([]); 
  const [availableIngredients, setAvailableIngredients] = useState([]); 
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const recipeRes = await customInstance({ url: "/api/recipes", method: "GET" });
      setRecipes(recipeRes.data?.data?.content || []);

      const ingRes = await customInstance({ url: "/api/ingredients", method: "GET" });
      setAvailableIngredients(ingRes.data?.data || []);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addIngredient = () => setIngredients([...ingredients, { ingredientId: "", amount: "" }]);
  const handleIngredientChange = (index, field, value) => {
    const newIng = [...ingredients];
    newIng[index][field] = value;
    setIngredients(newIng);
  };

  const addStep = () => setSteps([...steps, { stepNo: steps.length + 1, description: "", cookingImageUrl: "" }]);
  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    
    const validIngredients = ingredients
      .filter(ing => ing.ingredientId !== "" && ing.amount.trim() !== "")
      .map(ing => ({ ingredientId: Number(ing.ingredientId), amount: String(ing.amount) }));

    if (!title.trim() || validIngredients.length === 0) {
      return alert("제목과 재료를 입력해주세요.");
    }

    setLoading(true);
    try {
      const recipeData = {
        title: title.trim(),
        description: description.trim(),
        thumbnailImageUrl: thumbnailImageUrl.trim() || null,
        ingredients: validIngredients,
        steps: steps.filter(s => s.description.trim() !== "").map((s, i) => ({ ...s, stepNo: i + 1 }))
      };

      await customInstance({ url: "/api/recipes", method: "POST", data: recipeData });
      alert("🎉 등록 성공!");
      
      setTitle(""); setDescription(""); setThumbnailImageUrl("");
      setIngredients([{ ingredientId: "", amount: "" }]);
      setSteps([{ stepNo: 1, description: "", cookingImageUrl: "" }]);
      fetchData();
    } catch (err) {
      console.error("등록 실패 응답:", err.response?.data);
      alert(`등록 실패: ${err.response?.data?.message || "서버 응답 에러"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe_reg_container">
      <main className="recipe_main_content">
        <h2>레시피 등록</h2>
        <form className="recipe_input_section" onSubmit={handleRegister}>
          <section className="form_group">
            <Input label="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="설명" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input label="대표 이미지 URL" value={thumbnailImageUrl} onChange={(e) => setThumbnailImageUrl(e.target.value)} />
          </section>

          <section className="form_group">
            <h3>재료 설정</h3>
            {ingredients.map((ing, index) => (
              <div key={index} className="input_row">
                <select 
                  className="ingredient_select"
                  value={ing.ingredientId}
                  onChange={(e) => handleIngredientChange(index, "ingredientId", e.target.value)}
                >
                  <option value="">재료 선택</option>
                  {availableIngredients.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                <Input placeholder="양" value={ing.amount} onChange={(e) => handleIngredientChange(index, "amount", e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={addIngredient}>+ 재료 추가</button>
            {availableIngredients.length === 0 && (
              <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                ⚠️ 서버 DB에 등록된 재료가 없습니다. 재료를 먼저 등록해야 레시피 작성이 가능합니다.
              </p>
            )}
          </section>

          <section className="form_group">
            <h3>조리 순서</h3>
            {steps.map((step, index) => (
              <div key={index} className="step_input_box">
                <h4>Step {step.stepNo}</h4>
                <Input placeholder="설명" value={step.description} onChange={(e) => handleStepChange(index, "description", e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={addStep}>+ 단계 추가</button>
          </section>

          <Button type="submit" variant="primary" disabled={loading} style={{ width: "100%" }}>
            {loading ? "등록 중..." : "등록 완료"}
          </Button>
        </form>

        <div className="divider"></div>

        <section className="recipe_list_section">
          <h3>현재 등록된 레시피 ({recipes.length})</h3>
          <div className="recipe_grid">
            {recipes.map((r, idx) => (
              <div key={r.id || idx} className="recipe_card">
                <strong>{r.title}</strong>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default RecipeRegPage;