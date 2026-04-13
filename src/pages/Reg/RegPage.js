import React, { useState, useEffect } from "react";
import "./RegPage.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import customInstance from "../../api/api"; 

function RegPage() {
  const [name, setName] = useState("");              
  const [shelfLifeDays, setShelfLifeDays] = useState("");   
  const [ingredients, setIngredients] = useState([]); 
  const [loading, setLoading] = useState(false);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const res = await customInstance({
        url: "/api/ingredients",
        method: "GET"
      });

      // 서버 응답 구조에 따른 배열 추출
      let actualData = [];
      if (res && Array.isArray(res.data)) {
        actualData = res.data;
      } else if (Array.isArray(res)) {
        actualData = res;
      } else if (res && res.data && Array.isArray(res.data.data)) {
        actualData = res.data.data;
      }

      setIngredients(actualData);
    } catch (err) {
      console.error("재료 목록 로드 실패:", err);
      setIngredients([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleRegister = async (e) => {
    if (e) e.preventDefault(); 
    if (!name || !shelfLifeDays) return alert("정보를 모두 입력해주세요.");

    setLoading(true);
    try {
      await customInstance({
        url: "/api/ingredients",
        method: "POST",
        data: {
          name: name,
          shelfLifeDays: Number(shelfLifeDays), 
        },
      });

      alert("재료가 등록되었습니다.");
      setName(""); 
      setShelfLifeDays("");
      fetchIngredients(); 

    } catch (err) {
      alert(err.response?.data?.message || "등록 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await customInstance({
        url: `/api/ingredients/${id}`,
        method: "DELETE"
      });
      fetchIngredients();
    } catch (err) {
      alert("삭제 실패");
    }
  };

  return (
    <div className="reg_container">
      <main className="reg_main_content">
        <div className="reg_header">
          <h2>식재료 마스터 관리</h2>
        </div>

        <form className="reg_input_section" onSubmit={handleRegister}>
          <Input placeholder="식재료명" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="input_group">
            <label className="input_label">소비기한 (남은 일수)</label>
            <Input type="number" placeholder="예: 7" value={shelfLifeDays} onChange={(e) => setShelfLifeDays(e.target.value)} />
          </div>
          <div className="button_group">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "처리 중..." : "+ 새 식재료 등록"}
            </Button>
          </div>
        </form>

        <div className="divider"></div>

        <div className="ingredient_list">
          <h3 className="list_title">등록된 재료 ({ingredients?.length || 0})</h3>
          {Array.isArray(ingredients) && ingredients.length > 0 ? (
            ingredients.map((item) => (
              <div key={item.id || item.ingredientId} className="ingredient_card">
                <div className="card_content">
                  <span className="item_name">{item.name}</span>
                  <p className="item_desc">유효 기간: {item.shelfLifeDays}일</p>
                  <div className="card_buttons">
                    <button onClick={() => handleDelete(item.id || item.ingredientId)} className="del_text">삭제</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            !loading && <p>등록된 재료가 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default RegPage;