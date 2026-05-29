import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Refrigerator, Search, Plus, 
  Save, Loader2, List, ClipboardPlus, X 
} from "lucide-react";
import customInstance from "../../api/api";
import "./MyIngredientsPage.css";

export default function MyIngredientsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("list");
  const [myIngredients, setMyIngredients] = useState([]); 
  const [allIngredients, setAllIngredients] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // 💡 엔터 누르기 전 검색창의 텍스트를 임시 저장할 상태 변수 (실시간 API 호출 방지)
  const [searchInputValue, setSearchInputValue] = useState("");

  const [filters, setFilters] = useState({
    name: "",
    sortField: "expirationDate",
    sortDir: "asc"
  });

  const [formData, setFormData] = useState({
    ingredientId: "", 
    quantity: "",
    unit: "개",
    expirationDate: ""
  });

  /* ---------------------------------------------------------
     [마스터 데이터 조회] 마스터 식재료 목록 조회 (GET: /api/ingredients)
     --------------------------------------------------------- */
  const fetchAllMasterData = async () => {
    try {
      const res = await customInstance.get("/api/ingredients");
      const rawData = res.data?.data?.items || res.data?.data?.content || res.data?.data || [];
      setAllIngredients(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      console.error("❌ 마스터 목록 로드 실패:", err);
    }
  };

  /* ---------------------------------------------------------
     [내 냉장고 조회] 내 식재료 목록 조회 (GET: /api/my/ingredients)
     --------------------------------------------------------- */
  const fetchMyIngredients = useCallback(async () => {
    try {
      setLoading(true);
      const params = filters.name ? { name: filters.name } : {};
      const res = await customInstance.get("/api/my/ingredients", { params });
      
      console.log("🔍 내 식재료 서버 응답 데이터:", res.data);
      const extractedItems = res.data?.data?.items || res.data?.data?.content || [];
      setMyIngredients(extractedItems);
    } catch (err) {
      console.error("❌ 내 식재료 로드 실패:", err.response?.data || err.message);
      setMyIngredients([]);
    } finally {
      setLoading(false);
    }
  }, [filters.name]);

  useEffect(() => {
    fetchAllMasterData();
  }, []);

  useEffect(() => {
    if (activeTab === "list") fetchMyIngredients();
  }, [activeTab, fetchMyIngredients]);

  /* ---------------------------------------------------------
     💡 Enter 클릭 및 검색 돋보기 폼 제출 처리 핸들러
     --------------------------------------------------------- */
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault(); // 브라우저 창 새로고침 원천 차단
    setFilters((prev) => ({ ...prev, name: searchInputValue })); // 필터 조건 반영하여 useEffect 트리거
  };

  /* ---------------------------------------------------------
     내 식재료 등록 핸들러 (POST: /api/my/ingredients)
     --------------------------------------------------------- */
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.ingredientId) return alert("추가할 식재료를 선택해주세요.");
    if (!formData.quantity || isNaN(formData.quantity)) return alert("올바른 수량을 입력해주세요.");
    if (!formData.expirationDate) return alert("유통기한을 선택해주세요.");

    const parsedIngredientId = parseInt(formData.ingredientId, 10);
    const parsedQuantity = parseFloat(formData.quantity);

    if (isNaN(parsedIngredientId) || isNaN(parsedQuantity)) {
      return alert("데이터 타입 변환 중 내부 오류가 발생했습니다.");
    }

    const formattedDateWithTime = formData.expirationDate.includes("T") 
      ? formData.expirationDate 
      : `${formData.expirationDate}T00:00:00`;

    const payload = {
      ingredientId: parsedIngredientId,
      quantity: parsedQuantity,
      unit: formData.unit || "개",
      expirationDate: formattedDateWithTime 
    };

    try {
      await customInstance.post("/api/my/ingredients", payload);
      alert("냉장고에 성공적으로 저장되었습니다!");
      setFormData({ ingredientId: "", quantity: "", unit: "개", expirationDate: "" });
      setActiveTab("list");
      fetchMyIngredients();
    } catch (err) {
      console.error("❌ [등록 실패]");
      if (err.response) {
        const serverMsg = err.response.data?.message || err.response.data?.error || "필드 검증 오류";
        alert(`등록 실패 (서버 사유): ${serverMsg}`);
      } else {
        alert("서버와 통신할 수 없는 네트워크 상태입니다.");
      }
    }
  };

  return (
    <div className="mobile_container white_bg">
      <header className="ing_header">
        <button onClick={() => navigate(-1)} className="back_btn"><ChevronLeft size={24} /></button>
        <h1>{activeTab === "list" ? "나의 냉장고" : "재료 추가"}</h1>
        <button className="mode_toggle_btn" onClick={() => setActiveTab(activeTab === "list" ? "reg" : "list")}>
          {activeTab === "list" ? <Plus size={24} color="#00B341" /> : <X size={24} />}
        </button>
      </header>

      <div className="ing_tabs">
        <button className={`tab_item ${activeTab === "list" ? "active" : ""}`} onClick={() => setActiveTab("list")}>
          <List size={18} /> 목록
        </button>
        <button className={`tab_item ${activeTab === "reg" ? "active" : ""}`} onClick={() => setActiveTab("reg")}>
          <ClipboardPlus size={18} /> 추가
        </button>
      </div>

      <main className="ing_content">
        {activeTab === "list" ? (
          <div className="list_section">
            
            {/* 시맨틱 form 구조로 변경하여 돋보기 클릭 및 키보드 엔터 완벽 제어 */}
            <form className="filter_bar" onSubmit={handleSearchSubmit}>
              <div className="ing_input_wrapper">
                <Search size={16} />
                <input 
                  id="ingredient-search-input"
                  placeholder="재료 이름 검색 (Enter 또는 검색)" 
                  value={searchInputValue} 
                  onChange={(e) => setSearchInputValue(e.target.value)}
                />
              </div>
              <button type="submit" style={{ display: "none" }}>검색</button>
            </form>

            {loading ? <div className="ing_loading"><Loader2 className="spinner" /></div> : (
              <div className="ing_list">
                {myIngredients.length > 0 ? (
                  myIngredients.map((ing, idx) => {
                    const ingredientId = ing.id || ing.myIngredientId || idx;
                    const daysLeft = ing.daysLeft !== undefined ? ing.daysLeft : (ing.dDay || 0);

                    // 디데이 텍스트 가독성 분기 가공 처리 (daysLeft 매핑)
                    let dDayText = "";
                    if (daysLeft === 0) dDayText = "D-Day";
                    else if (daysLeft > 0) dDayText = `D-${daysLeft}`;
                    else dDayText = `D+${Math.abs(daysLeft)} (만료)`;

                    return (
                      <div 
                        key={`my-${ingredientId}`} 
                        className="ing_card"
                        /* 재료 클릭 시 상세조회 페이지 경로로 라우팅 링크 바인딩 */
                        onClick={() => navigate(`/my-ingredients/${ingredientId}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="ing_avatar"><Refrigerator size={22} color="#00B341" /></div>
                        <div className="ing_details">
                          <div className="top_info">
                            <span className="ing_name">{ing.name}</span>
                            <span className="ing_qty">{ing.quantity}{ing.unit}</span>
                          </div>
                          <p className={`ing_status ${daysLeft <= 3 ? "danger" : ""}`}>
                            {dDayText} ({ing.expirationDate})
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : <div className="empty_state_box">냉장고가 비어있습니다.</div>}
              </div>
            )}
          </div>
        ) : (
          <form className="reg_section" onSubmit={handleRegister}>
            <div className="input_group">
              {/* 💡 중복 ID 에러 해결: htmlFor와 select id 매칭 독립화 */}
              <label htmlFor="reg-ingredient-select">재료 선택</label>
              <select 
                id="reg-ingredient-select"
                name="ingredientId" 
                value={formData.ingredientId} 
                onChange={(e) => setFormData({...formData, ingredientId: e.target.value})} 
                required 
                className="master_select"
              >
                <option value="">추가할 재료를 선택하세요</option>
                {allIngredients.map((item) => {
                  const masterId = item.ingredientId || item.id;
                  return (
                    <option key={`m-${masterId}`} value={masterId}>
                      {item.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="input_row">
              <div className="input_group flex_2">
                {/* 💡 중복 ID 에러 해결: 수량 필드 고유 ID 부여 */}
                <label htmlFor="reg-quantity-input">수량</label>
                <input 
                  id="reg-quantity-input"
                  type="number" 
                  step="0.1" 
                  value={formData.quantity} 
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                  required 
                />
              </div>
              <div className="input_group flex_1">
                {/* 💡 중복 ID 에러 해결: 단위 필드 고유 ID 부여 */}
                <label htmlFor="reg-unit-select">단위</label>
                <select 
                  id="reg-unit-select"
                  value={formData.unit} 
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                >
                  <option value="개">개</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                </select>
              </div>
            </div>

            <div className="input_group">
              {/* 💡 중복 ID 에러 해결: 유통기한 필드 고유 ID 부여 */}
              <label htmlFor="reg-expiration-date">유통기한</label>
              <input 
                id="reg-expiration-date"
                type="date" 
                value={formData.expirationDate} 
                onChange={(e) => setFormData({...formData, expirationDate: e.target.value})} 
                required 
              />
            </div>
            
            <button type="submit" className="save_btn"><Save size={18} /> 냉장고에 저장</button>
          </form>
        )}
      </main>
    </div>
  );
}