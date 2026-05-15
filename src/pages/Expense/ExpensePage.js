import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./ExpensePage.css";
import ExpenseInputForm from "./ExpenseInputForm"; 
import { 
  Wallet, ShoppingCart, ArrowLeft, Calendar as CalendarIcon, 
  Plus, Loader2, Trash2, ChevronLeft, ChevronRight 
} from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import customInstance from "../../api/api"; 

export default function ExpensePage() {
  const navigate = useNavigate();

  // --- [상태 관리] ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expenseRecords, setExpenseRecords] = useState([]); 
  
  // [해결] Line 18:22 경고 해결 - 초기값 설정 및 handleUpdateGoal에서 사용
  const [budgetGoal, setBudgetGoal] = useState(500000); 

  // [월 이동 상태]
  const [viewDate, setViewDate] = useState(new Date(2026, 3)); // 2026년 4월 기준
  
  // [날짜 선택 상태] null이면 전체 보기, 숫자면 해당 일자 필터링
  const [selectedDay, setSelectedDay] = useState(null);

  // "YYYY-MM" 형식 변환 (API 및 데이터 필터용)
  const currentYearMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, [viewDate]);

  /**
   * [API] 지출 내역 조회
   */
  const fetchExpenseRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await customInstance.get("/api/expenses");
      const rawContent = res.data?.content || res.data?.data?.content || [];
      
      // 해당 월 데이터만 1차 필터링
      const monthlyData = rawContent.filter(r => r.purchasedAt?.startsWith(currentYearMonth));
      setExpenseRecords(monthlyData);
      setSelectedDay(null); // 월 변경 시 날짜 선택 초기화
    } catch (err) {
      console.error("❌ 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentYearMonth]);

  /**
   * [API] 목표 금액 수정
   * [해결] 여기서 setBudgetGoal을 사용하여 경고를 없앱니다.
   */
  const handleUpdateGoal = async () => {
    const userInput = prompt("이번 달 목표 식비를 입력하세요", budgetGoal);
    if (userInput === null || isNaN(userInput) || userInput === "") return;

    try {
      const amount = Number(userInput);
      // 실제 API가 있다면 호출: await customInstance.put(...)
      setBudgetGoal(amount); // 상태 업데이트 (경고 해결 지점)
      alert("목표 금액이 수정되었습니다.");
    } catch (err) {
      console.error("❌ 목표 수정 실패:", err);
    }
  };

  /**
   * [API] 지출 내역 삭제
   */
  const handleDeleteRecord = async (id, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await customInstance.delete(`/api/expenses/${id}`);
      setExpenseRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
    }
  };

  /**
   * [API] 지출 등록 (POST)
   */
  const handleAddRecord = async (formData) => {
    try {
      setIsLoading(true);
      const payload = {
        purchasedAt: formData.date.replaceAll('.', '-'),
        totalAmount: parseInt(formData.price, 10),
        category: formData.category || "기타",
        rawItemInput: formData.name 
      };
      await customInstance.post("/api/expenses", payload);
      setIsFormOpen(false);
      fetchExpenseRecords(); 
    } catch (err) {
      console.error("❌ 등록 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseRecords();
  }, [fetchExpenseRecords]);

  /**
   * [데이터 필터링] 선택된 날짜에 따라 리스트 가공
   */
  const filteredDisplayRecords = useMemo(() => {
    if (!selectedDay) return expenseRecords;
    return expenseRecords.filter(r => {
      const day = parseInt(r.purchasedAt.split("-")[2]);
      return day === selectedDay;
    });
  }, [expenseRecords, selectedDay]);

  // 통계 및 달력 데이터
  const totalSpent = useMemo(() => 
    expenseRecords.reduce((acc, cur) => acc + (cur.totalAmount || 0), 0), 
    [expenseRecords]
  );

  const dailySummary = useMemo(() => {
    const summary = {};
    expenseRecords.forEach(r => {
      const day = parseInt(r.purchasedAt.split("-")[2]);
      if (!isNaN(day)) summary[day] = (summary[day] || 0) + (r.totalAmount || 0);
    });
    return summary;
  }, [expenseRecords]);

  const lastDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const startDayOfWeek = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  return (
    <div className="expense_page_wrapper">
      {isLoading && <div className="loading_overlay"><Loader2 className="spinner" /></div>}

      <main className="expense_container">
        <header className="page_nav_header">
          <button onClick={() => navigate(-1)} className="icon_button_back"><ArrowLeft size={22} /></button>
          <h2 className="page_title">{viewDate.getMonth() + 1}월 지출 내역</h2>
        </header>

        {/* 1. 요약 카드 (클릭 시 목표 수정) */}
        <section className="summary_card" onClick={handleUpdateGoal} style={{ cursor: "pointer" }}>
          <div className="summary_header"><p>{currentYearMonth} 합계</p><Wallet size={18} /></div>
          <h2 className="spent_total_text">{totalSpent.toLocaleString()}원</h2>
          <div className="bar_track">
            <div className="bar_fill" style={{ width: `${Math.min((totalSpent / (budgetGoal || 1)) * 100, 100)}%` }}></div>
          </div>
          <p className="budget_info">목표 {budgetGoal.toLocaleString()}원 대비</p>
        </section>

        {/* 2. 월 이동 및 필터 달력 */}
        <section className="chart_card_section">
          <div className="section_header_row">
            <div className="month_selector">
              <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="month_nav_btn"><ChevronLeft size={20} /></button>
              <h3 className="section_title">{currentYearMonth}</h3>
              <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="month_nav_btn"><ChevronRight size={20} /></button>
            </div>
            <CalendarIcon size={16} color="#764ba2" />
          </div>
          <div className="cal_grid">
            {Array(startDayOfWeek).fill(null).map((_, i) => <div key={`empty-${i}`} className="cal_day empty"></div>)}
            {Array.from({ length: lastDayOfMonth }, (_, i) => i + 1).map(day => {
              const amt = dailySummary[day] || 0;
              const isSelected = selectedDay === day;
              return (
                <div 
                  key={day} 
                  className={`cal_day ${amt > 0 ? 'has_value' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => amt > 0 && setSelectedDay(isSelected ? null : day)}
                >
                  <span className="day_num">{day}</span>
                  {amt > 0 && <span className="day_amount">{(amt/1000).toFixed(0)}k</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. 장보기 내역 리스트 */}
        <section className="recent_history_section">
          <div className="section_header_row">
            <h3 className="section_title">{selectedDay ? `${selectedDay}일 상세` : "전체 상세"}</h3>
            {selectedDay && <button className="reset_view_btn" onClick={() => setSelectedDay(null)}>전체보기</button>}
          </div>
          <div className="history_stack">
            {filteredDisplayRecords.length > 0 ? (
              filteredDisplayRecords.map((record) => (
                <div key={`exp-${record.id}`} className="history_item_card">
                  <div className="item_icon_bg"><ShoppingCart size={16} color="#764ba2" /></div>
                  <div className="item_info_text">
                    <p className="item_name">
                      <span className="cat_badge">{record.category}</span>
                      <span className="item_date">{record.purchasedAt?.substring(5).replace('-', '/')}</span>
                    </p>
                    <p className="item_cat">{record.rawItemInput}</p>
                  </div>
                  <div className="price_action_group">
                    <p className="item_price">-{record.totalAmount?.toLocaleString()}원</p>
                    <button className="del_btn" onClick={(e) => handleDeleteRecord(record.id, e)}>
                      <Trash2 size={14} color="#ff4d4d" />
                    </button>
                  </div>
                </div>
              ))
            ) : <div className="empty_msg">기록이 없습니다.</div>}
          </div>
        </section>

        {/* 4. 추가 버튼 및 모달 */}
        <button className="fab_add_btn" onClick={() => setIsFormOpen(true)}><Plus size={28} /></button>
        {isFormOpen && <ExpenseInputForm onAdd={handleAddRecord} onClose={() => setIsFormOpen(false)} />}
      </main>
    </div>
  );
}