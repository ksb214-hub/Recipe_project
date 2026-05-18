import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Main.css";
import "../../pages/Main/recipeMatch.css";

import Card from "../../components/Card/Card";
import Section from "../../components/Section/Section";
import ReportModal from "../../components/ReportModal/ReportModal";
import customInstance from "../../api/api";

import { recipes3 as crawledRecipes } from "../../data/collection/recipes3";
import { Search, UtensilsCrossed, Refrigerator, Loader2, AlertCircle } from "lucide-react";

export default function Main() {
  const navigate = useNavigate();

  /* --- 상태 관리 --- */
  const [activeIngredients, setActiveIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recommendedData, setRecommendedData] = useState([]);
  
  const [recipes, setRecipes] = useState([]); 
  const [allIngredients, setAllIngredients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);

  // 북마크된 ID 목록 (숫자형 배열로 관리, 실시간 동기화 상태)
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  /* --- 신고 기능을 위한 상태 --- */
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState("");

  /* ---------------------------------------------------------
     🔥 [추가] 로그인한 유저의 기존 북마크 ID 리스트 동기화 함수
     --------------------------------------------------------- */
  const fetchBookmarkedIds = useCallback(async () => {
    try {
      console.log("📡 [GET] /api/recipe/bookmarks/ids (기존 북마크 ID 목록 조회)");
      const bookmarkRes = await customInstance.get("/api/recipe/bookmarks/ids");
      
      // 백엔드 공통 응답 규격 다중 방어 파싱 (data 필드가 존재하면 매핑)
      const ids = bookmarkRes.data?.data || bookmarkRes.data || [];
      console.log("✨ [동기화 성공] 현재 메인에서 인식한 유저 북마크 레시피 ID 목록:", ids);
      setBookmarkedIds(ids);
    } catch (err) {
      console.error("❌ 기존 북마크 ID 목록 로드 실패:", err);
    }
  }, []);

  /* ---------------------------------------------------------
     1. 데이터 로드 (레시피, 식재료 목록 및 북마크 교차 연동)
     --------------------------------------------------------- */
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. 식재료 목록 조회
      const ingRes = await customInstance.get("/api/ingredients");
      setAllIngredients(ingRes.data?.data?.content || []); 
      
      // 2. 레시피 목록 조회 (최신순)
      const recipeRes = await customInstance.get("/api/recipes", {
        params: { page: 0, size: 10, sort: 'latest' }
      });
      setRecipes(recipeRes.data?.data?.content || []);

      // 💡 [해결 핵심 연동] 컴포넌트 마운트 시점에 실제 서버 DB에 기록된 하트 정보 가동
      await fetchBookmarkedIds();

    } catch (err) { 
      console.error("데이터 로드 중 오류 발생:", err); 
    } finally {
      setLoading(false);
    }
  }, [fetchBookmarkedIds]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // 재료 기반 추천 로직 (Flask 서버 연동 시)
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (activeIngredients.length === 0) { setRecommendedData([]); return; }
      try {
        const res = await axios.post("http://localhost:8001/recommend/ingredients", { ingredients: activeIngredients });
        setRecommendedData(Array.isArray(res.data) ? res.data : []);
      } catch (err) { console.error("추천 실패:", err); }
    };
    fetchRecommendations();
  }, [activeIngredients]);

  /* ---------------------------------------------------------
     2. 핸들러 (북마크 토글, 신고, 검색)
     --------------------------------------------------------- */
  
  // ✅ 북마크 토글 기능 (사용자가 누를 때만 동작 및 409 Conflict 자가 치유 내장)
  /* ---------------------------------------------------------
     2. 핸들러 (북마크 토글, 신고, 검색)
     --------------------------------------------------------- */
  
  // ✅ 북마크 토글 기능 (URL 패스 파라미터 규격 반영 및 409 자가치유)
  const toggleBookmark = async (e, recipeId) => {
    e.stopPropagation(); // 카드 상세 이동 방지
    e.preventDefault();
    
    // 현재 메모리 상태 배열에 존재하는지 체크
    const isAlreadyBookmarked = bookmarkedIds.includes(recipeId);

    try {
      if (isAlreadyBookmarked) {
        // 1. 이미 북마크 된 경우 -> DELETE /api/recipes/{id}/bookmark
        console.log(`📤 [DELETE] 북마크 해제 요청 - 레시피 ID: ${recipeId}`);
        
        // 💡 Axios의 delete 메서드는 두 번째 인자가 config 객체이므로 URL에 id를 직접 바인딩하는 것이 가장 안전합니다.
        await customInstance.delete(`/api/recipes/${recipeId}/bookmark`);
        
        // 프론트엔드 상태 즉시 반영 (하트 끄기)
        setBookmarkedIds(prev => prev.filter(id => id !== recipeId));
      } else {
        // 2. 북마크 안 된 경우 -> POST /api/recipes/{id}/bookmark
        console.log(`📤 [POST] 북마크 등록 요청 - 레시피 ID: ${recipeId}`);
        
        // 💡 POST 요청 역시 URL 패스로 id를 넘기며, body는 빈 객체({})로 전달해 규격을 맞춥니다.
        await customInstance.post(`/api/recipes/${recipeId}/bookmark`, {});
        
        // 프론트엔드 상태 즉시 반영 (하트 켜기)
        setBookmarkedIds(prev => [...prev, recipeId]);
      }
    } catch (err) {
      console.error("❌ 북마크 처리 실패:", err);
      
      // 💡 만약 브라우저 렌더링 상태 싱크가 순간적으로 튀어서 409 Conflict가 발생하면 자동 동기화
      if (err.response?.status === 409) {
        console.warn("⚠️ [싱크 충돌 감지] 실제 DB 상태 정렬을 위해 북마크 데이터를 새로고침합니다.");
        fetchBookmarkedIds(); 
      } else {
        alert("북마크 처리 중 오류가 발생했습니다.");
      }
    }
  };

  // 신고 모달 열기
  const openReport = (e, targetName) => {
    e.stopPropagation(); 
    setReportTarget(targetName);
    setIsReportOpen(true);
  };

  const handleAddIngredient = (name) => {
    const ingredientName = name || searchTerm.trim();
    if (ingredientName && !activeIngredients.includes(ingredientName)) {
      setActiveIngredients(prev => [...prev, ingredientName]);
      setSearchTerm("");
      setShowSuggestions(false);
    }
  };

  /* ---------------------------------------------------------
     3. 데이터 가공 및 UI 렌더링 (오리지널 가공 필터링 100% 보존)
     --------------------------------------------------------- */
  const suggestions = useMemo(() => {
    if (!searchTerm) return [];
    return allIngredients.filter(item => item.name.includes(searchTerm)).slice(0, 5);
  }, [searchTerm, allIngredients]);

  const processedRecipes = useMemo(() => {
    const baseList = recipes.length > 0 ? recipes : crawledRecipes;

    return baseList
      .filter(recipe => {
        if (activeIngredients.length > 0) {
          const recInfo = recommendedData.find(rec => rec.title.trim() === recipe.title.trim());
          return recInfo && recInfo.score === 100;
        }
        return true;
      })
      .map((recipe, index) => ({
        ...recipe,
        id: recipe.id || `recipe-${index}`,
        displayAuthor: recipe.authorNickname || "공공데이터",
      }));
  }, [recipes, activeIngredients, recommendedData]);

  return (
    <div className="main_page_container">
      <main className="con">
        
        {/* 등록 버튼 영역 */}
        <div className="quick_action_row">
          <div className="quick_card" onClick={() => navigate("/reg")}>
            <div className="quick_icon_circle"><Refrigerator size={20} /></div>
            <span>재료 등록</span>
          </div>
          <div className="quick_card" onClick={() => navigate("/recipe-reg")}>
            <div className="quick_icon_circle"><UtensilsCrossed size={20} /></div>
            <span>레시피 등록</span>
          </div>
        </div>

        {/* 검색 섹션 */}
        <Section title="재료 검색 및 관리">
          <div className="search_box" style={{ position: "relative" }}>
            <input 
              id="ingredient-search"
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }} 
              placeholder="냉장고에 있는 재료를 검색해보세요" 
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestion_list">
                {suggestions.map((ing) => (
                  <li key={`ing-${ing.id}`} onClick={() => handleAddIngredient(ing.name)}>
                    {ing.name}
                  </li>
                ))}
              </ul>
            )}
            <button className="search_inner_btn" onClick={() => handleAddIngredient()}>
              <Search size={18} />
            </button>
          </div>
        </Section>

        {/* 결과 리스트 섹션 */}
        <Section title="오늘의 추천 레시피">
          {loading ? (
            <div className="loading_box" style={{ textAlign: 'center', padding: '50px' }}>
              <Loader2 className="spinner" />
              <p>맛있는 레시피를 가져오고 있습니다...</p>
            </div>
          ) : (
            <div className="card-wrapper">
              {processedRecipes.length > 0 ? (
                processedRecipes.map((recipe) => (
                  <div key={recipe.id} className="recipe-card-box">
                    {/* 신고 버튼 */}
                    <button 
                      className="report_trigger_btn"
                      onClick={(e) => openReport(e, recipe.title)}
                      title="신고하기"
                    >
                      <AlertCircle size={16} />
                    </button>

                    <Card
                      title={recipe.title}
                      category={recipe.displayAuthor}
                      thumbnailImageUrl={recipe.thumbnailImageUrl} 
                      isBookmarked={bookmarkedIds.includes(recipe.id)}
                      onToggleBookmark={(e) => toggleBookmark(e, recipe.id)}
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                    />
                  </div>
                ))
              ) : (
                <p className="empty_msg">추천할 레시피가 없습니다. 재료를 검색해보세요!</p>
              )}
            </div>
          )}
        </Section>
      </main>

      {/* 공통 모달 */}
      <ReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        targetName={reportTarget} 
      />
    </div>
  );
}