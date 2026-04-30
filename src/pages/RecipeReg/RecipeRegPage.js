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
  const [bookmarkedIds, setBookmarkedIds] = useState([]); // 정제된 숫자형 ID 배열 저장
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     2. 서버 데이터 로드 (Fetch) - 북마크 파싱 강화
     --------------------------------------------------------- */
  const fetchData = useCallback(async () => {
    try {
      // 1. 레시피 로드
      const recipeRes = await customInstance({ url: "/api/recipes", method: "GET" });
      const recipeList = recipeRes.data?.data?.content || recipeRes.data?.content || [];
      setRecipes(recipeList);

      // 2. 재료 로드
      const ingRes = await customInstance({ url: "/api/ingredients", method: "GET" });
      const rawIngData = ingRes.data;
      const finalIngList = rawIngData.content || rawIngData.data?.content || rawIngData.data || [];
      setAvailableIngredients(finalIngList);

      // 3. 북마크 로드 및 정제
      const bookmarkRes = await customInstance({ url: "/api/recipe/bookmarks", method: "GET" });
      
      console.log("🔍 서버 북마크 원본 응답:", bookmarkRes.data);

      let rawBookmarks = [];
      // 응답 형태에 따른 분기 처리
      if (Array.isArray(bookmarkRes.data)) {
        rawBookmarks = bookmarkRes.data;
      } else if (bookmarkRes.data?.data) {
        rawBookmarks = bookmarkRes.data.data;
      } else if (bookmarkRes.data?.content) {
        rawBookmarks = bookmarkRes.data.content;
      }

      // [핵심] 객체 배열이면 ID만 뽑고, 모든 ID를 '숫자' 타입으로 통일
      const cleanedIds = rawBookmarks.map(item => {
        if (typeof item === 'object' && item !== null) return Number(item.id || item.recipeId);
        return Number(item);
      }).filter(id => !isNaN(id));

      console.log("✅ 정제된 북마크 ID 목록:", cleanedIds);
      setBookmarkedIds(cleanedIds);

    } catch (err) {
      console.error("❌ 데이터 로드 실패:", err);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  /* ---------------------------------------------------------
     3. 핸들러 (북마크, 등록 등)
     --------------------------------------------------------- */
  
  const toggleBookmark = async (e, recipeId) => {
    e.stopPropagation();
    if (!recipeId) return;

    const targetId = Number(recipeId); // 타입 통일
    const isCurrentlyBookmarked = bookmarkedIds.includes(targetId);
    
    try {
      const method = isCurrentlyBookmarked ? "DELETE" : "POST";
      await customInstance({
        url: `/api/recipes/${targetId}/bookmark`,
        method: method
      });

      setBookmarkedIds(prev => 
        isCurrentlyBookmarked 
          ? prev.filter(id => id !== targetId) 
          : [...prev, targetId]
      );

      console.log(`✅ ${targetId}번 북마크 ${isCurrentlyBookmarked ? '해제' : '등록'} 완료`);

    } catch (err) {
      if (err.response?.status === 409) {
        console.warn("⚠️ 서버와 상태 불일치(409). 새로고침 실행.");
        fetchData(); 
      } else {
        console.error("❌ 북마크 통신 에러:", err);
      }
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
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  /* ---------------------------------------------------------
     4. 레시피 등록 실행
     --------------------------------------------------------- */
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    
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
        steps: steps
          .filter(s => s.description.trim() !== "")
          .map((s, i) => ({ ...s, stepNo: i + 1 }))
      };

      await customInstance({ url: "/api/recipes", method: "POST", data: recipeData });
      alert("🎉 레시피가 등록되었습니다!");
      
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
            <Input label="레시피 제목" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="간략한 설명" value={description} onChange={(e) => setDescription(e.target.value)} />
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
                <Input placeholder="양 (예: 200g, 1/2개)" value={ing.amount} onChange={(e) => handleIngredientChange(index, "amount", e.target.value)} />
              </div>
            ))}
            <button type="button" className="add_btn" onClick={addIngredient}>+ 재료 추가</button>
          </section>

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
                <div 
                  key={r.id || idx} 
                  className="recipe_card" 
                  onClick={() => navigate(`/recipe/${r.id}`)}
                  style={{ cursor: "pointer", position: "relative" }} 
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong>{r.title}</strong>
                    <button 
                      onClick={(e) => toggleBookmark(e, r.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}
                    >
                      <Heart 
                        size={20} 
                        fill={bookmarkedIds.includes(Number(r.id)) ? "#ff4d4f" : "none"} 
                        stroke={bookmarkedIds.includes(Number(r.id)) ? "#ff4d4f" : "#ccc"} 
                      />
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