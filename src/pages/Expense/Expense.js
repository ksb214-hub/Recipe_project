import React, { useState } from "react";
import "./ExpensePage.css";
import { Wallet, TrendingDown, ShoppingCart, ChevronRight } from "lucide-react";

function ExpensePage() {
  // 데이터 샘플
  const budgetGoal = 500000;
  const currentSpent = 315000;
  const lastMonthSpent = 420000; // 5. 저번달 지출
  
  const remainingBudget = budgetGoal - currentSpent;
  const dailyLimit = Math.floor(remainingBudget / 22); // 3. 남은 일수 기준 최대 비용

  const recentPurchases = [
    { id: 1, name: "대파 & 양파 세트", price: 5600, category: "채소" },
    { id: 2, name: "냉동 닭가슴살 1kg", price: 12900, category: "육류" },
  ];

  return (
    <div className="expense_page">
      <div className="expense_container">
        
        {/* 2. 지출 목표 vs 현재 지출 (상단 카드) */}
        <section className="summary_card">
          <div className="summary_header">
            <p>4월 사용 금액</p>
            <Wallet size={18} />
          </div>
          <h2 className="spent_amount">{currentSpent.toLocaleString()}원</h2>
          <div className="goal_progress">
            <div className="progress_text">
              <span>목표 {budgetGoal.toLocaleString()}원</span>
              <span>{Math.floor((currentSpent/budgetGoal)*100)}%</span>
            </div>
            <div className="progress_bar">
              <div className="fill" style={{ width: `${(currentSpent/budgetGoal)*100}%` }}></div>
            </div>
          </div>
        </section>

        {/* 5. 저번달 비교 시각화 그래프 */}
        <section className="comparison_section">
          <h3>지출 비교</h3>
          <div className="chart_container">
            <div className="bar_group">
              <div className="bar last_month" style={{ height: '80%' }}>
                <span className="bar_val">{lastMonthSpent / 10000}만</span>
              </div>
              <p className="bar_label">지난달</p>
            </div>
            <div className="bar_group">
              <div className="bar this_month" style={{ height: `${(currentSpent / lastMonthSpent) * 80}%` }}>
                <span className="bar_val">{currentSpent / 10000}만</span>
              </div>
              <p className="bar_label">이번달</p>
            </div>
            <div className="comparison_result">
              <TrendingDown size={20} color="#48bb78" />
              <p>지난달보다 <span>{(lastMonthSpent - currentSpent).toLocaleString()}원</span> 적게 쓰고 있어요!</p>
            </div>
          </div>
        </section>

        {/* 3. 내가 사용해야 하는 최대 비용 (가이드) */}
        <section className="daily_limit_box">
          <div className="limit_content">
            <p className="limit_title">오늘의 권장 지출</p>
            <h4 className="limit_price">최대 {dailyLimit.toLocaleString()}원</h4>
          </div>
          <div className="limit_tag">Good!</div>
        </section>

        {/* 4. 내가 지금 산 음식들 (최근 목록) */}
        <section className="recent_list">
          <div className="list_header">
            <h3>지금 산 음식들</h3>
            <ChevronRight size={20} color="#ccc" />
          </div>
          <div className="item_stack">
            {recentPurchases.map(item => (
              <div key={item.id} className="purchase_item">
                <div className="item_icon"><ShoppingCart size={16} color="#764ba2" /></div>
                <div className="item_info">
                  <p className="item_name">{item.name}</p>
                  <p className="item_cat">{item.category}</p>
                </div>
                <p className="item_price">-{item.price.toLocaleString()}원</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default ExpensePage;