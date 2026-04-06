import React, { useState, useEffect } from "react";
// import api from "../../api/api"; // 백엔드 연결 시 주석 해제
import "./RegPage.css";

import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";

function RegPage() {
  /* ===============================
     1. 상태 관리 (더미 데이터 포함)
  =============================== */
  const [name, setName] = useState("");              
  const [description, setDescription] = useState(""); 
  const [imageUrl, setImageUrl] = useState("");       
  
  const [ingredients, setIngredients] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);         

  /* ===============================
     2. 데이터 불러오기 (시연용 로컬 데이터)
  =============================== */
  const fetchIngredients = async () => {
    setLoading(true);
    // 0.5초 로딩 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500));

    const savedData = localStorage.getItem("mock_ingredients");
    if (savedData) {
      setIngredients(JSON.parse(savedData));
    } else {
      // 초기 시연용 더미 데이터
      const initialData = [
        { id: Date.now(), name: "방울토마토", description: "스테비아 공법으로 달콤한 토마토", image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200", created_at: new Date().toISOString() },
        { id: Date.now() + 1, name: "스팸", description: "냉장고 필수템 짭조름한 통조림 햄", image_url: "https://images.unsplash.com/photo-1629450646251-50e322301c27?w=200", created_at: new Date().toISOString() }
      ];
      setIngredients(initialData);
      localStorage.setItem("mock_ingredients", JSON.stringify(initialData));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  /* ===============================
     3. 재료 등록 및 수정 (시연용)
  =============================== */
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!name) return alert("식재료명을 입력하세요.");

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // 0.8초 저장 시뮬레이션

    let updatedList;
    if (editId) {
      // 수정 로직
      updatedList = ingredients.map(item => 
        item.id === editId 
          ? { ...item, name, description, image_url: imageUrl } 
          : item
      );
      alert("정보가 수정되었습니다.");
    } else {
      // 등록 로직
      const newIngredient = {
        id: Date.now(),
        name,
        description,
        image_url: imageUrl || "https://placehold.jp/150x150.png?text=No+Image",
        created_at: new Date().toISOString()
      };
      updatedList = [newIngredient, ...ingredients];
      alert("새로운 식재료가 등록되었습니다.");
    }

    setIngredients(updatedList);
    localStorage.setItem("mock_ingredients", JSON.stringify(updatedList));

    // 초기화
    setName("");
    setDescription("");
    setImageUrl("");
    setEditId(null);
    setLoading(false);
  };

  /* ===============================
     4. 삭제 (시연용)
  =============================== */
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedList = ingredients.filter(item => item.id !== id);
    setIngredients(updatedList);
    localStorage.setItem("mock_ingredients", JSON.stringify(updatedList));
    setLoading(false);
  };

  /* ===============================
     5. 수정 모드 진입
  =============================== */
  const handleEdit = (item) => {
    setName(item.name);
    setDescription(item.description || "");
    setImageUrl(item.image_url || "");
    setEditId(item.id);
    
    // 모바일 프레임 내부 스크롤 상단 이동
    const mainElement = document.querySelector('main');
    if (mainElement) mainElement.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="reg_container">
      <div className="reg_box">
        <div className="reg_header">
          <h2>식재료 마스터 관리</h2>
          <p>냉장고 속 재료를 등록해보세요.</p>
        </div>

        {/* 등록/수정 폼 */}
        <form className="reg_input_section" onSubmit={handleRegister}>
          <div className="input_group">
            <Input
              placeholder="식재료명 (예: 계란)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input_group">
            <Input
              placeholder="설명 (예: 무항생제 1등급)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="input_group">
            <Input
              placeholder="이미지 URL (선택)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          
          <div className="button_group">
            <Button type="submit" disabled={loading} variant="primary">
              {loading ? "처리 중..." : editId ? "수정 완료" : "+ 새 식재료 등록"}
            </Button>
            {editId && (
              <button 
                type="button" 
                className="cancel_btn" 
                onClick={() => { setEditId(null); setName(""); setDescription(""); setImageUrl(""); }}
              >
                취소
              </button>
            )}
          </div>
        </form>

        <div className="divider"></div>

        {/* 결과 리스트 영역 */}
        <div className="ingredient_list">
          <h3 className="list_title">현재 등록된 재료 ({ingredients.length})</h3>
          {loading && ingredients.length === 0 ? (
            <p className="empty_text">불러오는 중...</p>
          ) : ingredients.length > 0 ? (
            ingredients.map((item) => (
              <div key={item.id} className="ingredient_card">
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="card_img" 
                  onError={(e) => { e.target.src = "https://placehold.jp/150x150.png?text=No+Image"; }}
                />
                <div className="card_content">
                  <div className="card_text">
                    <span className="item_name">{item.name}</span>
                    <p className="item_desc">{item.description}</p>
                  </div>
                  <div className="card_buttons">
                    <button className="edit_link" onClick={() => handleEdit(item)}>수정</button>
                    <button className="delete_link" onClick={() => handleDelete(item.id)}>삭제</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no_data">
              <p className="empty_text">등록된 식재료가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegPage;