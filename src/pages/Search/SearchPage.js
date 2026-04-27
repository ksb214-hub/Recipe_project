import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // 상세 페이지 이동을 위한 Link import
import "./SearchPage.css";
import Card from "../../components/Card/Card";
import { Search, Filter, Clock, BarChart3, X } from "lucide-react"; 
import { recipes } from "../../data/recipes";

function SearchPage() {
  // 상태 관리
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [maxTime, setMaxTime] = useState("전체");
  const [difficulty, setDifficulty] = useState("전체");

  // 자동완성 관련 상태
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  // 필터 옵션 배열
  const categories = ["전체", "육류", "채소", "가공식품", "기타"];
  const times = ["전체", "15분", "30분", "60분"];
  const levels = ["전체", "쉬움", "보통", "어려움"];

  /* ===============================
     1. 자동완성 로직 (Debounce 적용)
  =============================== */
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      const filtered = recipes
        .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* ===============================
     2. 바깥 클릭 시 자동완성 닫기
  =============================== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ===============================
     3. 검색어 및 필터링 통합 로직
  =============================== */
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "전체" || recipe.category === activeCategory;
      
      const recipeTime = parseInt(recipe.time); 
      const selectedTime = maxTime === "전체" ? Infinity : parseInt(maxTime);
      const matchesTime = maxTime === "전체" || recipeTime <= selectedTime;

      const matchesDifficulty = difficulty === "전체" || recipe.difficulty === difficulty;

      return matchesSearch && matchesCategory && matchesTime && matchesDifficulty;
    });
  }, [searchQuery, activeCategory, maxTime, difficulty]);

  // 필터 초기화 함수
  const handleReset = () => {
    setSearchQuery("");
    setActiveCategory("전체");
    setMaxTime("전체");
    setDifficulty("전체");
  };

  return (
    <div className="search_page_wrapper">
      <main className="search_content">
        {/* 검색창 영역 */}
        <section className="search_header_area">
          <h2 className="search_title">레시피 검색</h2>
          <div className="search_box_container" ref={suggestionRef}>
            <div className="search_box_inner">
              <Search size={20} className="search_icon" />
              <input
                type="text"
                placeholder="요리 이름 또는 재료 입력"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="search_input"
              />
              {searchQuery && (
                <X size={18} className="clear_icon" onClick={() => setSearchQuery("")} />
              )}
            </div>

            {/* 자동완성 목록 */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestion_list">
                {suggestions.map((s) => (
                  <li 
                    key={s.id} 
                    className="suggestion_item"
                    onClick={() => {
                      setSearchQuery(s.title);
                      setShowSuggestions(false);
                    }}
                  >
                    <Search size={14} />
                    <span>{s.title}</span>
                    <small className="suggest_cate">{s.category}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* 필터 상세 영역 */}
        <section className="filter_section">
          <div className="filter_group">
            <div className="filter_label"><Filter size={14} /> <span>카테고리</span></div>
            <div className="category_chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`chip ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >{cat}</button>
              ))}
            </div>
          </div>

          <div className="filter_row">
            <div className="filter_item">
              <div className="filter_label"><Clock size={14} /> <span>조리 시간</span></div>
              <select value={maxTime} onChange={(e) => setMaxTime(e.target.value)} className="filter_select">
                {times.map(t => <option key={t} value={t}>{t === "전체" ? t : `${t} 이내`}</option>)}
              </select>
            </div>

            <div className="filter_item">
              <div className="filter_label"><BarChart3 size={14} /> <span>난이도</span></div>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="filter_select">
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </section>

        <div className="search_result_info">
          <p>총 <strong>{filteredRecipes.length}</strong>개의 레시피가 있습니다.</p>
        </div>

        {/* 결과 리스트 영역 */}
        <div className="search_result_list">
          {filteredRecipes.length > 0 ? (
            <div className="recipe_grid">
              {filteredRecipes.map((recipe) => (
                // 카드를 클릭하면 /recipe/:id 상세 페이지로 이동하도록 Link로 래핑
                <Link 
                  key={recipe.id} 
                  to={`/recipe/${encodeURIComponent(recipe.title)}`} // 제목을 URL 안전하게 인코딩하여 전달
                  style={{ textDecoration: 'none' }}
                >
                  <Card {...recipe} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="no_result">
              <p>조건에 맞는 레시피가 없네요!</p>
              <button onClick={handleReset} className="reset_btn">필터 초기화</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SearchPage;