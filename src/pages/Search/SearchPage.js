import React, { useState, useMemo } from "react";
import "./SearchPage.css";
import Card from "../../components/Card/Card";
import { Search, Filter } from "lucide-react";
import { recipes } from "../../data/recipes";

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");

  const categories = ["전체", "육류", "채소", "가공식품", "기타"];

  // 다중 필터링 로직: 검색어 + 카테고리
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "전체" || recipe.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="search_page_wrapper">
      <main className="search_content">
        <section className="search_header_area">
          <h2 className="search_title">레시피 검색</h2>
          <div className="search_box_inner">
            <Search size={20} className="search_icon" />
            <input
              type="text"
              placeholder="찾고 싶은 요리 이름을 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search_input"
            />
          </div>
        </section>

        <section className="category_filter_area">
          <div className="filter_label"><Filter size={14} /> <span>카테고리</span></div>
          <div className="category_chips">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {(searchQuery || activeCategory !== "전체") && (
          <div className="search_result_info">
            <span className="query_text">
              {activeCategory !== "전체" && `[${activeCategory}] `}
              {searchQuery && `"${searchQuery}"`}
            </span> 결과 <span className="count_text">{filteredRecipes.length}개</span>
          </div>
        )}

        <div className="search_result_list">
          {filteredRecipes.length === 0 ? (
            <div className="no_result_box">
              <p className="no_result_emoji">😢</p>
              <p className="no_result_text">일치하는 레시피가 없습니다.</p>
            </div>
          ) : (
            <div className="card_wrapper">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} {...recipe} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SearchPage;