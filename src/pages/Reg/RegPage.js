import React, { useState, useEffect } from "react";
import api from "../../api/api";
import "./RegPage.css";

import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";

function RegPage() {
  /* ===============================
     1. 상태 관리 (DB 명세 반영)
  =============================== */
  const [name, setName] = useState("");              
  const [description, setDescription] = useState(""); 
  const [imageUrl, setImageUrl] = useState("");       
  
  const [ingredients, setIngredients] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);         

  /* ===============================
     2. 데이터 불러오기 (Read)
     인증 헤더(Bearer Token)는 api.js 인터셉터에서 자동 주입됩니다.
  =============================== */
  const fetchIngredients = async () => {
    try {
      setLoading(true);
      // 서버에서 전체 식재료 목록 조회
      const response = await api.get("/ingredients");
      
      console.log("목록 응답 확인:", response.data);

      /** * 서버 응답 데이터 구조 최적화
       * 1. response.data가 배열인 경우
       * 2. response.data.data가 배열인 경우 (표준 JSON API)
       */
      const rawData = response.data;
      const finalData = Array.isArray(rawData) 
        ? rawData 
        : (rawData && Array.isArray(rawData.data) ? rawData.data : []);

      setIngredients(finalData);
    } catch (err) {
      console.error("데이터 로딩 실패:", err);
      // 401 에러(토큰 만료)는 api.js 인터셉터가 처리하지만, 여기서도 상태를 비워줍니다.
      setIngredients([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  /* ===============================
     3. 재료 등록 및 수정 (Create / Update)
  =============================== */
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!name) return alert("식재료명을 입력하세요.");

    // DB 컬럼 명세 준수
    const payload = {
      name: name,
      description: description,
      image_url: imageUrl,
      normalized_name: name // 필요 시 서버에서 처리하도록 전달
    };

    try {
      setLoading(true);
      if (editId) {
        // 수정 요청
        await api.put(`/ingredients/${editId}`, payload);
        alert("수정되었습니다.");
      } else {
        // 신규 등록 요청
        await api.post("/ingredients", payload);
        alert("등록되었습니다.");
      }

      // 입력 필드 초기화
      setName("");
      setDescription("");
      setImageUrl("");
      setEditId(null);
      
      // 즉시 목록 새로고침 (이 부분이 없으면 등록 후 리스트가 안 보입니다)
      await fetchIngredients();
    } catch (err) {
      console.error("저장 오류:", err);
      const errorMsg = err.response?.data?.message || "이미 등록된 이름이거나 서버 오류가 발생했습니다.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     4. 삭제 (Delete)
  =============================== */
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/ingredients/${id}`);
      await fetchIngredients(); // 삭제 후 동기화
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  /* ===============================
     5. 수정 모드 진입
  =============================== */
  const handleEdit = (item) => {
    setName(item.name);
    setDescription(item.description || "");
    setImageUrl(item.image_url || "");
    setEditId(item.id);
    // 입력창으로 스크롤 이동
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="reg_container">
      <div className="reg_box">
        <div className="reg_header">
          <h2>식재료 마스터 관리</h2>
          <p>식재료 정보를 등록하고 최신 상태로 유지하세요.</p>
        </div>

        {/* 등록/수정 폼 */}
        <form className="reg_input_section" onSubmit={handleRegister}>
          <Input
            label="식재료명"
            placeholder="예: 방울토마토"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="식재료 설명"
            placeholder="예: 유기농 농장에서 직송된 토마토"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="이미지 URL"
            placeholder="http://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "처리 중..." : editId ? "정보 수정 완료" : "+ 새 식재료 등록"}
          </Button>
          {editId && (
            <button 
              type="button" 
              className="cancel_btn" 
              onClick={() => { setEditId(null); setName(""); setDescription(""); setImageUrl(""); }}
            >
              수정 취소
            </button>
          )}
        </form>

        <div className="divider"></div>

        {/* 결과 리스트 영역 */}
        <div className="ingredient_list">
          {loading && ingredients.length === 0 ? (
            <p className="empty_text">데이터를 불러오는 중입니다...</p>
          ) : ingredients.length > 0 ? (
            ingredients.map((item) => (
              <div key={item.id} className="ingredient_card">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="card_img" 
                    onError={(e) => { e.target.src = "https://placehold.jp/150x150.png?text=No+Image"; }}
                  />
                ) : (
                  <div className="card_img_placeholder">이미지 없음</div>
                )}
                <div className="card_content">
                  <h3>{item.name}</h3>
                  <p className="item_desc">{item.description || "설명이 등록되지 않았습니다."}</p>
                  <span className="item_date">
                    등록일: {item.created_at ? new Date(item.created_at).toLocaleDateString() : "일자 미상"}
                  </span>
                </div>
                <div className="card_buttons">
                  <button className="edit_btn" onClick={() => handleEdit(item)}>수정</button>
                  <button className="delete_btn" onClick={() => handleDelete(item.id)}>삭제</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no_data">
              <p className="empty_text">등록된 식재료가 없습니다.</p>
              <p className="sub_text">상단 폼에서 첫 번째 재료를 등록해보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegPage;