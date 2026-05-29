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
  
  // 인기 검색어 상태 (객체 배열 구조 대응)
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
        
        // 💡 백엔드 인기 검색어가 비어있을 때 규격에 맞춘 객체 배열로 대체 배치
        if (keywords.length === 0) {
          console.log("ℹ️ 백엔드 인기 검색어가 비어있어 기본 추천 키워드로 대체 배치합니다.");
          setPopularKeywords([
            { rank: 1, keyword: "김치찌개" },
            { rank: 2, keyword: "떡볶이" },
            { rank: 3, keyword: "디저트" },
            { rank: 4, keyword: "돈까스" },
            { rank: 5, keyword: "계란말이" }
          ]);
        } else {
          setPopularKeywords(keywords);
        }
      }
    } catch (err) {
      console.error("❌ 인기 검색어 로드 실패:", err);
      // 에러가 나더라도 동일한 { rank, keyword } 규격의 배열을 세팅하여 화면 다운 방지
      setPopularKeywords([
        { rank: 1, keyword: "김치찌개" },
        { rank: 2, keyword: "떡볶이" },
        { rank: 3, keyword: "디저트" },
        { rank: 4, keyword: "닭백숙" }
      ]);
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
        const ids = bookmarkRes.data?.data || bookmarkRes.data || [];
        setBookmarkedIds(ids.map(id => Number(id)));
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
    if (!recipeId) return;
    
    const targetId = Number(recipeId);
    const isAlreadyBookmarked = bookmarkedIds.includes(targetId);
    try {
      if (isAlreadyBookmarked) {
        await customInstance.delete(`/api/recipes/${targetId}/bookmark`);
        setBookmarkedIds(prev => prev.filter(id => id !== targetId));
      } else {
        await customInstance.post(`/api/recipes/${targetId}/bookmark`, {});
        setBookmarkedIds(prev => [...prev, targetId]);
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
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#333' }}>
                인기 검색어
              </h3>
            </div>
            <div className="keyword_list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {popularKeywords.map((kw, idx) => {
                // 💡 [핵심 수정] kw가 객체 구조 { rank, keyword } 이므로 내부 문자열을 안전하게 추출합니다.
                const keywordText = typeof kw === "object" ? kw.keyword : kw;
                
                return (
                  <span 
                    key={`pop-kw-${idx}`} 
                    className="keyword_tag"
                    onClick={() => handleKeywordClick(keywordText)}
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
                    {keywordText}
                  </span>
                );
              })}
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
                const targetRecipeId = recipe.id;
                const uniqueKey = targetRecipeId || `search-recipe-${index}`;
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
                      isBookmarked={bookmarkedIds.includes(Number(targetRecipeId))}
                      onToggleBookmark={(e) => toggleBookmark(e, targetRecipeId)}
                      onClick={() => {
                        if (targetRecipeId) {
                          navigate(`/recipe/${targetRecipeId}`);
                        } else {
                          alert("상세 데이터를 조회할 수 없는 레시피 식별자입니다.");
                        }
                      }}
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