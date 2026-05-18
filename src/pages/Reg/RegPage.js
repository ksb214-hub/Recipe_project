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
     0. 영양정보 데이터 안전하게 추출
     --------------------------------------------------------- */
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
      
      // ✅ 로그 1: 서버 응답 확인
      console.log("📦 서버 응답 전체 데이터:", res.data);

      // 서버 응답 규격 유연하게 대응 (res.data.data 내부의 유효한 배열 탐색)
      let rawData = res.data?.data;
      let finalArray = [];

      if (Array.isArray(rawData)) {
        // 1. data 자체가 배열인 경우
        finalArray = rawData;
      } else if (rawData && typeof rawData === 'object') {
        // 2. data가 객체이고 그 안에 content, list, 또는 ingredients 등의 배열 필드가 숨어있는 경우
        const possibleArrayFields = ['content', 'list', 'ingredients', 'myIngredients'];
        const foundField = possibleArrayFields.find(field => Array.isArray(rawData[field]));
        
        if (foundField) {
          finalArray = rawData[foundField];
        } else {
          // 3. 만약 배열 필드가 없고 순수 단일 객체이며 id나 name을 가지고 있다면 배열로 포장
          if (rawData.id || rawData.name) {
            finalArray = [rawData];
          } else {
            // 4. 그 외 객체의 값들 중 배열이 있다면 가로채기
            const ObjectValues = Object.values(rawData);
            const hiddenArray = ObjectValues.find(val => Array.isArray(val));
            if (hiddenArray) finalArray = hiddenArray;
          }
        }
      } else if (Array.isArray(res.data)) {
        // 5. 최상위 응답 자체가 배열인 경우
        finalArray = res.data;
      }
      
      // ✅ 로그 2 & 3: 가공된 최종 배열 데이터 구조 검증
      console.log("🔍 안전하게 감지 및 가공된 원본 데이터 자원:", rawData);
      console.log("✅ 화면(렌더링)에 세팅될 최종 ingredients 배열:", finalArray);
      
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
    if (!name.trim() || !shelfLifeDays) return alert("입력값을 확인해주세요.");
    
    try {
      setLoading(true);
      const payload = {
        name: name,
        shelfLifeDays: parseInt(shelfLifeDays, 10)
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
                // 각 아이템 유효성 검증로그
                console.log(`🎨 렌더링 대상 아이템 [${index}]:`, item);

                const nutrition = Array.isArray(nutritionDb) 
                  ? nutritionDb.find(n => n.name === item.name)
                  : null;
                
                // key값 고유성 확보 및 백엔드 key 바인딩 방어선 구축
                const itemId = item.id || item.ingredientId || index;
                const daysLeft = item.daysLeft !== undefined && item.daysLeft !== null ? item.daysLeft : item.shelfLifeDays;
                
                return (
                  <div key={itemId} className="ingredient_card">
                    <div 
                      className="card_header" 
                      onClick={() => setOpenId(openId === itemId ? null : itemId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="info_area">
                        <span className="item_name" style={{ fontWeight: 'bold', marginRight: '10px' }}>{item.name || "이름 없음"}</span>
                        <span className="item_days" style={{ color: '#ff4d4d', fontSize: '13px' }}>
                          {daysLeft !== undefined ? `${daysLeft}일 남음` : "기한 정보 없음"}
                        </span>
                      </div>
                      <button onClick={(e) => handleDelete(e, itemId)} className="del_btn">삭제</button>
                    </div>

                    {openId === itemId && nutrition && (
                      <div className="card_nutrition_dropdown" style={{ padding: '10px', backgroundColor: '#f9f9f9', marginTop: '5px', borderRadius: '8px' }}>
                        <div className="nutrition_header" style={{ fontSize: '12px', marginBottom: '5px', color: '#666' }}>
                          기준: {nutrition.serving_size} / <b>{nutrition.kcal} kcal</b>
                        </div>
                        <div className="nutrition_content" style={{ display: 'flex', gap: '15px', fontSize: '13px' }}>
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