import React, { useState, useEffect, useCallback } from "react";
import "./RegPage.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import customInstance from "../../api/api";
// 영양 성분 데이터베이스
import nutritionData from "../../data/collection/nutrition_db.json";

function RegPage() {
  const [name, setName] = useState("");
  const [shelfLifeDays, setShelfLifeDays] = useState("");
  const [ingredients, setIngredients] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState(null);

  /* ---------------------------------------------------------
     0. 영양정보 데이터 안전하게 추출 (에러 해결)
     --------------------------------------------------------- */
  // JSON 데이터가 바로 배열이 아닐 경우(객체 내부의 content 등)를 대비
  const nutritionDb = Array.isArray(nutritionData) 
    ? nutritionData 
    : (nutritionData?.data || nutritionData?.content || []);

  /* ---------------------------------------------------------
     1. 식재료 목록 조회 (GET: /api/my/ingredients)
     --------------------------------------------------------- */
  const fetchIngredients = useCallback(async () => {
    try {
      setLoading(true);
      console.log("📡 [GET] /api/my/ingredients 요청 시작");
      
      const res = await customInstance.get("/api/my/ingredients");
      
      // ✅ 로그 1: 서버에서 온 순수 응답 확인
      console.log("📦 서버 응답 전체 데이터:", res.data);

      const rawData = res.data?.data || res.data || [];
      
      // ✅ 로그 2: 가공 전 데이터 상태 확인
      console.log("🔍 가공 전 데이터(rawData):", rawData);

      // 데이터가 배열인지 확인 후 최종 세팅
      let finalArray = [];
      if (Array.isArray(rawData)) {
        finalArray = rawData;
      } else if (rawData && typeof rawData === 'object') {
        finalArray = [rawData]; // 단일 객체일 경우 배열로 감싸줌
      }

      // ✅ 로그 3: 최종 ingredients 상태값 확인
      console.log("✅ 최종 ingredients 배열 세팅:", finalArray);
      setIngredients(finalArray);

    } catch (err) { 
      console.error("❌ 데이터 로드 실패:", err); 
      setIngredients([]); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    fetchIngredients(); 
  }, [fetchIngredients]);

  /* ---------------------------------------------------------
     2. 식재료 등록 (POST: /api/my/ingredients)
     --------------------------------------------------------- */
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!name || !shelfLifeDays) return alert("입력값을 확인해주세요.");
    
    try {
      setLoading(true);
      const payload = {
        name: name,
        shelfLifeDays: parseInt(shelfLifeDays)
      };

      console.log("📤 [POST] 등록 요청 데이터:", payload);

      await customInstance.post("/api/my/ingredients", payload);
      
      alert("식재료가 등록되었습니다.");
      setName("");
      setShelfLifeDays("");
      fetchIngredients(); // 목록 새로고침
    } catch (err) {
      console.error("❌ 등록 실패:", err);
      alert("등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------
     3. 식재료 삭제 (DELETE: /api/my/ingredients/{id})
     --------------------------------------------------------- */
  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    if (!window.confirm("삭제하시겠습니까?")) return;
    
    try {
      console.log(`🗑️ [DELETE] /api/my/ingredients/${id} 삭제 요청`);
      await customInstance.delete(`/api/my/ingredients/${id}`);
      fetchIngredients();
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="reg_page">
      <main className="reg_container">
        <h2 className="reg_title">내 냉장고 재료 등록</h2>
        
        <form className="reg_form" onSubmit={handleRegister}>
          <Input 
            label="재료 이름" 
            placeholder="예: 양배추, 계란" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input 
            label="소비기한 (남은 일수)" 
            type="number"
            placeholder="숫자만 입력 (예: 7)" 
            value={shelfLifeDays}
            onChange={(e) => setShelfLifeDays(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "등록 중..." : "재료 추가하기"}
          </Button>
        </form>

        <div className="ingredient_list_section">
          <h3 className="list_title">현재 보유 중인 재료</h3>
          <div className="ingredient_cards">
            {loading && ingredients.length === 0 ? (
              <p className="status_msg">로딩 중...</p>
            ) : ingredients.length > 0 ? (
              ingredients.map((item, index) => {
                // ✅ 로그 4: 각 아이템 렌더링 시 데이터 확인
                console.log(`🎨 렌더링 아이템 [${index}]:`, item);

                // 영양 정보 데이터(배열)에서 .find 수행
                const nutrition = Array.isArray(nutritionDb) 
                  ? nutritionDb.find(n => n.name === item.name)
                  : null;
                
                return (
                  <div key={item.id || index} className="ingredient_card">
                    <div 
                      className="card_header" 
                      onClick={() => setOpenId(openId === item.id ? null : item.id)}
                    >
                      <div className="info_area">
                        <span className="item_name">{item.name}</span>
                        {/* ⭐ 서버 응답 필드인 daysLeft 사용 */}
                        <span className="item_days">{item.daysLeft}일 남음</span>
                      </div>
                      <button onClick={(e) => handleDelete(e, item.id)} className="del_btn">삭제</button>
                    </div>

                    {openId === item.id && nutrition && (
                      <div className="card_nutrition_dropdown">
                        <div className="nutrition_header">
                          기준: {nutrition.serving_size} / <b>{nutrition.kcal} kcal</b>
                        </div>
                        <div className="nutrition_content">
                          <span>탄: <b>{nutrition.carbs}</b></span>
                          <span>단: <b>{nutrition.protein}</b></span>
                          <span>지: <b>{nutrition.fat}</b></span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="status_msg">등록된 재료가 없습니다.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegPage;