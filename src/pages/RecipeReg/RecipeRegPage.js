import React, { useState, useEffect, useCallback } from "react";
import "./RecipeRegPage.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import customInstance from "../../api/api"; 

function RecipeRegPage() {
  /* ---------------------------------------------------------
     1. 상태 관리 (State)
     --------------------------------------------------------- */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState("");
  // 선택된 재료 목록 (ID와 양)
  const [ingredients, setIngredients] = useState([{ ingredientId: "", amount: "" }]);
  // 조리 단계 목록
  const [steps, setSteps] = useState([{ stepNo: 1, description: "", cookingImageUrl: "" }]);
  
  const [recipes, setRecipes] = useState([]); // 등록된 레시피 목록
  const [availableIngredients, setAvailableIngredients] = useState([]); // 서버에서 가져온 선택 가능한 재료들
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     2. 서버 데이터 로드 (Fetch)
     --------------------------------------------------------- */
  const fetchData = useCallback(async () => {
    try {
      // 레시피 목록 가져오기
      const recipeRes = await customInstance({ url: "/api/recipes", method: "GET" });
      const recipeData = recipeRes.data?.data?.content || recipeRes.data?.content || [];
      setRecipes(recipeData);

      // ✅ [중요 수정] 재료 목록 가져오기 경로 수정
      // 아까 RegPage에서 확인한 것처럼 서버는 'content' 키 안에 배열을 담아줍니다.
      const ingRes = await customInstance({ url: "/api/ingredients", method: "GET" });
      
      console.log("📍 가져온 재료 원본 데이터:", ingRes.data);

      const rawIngData = ingRes.data;
      const finalIngList = rawIngData.content || (rawIngData.data && rawIngData.data.content) || rawIngData.data || [];
      
      console.log("✅ 추출된 재료 배열:", finalIngList);
      setAvailableIngredients(finalIngList);

    } catch (err) {
      console.error("데이터 로드 실패:", err);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  /* ---------------------------------------------------------
     3. 사용자 입력 핸들러 (UI Logic)
     --------------------------------------------------------- */
  // 재료 입력칸 추가
  const addIngredient = () => setIngredients([...ingredients, { ingredientId: "", amount: "" }]);
  
  // 특정 인덱스의 재료 필드(ID 또는 양) 변경
  const handleIngredientChange = (index, field, value) => {
    const newIng = [...ingredients];
    newIng[index][field] = value;
    setIngredients(newIng);
  };

  // 조리 단계 추가
  const addStep = () => setSteps([...steps, { stepNo: steps.length + 1, description: "", cookingImageUrl: "" }]);
  
  // 조리 단계 설명 변경
  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  /* ---------------------------------------------------------
     4. 레시피 등록 실행 (POST)
     --------------------------------------------------------- */
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    
    // 유효한 재료만 필터링 및 숫자 변환
    const validIngredients = ingredients
      .filter(ing => ing.ingredientId !== "" && ing.amount.trim() !== "")
      .map(ing => ({ 
        ingredientId: Number(ing.ingredientId), 
        amount: String(ing.amount) 
      }));

    if (!title.trim() || validIngredients.length === 0) {
      return alert("제목과 최소 하나 이상의 재료를 선택해주세요.");
    }

    setLoading(true);
    try {
      const recipeData = {
        title: title.trim(),
        description: description.trim(),
        thumbnailImageUrl: thumbnailImageUrl.trim() || null,
        ingredients: validIngredients,
        // 비어있는 단계는 제외하고 순번(stepNo) 재부여
        steps: steps
          .filter(s => s.description.trim() !== "")
          .map((s, i) => ({ ...s, stepNo: i + 1 }))
      };

      await customInstance({ url: "/api/recipes", method: "POST", data: recipeData });
      
      alert("🎉 레시피가 등록되었습니다!");
      
      // 입력 폼 초기화
      setTitle(""); setDescription(""); setThumbnailImageUrl("");
      setIngredients([{ ingredientId: "", amount: "" }]);
      setSteps([{ stepNo: 1, description: "", cookingImageUrl: "" }]);
      
      fetchData(); // 등록 후 목록 새로고침
    } catch (err) {
      console.error("등록 실패:", err.response?.data);
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
          {/* 기본 정보 */}
          <section className="form_group">
            <Input label="레시피 제목" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="간략한 설명" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input label="대표 이미지 URL" value={thumbnailImageUrl} onChange={(e) => setThumbnailImageUrl(e.target.value)} />
          </section>

          {/* 재료 설정 섹션 */}
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
                    // 서버에서 가져온 availableIngredients가 정상적으로 로드되어야 출력됨
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                <Input placeholder="양 (예: 200g, 1/2개)" value={ing.amount} onChange={(e) => handleIngredientChange(index, "amount", e.target.value)} />
              </div>
            ))}
            <button type="button" className="add_btn" onClick={addIngredient}>+ 재료 추가</button>
            
            {/* ⚠️ 재료가 0개일 때만 경고 문구 표시 */}
            {!loading && availableIngredients.length === 0 && (
              <p className="error_text">
                ⚠️ 서버에 등록된 재료가 없습니다. [식재료 관리] 페이지에서 재료를 먼저 등록해주세요.
              </p>
            )}
          </section>

          {/* 조리 순서 섹션 */}
          <section className="form_group">
            <h3>조리 순서</h3>
            {steps.map((step, index) => (
              <div key={index} className="step_input_box">
                <h4>Step {index + 1}</h4>
                <Input placeholder="조리 과정을 설명해주세요." value={step.description} onChange={(e) => handleStepChange(index, "description", e.target.value)} />
              </div>
            ))}
            <button type="button" className="add_btn" onClick={addStep}>+ 단계 추가</button>
          </section>

          <Button type="submit" variant="primary" disabled={loading || availableIngredients.length === 0} style={{ width: "100%", height: "50px", fontSize: "16px" }}>
            {loading ? "레시피 저장 중..." : "레시피 등록 완료"}
          </Button>
        </form>

        <div className="divider"></div>

        {/* 하단 레시피 목록 미리보기 */}
        <section className="recipe_list_section">
          <h3>현재 등록된 레시피 ({recipes.length})</h3>
          <div className="recipe_grid">
            {recipes.length > 0 ? (
              recipes.map((r, idx) => (
                <div key={r.id || idx} className="recipe_card">
                  <strong>{r.title}</strong>
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