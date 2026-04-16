import React, { useState, useEffect, useCallback } from "react";
import "./RegPage.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import customInstance from "../../api/api"; 

function RegPage() {
  const [name, setName] = useState("");
  const [shelfLifeDays, setShelfLifeDays] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================================================
     1. 데이터 불러오기 (GET)
     ========================================================= */
  const fetchIngredients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customInstance({
        url: "/api/ingredients",
        method: "GET"
      });

      // ✅ Soft Delete 적용 시: 서버가 deleted_at이 NULL인 것만 보내주는지 확인해야 합니다.
      const result = res.data;
      const finalData = result.content || result.data?.content || result.data || result || [];
      
      setIngredients(finalData);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  /* =========================================================
     2. 재료 등록 (POST)
     ========================================================= */
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!name || !shelfLifeDays) return alert("식재료명과 소비기한을 입력해주세요.");

    setLoading(true);
    try {
      await customInstance({
        url: "/api/ingredients",
        method: "POST",
        data: { name: name.trim(), shelfLifeDays: Number(shelfLifeDays) },
      });
      
      alert("등록되었습니다.");
      setName(""); 
      setShelfLifeDays("");
      fetchIngredients(); // 리스트 새로고침
    } catch (err) {
      // 💡 만약 동일한 이름의 재료가 이미 deleted_at에 있다면 에러가 날 수 있습니다.
      alert("등록에 실패했습니다. (이미 존재하는 재료일 수 있습니다)");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     3. 재료 삭제 (DELETE -> 사실상 백엔드에서 Soft Delete 처리)
     ========================================================= */
  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("이 재료를 목록에서 삭제하시겠습니까?")) return;
    
    try {
      // ✅ 요청은 동일하게 DELETE로 보냅니다.
      // 백엔드에서 이 요청을 받고 'UPDATE ... SET deleted_at = NOW()'를 실행할 것입니다.
      await customInstance({
        url: `/api/ingredients/${id}`,
        method: "DELETE"
      });
      
      alert("삭제되었습니다.");
      
      // ✅ 중요: Soft Delete 후에는 서버 DB 상태가 바뀌었으므로 
      // 필터링된 새 목록을 가져오기 위해 fetchIngredients를 반드시 호출합니다.
      fetchIngredients(); 
      
    } catch (err) {
      console.error("삭제 실패:", err);
      // 외래키 제약조건 등으로 Soft Delete조차 실패할 경우에 대한 안내
      alert("현재 다른 레시피에서 사용 중인 재료는 삭제할 수 없습니다.");
    }
  };

  return (
    <div className="reg_container">
      <main className="reg_main_content">
        <div className="reg_header">
          <h2>식재료 관리</h2>
          <p>전체 식재료 목록을 관리합니다. (삭제 시 목록에서 숨겨집니다.)</p>
        </div>

        <form className="reg_input_section" onSubmit={handleRegister}>
          <Input 
            placeholder="식재료명" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <div className="input_group">
            <label className="input_label">유효 기간 (일)</label>
            <Input 
              type="number" 
              placeholder="예: 7" 
              value={shelfLifeDays} 
              onChange={(e) => setShelfLifeDays(e.target.value)} 
            />
          </div>
          <Button type="submit" variant="primary" disabled={loading} style={{width: '100%', marginTop: '10px'}}>
            {loading ? "처리 중..." : "+ 새 식재료 등록"}
          </Button>
        </form>

        <div className="divider"></div>

        <div className="ingredient_list">
          <h3 className="list_title">현재 사용 가능한 재료 ({ingredients.length})</h3>
          
          <div className="ingredient_grid">
            {ingredients.length > 0 ? (
              ingredients.map((item) => {
                const currentId = item.id || item.ingredientId;
                
                return (
                  <div key={currentId} className="card">
                    <div className="card_info">
                      <span className="item_name">{item.name}</span>
                      <span className="item_days">{item.shelfLifeDays}일</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(currentId);
                      }} 
                      className="del_btn"
                    >
                      삭제
                    </button>
                  </div>
                );
              })
            ) : (
              !loading && <p className="empty_msg">보관 중인 재료 데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegPage;