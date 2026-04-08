import React, { useState } from "react";
import "./SearchPage.css";
import Card from "../../components/Card/Card";
import { Search } from "lucide-react";
import { recipes } from "../../data/recipes";

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // 🔍 실시간 필터링: 입력값이 있을 때만 작동하게 하거나, 전체 노출하거나 선택 가능
  // 여기서는 입력값에 따라 실시간으로 카드가 변하도록 유지했습니다.
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="search_page_wrapper">
      {/* Header는 제거되었습니다. (상위 App.js 등에서 관리 가정) */}
      
      <main className="search_content">
        {/* 🔍 검색 헤더 영역 */}
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

        {/* 🔍 검색 결과 요약: 입력어가 있을 때만 표시 */}
        {searchQuery && (
          <div className="search_result_info">
            <span className="query_text">"{searchQuery}"</span> 검색 결과{" "}
            <span className="count_text">{filteredRecipes.length}개</span>
          </div>
        )}

        {/* 🔍 카드 리스트 영역 */}
        <div className="search_result_list">
          {searchQuery && filteredRecipes.length === 0 ? (
            <div className="no_result_box">
              <p className="no_result_emoji">😢</p>
              <p className="no_result_text">검색 결과가 없습니다.</p>
              <p className="no_result_hint">다른 키워드로 검색해 보세요!</p>
            </div>
          ) : (
            <div className="card_wrapper">
              {filteredRecipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  title={recipe.title}
                  image={recipe.image}
                  time={recipe.time}
                  difficulty={recipe.difficulty}
                  servings={recipe.servings}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SearchPage;