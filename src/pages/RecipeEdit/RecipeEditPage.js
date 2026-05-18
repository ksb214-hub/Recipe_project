import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Trash2, Save, Loader2, Image } from "lucide-react";
import customInstance from "../../api/api";
import "./RecipeEditPage.css"; // 아래 제공되는 CSS와 매칭됩니다.

export default function RecipeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* --- 상태 관리 --- */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 레시피 기본 정보
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("기타");
  const [cookingTime, setCookingTime] = useState("");
  const [servings, setServings] = useState("");
  const [difficulty, setDifficulty] = useState("초급");
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState("");

  // 레시피 세부 기능 리스트 (🥕 재료 및 👩‍🍳 조리 순서)
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);

  /* ---------------------------------------------------------
     1. 기존 레시피 데이터 로드 (GET: /api/recipes/{id})
     --------------------------------------------------------- */
  useEffect(() => {
    const fetchOriginalRecipe = async () => {
      try {
        setLoading(true);
        const res = await customInstance.get(`/api/recipes/${id}`);
        if (res.data?.success) {
          const data = res.data.data;
          setTitle(data.title || "");
          setDescription(data.description || "");
          setCategory(data.category || "기타");
          setCookingTime(data.cookingTime || "");
          setServings(data.servings || "");
          setDifficulty(data.difficulty || "초급");
          setThumbnailImageUrl(data.thumbnailImageUrl || "");
          setIngredients(data.ingredients || []);
          setSteps(data.steps ? [...data.steps].sort((a, b) => a.stepNo - b.stepNo) : []);
        }
      } catch (err) {
        console.error("수정할 레시피 로드 실패:", err);
        alert("레시피 데이터를 불러오지 못했습니다.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchOriginalRecipe();
  }, [id, navigate]);

  /* ---------------------------------------------------------
     2. 🥕 필수 재료 동적 핸들러
     --------------------------------------------------------- */
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "" }]);
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  /* ---------------------------------------------------------
     3. 👩‍🍳 조리 순서 동적 핸들러
     --------------------------------------------------------- */
  const handleAddStep = () => {
    const nextStepNo = steps.length + 1;
    setSteps([...steps, { stepNo: nextStepNo, description: "", cookingImageUrl: "" }]);
  };

  const handleStepChange = (index, field, value) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  const handleRemoveStep = (index) => {
    const filtered = steps.filter((_, i) => i !== index);
    // 재정렬을 통해 stepNo 순차 순서 보장
    const reordered = filtered.map((step, idx) => ({
      ...step,
      stepNo: idx + 1,
    }));
    setSteps(reordered);
  };

  /* ---------------------------------------------------------
     4. 수정 완료 및 서버 전송 (PUT: /api/recipes/{id})
     --------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("레시피 제목을 입력해주세요.");
    if (ingredients.length === 0) return alert("최소 한 개 이상의 재료를 추가해주세요.");

    try {
      setSaving(true);
      const payload = {
        title,
        description,
        category,
        cookingTime,
        servings,
        difficulty,
        thumbnailImageUrl,
        ingredients,
        steps,
      };

      const res = await customInstance.put(`/api/recipes/${id}`, payload);
      if (res.data?.success) {
        alert("레시피가 정상적으로 수정되었습니다.");
        navigate(`/recipe/${id}`); // 수정 완료 후 상세페이지로 이동
      }
    } catch (err) {
      console.error("레시피 수정 실패:", err);
      alert("수정 요청 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit_loading">
        <Loader2 className="spinner" size={40} />
        <p>수정할 내용을 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="recipe_edit_page">
      {/* 상단바 */}
      <div className="edit_top_nav">
        <button onClick={() => navigate(-1)} className="nav_icon_btn">
          <ChevronLeft size={24} />
        </button>
        <h2>레시피 수정</h2>
        <button onClick={handleSubmit} className="save_text_btn" disabled={saving}>
          {saving ? <Loader2 className="spinner" size={18} /> : <Save size={20} />}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="edit_form_container">
        {/* 대표 이미지 미리보기 및 URL 입력 */}
        <div className="edit_section image_upload_section">
          <label className="section_label">대표 이미지 URL</label>
          <div className="url_input_box">
            <Image size={18} className="input_icon" />
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={thumbnailImageUrl}
              onChange={(e) => setThumbnailImageUrl(e.target.value)}
            />
          </div>
          {thumbnailImageUrl && (
            <div className="edit_thumbnail_preview">
              <img src={thumbnailImageUrl} alt="미리보기" referrerPolicy="no-referrer" />
            </div>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="edit_section">
          <label className="section_label">레시피 제목</label>
          <input
            type="text"
            className="base_input"
            placeholder="예) 촉촉한 계란 토스트"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="edit_section">
          <label className="section_label">요리 요약 설명</label>
          <textarea
            className="base_textarea"
            placeholder="레시피에 대한 간단한 설명을 입력하세요."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* 메타 정보 메인 그리드 */}
        <div className="meta_grid_inputs">
          <div className="grid_item">
            <label>카테고리</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="한식">한식</option>
              <option value="양식">양식</option>
              <option value="일식">일식</option>
              <option value="중식">중식</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <div className="grid_item">
            <label>난이도</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="초급">초급</option>
              <option value="중급">중급</option>
              <option value="고급">고급</option>
            </select>
          </div>
        </div>

        <div className="meta_grid_inputs">
          <div className="grid_item">
            <label>조리 시간</label>
            <input
              type="text"
              placeholder="예) 15분"
              value={cookingTime}
              onChange={(e) => setCookingTime(e.target.value)}
            />
          </div>
          <div className="grid_item">
            <label>인분 수 기준</label>
            <input
              type="text"
              placeholder="예) 2인분"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
          </div>
        </div>

        {/* 🥕 필수 재료 편집 기능 영역 */}
        <div className="edit_section">
          <div className="section_title_flex">
            <h3 className="sub_title_badge">🥕 필수 재료</h3>
            <button type="button" onClick={handleAddIngredient} className="add_list_btn">
              <Plus size={16} /> 추가
            </button>
          </div>

          <div className="dynamic_list_container">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="dynamic_item_row ingredient_row">
                <input
                  type="text"
                  placeholder="재료명 (계란)"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(idx, "name", e.target.value)}
                  className="flex_input_two"
                />
                <input
                  type="text"
                  placeholder="계량 (2개)"
                  value={ing.amount}
                  onChange={(e) => handleIngredientChange(idx, "amount", e.target.value)}
                  className="flex_input_one"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(idx)}
                  className="row_del_btn"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {ingredients.length === 0 && (
              <p className="empty_warn_text">등록된 재료가 없습니다. 추가를 눌러주세요.</p>
            )}
          </div>
        </div>

        {/* 👩‍🍳 조리 순서 편집 기능 영역 */}
        <div className="edit_section">
          <div className="section_title_flex">
            <h3 className="sub_title_badge">👩‍🍳 조리 순서</h3>
            <button type="button" onClick={handleAddStep} className="add_list_btn">
              <Plus size={16} /> 추가
            </button>
          </div>

          <div className="dynamic_list_container">
            {steps.map((step, idx) => (
              <div key={idx} className="step_edit_card">
                <div className="step_card_header">
                  <span className="step_number_label">Step {step.stepNo}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="row_del_btn"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <textarea
                  placeholder="조리 과정을 상세히 적어주세요."
                  value={step.description}
                  onChange={(e) => handleStepChange(idx, "description", e.target.value)}
                  className="step_textarea"
                />
                <div className="url_input_box step_img_url_box">
                  <Image size={14} className="input_icon" />
                  <input
                    type="text"
                    placeholder="과정 이미지 URL (선택)"
                    value={step.cookingImageUrl || ""}
                    onChange={(e) => handleStepChange(idx, "cookingImageUrl", e.target.value)}
                  />
                </div>
                {step.cookingImageUrl && (
                  <div className="step_preview_img">
                    <img src={step.cookingImageUrl} alt="과정 미리보기" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            ))}
            {steps.length === 0 && (
              <p className="empty_warn_text">등록된 조리 순서가 없습니다. 추가를 눌러주세요.</p>
            )}
          </div>
        </div>

        {/* 하단 전체 저장 대형 버튼 */}
        <button type="submit" className="huge_save_submit_btn" disabled={saving}>
          {saving ? "레시피 수정 사항 저장 중..." : "수정 완료하기"}
        </button>
      </form>
    </div>
  );
}