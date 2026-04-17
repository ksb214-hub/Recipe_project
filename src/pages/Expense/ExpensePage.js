import React, { useState, useEffect, useMemo } from "react";
import "./ExpensePage.css";
import Header from "../../components/Header/Header";
import ExpenseInputForm from "./ExpenseInputForm";
import { Wallet, ShoppingCart, ArrowLeft, Calendar as CalendarIcon, Plus, Loader2 } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

/**
 * [ExpensePage]
 * 사용자의 지출을 관리하는 페이지입니다.
 * 설계 구조: expense_records(장보기), expense_record_items(품목), monthly_expense_goals(목표)
 */
function ExpensePage() {
  const navigate = useNavigate();

  /* ==========================================================
     1. 데이터 상태 관리 (DB 구조 반영)
     ========================================================== */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 (ESLint 경고 해결)

  // [TABLE: monthly_expense_goals] 목표액 관리
  const [budgetGoal, setBudgetGoal] = useState(500000);
  
  // [TABLE: expense_records & items] 지출 내역 관리
  const [expenseRecords, setExpenseRecords] = useState([
    { 
      id: 1, 
      storeName: "이마트 시흥점", 
      totalAmount: 18500,        
      purchaseDate: "2026-04-07", 
      items: [                    
        { itemId: 1, name: "대파", price: 3000, category: "채소" },
        { itemId: 2, name: "양파", price: 2600, category: "채소" },
        { itemId: 3, name: "삼겹살", price: 12900, category: "육류" }
      ]
    },
    { 
      id: 2, 
      storeName: "편의점", 
      totalAmount: 4500, 
      purchaseDate: "2026-04-05",
      items: [
        { itemId: 4, name: "진라면", price: 4500, category: "가공식품" }
      ]
    }
  ]);

  /* ==========================================================
     2. 백엔드 연동 준비 (API 완성 시 주석 해제하여 사용)
     ========================================================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true); // 데이터 로드 시작
        /* ----------------------------------------------------------
           // 예시: 
           const goalRes = await api.get("/api/expenses/goals/2026/04");
           setBudgetGoal(goalRes.data.amount);

           const recordRes = await api.get("/api/expenses/records/2026/04");
           setExpenseRecords(recordRes.data);
           ---------------------------------------------------------- */
        
        // 시뮬레이션을 위해 0.5초 후 로딩 종료
        setTimeout(() => setIsLoading(false), 500);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ==========================================================
     3. 실시간 통계 계산 (useMemo 활용)
     ========================================================== */
  
  // 총 지출액 합산
  const totalSpent = useMemo(() => 
    expenseRecords.reduce((acc, cur) => acc + cur.totalAmount, 0), [expenseRecords]
  );

  // 카테고리별 비중 계산 (상세 품목 데이터 활용)
  const categorySummary = useMemo(() => {
    const summary = { "육류": 0, "채소": 0, "가공식품": 0, "기타": 0 };
    expenseRecords.forEach(record => {
      record.items.forEach(item => {
        if(summary[item.category] !== undefined) summary[item.category] += item.price;
        else summary["기타"] += item.price;
      });
    });
    return summary;
  }, [expenseRecords]);

  // 도넛 차트 그라데이션
  const chartGradient = useMemo(() => {
    if (totalSpent === 0) return "#e2e8f0";
    const meatStep = (categorySummary["육류"] / totalSpent) * 100;
    const vegStep = meatStep + (categorySummary["채소"] / totalSpent) * 100;
    const procStep = vegStep + (categorySummary["가공식품"] / totalSpent) * 100;
    return `conic-gradient(#764ba2 0% ${meatStep}%, #667eea ${meatStep}% ${vegStep}%, #a5b4fc ${vegStep}% ${procStep}%, #e2e8f0 ${procStep}% 100%)`;
  }, [categorySummary, totalSpent]);

  // 달력 표시용 날짜별 합계
  const dailySummary = useMemo(() => {
    const summary = {};
    expenseRecords.forEach(record => {
      const day = parseInt(record.purchaseDate.split("-")[2]);
      summary[day] = (summary[day] || 0) + record.totalAmount;
    });
    return summary;
  }, [expenseRecords]);

  /* ==========================================================
     4. 이벤트 핸들러
     ========================================================== */
  const handleAddRecord = (newRecord) => setExpenseRecords([newRecord, ...expenseRecords]);

  const handleDeleteRecord = (id) => {
    if(window.confirm("이 장보기 내역을 전체 삭제하시겠습니까?")) {
      setExpenseRecords(expenseRecords.filter(r => r.id !== id));
    }
  };

  // 목표 금액 수정 핸들러 (setBudgetGoal 경고 해결용)
  const handleUpdateGoal = () => {
    const val = prompt("이번 달 목표 식비를 입력하세요 (원)", budgetGoal);
    if (val && !isNaN(val)) setBudgetGoal(Number(val));
  };

  return (
    <div className="expense_page_wrapper">
      <Header />
      
      {/* 데이터 로드 중일 때 보여주는 인디케이터 */}
      {isLoading && (
        <div className="loading_overlay">
          <Loader2 className="animate-spin" size={24} color="#764ba2" />
          <span>업데이트 중...</span>
        </div>
      )}

      <main className="expense_container">
        <header className="page_nav_header">
          <button onClick={() => navigate(-1)} className="icon_button_back"><ArrowLeft size={22} /></button>
          <h2 className="page_title">4월 식비 분석</h2>
        </header>

        {/* 1. 요약 카드 (목표액 클릭 시 수정 가능) */}
        <section className="summary_card" onClick={handleUpdateGoal} style={{ cursor: 'pointer' }}>
          <div className="summary_header"><p>현재 총 지출</p><Wallet size={18} /></div>
          <h2 className="spent_total_text">{totalSpent.toLocaleString()}원</h2>
          <div className="bar_track">
            <div className="bar_fill" style={{ width: `${Math.min((totalSpent/budgetGoal)*100, 100)}%` }}></div>
          </div>
          <p className="budget_info">목표 {budgetGoal.toLocaleString()}원 대비 {Math.round((totalSpent/budgetGoal)*100)}% 지출</p>
        </section>

        {/* 2. 카테고리 비중 */}
        <section className="chart_card_section">
          <h3 className="section_title">지출 카테고리 비중</h3>
          <div className="donut_chart_layout">
            <div className="donut_graphic" style={{ background: chartGradient }}>
              <div className="donut_center_hole"><span className="hole_value">{Math.floor(totalSpent/10000)}만</span></div>
            </div>
            <div className="chart_legend_list">
              <LegendItem color="#764ba2" name="육류" percent={Math.round((categorySummary["육류"]/totalSpent)*100) || 0} />
              <LegendItem color="#667eea" name="채소" percent={Math.round((categorySummary["채소"]/totalSpent)*100) || 0} />
              <LegendItem color="#a5b4fc" name="가공" percent={Math.round((categorySummary["가공식품"]/totalSpent)*100) || 0} />
              <LegendItem color="#e2e8f0" name="기타" percent={Math.round((categorySummary["기타"]/totalSpent)*100) || 0} />
            </div>
          </div>
        </section>

        {/* 3. 지출 달력 */}
        <section className="chart_card_section">
          <div className="section_header_row"><h3 className="section_title">지출 달력</h3><CalendarIcon size={16} color="#764ba2" /></div>
          <div className="cal_grid">
            {/* 4월 기준 공백 (수정 필요 시 조절) */}
            {Array(3).fill(null).map((_, i) => <div key={`e-${i}`} className="cal_day empty"></div>)}
            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
              const amt = dailySummary[day] || 0;
              return (
                <div key={day} className={`cal_day ${amt > 0 ? 'has_value' : ''}`}>
                  <span className="day_num">{day}</span>
                  {amt > 0 && <span className="day_amount">{(amt/1000).toFixed(1)}k</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. 장보기 내역 리스트 */}
        <section className="recent_history_section">
          <h3 className="section_title">장보기 내역</h3>
          <div className="history_stack">
            {expenseRecords.map(record => (
              <div key={record.id} className="history_item_card" onClick={() => handleDeleteRecord(record.id)}>
                <div className="item_icon_bg"><ShoppingCart size={16} color="#764ba2" /></div>
                <div className="item_info_text">
                  <p className="item_name">{record.storeName} <span className="item_date">{record.purchaseDate.slice(5)}</span></p>
                  <p className="item_cat">{record.items.length}개 품목</p>
                </div>
                <p className="item_price">-{record.totalAmount.toLocaleString()}원</p>
              </div>
            ))}
          </div>
        </section>

        {/* 추가 버튼 (FAB) */}
        <button className="fab_add_btn" onClick={() => setIsFormOpen(true)}><Plus size={28} /></button>
        
        {/* 입력 폼 모달 */}
        {isFormOpen && <ExpenseInputForm onAdd={handleAddRecord} onClose={() => setIsFormOpen(false)} />}
      </main>
    </div>
  );
}

// 범례 컴포넌트
const LegendItem = ({ color, name, percent }) => (
  <div className="legend_row">
    <span className="legend_dot" style={{ backgroundColor: color }}></span>
    <span className="legend_name">{name}</span>
    <span className="legend_percent">{percent}%</span>
  </div>
);

export default ExpensePage;