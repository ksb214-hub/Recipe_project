import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./ExpensePage.css";
import ExpenseInputForm from "./ExpenseInputForm";
import { Wallet, ShoppingCart, ArrowLeft, Calendar as CalendarIcon, Plus, Loader2, ChevronLeft, ChevronRight, Edit2, Trash2, X, Info } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import customInstance from "../../api/api";

/**
 * [ExpensePage]
 * 사용자의 지출 관리, 월별 단일 목표 설정 및 장보기 내역 상세 조회를 제공하는 페이지입니다.
 */
export default function ExpensePage() {
  const navigate = useNavigate();

  /* ==========================================================
     1. 데이터 및 날짜 상태 관리
     ========================================================== */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 

  // 현재 선택된 연도와 월 상태 관리 (기본값: 2026년 4월)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4);

  // [TABLE: monthly_expense_goals] 목표액 관리 (선택된 연월당 '하나만' 유지)
  const [budgetGoal, setBudgetGoal] = useState(500000);
  
  // [TABLE: expense_records & items] 지출 내역 리스트 관리
  const [expenseRecords, setExpenseRecords] = useState([]);

  // 🎯 지출 내역 상세 조회(GET /api/expenses/{id})를 위한 상태 관리
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // QA 명세 및 시스템에서 지정한 고정 카테고리 목록 정의 (카테고리 자유 입력 미지원 스펙)
  const ALLOWED_CATEGORIES = useMemo(() => [
    "채소", "과일", "육류", "수산물", "유제품", 
    "가공식품", "곡류/면", "양념/조미료", "음료", "간식", "기타"
  ], []);

  /* ==========================================================
     2. 백엔드 연동 및 목표액 단일 동기화 로직
     ========================================================== */
  const fetchExpenseData = useCallback(async () => {
    try {
      setIsLoading(true);
      const formattedMonth = String(currentMonth).padStart(2, "0");
      const yearMonth = `${currentYear}-${formattedMonth}`; // 고유 연월 키 생성
      
      console.log(`📡 [GET] 지출 내역 및 목표 조회 시작 (${yearMonth})`);
      
      // 1. 지출 내역 리스트 가져오기
      const res = await customInstance.get("/api/expenses", {
        params: { year: currentYear, month: formattedMonth }
      });

      // 2. 🎯 [수정] 같은 연월의 '단 하나뿐인' 목표 금액 단건 조회 (백엔드 구조 반영)
      try {
        const goalRes = await customInstance.get(`/api/expenses/monthly-goals/${yearMonth}`);
        
        // 백엔드 성공 포맷의 공통 감싸기 구조인 .data 처리 반영
        const resData = goalRes.data?.data || goalRes.data; 
        
        if (resData) {
          // 백엔드 필드 명세인 targetAmount로 데이터 파싱 시도
          const serverGoal = resData.targetAmount !== undefined ? resData.targetAmount : resData;
          setBudgetGoal(Number(serverGoal));
        }
      } catch (goalErr) {
        console.warn(`⚠️ ${yearMonth}에 등록된 목표가 없어 기본값(500,000)으로 세팅합니다.`);
        setBudgetGoal(500000); 
      }

      // 3. 응답 데이터 파싱 및 매핑
      let finalData = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          finalData = res.data;
        } else if (Array.isArray(res.data.data)) {
          finalData = res.data.data;
        } else if (res.data.data && Array.isArray(res.data.data.content)) {
          finalData = res.data.data.content;
        }
      }

      if (Array.isArray(finalData)) {
        const mappedData = finalData.map(record => ({
          id: record.id || Date.now(),
          storeName: record.rawItemInput || record.storeName || "식재료 구매",
          totalAmount: record.totalAmount !== undefined ? record.totalAmount : (record.price || 0),
          purchaseDate: record.purchasedAt || record.purchaseDate || `${currentYear}-${formattedMonth}-20`,
          items: record.items || [
            { 
              itemId: Date.now(), 
              name: record.rawItemInput || "품목", 
              price: record.totalAmount || 0, 
              category: ALLOWED_CATEGORIES.includes(record.category) ? record.category : "기타" 
            }
          ]
        }));
        setExpenseRecords(mappedData);
      } else {
        setExpenseRecords([]);
      }
    } catch (err) {
      console.error("❌ 데이터 로딩 실패 (데모용 기본 목데이터 매핑):", err);
      const formattedMonth = String(currentMonth).padStart(2, "0");
      setExpenseRecords([
        { 
          id: 101, 
          storeName: "부채살", 
          totalAmount: 100000,        
          purchaseDate: `${currentYear}-${formattedMonth}-08`, 
          items: [                    
            { itemId: 1, name: "부채살", price: 100000, category: "육류" }
          ]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [currentYear, currentMonth, ALLOWED_CATEGORIES]);

  useEffect(() => {
    fetchExpenseData();
  }, [fetchExpenseData]);

  /* ==========================================================
     🎯 3. 지출 내역 상세 조회 핸들러 (GET /api/expenses/{id})
     ========================================================== */
  const handleOpenDetail = async (id) => {
    try {
      setIsLoading(true);
      console.log(`📡 [GET] /api/expenses/${id} 단건 상세 조회 요청`);
      
      const res = await customInstance.get(`/api/expenses/${id}`);
      if (res.data) {
        setSelectedExpense(res.data?.data || res.data);
      } else {
        const localRecord = expenseRecords.find(r => r.id === id);
        setSelectedExpense(localRecord);
      }
      setIsDetailOpen(true);
    } catch (err) {
      console.error("❌ 지출 상세 조회 실패 (로컬 캐시 데이터 컨버전 활용):", err);
      const localRecord = expenseRecords.find(r => r.id === id);
      if (localRecord) {
        setSelectedExpense(localRecord);
        setIsDetailOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ==========================================================
     월 제어 이동 핸들러
     ========================================================== */
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

  /* ==========================================================
     4. 실시간 분석 차트 및 통계 연산
     ========================================================== */
  const totalSpent = useMemo(() => 
    (expenseRecords || []).reduce((acc, cur) => acc + (cur.totalAmount || 0), 0), 
    [expenseRecords]
  );

  const categorySummary = useMemo(() => {
    const summary = {};
    ALLOWED_CATEGORIES.forEach(cat => { summary[cat] = 0; });
    
    (expenseRecords || []).forEach(record => {
      (record.items || []).forEach(item => {
        const cat = item.category;
        if (summary.hasOwnProperty(cat)) {
          summary[cat] += (item.price || 0);
        } else {
          summary["기타"] += (item.price || 0);
        }
      });
    });
    return summary;
  }, [expenseRecords, ALLOWED_CATEGORIES]);

  const { chartGradient, orderedStats } = useMemo(() => {
    const colors = {
      "채소": "#764ba2", "과일": "#667eea", "육류": "#ff7675", "수산물": "#00b894", 
      "유제품": "#fdcb6e", "가공식품": "#0984e3", "곡류/면": "#e84393", "양념/조미료": "#2d3436", 
      "음료": "#ffeaa7", "간식": "#fab1a0", "기타": "#e2e8f0"
    };

    if (totalSpent === 0) return { chartGradient: "#e2e8f0", orderedStats: [] };

    let currentPercent = 0;
    const gradientParts = [];
    const stats = [];

    ALLOWED_CATEGORIES.forEach(cat => {
      const amount = categorySummary[cat] || 0;
      if (amount > 0) {
        const percent = (amount / totalSpent) * 100;
        const nextPercent = currentPercent + percent;
        gradientParts.push(`${colors[cat]} ${currentPercent}% ${nextPercent}%`);
        stats.push({ name: cat, color: colors[cat], percent: Math.round(percent), amount });
        currentPercent = nextPercent;
      }
    });

    if (currentPercent < 100 && gradientParts.length > 0) {
      gradientParts.push(`#e2e8f0 ${currentPercent}% 100%`);
    }

    return { 
      chartGradient: gradientParts.length > 0 ? `conic-gradient(${gradientParts.join(", ")})` : "#e2e8f0", 
      orderedStats: stats.sort((a, b) => b.amount - a.amount) 
    };
  }, [categorySummary, totalSpent, ALLOWED_CATEGORIES]);

  const dailySummary = useMemo(() => {
    const summary = {};
    (expenseRecords || []).forEach(record => {
      if (record?.purchaseDate && typeof record.purchaseDate === 'string') {
        const day = parseInt(record.purchaseDate.split("-")[2], 10);
        if (!isNaN(day)) summary[day] = (summary[day] || 0) + (record.totalAmount || 0);
      }
    });
    return summary;
  }, [expenseRecords]);

  const calendarData = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth, 0).getDate();
    return { firstDayIndex, totalDays };
  }, [currentYear, currentMonth]);

  /* ==========================================================
     5. 비즈니스 로직 및 CRUD 핸들러 (명세 규칙 철저 엄수)
     ========================================================== */
  
  /**
   * 🎯 [PUT] /api/expenses/monthly-goals/{yearMonth} 목표 등록 및 수정
   * [수정 반영 완료]: 성공한 curl 명세에 따라 Key를 'targetAmount'로 완전 변경
   */
  const handleUpdateGoal = async (e) => {
    e.stopPropagation();
    const val = prompt(`이번 달(${currentMonth}월) 목표 식비를 정수 숫자로 입력하세요 (원)`, budgetGoal);
    if (val === null) return; 
    
    const parsedGoal = parseInt(val, 10);
    if (isNaN(parsedGoal) || parsedGoal < 0) {
      return alert("올바른 목표 금액(0원 이상의 정수)을 입력해 주세요.");
    }

    const formattedMonth = String(currentMonth).padStart(2, "0");
    const yearMonth = `${currentYear}-${formattedMonth}`; 

    try {
      setIsLoading(true);
      // curl 동기화: 백엔드 명세 규칙 { targetAmount: 300000 }으로 전송
      const res = await customInstance.put(`/api/expenses/monthly-goals/${yearMonth}`, {
        targetAmount: parsedGoal
      });

      if (res.status === 200 || res.status === 201) {
        alert(`${currentMonth}월 식비 목표가 정상 저장되었습니다.`);
        setBudgetGoal(parsedGoal); 
      }
    } catch (err) {
      console.error("❌ 목표 등록 실패 (로컬 브라우저 세션 가상 유지):", err);
      setBudgetGoal(parsedGoal);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🛠️ [PATCH] /api/expenses/{id} 지출 내역 수정 
   */
  const handleUpdateRecord = async (record, e) => {
    e.stopPropagation(); 

    const newName = prompt("수정할 내역(사용처)을 입력하세요:", record.storeName);
    if (newName === null) return; 
    if (!newName.trim()) return alert("사용처 이름은 필수 입력 항목입니다.");

    const newPrice = prompt("수정할 금액을 숫자로 입력하세요:", record.totalAmount);
    if (newPrice === null) return;
    const parsedPrice = parseInt(newPrice, 10); 
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return alert("올바른 결제 금액을 입력해 주세요. (0 이하의 금액은 등록 및 수정이 불가능합니다.)");
    }

    const currentCat = record.items?.[0]?.category || "기타";
    const newCategory = prompt(
      `수정할 카테고리를 입력하세요:\n(${ALLOWED_CATEGORIES.join(", ")})`, 
      currentCat
    );
    if (newCategory === null) return;

    let validCategory = newCategory.trim();
    if (!ALLOWED_CATEGORIES.includes(validCategory)) {
      alert("지정되지 않은 분류 체계입니다. '기타' 카테고리로 매핑을 강제 전환합니다.");
      validCategory = "기타";
    }

    const targetDate = record.purchaseDate; 

    const patchPayload = {
      hasPurchasedAt: true,
      hasTotalAmount: true,
      hasCategory: true,
      hasRawItemInput: true,
      purchasedAt: targetDate,       
      totalAmount: parsedPrice,      
      category: validCategory,       
      rawItemInput: newName.trim()   
    };

    try {
      console.log(`📡 [PATCH] 지출 수정 요청 발송 /api/expenses/${record.id}:`, patchPayload);
      const res = await customInstance.patch(`/api/expenses/${record.id}`, patchPayload);
      if (res.status === 200 || res.status === 201) {
        fetchExpenseData(); 
      }
    } catch (err) {
      console.error("❌ 수정 실패 (로컬 상태 어레이 실시간 폴백 맵 가동):", err);
      setExpenseRecords(prev => 
        prev.map(r => r.id === record.id 
          ? { 
              ...r, 
              storeName: newName.trim(), 
              totalAmount: parsedPrice,
              items: [{ ...r.items[0], name: newName.trim(), price: parsedPrice, category: validCategory }]
            } 
          : r
        )
      );
    }
  };

  /**
   * [POST] /api/expenses 지출 등록 핸들러
   */
  const handleAddRecord = async (newRecord) => {
    const parsedPrice = parseInt(newRecord.price, 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return alert("올바른 결제 금액을 입력해 주세요. (0 이하 불가)");
    if (!ALLOWED_CATEGORIES.includes(newRecord.category)) return alert("올바르지 않은 카테고리입니다.");

    const todayStr = new Date().toISOString().split("T")[0];
    const targetDate = newRecord.date ? newRecord.date.replaceAll('.', '-') : todayStr;

    try {
      await customInstance.post("/api/expenses", {
        purchasedAt: targetDate, 
        totalAmount: parsedPrice, 
        category: newRecord.category,              
        rawItemInput: newRecord.name.trim()          
      });
      fetchExpenseData(); 
    } catch (err) {
      console.warn("❌ 등록 서버 전송 실패 (데모 연동용 로컬 강제 푸시 수행):", err);
      const formatted = {
        id: Date.now(),
        storeName: newRecord.name,      
        totalAmount: parsedPrice,   
        purchaseDate: targetDate, 
        items: [{ itemId: Date.now(), name: newRecord.name, price: parsedPrice, category: newRecord.category }]
      };
      setExpenseRecords(prev => [formatted, ...prev]);
    }
  };

  /**
   * [DELETE] /api/expenses/{id} 지출 내역 삭제
   */
  const handleDeleteRecord = async (id, e) => {
    e.stopPropagation(); 
    if(!window.confirm("이 장보기 지출 내역을 데이터베이스에서 완전히 삭제하시겠습니까?")) return;
    try {
      await customInstance.delete(`/api/expenses/${id}`);
      fetchExpenseData();
    } catch (err) {
      setExpenseRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="expense_page_wrapper">
      
      {isLoading && (
        <div className="loading_overlay">
          <Loader2 className="animate-spin" size={24} color="#764ba2" />
          <span>업데이트 동기화 중...</span>
        </div>
      )}

      <main className="expense_container">
        <header className="page_nav_header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => navigate(-1)} className="icon_button_back"><ArrowLeft size={22} /></button>
            <h2 className="page_title">{currentMonth}월 식비 분석</h2>
          </div>
          
          <div className="month_navigation_controls" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f1f3f7', padding: '4px 8px', borderRadius: '20px' }}>
            <button onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={18} color="#555" />
            </button>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#333', minWidth: '60px', textAlign: 'center' }}>
              {currentYear}.{String(currentMonth).padStart(2, "0")}
            </span>
            <button onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={18} color="#555" />
            </button>
          </div>
        </header>

        {/* 1. 월별 유일 목표 요약 카드 */}
        <section className="summary_card" onClick={handleUpdateGoal} style={{ cursor: 'pointer' }} title="목표 금액 수정하기">
          <div className="summary_header">
            <p>{currentMonth}월 총 지출</p>
            <Wallet size={18} style={{ color: '#764ba2' }} />
          </div>
          <h2 className="spent_total_text">{totalSpent.toLocaleString()}원</h2>
          <div className="bar_track">
            <div className="bar_fill" style={{ width: `${budgetGoal > 0 ? Math.min((totalSpent/budgetGoal)*100, 100) : 0}%` }}></div>
          </div>
          <p className="budget_info">목표 {budgetGoal.toLocaleString()}원 대비 {budgetGoal > 0 ? Math.round((totalSpent/budgetGoal)*100) : 0}% 지출</p>
        </section>

        {/* 2. 고정 분류 기반 도넛 비중 차트 */}
        <section className="chart_card_section">
          <h3 className="section_title">지출 카테고리 비중</h3>
          <div className="donut_chart_layout">
            <div className="donut_graphic" style={{ background: chartGradient }}>
              <div className="donut_center_hole"><span className="hole_value">{Math.floor(totalSpent/10000)}만</span></div>
            </div>
            <div className="chart_legend_list">
              {orderedStats.length > 0 ? (
                orderedStats.map(stat => (
                  <LegendItem key={stat.name} color={stat.color} name={stat.name} percent={stat.percent} />
                ))
              ) : (
                <p style={{ fontSize: '12px', color: '#999', padding: '10px 0' }}>지출 내역이 없습니다.</p>
              )}
            </div>
          </div>
        </section>

        {/* 3. 지출 달력 컴포넌트 */}
        <section className="chart_card_section">
          <div className="section_header_row">
            <h3 className="section_title">지출 달력</h3>
            <CalendarIcon size={16} color="#764ba2" />
          </div>
          <div className="cal_grid">
            {Array(calendarData.firstDayIndex).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="cal_day empty"></div>
            ))}
            {Array.from({ length: calendarData.totalDays }, (_, i) => i + 1).map(day => {
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

        {/* 4. 장보기 내역 히스토리 스택 */}
        <section className="recent_history_section">
          <h3 className="section_title">{currentMonth}월 장보기 내역</h3>
          <div className="history_stack">
            {expenseRecords.length > 0 ? (
              expenseRecords.map(record => (
                <div 
                  key={record.id} 
                  className="history_item_card" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleOpenDetail(record.id)} 
                >
                  <div className="item_icon_bg">
                    <ShoppingCart size={16} color="#764ba2" />
                  </div>
                  <div className="item_info_text">
                    <p className="item_name">
                      {record.storeName || "정보 없음"} 
                      <span className="item_date">{record.purchaseDate?.slice(5) || ""}</span>
                    </p>
                    <p className="item_cat">
                      {record.items?.length || 1}개 품목 
                      <span style={{ marginLeft: '6px', color: '#764ba2', background: '#f3f0ff', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>
                        {record.items?.[0]?.category || "기타"}
                      </span>
                    </p>
                  </div>
                  <p className="item_price" style={{ marginRight: '8px' }}>
                    -{record.totalAmount?.toLocaleString() || 0}원
                  </p>
                  
                  <div className="card_action_buttons" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={(e) => handleUpdateRecord(record, e)} style={{ background: 'transparent', border: 'none', color: '#4a5568', cursor: 'pointer', padding: '4px' }} title="수정하기"><Edit2 size={15} /></button>
                    <button onClick={(e) => handleDeleteRecord(record.id, e)} style={{ background: 'transparent', border: 'none', color: '#ff7675', cursor: 'pointer', padding: '4px' }} title="삭제하기"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", fontSize: "13px", color: "#999", padding: "20px 0" }}>이 달에 등록된 지출 내역이 없습니다.</p>
            )}
          </div>
        </section>

        {/* ➕ 플로팅 등록용 컴포넌트 버튼 */}
        <button className="fab_add_btn" onClick={() => setIsFormOpen(true)}><Plus size={28} /></button>
        
        {isFormOpen && <ExpenseInputForm onAdd={handleAddRecord} onClose={() => setIsFormOpen(false)} />}

        {/* 🎯 5. 지출 내역 상세 단건 조회 전용 바텀시트/모달 (GET /api/expenses/{id} 출력) */}
        {isDetailOpen && selectedExpense && (
          <div className="form_overlay" onClick={() => setIsDetailOpen(false)}>
            <div className="form_sheet" onClick={(e) => e.stopPropagation()} style={{ minHeight: '320px' }}>
              <div className="form_header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={18} color="#764ba2" />
                  <h3>지출 내역 상세 조회</h3>
                </div>
                <button className="close_btn" onClick={() => setIsDetailOpen(false)}><X size={20} /></button>
              </div>

              <div className="detail_modal_body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#f8f9fa', padding: '14px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#764ba2', fontWeight: 'bold', background: '#f3f0ff', padding: '3px 8px', borderRadius: '20px' }}>
                    {selectedExpense.category || selectedExpense.items?.[0]?.category || "기타"}
                  </span>
                  <h2 style={{ fontSize: '22px', margin: '8px 0 4px 0', color: '#1a202c', fontWeight: '800' }}>
                    {selectedExpense.rawItemInput || selectedExpense.storeName || "구매 이력"}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#a0aec0', margin: 0 }}>
                    소비 일자: {selectedExpense.purchasedAt || selectedExpense.purchaseDate}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 4px', borderBottom: '1px solid #edf2f7' }}>
                  <span style={{ color: '#4a5568', fontSize: '14px' }}>결제 금액</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#ff7675' }}>
                    {(selectedExpense.totalAmount || selectedExpense.price || 0).toLocaleString()}원
                  </span>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <h4 style={{ fontSize: '13px', color: '#718096', marginBottom: '8px' }}>자유입력형 구매 이력 기준 상세</h4>
                  <div style={{ background: '#f7fafc', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>🏷️ {selectedExpense.rawItemInput || selectedExpense.storeName || "품목명"}</span>
                      <span style={{ fontWeight: '600' }}>{(selectedExpense.totalAmount || selectedExpense.price || 0).toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const LegendItem = ({ color, name, percent }) => (
  <div className="legend_row">
    <span className="legend_dot" style={{ backgroundColor: color }}></span>
    <span className="legend_name">{name}</span>
    <span className="legend_percent">{percent}%</span>
  </div>
);