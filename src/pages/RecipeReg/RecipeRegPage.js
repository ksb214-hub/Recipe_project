import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./RecipeRegPage.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import customInstance from "../../api/api"; 
import { Heart } from "lucide-react";

function RecipeRegPage() {
  const navigate = useNavigate();

  /* ---------------------------------------------------------
     1. 상태 관리
     --------------------------------------------------------- */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState("");
  const [ingredients, setIngredients] = useState([{ ingredientId: "", amount: "" }]);
  const [steps, setSteps] = useState([{ stepNo: 1, description: "", cookingImageUrl: "" }]);
  
  const [recipes, setRecipes] = useState([]); 
  const [availableIngredients, setAvailableIngredients] = useState([]); 
  const [bookmarkedIds, setBookmarkedIds] = useState([]); 
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     2. 서버 데이터 로드
     --------------------------------------------------------- */
  const fetchData = useCallback(async () => {
    try {
      const recipeRes = await customInstance({ url: "/api/recipes", method: "GET" });
      const recipeList = recipeRes.data?.data?.content || recipeRes.data?.content || recipeRes.data || [];
      setRecipes(recipeList);

      const ingRes = await customInstance({ url: "/api/ingredients", method: "GET" });
      const rawIngData = ingRes.data;
      const finalIngList = rawIngData.content || rawIngData.data?.content || rawIngData.data || [];
      setAvailableIngredients(finalIngList);
    } catch (err) {
      console.error("❌ 데이터 로드 실패:", err);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  /* ---------------------------------------------------------
     3. DB 컬럼 규격에 맞춘 실시간 입력 제한 핸들러
     --------------------------------------------------------- */
  const handleTitleChange = (e) => {
    const value = e.target.value;
    if (value.length > 100) return; // varchar(100) 초과 차단
    setTitle(value);
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length > 1000) return; // 최대 1000자 가이드라인 차단
    setDescription(value);
  };

  const handleThumbnailUrlChange = (e) => {
    const value = e.target.value;
    if (value.length > 1000) return; // varchar(1000) 초과 차단
    setThumbnailImageUrl(value);
  };

  const toggleBookmark = async (e, recipeId) => {
    e.stopPropagation();
    if (!recipeId) return;
    const targetId = Number(recipeId);
    const isCurrentlyBookmarked = bookmarkedIds.includes(targetId);
    try {
      const method = isCurrentlyBookmarked ? "DELETE" : "POST";
      await customInstance({ url: `/api/recipes/${targetId}/bookmark`, method });
      setBookmarkedIds(prev => isCurrentlyBookmarked ? prev.filter(id => id !== targetId) : [...prev, targetId]);
    } catch (err) {
      console.error("❌ 북마크 통신 에러:", err);
    }
  };

  const addIngredient = () => setIngredients([...ingredients, { ingredientId: "", amount: "" }]);
  
  const handleIngredientChange = (index, field, value) => {
    const newIng = [...ingredients];
    newIng[index][field] = value;
    setIngredients(newIng);
  };

  const addStep = () => setSteps([...steps, { stepNo: steps.length + 1, description: "", cookingImageUrl: "" }]);
  
  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    
    // 조리 단계 설명 및 이미지 URL도 DB 규격 varchar(1000)을 초과하지 않도록 실시간 차단
    if (field === "description" && value.length > 1000) return;
    if (field === "cookingImageUrl" && value.length > 1000) return;

    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  /* ---------------------------------------------------------
     4. 레시피 등록 및 데이터 정밀 검증
     --------------------------------------------------------- */
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    
    // 1. 제목 최소 글자 수 검증
    if (!title || title.trim().length === 0) {
      return alert("레시피 제목은 최소 1글자 이여야 합니다.");
    }

    // 2. 상세 설명 최소 글자 수 검증
    if (!description || description.trim().length === 0) {
      return alert("레시피 순서는 최소 1자여야합니다.");
    }

    // 재료 가공 및 유효성 검사
    const validIngredients = ingredients.filter(ing => ing.ingredientId !== "");
    if (validIngredients.length === 0) {
      return alert("최소 1개 이상의 재료를 선택해야 합니다.");
    }
    const hasEmptyAmount = validIngredients.some(ing => !ing.amount || ing.amount.trim() === "");
    if (hasEmptyAmount) {
      return alert("선택한 재료의 수량 또는 용량을 입력해 주세요.");
    }

    // 조리 순서(Step) 빈값 검증 (Null = NO 대응)
    const hasEmptyStepDesc = steps.some(s => !s.description || s.description.trim() === "");
    if (hasEmptyStepDesc) {
      return alert("조리 순서 내용을 입력해 주세요.");
    }

    setLoading(true);
    try {
      const recipeData = {
        title: title.trim(),
        description: description.trim(),
        thumbnailImageUrl: thumbnailImageUrl.trim() || null,
        status: "PUBLISHED", // DB의 필수 enum 컬럼 반영
        ingredients: validIngredients.map(ing => ({
          ingredientId: Number(ing.ingredientId),
          amount: String(ing.amount)
        })),
        steps: steps.map((s, i) => ({
          stepNo: i + 1,
          description: s.description.trim(),
          cookingImageUrl: s.cookingImageUrl.trim() || null
        }))
      };

      await customInstance({ url: "/api/recipes", method: "POST", data: recipeData });
      alert("레시피가 입력됐습니다.");
      
      setTitle(""); setDescription(""); setThumbnailImageUrl("");
      setIngredients([{ ingredientId: "", amount: "" }]);
      setSteps([{ stepNo: 1, description: "", cookingImageUrl: "" }]);
      
      fetchData(); 
    } catch (err) {
      alert(`등록 실패: ${err.response?.data?.message || "서버 에러"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe_reg_container">
      <main className="recipe_main_content">
        <h2>새 레시피 작성</h2>
        
        <form className="recipe_input_section" onSubmit={handleRegister}>
          <section className="form_group">
            <Input label="레시피 제목" value={title} onChange={handleTitleChange} placeholder="레시피 제목을 입력하세요 (최대 100자)" />
            <Input label="간략한 설명" value={description} onChange={handleDescriptionChange} placeholder="조리 설명을 입력하세요 (최대 1000자)" />
            <Input label="대표 이미지 URL" value={thumbnailImageUrl} onChange={handleThumbnailUrlChange} placeholder="이미지 URL 경로를 입력하세요 (최대 1000자)" />
          </section>

          <section className="form_group">
            <h3>재료 설정 (필수)</h3>
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
                <Input placeholder="양 (예: 200g, 1/2개)" value={ing.amount} onChange={(e) => handleIngredientChange(index, "amount", e.target.value)} />
              </div>
            ))}
            <button type="button" className="add_btn" onClick={addIngredient}>+ 재료 추가</button>
          </section>

          <section className="form_group">
            <h3>조리 순서 (필수)</h3>
            {steps.map((step, index) => (
              <div key={index} className="step_input_box">
                <h4>Step {index + 1}</h4>
                <Input placeholder="조리 과정을 설명해주세요. (최대 1000자)" value={step.description} onChange={(e) => handleStepChange(index, "description", e.target.value)} />
                <Input placeholder="단계별 이미지 URL (선택, 최대 1000자)" value={step.cookingImageUrl || ""} onChange={(e) => handleStepChange(index, "cookingImageUrl", e.target.value)} />
              </div>
            ))}
            <button type="button" className="add_btn" onClick={addStep}>+ 단계 추가</button>
          </section>

          <Button type="submit" variant="primary" disabled={loading} style={{ width: "100%", height: "50px", fontSize: "16px" }}>
            {loading ? "레시피 저장 중..." : "레시피 등록 완료"}
          </Button>
        </form>

        <div className="divider"></div>

        <section className="recipe_list_section">
          <h3>현재 등록된 레시피 ({recipes.length})</h3>
          <div className="recipe_grid">
            {recipes.length > 0 ? (
              recipes.map((r, idx) => (
                <div key={r.id || idx} className="recipe_card" onClick={() => navigate(`/recipe/${r.id}`)} style={{ cursor: "pointer", position: "relative" }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong>{r.title}</strong>
                    <button onClick={(e) => toggleBookmark(e, r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>
                      <Heart size={20} fill={bookmarkedIds.includes(Number(r.id)) ? "#ff4d4f" : "none"} stroke={bookmarkedIds.includes(Number(r.id)) ? "#ff4d4f" : "#ccc"} />
                    </button>
                  </div>
                  <p>{r.description}</p>
                </div>
              ))
            ) : (
              <p>등록된 레시피가 없습니다.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default RecipeRegPage;