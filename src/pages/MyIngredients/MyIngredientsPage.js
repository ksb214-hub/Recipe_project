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
      // 백엔드 커스텀 응답 규격(data.items) 매핑 대응
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
     🔥 [400 에러 원천 해결] 내 식재료 등록 핸들러 (POST: /api/my/ingredients)
     --------------------------------------------------------- */
  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. 프론트엔드 자체 유효성 예외 검사 (Id, 수량, 날짜 누락 차단)
    if (!formData.ingredientId) {
      alert("추가할 식재료를 선택해주세요.");
      return;
    }
    if (!formData.quantity || isNaN(formData.quantity)) {
      alert("올바른 수량을 입력해주세요.");
      return;
    }
    if (!formData.expirationDate) {
      alert("유통기한을 선택해주세요.");
      return;
    }

    // 2. 백엔드 DTO 바인딩 규격에 부합하도록 안전 형변환 수행 (문자열 우회)
    const parsedIngredientId = parseInt(formData.ingredientId, 10);
    const parsedQuantity = parseFloat(formData.quantity);

    if (isNaN(parsedIngredientId) || isNaN(parsedQuantity)) {
      alert("데이터 타입 변환 중 내부 오류가 발생했습니다.");
      return;
    }

    // 3. 💡 [날짜 포맷 정밀 방어선] 백엔드가 LocalDateTime을 요구할 수도 있으므로 보정 처리
    // 기본 "YYYY-MM-DD" 형식을 검사한 뒤 필요에 따라 "T00:00:00" 접미사를 안전하게 핸들링합니다.
    const formattedDateWithTime = formData.expirationDate.includes("T") 
      ? formData.expirationDate 
      : `${formData.expirationDate}T00:00:00`;

    // 4. 백엔드 전송용 핵심 페이로드(Payload) 구성
    // ※ 혹시 400 에러가 지속된다면 expirationDate 값을 formData.expirationDate(순수 날짜)로 토글해볼 수 있습니다.
    const payload = {
      ingredientId: parsedIngredientId,
      quantity: parsedQuantity,
      unit: formData.unit || "개",
      expirationDate: formattedDateWithTime 
    };

    try {
      console.log("📤 [POST] /api/my/ingredients 보낼 최종 데이터(Payload):", JSON.stringify(payload, null, 2));
      
      const res = await customInstance.post("/api/my/ingredients", payload);
      
      console.log("✨ [등록 성공] 서버 응답 결과:", res.data);
      alert("냉장고에 성공적으로 저장되었습니다!");
      
      // 저장 성공 후 데이터 상태 초기화 및 화면 전환
      setFormData({ ingredientId: "", quantity: "", unit: "개", expirationDate: "" });
      setActiveTab("list");
      fetchMyIngredients();
    } catch (err) {
      console.error("❌ [등록 실패] AxiosError 디테일 추적");
      
      // 5. 🔍 400 에러의 진짜 거절 사유를 완벽하게 콘솔에 파싱하여 노출
      if (err.response) {
        console.error("📊 서버 반환 상태 코드 (Status):", err.response.status);
        console.error("📦 서버 실제 거절 내용 (Data):", err.response.data);
        
        // 백엔드 고유의 에러 메시지 래퍼 추출
        const serverMsg = err.response.data?.message || err.response.data?.error || "필드 검증 오류 (Field Validation Error)";
        alert(`등록 실패 (서버 사유): ${serverMsg}\n\n*콘솔창(F12)의 '서버 실제 거절 내용'을 확인하세요!`);
      } else {
        console.error("🚨 네트워크 연결 불안정:", err.message);
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
            <div className="filter_bar">
              <div className="ing_input_wrapper">
                <Search size={16} />
                <input 
                  placeholder="재료 이름 검색" 
                  value={filters.name} 
                  onChange={(e) => setFilters(prev => ({...prev, name: e.target.value}))} 
                />
              </div>
            </div>

            {loading ? <div className="ing_loading"><Loader2 className="spinner" /></div> : (
              <div className="ing_list">
                {myIngredients.length > 0 ? (
                  myIngredients.map((ing, idx) => (
                    <div key={`my-${ing.myIngredientId || idx}`} className="ing_card">
                      <div className="ing_avatar"><Refrigerator size={22} color="#00B341" /></div>
                      <div className="ing_details">
                        <div className="top_info">
                          <span className="ing_name">{ing.name}</span>
                          <span className="ing_qty">{ing.quantity}{ing.unit}</span>
                        </div>
                        <p className={`ing_status ${ing.dDay <= 3 ? "danger" : ""}`}>
                          D-{ing.dDay} ({ing.expirationDate})
                        </p>
                      </div>
                    </div>
                  ))
                ) : <div className="empty_state_box">냉장고가 비어있습니다.</div>}
              </div>
            )}
          </div>
        ) : (
          <form className="reg_section" onSubmit={handleRegister}>
            <div className="input_group">
              <label>재료 선택</label>
              <select 
                name="ingredientId" 
                value={formData.ingredientId} 
                onChange={(e) => setFormData({...formData, ingredientId: e.target.value})} 
                required 
                className="master_select"
              >
                <option value="">추가할 재료를 선택하세요</option>
                {allIngredients.map((item) => (
                  <option key={`m-${item.ingredientId || item.id}`} value={item.ingredientId || item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="input_row">
              <div className="input_group flex_2">
                <label>수량</label>
                <input type="number" step="0.1" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} required />
              </div>
              <div className="input_group flex_1">
                <label>단위</label>
                <select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}>
                  <option value="개">개</option><option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option>
                </select>
              </div>
            </div>
            <div className="input_group">
              <label>유통기한</label>
              <input type="date" value={formData.expirationDate} onChange={(e) => setFormData({...formData, expirationDate: e.target.value})} required />
            </div>
            <button type="submit" className="save_btn"><Save size={18} /> 냉장고에 저장</button>
          </form>
        )}
      </main>
    </div>
  );
}