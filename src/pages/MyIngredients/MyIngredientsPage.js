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

  const fetchAllMasterData = async () => {
    try {
      const res = await customInstance.get("/api/ingredients");
      const rawData = res.data?.data?.items || res.data?.data?.content || res.data?.data || [];
      setAllIngredients(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      console.error("❌ 마스터 목록 로드 실패:", err);
    }
  };

  const fetchMyIngredients = useCallback(async () => {
    try {
      setLoading(true);
      // 400 에러 방지를 위해 필터가 비어있으면 파라미터 없이 호출
      const params = filters.name ? { name: filters.name } : {};
      const res = await customInstance.get("/api/my/ingredients", { params });
      
      console.log("🔍 서버 응답 데이터:", res.data);
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

  const handleRegister = async (e) => {
    e.preventDefault();
    const payload = {
      ingredientId: parseInt(formData.ingredientId, 10),
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      expirationDate: formData.expirationDate
    };

    try {
      await customInstance.post("/api/my/ingredients", payload);
      alert("냉장고에 저장되었습니다!");
      setFormData({ ingredientId: "", quantity: "", unit: "개", expirationDate: "" });
      setActiveTab("list");
      fetchMyIngredients();
    } catch (err) {
      alert("등록에 실패했습니다. 입력 정보를 확인해주세요.");
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
              <div className="search_input_wrapper">
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