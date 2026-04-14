import React, { useState, useEffect } from "react";
import "./RegPage.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import customInstance from "../../api/api"; 

function RegPage() {
  /* =========================================================
     1. 상태 관리 (State)
     ========================================================= */
  const [name, setName] = useState("");              // 입력받을 식재료 이름
  const [shelfLifeDays, setShelfLifeDays] = useState(""); // 입력받을 소비기한(일수)
  const [ingredients, setIngredients] = useState([]); // 서버에서 가져온 재료 목록 배열
  const [loading, setLoading] = useState(false);      // 로딩 상태 (버튼 비활성화 등)

  /* =========================================================
     2. 데이터 불러오기 (Read - GET)
     - 페이지 로드 시 또는 데이터 등록/삭제 후 목록을 갱신합니다.
     ========================================================= */
  const fetchIngredients = async () => {
    try {
      setLoading(true);
      // [흐름] 서버의 공통 API 규격에 맞춰 GET 요청을 보냅니다.
      const res = await customInstance({
        url: "/api/ingredients",
        method: "GET" // 중요: 조회는 반드시 GET 메서드를 사용해야 합니다.
      });

      console.log("📍 서버 응답 데이터 확인:", res.data);

      /**
       * [데이터 추출 흐름]
       * 서버 응답(res.data) 구조: { success, message, data: { content: [...] } }
       * Spring Data JPA의 Page 객체이므로 'content' 필드 안에 배열이 들어있습니다.
       */
      const actualData = res.data?.data?.content || [];
      
      // 상태를 업데이트하여 화면을 다시 그립니다(Re-render).
      setIngredients(actualData);
    } catch (err) {
      console.error("재료 목록 로드 실패:", err);
      setIngredients([]); // 에러 발생 시 빈 배열로 초기화하여 map 에러 방지
    } finally {
      setLoading(false);
    }
  };

  /**
   * [생명주기] 컴포넌트가 처음 화면에 나타날(Mount) 때 목록을 한 번 가져옵니다.
   */
  useEffect(() => {
    fetchIngredients();
  }, []);

  /* =========================================================
     3. 재료 등록 처리 (Create - POST)
     - 사용자가 입력한 데이터를 서버에 저장합니다.
     ========================================================= */
  const handleRegister = async (e) => {
    if (e) e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    
    if (!name || !shelfLifeDays) {
      return alert("식재료명과 소비기한을 모두 입력해주세요.");
    }

    setLoading(true);
    try {
      // [흐름] 사용자가 입력한 값을 JSON 바디에 담아 POST 요청을 보냅니다.
      await customInstance({
        url: "/api/ingredients",
        method: "POST",
        data: {
          name: name,
          shelfLifeDays: Number(shelfLifeDays), // 숫자로 형변환하여 전송
        },
      });

      alert("재료가 성공적으로 등록되었습니다.");
      
      // [성공 후 흐름] 입력창을 비우고, 최신 목록을 다시 불러옵니다.
      setName(""); 
      setShelfLifeDays("");
      fetchIngredients(); 

    } catch (err) {
      console.error("등록 에러:", err);
      alert(err.response?.data?.message || "등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     4. 재료 삭제 처리 (Delete - DELETE)
     - 특정 ID의 재료를 서버에서 삭제합니다.
     ========================================================= */
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    
    try {
      // [흐름] 해당 아이템의 고유 ID를 경로에 담아 DELETE 요청을 보냅니다.
      await customInstance({
        url: `/api/ingredients/${id}`,
        method: "DELETE"
      });
      
      alert("삭제되었습니다.");
      fetchIngredients(); // 삭제 후 목록 갱신
    } catch (err) {
      console.error("삭제 에러:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  /* =========================================================
     5. 화면 렌더링 (View)
     ========================================================= */
  return (
    <div className="reg_container">
      <main className="reg_main_content">
        <div className="reg_header">
          <h2>식재료 마스터 관리</h2>
          <p>등록된 재료는 메인 화면에서 확인 가능합니다.</p>
        </div>

        {/* 재료 입력 폼 섹션 */}
        <form className="reg_input_section" onSubmit={handleRegister}>
          <Input 
            placeholder="식재료명 (예: 양파)" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <div className="input_group">
            <label className="input_label">소비기한 (남은 일수)</label>
            <Input 
              type="number" 
              placeholder="숫자 입력 (예: 7)" 
              value={shelfLifeDays} 
              onChange={(e) => setShelfLifeDays(e.target.value)} 
            />
          </div>
          <div className="button_group">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "처리 중..." : "+ 새 식재료 등록"}
            </Button>
          </div>
        </form>

        <div className="divider"></div>

        {/* 등록된 재료 리스트 섹션 */}
        <div className="ingredient_list">
          <h3 className="list_title">등록된 재료 ({ingredients?.length || 0})</h3>
          
          {/* 배열인지 확인 후 map 함수를 사용하여 리스트 생성 */}
          {Array.isArray(ingredients) && ingredients.length > 0 ? (
            ingredients.map((item) => (
              <div key={item.id || item.ingredientId} className="ingredient_card">
                <div className="card_content">
                  <span className="item_name">{item.name}</span>
                  <p className="item_desc">유효 기간: {item.shelfLifeDays}일</p>
                  <div className="card_buttons">
                    <button 
                      onClick={() => handleDelete(item.id || item.ingredientId)} 
                      className="del_text"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // 데이터가 없을 때 보여줄 화면
            !loading && <p className="empty_msg">등록된 재료가 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default RegPage;