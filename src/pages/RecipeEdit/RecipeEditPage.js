import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../RecipeReg/RecipeRegPage.css';
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import customInstance from "../../api/api";
import { Plus, Trash2 } from "lucide-react"; // 아이콘 추가

function RecipeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ---------------------------------------------------------
     1. 상태 관리
     --------------------------------------------------------- */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  
  const [availableIngredients, setAvailableIngredients] = useState([]); 
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     2. 데이터 불러오기 (데이터 정제 로직 추가)
     --------------------------------------------------------- */
  const fetchRecipeDetail = useCallback(async () => {
    try {
      setLoading(true);
      // 1. 마스터 식재료 목록 로드
      const ingRes = await customInstance.get("/api/ingredients");
      const ingList = ingRes.data?.data?.content || ingRes.data?.data || [];
      setAvailableIngredients(ingList);

      // 2. 수정할 레시피 상세 정보 로드
      const res = await customInstance.get(`/api/recipes/${id}`);
      const data = res.data?.data || res.data;

      setTitle(data.title || "");
      setDescription(data.description || "");
      setThumbnailImageUrl(data.thumbnailImageUrl || "");
      
      // ✅ 중요: 서버에서 온 재료 데이터에서 ID만 추출하여 상태 설정
      if (data.ingredients) {
        const formattedIngs = data.ingredients.map(ing => ({
          ingredientId: ing.ingredientId || ing.id, // 필드명 대응
          amount: ing.amount || ""
        }));
        setIngredients(formattedIngs);
      }

      // ✅ 조리 순서 정제
      if (data.steps) {
        const formattedSteps = [...data.steps]
          .sort((a, b) => a.stepNo - b.stepNo)
          .map(s => ({
            description: s.description || s.content || "",
            cookingImageUrl: s.cookingImageUrl || ""
          }));
        setSteps(formattedSteps);
      }
    } catch (err) {
      console.error(err);
      alert("데이터를 불러오는데 실패했습니다.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchRecipeDetail(); }, [fetchRecipeDetail]);

  /* ---------------------------------------------------------
     3. 핸들러 (추가/삭제/수정)
     --------------------------------------------------------- */
  // 재료 관련
  const addIngredient = () => setIngredients([...ingredients, { ingredientId: availableIngredients[0]?.id || "", amount: "" }]);
  const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));
  const handleIngredientChange = (index, field, value) => {
    const newIng = [...ingredients];
    newIng[index][field] = value;
    setIngredients(newIng);
  };

  // 단계 관련
  const addStep = () => setSteps([...steps, { description: "", cookingImageUrl: "" }]);
  const removeStep = (index) => setSteps(steps.filter((_, i) => i !== index));
  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  /* ---------------------------------------------------------
     4. 수정 요청 (PUT)
     --------------------------------------------------------- */
  const handleUpdate = async (e) => {
    e.preventDefault();

    // 유효성 검사 강화
    if (!title.trim()) return alert("레시피 제목을 입력해주세요.");
    if (ingredients.length === 0) return alert("최소 하나 이상의 재료를 등록해주세요.");
    if (ingredients.some(ing => !ing.amount)) return alert("재료의 양을 모두 입력해주세요.");

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        thumbnailImageUrl,
        ingredients: ingredients.map(ing => ({
          ingredientId: Number(ing.ingredientId),
          amount: String(ing.amount)
        })),
        steps: steps.map((s, i) => ({
          stepNo: i + 1,
          description: s.description,
          cookingImageUrl: s.cookingImageUrl
        }))
      };

      await customInstance.put(`/api/recipes/${id}`, payload);

      alert("레시피가 성공적으로 수정되었습니다!");
      navigate(`/recipe/${id}`);
    } catch (err) {
      alert("수정 실패: " + (err.response?.data?.message || "서버 오류"));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !title) return <div className="loading_container">로딩 중...</div>;

  return (
    <div className="recipe_reg_container">
      <main className="recipe_main_content">
        <h2 className="reg_title">레시피 수정하기</h2>
        
        <form className="recipe_input_section" onSubmit={handleUpdate}>
          {/* 기본 정보 */}
          <section className="form_group">
            <Input label="레시피 제목" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예) 매콤 김치찌개" />
            <Input label="레시피 설명" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="간단한 소개를 적어주세요." />
            <Input label="대표 이미지 URL" value={thumbnailImageUrl} onChange={(e) => setThumbnailImageUrl(e.target.value)} placeholder="https://..." />
          </section>

          {/* 재료 섹션 */}
          <section className="form_group">
            <div className="section_header">
              <h3>🥕 재료 수정</h3>
              <Button type="button" onClick={addIngredient} className="add_btn"><Plus size={16} /> 추가</Button>
            </div>
            {ingredients.map((ing, index) => (
              <div key={`ing-${index}`} className="input_row">
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
                <input 
                  className="amount_input"
                  placeholder="양 (예: 2큰술)" 
                  value={ing.amount} 
                  onChange={(e) => handleIngredientChange(index, "amount", e.target.value)} 
                />
                <button type="button" className="remove_btn" onClick={() => removeIngredient(index)}><Trash2 size={18} /></button>
              </div>
            ))}
          </section>

          {/* 요리 순서 섹션 */}
          <section className="form_group">
            <div className="section_header">
              <h3>👩‍🍳 요리 순서 수정</h3>
              <Button type="button" onClick={addStep} className="add_btn"><Plus size={16} /> 단계 추가</Button>
            </div>
            {steps.map((step, index) => (
              <div key={`step-${index}`} className="step_edit_box">
                <div className="step_label">
                  <span>Step {index + 1}</span>
                  <button type="button" className="remove_btn_small" onClick={() => removeStep(index)}>삭제</button>
                </div>
                <textarea 
                  className="step_textarea"
                  placeholder="조리 과정을 상세히 적어주세요."
                  value={step.description}
                  onChange={(e) => handleStepChange(index, "description", e.target.value)}
                />
                <Input 
                  placeholder="단계별 이미지 URL (선택)" 
                  value={step.cookingImageUrl} 
                  onChange={(e) => handleStepChange(index, "cookingImageUrl", e.target.value)} 
                />
              </div>
            ))}
          </section>
          
          <div className="reg_button_group">
            <Button type="submit" variant="primary" disabled={loading} style={{ width: "100%", height: "50px", fontSize: "16px" }}>
              {loading ? "수정 사항 저장 중..." : "수정 완료"}
            </Button>
            <Button type="button" onClick={() => navigate(-1)} style={{ width: "100%", marginTop: "10px", background: "#eee", color: "#666" }}>
              취소하고 돌아가기
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default RecipeEditPage;