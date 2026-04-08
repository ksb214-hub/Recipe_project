import React, { useState, useMemo } from "react";
import "./ExpensePage.css";
import Header from "../../components/Header/Header";
import ExpenseInputForm from "./ExpenseInputForm";
import { Wallet, ShoppingCart, ArrowLeft, Calendar as CalendarIcon, Plus } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

function ExpensePage() {
  const navigate = useNavigate();

  /* ==========================================================
     1. 데이터 상태 관리
     ========================================================== */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [budgetGoal] = useState(500000);
  
  // 성빈님이 직접 관리할 핵심 데이터 리스트
  const [recentPurchases, setRecentPurchases] = useState([
    { id: 1, name: "대파 & 양파 세트", price: 5600, category: "채소", date: "2026.04.07" },
    { id: 2, name: "냉동 닭가슴살 1kg", price: 12900, category: "육류", date: "2026.04.08" },
    { id: 3, name: "진라면 매운맛", price: 4500, category: "가공식품", date: "2026.04.05" }
  ]);

  /* ==========================================================
     2. 실시간 계산 로직 (그래프 및 통계)
     ========================================================== */
  
  // [계산] 총 지출액
  const totalSpent = useMemo(() => 
    recentPurchases.reduce((acc, cur) => acc + cur.price, 0), [recentPurchases]
  );

  // [계산] 카테고리별 합계 (도넛 그래프용)
  const categorySummary = useMemo(() => {
    const summary = { "육류": 0, "채소": 0, "가공식품": 0, "기타": 0 };
    recentPurchases.forEach(item => {
      if(summary[item.category] !== undefined) summary[item.category] += item.price;
      else summary["기타"] += item.price;
    });
    return summary;
  }, [recentPurchases]);

  // [계산] 도넛 그래프 CSS Gradient 생성
  const chartGradient = useMemo(() => {
    if (totalSpent === 0) return "#e2e8f0"; // 데이터 없을 때 회색
    const meatStep = (categorySummary["육류"] / totalSpent) * 100;
    const vegStep = meatStep + (categorySummary["채소"] / totalSpent) * 100;
    const procStep = vegStep + (categorySummary["가공식품"] / totalSpent) * 100;
    
    return `conic-gradient(
      #764ba2 0% ${meatStep}%, 
      #667eea ${meatStep}% ${vegStep}%, 
      #a5b4fc ${vegStep}% ${procStep}%, 
      #e2e8f0 ${procStep}% 100%
    )`;
  }, [categorySummary, totalSpent]);

  // [계산] 날짜별 지출 (달력용)
  const dailySummary = useMemo(() => {
    const summary = {};
    recentPurchases.forEach(item => {
      const day = parseInt(item.date.split(".")[2]);
      summary[day] = (summary[day] || 0) + item.price;
    });
    return summary;
  }, [recentPurchases]);

  /* ==========================================================
     3. 핸들러
     ========================================================== */
  const handleAddPurchase = (newItem) => setRecentPurchases([newItem, ...recentPurchases]);
  const handleDeletePurchase = (id) => setRecentPurchases(recentPurchases.filter(i => i.id !== id));

  return (
    <div className="expense_page_wrapper">
      <Header />
      <main className="expense_container">
        
        <header className="page_nav_header">
          <button onClick={() => navigate(-1)} className="icon_button_back"><ArrowLeft size={22} /></button>
          <h2 className="page_title">4월 식비 분석</h2>
        </header>

        {/* 1. 요약 카드 */}
        <section className="summary_card">
          <div className="summary_header"><p>현재 총 지출</p><Wallet size={18} /></div>
          <h2 className="spent_total_text">{totalSpent.toLocaleString()}원</h2>
          <div className="bar_track"><div className="bar_fill" style={{ width: `${Math.min((totalSpent/budgetGoal)*100, 100)}%` }}></div></div>
        </section>

        {/* 2. 도넛 그래프 섹션 (부활!) */}
        <section className="chart_card_section">
          <h3 className="section_title">지출 카테고리 비중</h3>
          <div className="donut_chart_layout">
            <div className="donut_graphic" style={{ background: chartGradient }}>
              <div className="donut_center_hole">
                <span className="hole_value">{Math.floor(totalSpent/10000)}만</span>
              </div>
            </div>
            <div className="chart_legend_list">
              <LegendItem color="#764ba2" name="육류" percent={Math.round((categorySummary["육류"]/totalSpent)*100) || 0} />
              <LegendItem color="#667eea" name="채소" percent={Math.round((categorySummary["채소"]/totalSpent)*100) || 0} />
              <LegendItem color="#a5b4fc" name="가공" percent={Math.round((categorySummary["가공식품"]/totalSpent)*100) || 0} />
              <LegendItem color="#e2e8f0" name="기타" percent={Math.round((categorySummary["기타"]/totalSpent)*100) || 0} />
            </div>
          </div>
        </section>

        {/* 3. 달력 섹션 */}
        <section className="chart_card_section">
          <div className="section_header_row"><h3 className="section_title">지출 달력</h3><CalendarIcon size={16} color="#764ba2" /></div>
          <div className="cal_grid">
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

        {/* 4. 구매 내역 리스트 */}
        <section className="recent_history_section">
          <h3 className="section_title">구매 내역</h3>
          <div className="history_stack">
            {recentPurchases.map(item => (
              <div key={item.id} className="history_item_card" onClick={() => {if(window.confirm("삭제할까요?")) handleDeletePurchase(item.id)}}>
                <div className="item_icon_bg"><ShoppingCart size={16} color="#764ba2" /></div>
                <div className="item_info_text">
                  <p className="item_name">{item.name} <span className="item_date">{item.date.slice(5)}</span></p>
                  <p className="item_cat">{item.category}</p>
                </div>
                <p className="item_price">-{item.price.toLocaleString()}원</p>
              </div>
            ))}
          </div>
        </section>

        <button className="fab_add_btn" onClick={() => setIsFormOpen(true)}><Plus size={28} /></button>
        {isFormOpen && <ExpenseInputForm onAdd={handleAddPurchase} onClose={() => setIsFormOpen(false)} />}
      </main>
    </div>
  );
}

// 범례 아이템 컴포넌트
const LegendItem = ({ color, name, percent }) => (
  <div className="legend_row">
    <span className="legend_dot" style={{ backgroundColor: color }}></span>
    <span className="legend_name">{name}</span>
    <span className="legend_percent">{percent}%</span>
  </div>
);

export default ExpensePage;