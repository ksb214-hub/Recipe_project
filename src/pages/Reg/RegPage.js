import React, { useState, useEffect, useCallback } from "react";
import "./RegPage.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import customInstance from "../../api/api";
import nutritionDb from "../../data/collection/nutrition_db.json"; // 영양 데이터베이스

function RegPage() {
  const [name, setName] = useState("");
  const [shelfLifeDays, setShelfLifeDays] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  // 현재 펼쳐진 재료의 ID를 저장 (드롭다운 제어용)
  const [openId, setOpenId] = useState(null);

  /* [데이터 조회] */
  const fetchIngredients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customInstance({ url: "/api/ingredients", method: "GET" });
      const finalData = res.data?.content || res.data?.data?.content || res.data || [];
      setIngredients(finalData);
    } catch (err) { console.error("데이터 로드 실패:", err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchIngredients(); }, [fetchIngredients]);

  /* [데이터 등록] */
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!name || !shelfLifeDays) return alert("입력값을 확인해주세요.");
    setLoading(true);
    try {
      await customInstance({ url: "/api/ingredients", method: "POST", data: { name, shelfLifeDays: Number(shelfLifeDays) } });
      alert("등록 완료");
      setName(""); setShelfLifeDays("");
      fetchIngredients();
    } catch (err) { alert("등록 실패"); }
    finally { setLoading(false); }
  };

  /* [데이터 삭제] */
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // 삭제 버튼 클릭 시 드롭다운이 열리는 것을 방지
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await customInstance({ url: `/api/ingredients/${id}`, method: "DELETE" });
      fetchIngredients();
    } catch (err) { alert("삭제 실패"); }
  };

  return (
    <div className="reg_container">
      <main className="reg_main_content">
        <h2>식재료 관리</h2>
        
        <form className="reg_input_section" onSubmit={handleRegister}>
          <Input placeholder="식재료명" value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="number" placeholder="소비기한(일)" value={shelfLifeDays} onChange={(e) => setShelfLifeDays(e.target.value)} />
          <Button type="submit" disabled={loading}>+ 등록</Button>
        </form>

        <div className="ingredient_list">
          <h3>보유 재료 ({ingredients.length})</h3>
          <div className="ingredient_grid">
            {ingredients.map((item) => {
              // JSON 데이터 매칭 (이름 포함 여부 확인)
              const nutrition = Object.values(nutritionDb).find(n => 
                item.name.includes(n.name) || n.name.includes(item.name)
              );

              return (
                <div key={item.id} className="ingredient_card">
                  {/* 상단: 재료 이름, 소비기한, 삭제 버튼 (항상 고정) */}
                  <div className="card_header" onClick={() => setOpenId(openId === item.id ? null : item.id)}>
                    <div className="info_area">
                      <span className="item_name">{item.name}</span>
                      <span className="item_days">{item.shelfLifeDays}일 남음</span>
                    </div>
                    <button onClick={(e) => handleDelete(e, item.id)} className="del_btn">삭제</button>
                  </div>

                  {/* 하단: 영양성분 전용 드롭다운 (독립적 영역) */}
                  {openId === item.id && nutrition && (
                    <div className="card_nutrition_dropdown">
                      <div className="nutrition_content">
                        <span>탄수화물: <b>{nutrition.carbs}</b></span>
                        <span>단백질: <b>{nutrition.protein}</b></span>
                        <span>지방: <b>{nutrition.fat}</b></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
export default RegPage;