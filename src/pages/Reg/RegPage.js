import React, { useState, useEffect, useCallback } from "react";
import "./RegPage.css";
import Input from "../../components/Input/Input"; // Line 3 해결
import Button from "../../components/Button/Button"; // Line 4 해결
import customInstance from "../../api/api"; 

function RegPage() {
  const [name, setName] = useState("");
  const [shelfLifeDays, setShelfLifeDays] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);

  /* 1. 데이터 불러오기 */
  const fetchIngredients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customInstance({
        url: "/api/ingredients", 
        method: "GET"
      });

      const result = res.data;
      let finalData = [];

      if (result.content && Array.isArray(result.content)) {
        finalData = result.content;
      } else if (result.data && Array.isArray(result.data.content)) {
        finalData = result.data.content;
      } else if (Array.isArray(result.data)) {
        finalData = result.data;
      } else if (Array.isArray(result)) {
        finalData = result;
      }

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

  /* 2. 재료 등록 처리 (Line 58 해결 - form에서 사용) */
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    
    if (!name || !shelfLifeDays) {
      return alert("식재료명과 소비기한을 모두 입력해주세요.");
    }

    setLoading(true);
    try {
      await customInstance({
        url: "/api/ingredients",
        method: "POST",
        data: {
          name: name.trim(),
          shelfLifeDays: Number(shelfLifeDays),
        },
      });

      alert("등록 성공!");
      setName(""); 
      setShelfLifeDays("");
      fetchIngredients(); 

    } catch (err) {
      const errorMsg = err.response?.data?.message || "등록 실패";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* 3. 재료 삭제 처리 */
  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    
    try {
      await customInstance({
        url: `/api/ingredients/${id}`,
        method: "DELETE"
      });
      alert("삭제되었습니다.");
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
          <p>등록된 재료는 시스템에서 공통으로 사용됩니다.</p>
        </div>

        {/* ✅ handleRegister를 여기서 사용해야 ESLint 에러가 사라집니다. */}
        <form className="reg_input_section" onSubmit={handleRegister}>
          {/* ✅ Input 컴포넌트 사용 */}
          <Input 
            placeholder="식재료명 (예: 양파)" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <div className="input_group" style={{ marginTop: '10px' }}>
            <label className="input_label">기본 소비기한 (일)</label>
            <Input 
              type="number" 
              placeholder="예: 7" 
              value={shelfLifeDays} 
              onChange={(e) => setShelfLifeDays(e.target.value)} 
            />
          </div>
          {/* ✅ Button 컴포넌트 사용 */}
          <Button type="submit" variant="primary" disabled={loading} style={{width: '100%', marginTop: '15px'}}>
            {loading ? "등록 중..." : "+ 새 식재료 등록"}
          </Button>
        </form>

        <div className="divider" style={{ margin: '30px 0', borderBottom: '1px solid #eee' }}></div>

        <div className="ingredient_list">
          <h3 className="list_title">등록된 재료 ({ingredients.length})</h3>
          
          <div className="ingredient_grid">
            {ingredients.length > 0 ? (
              ingredients.map((item) => {
                const currentId = item.id || item.ingredientId;
                
                return (
                  /* ✅ 주신 .card 스타일 적용 */
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
              !loading && <p className="empty_msg">등록된 재료가 없습니다.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegPage;