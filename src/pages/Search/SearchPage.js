import React, { useState, useMemo } from "react";
import "./SearchPage.css";
import Card from "../../components/Card/Card";
import { Search, Filter, Clock, BarChart3 } from "lucide-react"; // 아이콘 추가
import { recipes } from "../../data/recipes";

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  
  // [추가] 필터 상태 관리
  const [maxTime, setMaxTime] = useState("전체"); // 전체, 15분, 30분, 60분
  const [difficulty, setDifficulty] = useState("전체"); // 전체, 쉬움, 보통, 어려움

  const categories = ["전체", "육류", "채소", "가공식품", "기타"];
  const times = ["전체", "15분", "30분", "60분"];
  const levels = ["전체", "쉬움", "보통", "어려움"];

  /* ===============================
     필터링 핵심 로직 (useMemo)
     - 검색어 + 카테고리 + 시간 + 난이도를 동시에 체크합니다.
  =============================== */
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // 1. 이름 검색
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. 카테고리 체크
      const matchesCategory = activeCategory === "전체" || recipe.category === activeCategory;
      
      // 3. 조리 시간 체크 (숫자 비교를 위해 "15분" -> 15로 변환)
      const recipeTime = parseInt(recipe.time); 
      const selectedTime = maxTime === "전체" ? Infinity : parseInt(maxTime);
      const matchesTime = maxTime === "전체" || recipeTime <= selectedTime;

      // 4. 난이도 체크
      const matchesDifficulty = difficulty === "전체" || recipe.difficulty === difficulty;

      return matchesSearch && matchesCategory && matchesTime && matchesDifficulty;
    });
  }, [searchQuery, activeCategory, maxTime, difficulty]);

  return (
    <div className="search_page_wrapper">
      <main className="search_content">
        {/* 검색창 영역 */}
        <section className="search_header_area">
          <h2 className="search_title">레시피 검색</h2>
          <div className="search_box_inner">
            <Search size={20} className="search_icon" />
            <input
              type="text"
              placeholder="요리 이름 또는 재료 입력"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search_input"
            />
          </div>
        </section>

        {/* [확장] 필터링 상세 영역 */}
        <section className="filter_section">
          {/* 1. 카테고리 칩 */}
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

          {/* 2. 시간 & 난이도 드롭다운 (병렬 배치) */}
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

        {/* 결과 정보 영역 */}
        <div className="search_result_info">
          <p>총 <strong>{filteredRecipes.length}</strong>개의 맛있는 레시피가 있어요!</p>
        </div>

        {/* 레시피 리스트 시각화 영역 */}
        <div className="search_result_list">
          {filteredRecipes.length > 0 ? (
            <div className="recipe_grid">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} {...recipe} />
              ))}
            </div>
          ) : (
            <div className="no_result">
              <p>찾으시는 조건의 레시피가 없네요 ㅠㅠ</p>
              <button onClick={() => {setSearchQuery(""); setActiveCategory("전체");}}>필터 초기화</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SearchPage;