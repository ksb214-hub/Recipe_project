import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchPage.css";
import Card from "../../components/Card/Card";
import ReportModal from "../../components/ReportModal/ReportModal";
import customInstance from "../../api/api";
import { Search, X, Loader2, AlertCircle, TrendingUp } from "lucide-react"; 

function SearchPage() {
  const navigate = useNavigate();

  /* --- 상태 관리 --- */
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  
  // 인기 검색어 상태
  const [popularKeywords, setPopularKeywords] = useState([]);

  // 필터 상태
  const [activeCategory, setActiveCategory] = useState("전체");
  const [difficulty, setDifficulty] = useState("전체");

  // 신고 모달 상태
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState("");

  /* ---------------------------------------------------------
     1. 데이터 로드 (인기 검색어 획득 및 Fallback 처리)
     --------------------------------------------------------- */
  const fetchPopularKeywords = useCallback(async () => {
    try {
      console.log("📡 [GET] /api/search/popular (인기 검색어 API 요청 시작)");
      const res = await customInstance.get("/api/search/popular");
      
      if (res.data?.success) {
        const keywords = res.data.data?.keywords || res.data.data || [];
        
        // 💡 [핵심 방어 코드] 백엔드에서 빈 배열([])이 오면 화면이 심심하지 않게 추천 키워드로 대체합니다.
        if (keywords.length === 0) {
          console.log("ℹ️ 백엔드 인기 검색어가 비어있어 기본 추천 키워드로 대체 배치합니다.");
          setPopularKeywords(["김치찌개", "떡볶이", "디저트", "돈까스", "계란말이"]);
        } else {
          setPopularKeywords(keywords);
        }
      }
    } catch (err) {
      console.error("❌ 인기 검색어 로드 실패:", err);
      // 에러가 나더라도 클라이언트가 멈추지 않도록 기본 배열 세팅
      setPopularKeywords(["김치찌개", "떡볶이", "디저트", "닭백숙"]);
    }
  }, []);

  /* ---------------------------------------------------------
     2. 🚀 레시피 검색/조회 실행 통합 함수
     --------------------------------------------------------- */
  const handleSearch = useCallback(async (targetQuery) => {
    const currentKeyword = targetQuery !== undefined ? targetQuery : searchQuery;
    const trimmedQuery = currentKeyword ? currentKeyword.trim() : "";

    setLoading(true);
    try {
      console.log(`🔍 [API 호출] 키워드: '${trimmedQuery || "전체보기"}'로 레시피 리스트 요청 중...`);
      
      const res = await customInstance.get("/api/recipes/search", {
        params: {
          keyword: trimmedQuery || undefined, 
          sort: "relevance",
          page: 0,
          size: 20
        }
      });
      
      const fetchedContent = res.data?.data?.content || res.data?.content || [];
      setRecipes(fetchedContent);
      console.log(`✨ [조회 성공] 가져온 레시피 개수: ${fetchedContent.length}개`);

      // 북마크 연동
      try {
        const bookmarkRes = await customInstance.get("/api/recipe/bookmarks/ids");
        setBookmarkedIds(bookmarkRes.data?.data || bookmarkRes.data || []);
      } catch (bErr) {
        console.warn("⚠️ 북마크 ID 리스트 로드 실패:", bErr);
        setBookmarkedIds([]);
      }

    } catch (err) {
      console.error("❌ 검색 결과를 가져오는데 실패했습니다:", err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // 페이지 진입 시 실행
  useEffect(() => {
    fetchPopularKeywords();
    handleSearch(""); 
  }, [fetchPopularKeywords, handleSearch]);

  /* ---------------------------------------------------------
     3. 이벤트 핸들러 및 리셋 제어
     --------------------------------------------------------- */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(); 
    }
  };

  const handleKeywordClick = (keyword) => {
    setSearchQuery(keyword);
    handleSearch(keyword); 
  };

  const toggleBookmark = async (e, recipeId) => {
    e.stopPropagation();
    e.preventDefault();
    
    const isAlreadyBookmarked = bookmarkedIds.includes(recipeId);
    try {
      if (isAlreadyBookmarked) {
        await customInstance.delete(`/api/recipes/${recipeId}/bookmark`);
        setBookmarkedIds(prev => prev.filter(id => id !== recipeId));
      } else {
        await customInstance.post(`/api/recipes/${recipeId}/bookmark`, {});
        setBookmarkedIds(prev => [...prev, recipeId]);
      }
    } catch (err) {
      console.error("❌ 북마크 처리 실패:", err);
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
    handleSearch(""); 
  };

  /* ---------------------------------------------------------
     4. 필터링 로직
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
        <section className="search_bar_section" style={{ padding: '20px 20px 10px' }}>
          <div className="search_input_wrapper">
            <Search 
              className="search_icon" 
              size={20} 
              onClick={() => handleSearch()} 
              style={{ cursor: 'pointer' }}
            />
            <input 
              type="text" 
              placeholder="어떤 요리를 찾으시나요?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown} 
            />
            {searchQuery && <X className="clear_icon" size={18} onClick={handleReset} />}
          </div>
        </section>

        {/* 인기 검색어 섹션 */}
        {!searchQuery && !loading && (
          <section className="popular_keywords_section" style={{ padding: '10px 20px 15px' }}>
            <div className="section_header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <TrendingUp size={18} color="#667eea" />
              {/* 백엔드 데이터 여부에 따라 제목을 유연하게 변경 */}
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#333' }}>
                {popularKeywords.includes("김치찌개") && !searchQuery ? "추천 검색어" : "인기 검색어"}
              </h3>
            </div>
            <div className="keyword_list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {popularKeywords.map((kw, idx) => (
                <span 
                  key={`pop-kw-${idx}`} 
                  className="keyword_tag"
                  onClick={() => handleKeywordClick(kw)}
                  style={{
                    padding: '6px 14px',
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: '20px',
                    fontSize: '13px',
                    color: '#666',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 결과 리스트 레이어 */}
        <div className="search_result_list">
          {filteredRecipes.length > 0 && (
            <p className="result_count" style={{ marginBottom: '16px', padding: '0 20px' }}>
              총 <strong>{filteredRecipes.length}</strong>개의 레시피 발견
            </p>
          )}
          
          {loading ? (
            <div className="loading_box" style={{ textAlign: 'center', padding: '50px' }}>
              <Loader2 className="spinner" />
              <p>레시피 컬렉션을 매핑하고 있습니다...</p>
            </div>
          ) : filteredRecipes.length > 0 ? (
            <div className="recipe_grid">
              {filteredRecipes.map((recipe, index) => {
                const uniqueKey = recipe.id || `search-recipe-${index}`;
                return (
                  <div key={uniqueKey} className="recipe-card-box">
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
                );
              })}
            </div>
          ) : (
            <div className="no_result" style={{ textAlign: 'center', padding: '80px 20px' }}>
              <p style={{ color: '#999', marginBottom: '12px' }}>조건에 일치하는 검색 결과가 존재하지 않습니다.</p>
              <button onClick={handleReset} className="reset_btn" style={{
                padding: '8px 16px',
                background: '#667eea',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}>필터 초기화 및 리스트 새로고침</button>
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