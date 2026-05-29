import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import customInstance from "../../api/api";
import "./MyIngredientEditPage.css"; // 스타일 파일 (기존 추가 폼 디자인과 톤앤매너 매칭)

export default function MyIngredientEditPage() {
  const { id } = useParams(); // URL 파라미터에서 보유 식재료의 ID 추출
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ingredientName, setIngredientName] = useState(""); // 읽기 전용으로 보여줄 재료명

  const [formData, setFormData] = useState({
    quantity: "",
    unit: "개",
    expirationDate: ""
  });

  /* ---------------------------------------------------------
     1. 기존 데이터 조회 (GET: /api/my/ingredients/{id})
     --------------------------------------------------------- */
  useEffect(() => {
    const fetchOriginalData = async () => {
      try {
        setLoading(true);
        const res = await customInstance.get(`/api/my/ingredients/${id}`);
        const data = res.data?.data || res.data;

        if (data) {
          setIngredientName(data.name || "식재료");
          setFormData({
            quantity: data.quantity !== undefined ? data.quantity.toString() : "",
            unit: data.unit || "개",
            // 날짜 포맷이 "YYYY-MM-DDTHH:mm:ss"일 경우 "YYYY-MM-DD" 형태로 파싱
            expirationDate: data.expirationDate ? data.expirationDate.split("T")[0] : ""
          });
        }
      } catch (err) {
        console.error("❌ 기존 재료 정보 로드 실패:", err);
        alert("정보를 불러오지 못했습니다.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOriginalData();
  }, [id, navigate]);

  /* ---------------------------------------------------------
     2. 수정 요청 제출 처리 (PATCH: /api/my/ingredients/{id})
     --------------------------------------------------------- */
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!formData.quantity || isNaN(formData.quantity)) return alert("올바른 수량을 입력해주세요.");
    if (!formData.expirationDate) return alert("유통기한을 선택해주세요.");

    const parsedQuantity = parseFloat(formData.quantity);
    if (isNaN(parsedQuantity)) return alert("수량 데이터 타입 변환 중 오류가 발생했습니다.");

    // 백엔드 LocalDateTime 포맷 맞춤 대응 보정
    const formattedDate = formData.expirationDate.includes("T") 
      ? formData.expirationDate 
      : `${formData.expirationDate}T00:00:00`;

    // 📦 curl 명세와 동일하게 매핑한 페이로드 오브젝트
    const payload = {
      hasQuantity: true,
      hasUnit: true,
      hasExpirationDate: true,
      quantity: parsedQuantity,
      unit: formData.unit,
      expirationDate: formattedDate // 백엔드 스펙에 맞춰 날짜 문자열 주입
    };

    try {
      setSubmitting(true);
      console.log(`📤 [PATCH] /api/my/ingredients/${id} 전송 페이로드:`, payload);
      
      await customInstance.patch(`/api/my/ingredients/${id}`, payload);
      
      alert("식재료 정보가 성공적으로 수정되었습니다.");
      navigate(`/my-ingredients/${id}`); // 수정 완료 후 다시 상세페이지로 리다이렉트
    } catch (err) {
      console.error("❌ 식재료 수정 요청 실패:", err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || "서버 통신 오류";
      alert(`수정 실패: ${serverMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="ing_loading_box">
        <Loader2 className="spinner" />
        <p>기존 재료 정보를 가져오는 중...</p>
      </div>
    );
  }

  return (
    <div className="mobile_container white_bg">
      <header className="ing_header">
        <button onClick={() => navigate(-1)} className="back_btn">
          <ChevronLeft size={24} />
        </button>
        <h1>재료 수정</h1>
        <div style={{ width: 24 }} />
      </header>

      <main className="ing_content">
        <form className="reg_section" onSubmit={handleUpdateSubmit}>
          {/* 재료 이름 (수정 불가, 안내용) */}
          <div className="input_group">
            <label>재료 명칭</label>
            <input type="text" value={ingredientName} disabled className="disabled_read_input" />
          </div>

          {/* 수량 및 단위 입력 로우 */}
          <div className="input_row">
            <div className="input_group flex_2">
              <label htmlFor="edit-quantity-input">수량</label>
              <input 
                id="edit-quantity-input"
                type="number" 
                step="0.1" 
                value={formData.quantity} 
                onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                required 
              />
            </div>
            <div className="input_group flex_1">
              <label htmlFor="edit-unit-select">단위</label>
              <select 
                id="edit-unit-select"
                value={formData.unit} 
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
              >
                <option value="개">개</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
              </select>
            </div>
          </div>

          {/* 유통기한 입력 그룹 */}
          <div className="input_group">
            <label htmlFor="edit-expiration-date">유통기한</label>
            <input 
              id="edit-expiration-date"
              type="date" 
              value={formData.expirationDate} 
              onChange={(e) => setFormData({...formData, expirationDate: e.target.value})} 
              required 
            />
          </div>

          <button type="submit" className="save_btn" disabled={submitting}>
            {submitting ? <Loader2 className="spinner" size={18} /> : <Save size={18} />}
            {submitting ? " 수정사항 반영 중..." : " 변경사항 저장"}
          </button>
        </form>
      </main>
    </div>
  );
}