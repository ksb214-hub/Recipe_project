import React, { useState, useEffect, useCallback } from "react";
import "./RegPage.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import customInstance from "../../api/api";
// 영양 성분 데이터베이스 JSON 파일 import
import nutritionDb from "../../data/collection/nutrition_db.json";

function RegPage() {
  const [name, setName] = useState("");
  const [shelfLifeDays, setShelfLifeDays] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  // 드롭다운(아코디언) 상태 관리: 클릭한 재료의 ID를 저장
  const [openId, setOpenId] = useState(null);

  /* [데이터 조회] 서버에서 등록된 식재료 목록을 가져옴 */
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

  /* [데이터 등록] 새 식재료 추가 */
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!name || !shelfLifeDays) return alert("입력값을 확인해주세요.");
    setLoading(true);
    try {
      await customInstance({ url: "/api/ingredients", method: "POST", data: { name, shelfLifeDays: Number(shelfLifeDays) } });
      alert("등록 완료");
      setName(""); setShelfLifeDays("");
      fetchIngredients(); // 리스트 새로고침
    } catch (err) { alert("등록 실패"); }
    finally { setLoading(false); }
  };

  /* [데이터 삭제] */
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // 삭제 버튼 클릭 시 드롭다운이 열리는 이벤트 방지
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
        
        {/* 새 재료 입력 폼 */}
        <form className="reg_input_section" onSubmit={handleRegister}>
          <Input placeholder="식재료명" value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="number" placeholder="소비기한(일)" value={shelfLifeDays} onChange={(e) => setShelfLifeDays(e.target.value)} />
          <Button type="submit" disabled={loading}>+ 등록</Button>
        </form>

        <div className="ingredient_list">
          <h3>보유 재료 ({ingredients.length})</h3>
          <div className="ingredient_grid">
            {ingredients.map((item) => {
              // 등록된 식재료명과 nutritionDb 데이터를 매칭
              const nutrition = Object.values(nutritionDb).find(n => 
                item.name.includes(n.name) || n.name.includes(item.name)
              );

              return (
                <div key={item.id} className="ingredient_card">
                  {/* 상단: 재료 이름, 소비기한, 삭제 버튼 (클릭 시 드롭다운 토글) */}
                  <div className="card_header" onClick={() => setOpenId(openId === item.id ? null : item.id)}>
                    <div className="info_area">
                      <span className="item_name">{item.name}</span>
                      <span className="item_days">{item.shelfLifeDays}일 남음</span>
                    </div>
                    <button onClick={(e) => handleDelete(e, item.id)} className="del_btn">삭제</button>
                  </div>

                  {/* 하단: 영양성분 독립 드롭다운 (칼로리 및 서빙 사이즈 포함) */}
                  {openId === item.id && nutrition && (
                    <div className="card_nutrition_dropdown">
                      {/* 서빙 사이즈 및 칼로리 정보 */}
                      <div className="nutrition_header">
                        기준: {nutrition.serving_size} / <b>{nutrition.kcal} kcal</b>
                      </div>
                      {/* 탄수화물, 단백질, 지방 데이터 */}
                      <div className="nutrition_content">
                        <span>탄: <b>{nutrition.carbs}</b></span>
                        <span>단: <b>{nutrition.protein}</b></span>
                        <span>지: <b>{nutrition.fat}</b></span>
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