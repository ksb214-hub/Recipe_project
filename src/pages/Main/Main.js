import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 페이지 간 이동을 담당하는 라우터 훅
import "./Main.css";
import "../../pages/Main/recipeMatch.css";

// [컴포넌트 및 API 임포트]
import Card from "../../components/Card/Card"; // 레시피 정보를 시각화하는 카드
import Button from "../../components/Button/Button"; // UI 통일성을 위한 버튼 컴포넌트
import Section from "../../components/Section/Section"; // 화면 영역을 분리하는 섹션 컨테이너
import customInstance from "../../api/api"; // 서버와 통신하기 위한 Axios 커스텀 설정

// [데이터 및 아이콘 임포트]
import { recipes3 as crawledRecipes } from "../../data/collection/recipes3"; // 크롤링 데이터
import { Search, X, Plus } from "lucide-react"; // UI 구성용 아이콘 라이브러리

export default function Main() {
  const navigate = useNavigate(); // 페이지 전환 시 호출할 navigate 함수

  // [상태 관리(State)]
  const [activeIngredients, setActiveIngredients] = useState([]); // 사용자가 보유한 재료 목록 저장
  const [searchTerm, setSearchTerm] = useState(""); // 검색창에 입력 중인 텍스트 임시 저장
  const [bookmarkedIds, setBookmarkedIds] = useState([]); // 서버에서 받은 북마크한 레시피 리스트
  const [selectedCategory, setSelectedCategory] = useState("전체"); // 카테고리 필터링 상태

  // [카테고리 목록 생성]
  // crawledRecipes 데이터의 모든 카테고리를 중복 제거하여 드롭다운 항목으로 만듭니다.
  const categories = ["전체", ...new Set(crawledRecipes.map(r => r.category))];

  // [초기 데이터 로딩]
  // 컴포넌트가 처음 렌더링될 때 서버에서 사용자의 재료와 북마크 상태를 불러옵니다.
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 서버로부터 보유 재료 리스트 조회
        const ingRes = await customInstance({ url: "/api/ingredients", method: "GET" });
        const content = ingRes.data?.data?.content || [];
        setActiveIngredients(content.map(item => item.name)); // 서버 데이터를 상태에 저장

        // 서버로부터 북마크 리스트 조회
        try {
          const bookmarkRes = await customInstance({ url: "/api/bookmarks", method: "GET" });
          setBookmarkedIds(bookmarkRes.data || []);
        } catch (err) {
          console.warn("북마크 데이터 없음");
        }
      } catch (err) {
        console.error("📍 데이터 로드 실패:", err);
      }
    };
    fetchInitialData();
  }, []);

  // [북마크 토글]
  // 클릭 시 서버에 추가/삭제 요청을 보내고, 로컬 상태를 실시간으로 반영합니다.
  const toggleBookmark = async (e, recipeTitle) => {
    e.stopPropagation(); // 카드 클릭 시 페이지 이동 이벤트가 발생하지 않도록 차단
    const isBookmarked = bookmarkedIds.includes(recipeTitle);

    try {
      // 쿼리 파라미터 방식으로 제목 전달 (특수문자 이슈 방지)
      await customInstance({
        url: "/api/bookmarks",
        method: isBookmarked ? "DELETE" : "POST",
        params: { title: recipeTitle }
      });

      // 로컬 상태를 업데이트하여 아이콘 색상 등이 즉각 변하게 처리
      setBookmarkedIds(prev =>
        isBookmarked
          ? prev.filter(id => id !== recipeTitle)
          : [...prev, recipeTitle]
      );
    } catch (err) {
      console.error("📍 북마크 에러:", err);
      alert("북마크 처리 중 오류가 발생했습니다.");
    }
  };

  // [재료 관리] 등록 및 제거
  const handleAddIngredient = () => {
    const trimmed = searchTerm.trim();
    if (trimmed && !activeIngredients.includes(trimmed)) {
      setActiveIngredients(prev => [...prev, trimmed]); // 배열에 새 재료 추가
      setSearchTerm(""); // 입력창 초기화
    }
  };

  const handleRemoveIngredient = (ingredient) => {
    setActiveIngredients(prev => prev.filter(i => i !== ingredient)); // 해당 재료 삭제
  };

  return (
    <div className="main_page_container">
      <main className="con">
        
        {/* [1. 재료 검색 및 관리 섹션] */}
        <Section title="재료 검색 및 관리">
          <div className="fridge_header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <Button onClick={() => navigate("/reg")}>
              <Plus size={16} /> 재료 등록
            </Button>
          </div>

          {/* 재료 입력 폼 */}
          <div className="search_box">
            <input
              id="ingredient-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="재료 입력 (예: 양파)"
            />
            <Button onClick={handleAddIngredient}>
              <Search size={16} />
            </Button>
          </div>

          {/* 등록된 재료 리스트(태그) */}
          <div className="tags_container">
            {activeIngredients.map((ing) => (
              <span key={ing} className="ingredient_tag">
                {ing}
                <X size={14} onClick={() => handleRemoveIngredient(ing)} />
              </span>
            ))}
          </div>
        </Section>

        {/* [2. BEST 요리모음 섹션] */}
        <Section title="BEST 요리모음">
          {/* 카테고리 선택 드롭다운 */}
          <div className="filter_box">
            <select
              className="drop_nav"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 필터링 로직: 카테고리 & 보유 재료 매칭 */}
          <div className="card-wrapper">
            {crawledRecipes
              .filter(recipe => {
                // [카테고리 필터링]
                const matchesCategory = selectedCategory === "전체" || recipe.category === selectedCategory;

                // [재료 실시간 매칭]
                // 1. 보유 재료가 없으면 전체 레시피 노출
                // 2. 하나라도 있으면 레시피의 재료 목록(amount 또는 name 필드)에서 포함 여부 확인
                const matchesIngredients = activeIngredients.length === 0 ||
                  activeIngredients.some(ing =>
                    recipe.ingredients.some(rIng => {
                      // 데이터 필드명 확인 (amount 혹은 name) 및 대소문자/공백 정규화
                      const targetValue = rIng.amount || rIng.name || ""; 
                      const recipeIng = targetValue.toLowerCase().replace(/\s/g, "");
                      const myIng = ing.toLowerCase().replace(/\s/g, "");
                      
                      const isMatch = recipeIng.includes(myIng);
                      
                      // 디버깅용: 매칭되는 재료가 있는지 확인 (콘솔창 확인)
                      if (isMatch) console.log(`🔍 매칭됨: [${recipe.title}] 데이터[${targetValue}] vs 검색어[${ing}]`);
                      
                      return isMatch;
                    })
                  );

                return matchesCategory && matchesIngredients;
              })
              .map((recipe) => (
                <Card
                  key={recipe.title}
                  title={recipe.title}
                  image={recipe.thumbnailImageUrl}
                  isBookmarked={bookmarkedIds.includes(recipe.title)}
                  onToggleBookmark={(e) => toggleBookmark(e, recipe.title)}
                  onClick={() => navigate(`/recipe/${encodeURIComponent(recipe.title)}`)}
                />
              ))}
          </div>
        </Section>
      </main>
    </div>
  );
}