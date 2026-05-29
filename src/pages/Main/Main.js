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

  /* --- 신고 기능을 위한 상태 관리 교정 --- */
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState(null); // ⭐ 레시피 고유 ID 저장용 상태 추가
  const [reportTargetName, setReportTargetName] = useState(""); // 기존 제목 저장 변수명 변경 (명확성)

  /* ---------------------------------------------------------
     1. 데이터 로드 (존재하지 않는 북마크 GET API 제거)
     --------------------------------------------------------- */
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. 전체 식재료 목록 조회
      const ingRes = await customInstance.get("/api/ingredients");
      setAllIngredients(ingRes.data?.data?.content || []); 
      
      // 2. 최신 레시피 목록 조회
      const recipeRes = await customInstance.get("/api/recipes", {
        params: { page: 0, size: 10, sort: 'latest' }
      });
      
      setRecipes(recipeRes.data?.data?.content || []);

    } catch (err) { 
      console.error("데이터 로드 중 오류 발생:", err); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // 재료 기반 추천 로직 (Flask 서버 연동)
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
     2. 핸들러 (북마크 토글, 신고, 재료 추가)
     --------------------------------------------------------- */
  
  // 북마크 토글 기능
  const toggleBookmark = async (e, recipeId, isCurrentlyBookmarked) => {
    e.stopPropagation(); 
    e.preventDefault();

    try {
      if (isCurrentlyBookmarked) {
        console.log(`📤 [DELETE] 북마크 해제 요청 - 레시피 ID: ${recipeId}`);
        await customInstance.delete(`/api/recipes/${recipeId}/bookmark`);
      } else {
        console.log(`📤 [POST] 북마크 등록 요청 - 레시피 ID: ${recipeId}`);
        await customInstance.post(`/api/recipes/${recipeId}/bookmark`, {});
      }

      setRecipes(prevRecipes => 
        prevRecipes.map(recipe => {
          if (recipe.id === recipeId) {
            const currentFlag = recipe.isBookmarked !== undefined ? recipe.isBookmarked : (recipe.liked || false);
            return { 
              ...recipe, 
              isBookmarked: !currentFlag,
              liked: !currentFlag 
            };
          }
          return recipe;
        })
      );

    } catch (err) {
      console.error("❌ 북마크 처리 실패:", err);
      alert("북마크 처리 중 오류가 발생했습니다.");
    }
  };

  // 💡 [수정 포인트 1] 신고 모달을 열 때 고유 ID와 제목을 동시에 저장하도록 변경
  const openReport = (e, id, title) => {
    e.stopPropagation(); 
    setReportTargetId(id);     // 고유 ID 상태 업데이트
    setReportTargetName(title); // 제목 상태 업데이트
    setIsReportOpen(true);
  };

  // 💡 [수정 포인트 2] 신고가 성공했을 때 화면 목록에서 해당 레시피 블라인드(필터) 콜백 함수 생성
  const handleReportSuccess = (reportedId) => {
    setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== reportedId));
  };

  // 검색창 입력 및 선택을 통한 재료 태그 추가
  const handleAddIngredient = (name) => {
    const ingredientName = name || searchTerm.trim();
    if (ingredientName && !activeIngredients.includes(ingredientName)) {
      setActiveIngredients(prev => [...prev, ingredientName]);
      setSearchTerm("");
      setShowSuggestions(false);
    }
  };

  /* ---------------------------------------------------------
     3. 데이터 가공 및 필터링
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
        
        {/* 바로가기 버튼 영역 */}
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

        {/* 오늘의 추천 레시피 리스트 섹션 */}
        <Section title="오늘의 추천 레시피">
          {loading ? (
            <div className="loading_box" style={{ textAlign: 'center', padding: '50px' }}>
              <Loader2 className="spinner" />
              <p>맛있는 레시피를 가져오고 있습니다...</p>
            </div>
          ) : (
            <div className="card-wrapper">
              {processedRecipes.length > 0 ? (
                processedRecipes.map((recipe) => {
                  const currentIsBookmarked = recipe.isBookmarked || recipe.liked || false;

                  return (
                    <div key={recipe.id} className="recipe-card-box">
                      {/* 💡 [수정 포인트 3] openReport 인자에 recipe.id와 recipe.title을 정밀 매핑하여 전송 */}
                      <button 
                        className="report_trigger_btn"
                        onClick={(e) => openReport(e, recipe.id, recipe.title)}
                        title="신고하기"
                      >
                        <AlertCircle size={16} />
                      </button>

                      <Card
                        title={recipe.title}
                        category={recipe.displayAuthor}
                        thumbnailImageUrl={recipe.thumbnailImageUrl} 
                        isBookmarked={currentIsBookmarked}
                        onToggleBookmark={(e) => toggleBookmark(e, recipe.id, currentIsBookmarked)}
                        onClick={() => navigate(`/recipe/${recipe.id}`)}
                      />
                    </div>
                  );
                })
              ) : (
                <p className="empty_msg">추천할 레시피가 없습니다. 재료를 검색해보세요!</p>
              )}
            </div>
          )}
        </Section>
      </main>

      {/* =========================================================
          💡 [수정 포인트 4] 완벽하게 개편된 ReportModal Props 주입 및 성공 콜백 연결
         ========================================================= */}
      <ReportModal 
        isOpen={isReportOpen} 
        onClose={() => {
          setIsReportOpen(false);
          setReportTargetId(null); // 닫힐 때 식별자 안전 초기화
        }} 
        targetId={reportTargetId}        // ⭐ 이제 정상적으로 id 상숫값이 주입됩니다!
        targetName={reportTargetName}    // 신고 대상 레시피 제목 매핑
        onReportSuccess={handleReportSuccess} // 신고 성공 시 목록에서 리프레시 없이 필터링
      />
    </div>
  );
}