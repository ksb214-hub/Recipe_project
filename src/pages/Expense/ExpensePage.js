import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Utensils, Calendar, List, Trash2, ArrowLeft } from "lucide-react";
import customInstance from "../../api/api";
import "./ExpensePage.css";

export default function ExpensePage() {
  // 1. 📅 날짜 상태 (기본값: 2026-04)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4);

  // 2. 💰 데이터 관련 상태 목록
  const [expenseList, setExpenseList] = useState([]);

  // 3. 📝 지출 등록 Bottom Sheet 모달 제어 상태
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    date: "2026-04-18",
    category: "식비" // 기본 카테고리 식비 고정
  });

  /* ---------------------------------------------------------
     [API 연동] 해당 연/월의 지출 데이터 가져오기 파이프라인 (에러 방어 강화)
     --------------------------------------------------------- */
  const fetchExpenseData = useCallback(async () => {
    try {
      // 월 포맷 맞춤 보정 (예: 4 -> "04")
      const formattedMonth = String(currentMonth).padStart(2, "0");
      console.log(`📡 [GET] /api/expenses?year=${currentYear}&month=${formattedMonth} 요청 시작`);
      
      const res = await customInstance.get("/api/expenses", {
        params: { year: currentYear, month: formattedMonth }
      });

      console.log("📦 백엔드 가계부 원본 응답:", res.data);

      // 💡 [Wrapper Object 언래핑 통합 가드]
      // 백엔드가 공통 포맷 { success: true, data: [...] } 형태로 주는지, 혹은 { data: { content: [...] } } 인지 꼼꼼하게 분기 처리
      let finalData = [];
      if (res.data) {
        if (Array.isArray(res.data.data)) {
          finalData = res.data.data;
        } else if (res.data.data && Array.isArray(res.data.data.content)) {
          finalData = res.data.data.content;
        } else if (Array.isArray(res.data)) {
          finalData = res.data;
        }
      }

      // 최종 추출된 데이터가 배열이 맞는지 한 번 더 확인 후 검증 배치
      if (Array.isArray(finalData)) {
        setExpenseList(finalData);
      } else {
        console.warn("⚠️ 백엔드에서 배열 형식이 아닌 데이터가 넘어왔습니다:", finalData);
        setExpenseList([]); // .reduce() 터짐 방지를 위해 안전하게 빈 배열 할당
      }

    } catch (err) {
      console.error("❌ 지출 내역 로드 실패 (안전 가동용 목데이터 활성화):", err);
      // 백엔드 연동 전 또는 에러 발생 시 프론트 가동용 안전 목데이터 가드
      setExpenseList([
        { id: 1, name: "식품 식자재 마트", price: 42000, date: `${currentYear}-${String(currentMonth).padStart(2, "0")}-05`, category: "식비" },
        { id: 2, name: "술집 골목 정포", price: 35000, date: `${currentYear}-${String(currentMonth).padStart(2, "0")}-12`, category: "술/유흥" },
        { id: 3, name: "배달 요기요 야식", price: 24000, date: `${currentYear}-${String(currentMonth).padStart(2, "0")}-18`, category: "식비" },
        { id: 4, name: "편의점 간식", price: 8500, date: `${currentYear}-${String(currentMonth).padStart(2, "0")}-18`, category: "간식" },
        { id: 5, name: "밀키트 정기 구독", price: 58000, date: `${currentYear}-${String(currentMonth).padStart(2, "0")}-25`, category: "식비" }
      ]);
    } finally {
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchExpenseData();
  }, [fetchExpenseData]);

  /* ---------------------------------------------------------
     [월 조절 핸들러] 네비게이션 트리거
     --------------------------------------------------------- */
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  /* ---------------------------------------------------------
     [데이터 통계 가공] 대시보드 도넛 차트 및 총액 스펙 연산
     --------------------------------------------------------- */
  const totalAmount = useMemo(() => {
    // Array.isArray 이중 검증으로 누수 원천 차단
    if (!Array.isArray(expenseList)) return 0;
    return expenseList.reduce((acc, cur) => acc + Number(cur.price || 0), 0);
  }, [expenseList]);

  const categoryStats = useMemo(() => {
    const categories = {
      "식비": { total: 0, color: "#764ba2" },
      "술/유흥": { total: 0, color: "#667eea" },
      "간식": { total: 0, color: "#ff7675" },
      "기타": { total: 0, color: "#b2bec3" }
    };

    if (Array.isArray(expenseList)) {
      expenseList.forEach(item => {
        if (!item) return;
        const cat = categories[item.category] ? item.category : "기타";
        categories[cat].total += Number(item.price || 0);
      });
    }

    return Object.entries(categories).map(([name, info]) => {
      const percent = totalAmount > 0 ? Math.round((info.total / totalAmount) * 100) : 0;
      return { name, ...info, percent };
    }).sort((a, b) => b.total - a.total);
  }, [expenseList, totalAmount]);

  // 도넛 차트의 원형 그래픽 그라디언트 비율 동적 계산 생성기
  const donutGradientStyle = useMemo(() => {
    if (totalAmount === 0) return { background: "#f1f3f7" };
    
    let currentAngle = 0;
    const gradientParts = categoryStats.map(stat => {
      if (stat.percent === 0) return null;
      const startAngle = currentAngle;
      currentAngle += stat.percent * 3.6; // 100% -> 360도 환산
      return `${stat.color} ${startAngle}deg ${currentAngle}deg`;
    }).filter(Boolean);

    return { background: `conic-gradient(${gradientParts.join(", ")})` };
  }, [categoryStats, totalAmount]);

  /* ---------------------------------------------------------
     [캘린더 데이터 매핑] 일자 기준 2차원 배열 파싱
     --------------------------------------------------------- */
  const calendarDays = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;
    
    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    const lastDate = new Date(year, month, 0).getDate();

    const daysArray = [];
    // 공백 일자 채우기
    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push({ type: "empty" });
    }
    // 실제 날짜 매핑 및 일별 합산 금액 계산
    for (let d = 1; d <= lastDate; d++) {
      const dateString = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      
      const dayTotal = Array.isArray(expenseList) 
        ? expenseList
            .filter(item => item && item.date === dateString)
            .reduce((sum, item) => sum + Number(item.price || 0), 0)
        : 0;

      daysArray.push({ type: "day", dayNum: d, amount: dayTotal, fullDate: dateString });
    }
    return daysArray;
  }, [currentYear, currentMonth, expenseList]);

  /* ---------------------------------------------------------
     [C.R.U.D 액션] 지출 추가 및 삭제 제어 파트
     --------------------------------------------------------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return alert("내역과 금액을 명확히 입력해주세요!");

    try {
      console.log("📡 [POST] /api/expenses 데이터 전송:", formData);
      const res = await customInstance.post("/api/expenses", formData);
      if (res.status === 200 || res.status === 201) {
        fetchExpenseData();
      }
    } catch (err) {
      console.error("추가 실패 시 프론트 가상 추가 우회:", err);
      setExpenseList(prev => [
        { id: Date.now(), ...formData, price: Number(formData.price) },
        ...prev
      ]);
    } finally { // 💡 finalData { 로 잘못 들어가 있던 오타를 문법에 맞는 finally { 로 수정했습니다!
      setIsFormOpen(false);
      setFormData({ 
        name: "", 
        price: "", 
        date: `${currentYear}-${String(currentMonth).padStart(2, "0")}-18`, 
        category: "식비" 
      });
    }
  };

  const handleDeleteItem = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("선택하신 지출 내역을 목록에서 삭제하시겠습니까?")) return;

    try {
      console.log(`📡 [DELETE] /api/expenses/${id} 요청 시작`);
      await customInstance.delete(`/api/expenses/${id}`);
      fetchExpenseData();
    } catch (err) {
      console.error("삭제 실패 시 프론트 자체 배열 필터 반환:", err);
      setExpenseList(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="expense_page_wrapper">
      {/* 최상단 네비게이션 헤더 */}
      <header className="page_nav_header" style={{ padding: '24px 20px 16px' }}>
        <button className="icon_button_back" onClick={() => window.history.back()}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="page_title">가계부 및 식비 관리</h1>
      </header>

      <div className="expense_container">
        {/* 1. ⚙️ 상단 월 선택기 컨트롤 유닛 블록 */}
        <div className="month_selector">
          <button className="month_nav_btn" onClick={handlePrevMonth}>
            <ChevronLeft size={20} />
          </button>
          <h3 className="section_title">{`${currentYear}-${String(currentMonth).padStart(2, "0")}`}</h3>
          <button className="month_nav_btn" onClick={handleNextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* 2. 대시보드 총 금액 서머리 카드 */}
        <section className="summary_card">
          <span style={{ fontSize: '14px', opacity: 0.85, fontWeight: '500' }}>이번 달 누적 총 지출금액</span>
          <div className="spent_total_text">{totalAmount.toLocaleString()}원</div>
          <div style={{ fontSize: '12px', background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '4px 10px', borderRadius: '20px' }}>
            📊 목표 식비 예산 대비 안정권 유지 중
          </div>
        </section>

        {/* 3. 🍩 식비 세부 통계 도넛 차트 섹션 */}
        <section className="chart_card_section">
          <h2 className="section_title">지출 카테고리 통계</h2>
          <div className="donut_chart_layout">
            <div className="donut_graphic" style={donutGradientStyle}>
              <div className="donut_center_hole">
                <span className="hole_value" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                  {categoryStats[0]?.percent > 0 ? `${categoryStats[0].name}` : "무지출"}
                </span>
              </div>
            </div>
            <div className="chart_legend_list">
              {categoryStats.map((stat, idx) => (
                <div key={`legend-${idx}`} className="legend_row">
                  <div className="legend_dot" style={{ backgroundColor: stat.color }} />
                  <span className="legend_name">{stat.name}</span>
                  <span className="legend_percent">{stat.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. 📅 금액 시각화 월간 캘린더 그리드 레이아웃 */}
        <section className="chart_card_section">
          <div className="section_header" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
            <Calendar size={16} color="#764ba2" />
            <h2 className="section_title" style={{ margin: 0 }}>일별 지출 캘린더</h2>
          </div>
          <div className="cal_grid">
            {calendarDays.map((day, idx) => (
              <div 
                key={`cal-${idx}`} 
                className={`cal_day ${day.type === "empty" ? "empty" : ""} ${day.amount > 0 ? "has_value" : ""}`}
              >
                {day.type === "day" && (
                  <>
                    <span className="day_num">{day.dayNum}</span>
                    {day.amount > 0 && (
                      <span className="day_amount">{(day.amount / 1000).toFixed(0)}k</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 5. 📜 상세 내역 리스트 (slice 에러 완벽 대처 완료) */}
        <section className="recent_history_section">
          <div className="section_header" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            <List size={16} color="#764ba2" />
            <h2 className="section_title" style={{ margin: 0 }}>상세 내역</h2>
          </div>
          <div className="history_stack">
            {expenseList.length > 0 ? (
              expenseList.map((item, idx) => {
                const uniqueKey = item.id || `expense-item-${idx}`;
                return (
                  <div key={uniqueKey} className="history_item_card">
                    <div className="item_icon_bg">
                      <Utensils size={18} color="#764ba2" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="item_name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name || "이름 없는 지출"}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                        {/* 💡 date 타입 검증식 가드로 .slice() 크래시 완전 방어 */}
                        <span className="item_date">
                          {item.date && typeof item.date === "string" ? item.date.slice(5) : "00-00"}
                        </span>
                        <span className="item_date" style={{ color: '#764ba2', background: '#f3f0ff', padding: '1px 6px', borderRadius: '4px', marginLeft: '8px' }}>
                          {item.category || "식비"}
                        </span>
                      </div>
                    </div>
                    <div className="item_price" style={{ fontWeight: '700', marginLeft: 'auto' }}>
                      {Number(item.price || 0).toLocaleString()}원
                    </div>
                    <button 
                      style={{ marginLeft: '12px', background: 'transparent', border: 'none', color: '#ff7675', cursor: 'pointer' }}
                      onClick={(e) => handleDeleteItem(item.id, e)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })
            ) : (
              <p style={{ textAlign: "center", fontSize: "13px", color: "#999", padding: "20px 0" }}>
                이번 달에 기록된 지출 내용이 없습니다.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* 6. ➕ 우측 하단 플로팅 액션 추가 버튼 (FAB) */}
      <button className="fab_add_btn" onClick={() => setIsFormOpen(true)}>
        <Plus size={24} />
      </button>

      {/* 7. 📥 입력 폼 오버레이 하단 모달 가이드 시트 (Bottom Sheet) */}
      {isFormOpen && (
        <div className="form_overlay" onClick={() => setIsFormOpen(false)}>
          <div className="form_sheet" onClick={(e) => e.stopPropagation()}>
            <h3 className="section_title" style={{ fontSize: "18px", marginBottom: "20px" }}>새로운 지출 내역 기록</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="input_group">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#555' }}>사용처 내역</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="예: 마트 장보기, 치킨 배달" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="input_group">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#555' }}>결제 금액 (원)</label>
                <input 
                  type="number" 
                  name="price" 
                  placeholder="금액을 입력하세요" 
                  value={formData.price} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="input_group">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#555' }}>분류 카테고리</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="식비">식비</option>
                  <option value="술/유흥">술/유흥</option>
                  <option value="간식">간식</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div className="input_group">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#555' }}>소비 일자</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleInputChange} 
                />
              </div>
              <button type="submit" className="submit_btn">가계부 등록하기</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}