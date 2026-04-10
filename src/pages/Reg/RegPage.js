import React, { useState, useEffect } from "react";
import "./RegPage.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";

function RegPage() {
  /* ===============================
     1. 상태 관리 (State)
  =============================== */
  const [name, setName] = useState("");              
  const [description, setDescription] = useState(""); 
  const [imageUrl, setImageUrl] = useState("");       
  // [추가] 소비기한 상태 (기본값은 빈 문자열)
  const [expiryDate, setExpiryDate] = useState("");   
  
  const [ingredients, setIngredients] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null); 

  /* ===============================
     2. 데이터 불러오기
  =============================== */
  const fetchIngredients = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const savedData = localStorage.getItem("mock_ingredients");
    if (savedData) {
      setIngredients(JSON.parse(savedData));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  /* ===============================
     3. 등록 및 수정 처리
  =============================== */
  const handleRegister = async (e) => {
    if (e) e.preventDefault(); 
    if (!name) return alert("식재료명을 입력하세요.");

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    let updatedList;
    if (editId) {
      // (U) 수정: expiryDate 포함하여 업데이트
      updatedList = ingredients.map(item => 
        item.id === editId 
          ? { ...item, name, description, image_url: imageUrl, expiry_date: expiryDate } 
          : item
      );
    } else {
      // (C) 등록: expiry_date 필드 추가
      const newIngredient = {
        id: Date.now(),
        name,
        description,
        image_url: imageUrl || "https://placehold.jp/150x150.png?text=No+Image",
        expiry_date: expiryDate, // 선택 사항으로 저장
        created_at: new Date().toISOString()
      };
      updatedList = [newIngredient, ...ingredients];
    }

    setIngredients(updatedList);
    localStorage.setItem("mock_ingredients", JSON.stringify(updatedList));

    // 입력창 초기화
    setName(""); setDescription(""); setImageUrl(""); setExpiryDate(""); setEditId(null);
    setLoading(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const updatedList = ingredients.filter(item => item.id !== id);
    setIngredients(updatedList);
    localStorage.setItem("mock_ingredients", JSON.stringify(updatedList));
  };

  const handleEdit = (item) => {
    setName(item.name);
    setDescription(item.description || "");
    setImageUrl(item.image_url || "");
    setExpiryDate(item.expiry_date || ""); // 수정 모드 시 날짜 불러오기
    setEditId(item.id);
  };

  return (
    <div className="reg_container">
      <main className="reg_main_content">
        <div className="reg_header">
          <h2>식재료 마스터 관리</h2>
          <p>소비기한을 입력하면 알림을 보내드려요.</p>
        </div>

        <form className="reg_input_section" onSubmit={handleRegister}>
          <Input placeholder="식재료명" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="설명" value={description} onChange={(e) => setDescription(e.target.value)} />
          
          {/* [추가] 소비기한 입력 필드 (HTML5 date 타입 사용) */}
          <div className="input_group">
            <label className="input_label">소비기한 (선택)</label>
            <Input 
              type="date" 
              value={expiryDate} 
              onChange={(e) => setExpiryDate(e.target.value)} 
            />
          </div>

          <Input placeholder="이미지 URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          
          <div className="button_group">
            <Button type="submit" variant="primary">
              {loading ? "처리 중..." : editId ? "수정 완료" : "+ 새 식재료 등록"}
            </Button>
            {editId && (
              <button type="button" className="cancel_btn" onClick={() => { setEditId(null); setName(""); setDescription(""); setImageUrl(""); setExpiryDate(""); }}>
                취소
              </button>
            )}
          </div>
        </form>

        <div className="divider"></div>

        <div className="ingredient_list">
          <h3 className="list_title">등록된 재료 ({ingredients.length})</h3>
          {ingredients.map((item) => (
            <div key={item.id} className="ingredient_card">
              <img src={item.image_url} alt={item.name} className="card_img" onError={(e) => e.target.src="https://placehold.jp/150x150.png?text=No+Image"} />
              <div className="card_content">
                <span className="item_name">{item.name}</span>
                <p className="item_desc">{item.description}</p>
                {/* [추가] 리스트에 소비기한 표시 */}
                {item.expiry_date && (
                  <span className="item_expiry">소비기한: {item.expiry_date}</span>
                )}
                <div className="card_buttons">
                  <button onClick={() => handleEdit(item)}>수정</button>
                  <button onClick={() => handleDelete(item.id)} className="del_text">삭제</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default RegPage;