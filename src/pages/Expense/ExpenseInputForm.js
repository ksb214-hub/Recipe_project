import React, { useState } from "react";
import "./ExpenseInputForm.css";
import { X, Plus, Utensils, Calendar } from "lucide-react";

/**
 * @component ExpenseInputForm
 * @description 새로운 식비 지출 내역을 입력받는 폼 (Bottom Sheet 스타일)
 */
function ExpenseInputForm({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "기타",
    date: "2026.04.08", // 오늘 날짜 기본값
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return alert("항목과 금액을 입력해주세요!");
    
    // 부모 컴포넌트(ExpensePage)로 데이터 전달
    onAdd({
      ...formData,
      id: Date.now(),
      price: parseInt(formData.price),
    });
    onClose();
  };

  return (
    <div className="form_overlay" onClick={onClose}>
      <div className="form_sheet" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 영역 */}
        <div className="form_header">
          <h3>지출 기록하기</h3>
          <button className="close_btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="input_form_body">
          {/* 1. 항목명 입력 */}
          <div className="input_group">
            <label><Utensils size={14} /> 어떤 걸 사셨나요?</label>
            <input 
              type="text" 
              name="name"
              placeholder="예: 닭가슴살, 대파 1단 등" 
              value={formData.name}
              onChange={handleChange}
              autoFocus
            />
          </div>

          {/* 2. 금액 및 카테고리 (가로 배치) */}
          <div className="input_row">
            <div className="input_group flex_2">
              <label>금액 (원)</label>
              <input 
                type="number" 
                name="price"
                placeholder="0"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div className="input_group flex_1">
              <label>분류</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="육류">육류</option>
                <option value="채소">채소</option>
                <option value="가공식품">가공식품</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>

          {/* 3. 날짜 입력 */}
          <div className="input_group">
            <label><Calendar size={14} /> 구매 날짜</label>
            <input 
              type="text" 
              name="date"
              value={formData.date}
              onChange={handleChange}
              placeholder="YYYY.MM.DD"
            />
          </div>

          {/* 등록 버튼 */}
          <button type="submit" className="submit_btn">
            <Plus size={18} /> 기록 완료
          </button>
        </form>
      </div>
    </div>
  );
}

export default ExpenseInputForm;