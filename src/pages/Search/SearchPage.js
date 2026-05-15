import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchPage.css";
import Card from "../../components/Card/Card";
import ReportModal from "../../components/ReportModal/ReportModal";
import customInstance from "../../api/api";
import { Search, Filter, BarChart3, X, Loader2, AlertCircle } from "lucide-react"; 

function SearchPage() {
  const navigate = useNavigate();

  /* --- 상태 관리 --- */
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  // 필터 상태
  const [activeCategory, setActiveCategory] = useState("전체");
  const [difficulty, setDifficulty] = useState("전체");

  // 신고 모달 상태
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState("");

  /* ---------------------------------------------------------
     1. 데이터 로드 (검색 API 및 북마크 ID 로드)
     --------------------------------------------------------- */
  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    try {
      // 레시피 검색 API 호출 (제공해주신 URL 구조 반영)
      const res = await customInstance.get("/api/recipes/search", {
        params: {
          keyword: searchQuery, 
          sort: "relevance",
          page: 0,
          size: 20
        }
      });
      setRecipes(res.data?.data?.content || []);

      // 사용자의 북마크 ID 목록 로드 (동기화)
      const bookmarkRes = await customInstance.get("/api/recipe/bookmarks/ids");
      setBookmarkedIds(bookmarkRes.data?.data || []);
    } catch (err) {
      console.error("검색 결과를 가져오는데 실패했습니다:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults();
    }, 500); // 디바운스 적용

    return () => clearTimeout(delayDebounceFn);
  }, [fetchSearchResults]);

  /* ---------------------------------------------------------
     2. 핸들러 (북마크, 신고, 초기화)
     --------------------------------------------------------- */
  
  const toggleBookmark = async (e, recipeId) => {
    e.stopPropagation();
    e.preventDefault();
    
    const isAlreadyBookmarked = bookmarkedIds.includes(recipeId);
    try {
      if (isAlreadyBookmarked) {
        await customInstance.delete(`/api/recipes/${recipeId}/bookmark`);
        setBookmarkedIds(prev => prev.filter(id => id !== recipeId));
      } else {
        await customInstance.post(`/api/recipes/${recipeId}/bookmark`);
        setBookmarkedIds(prev => [...prev, recipeId]);
      }
    } catch (err) {
      console.error("북마크 처리 실패:", err);
    }
  };

  const openReport = (e, targetName) => {
    e.stopPropagation();
    e.preventDefault();
    setReportTarget(targetName);
    setIsReportOpen(true);
  };

  const handleReset = () => {
    setSearchQuery("");
    setActiveCategory("전체");
    setDifficulty("전체");
  };

  /* ---------------------------------------------------------
     3. 필터링 로직 (클라이언트 사이드 가공)
     --------------------------------------------------------- */
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchCategory = activeCategory === "전체" || recipe.category === activeCategory;
      const matchDifficulty = difficulty === "전체" || recipe.difficulty === difficulty;
      return matchCategory && matchDifficulty;
    });
  }, [recipes, activeCategory, difficulty]);

  return (
    <div className="search_page">
      <main className="search_container">
        {/* 검색창 영역 */}
        <section className="search_bar_section">
          <div className="search_input_wrapper">
            <Search className="search_icon" size={20} />
            <input 
              type="text" 
              placeholder="어떤 요리를 찾으시나요?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && <X className="clear_icon" size={18} onClick={() => setSearchQuery("")} />}
          </div>
        </section>

        {/* 결과 리스트 영역 */}
        <div className="search_result_list">
          <p className="result_count">총 <strong>{filteredRecipes.length}</strong>개의 레시피</p>
          
          {loading ? (
            <div className="loading_box" style={{ textAlign: 'center', padding: '50px' }}>
              <Loader2 className="spinner" />
              <p>검색 중...</p>
            </div>
          ) : filteredRecipes.length > 0 ? (
            <div className="recipe_grid">
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} className="recipe-card-box">
                  {/* 신고 버튼 */}
                  <button 
                    className="report_trigger_btn"
                    onClick={(e) => openReport(e, recipe.title)}
                  >
                    <AlertCircle size={16} />
                  </button>

                  <Card 
                    title={recipe.title} 
                    thumbnailImageUrl={recipe.thumbnailImageUrl} 
                    category={recipe.authorNickname || "공공데이터"}
                    isBookmarked={bookmarkedIds.includes(recipe.id)}
                    onToggleBookmark={(e) => toggleBookmark(e, recipe.id)}
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="no_result">
              <p>검색 결과가 없습니다.</p>
              <button onClick={handleReset} className="reset_btn">필터 초기화</button>
            </div>
          )}
        </div>
      </main>

      {/* 신고 모달 */}
      <ReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        targetName={reportTarget} 
      />
    </div>
  );
}

export default SearchPage;