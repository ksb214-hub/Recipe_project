// 아이콘 라이브러리 (검색, 필터, 요리 관련 아이콘)
import { Search, Filter, TrendingUp, Clock, ChefHat, Timer, Users } from 'lucide-react';
import "./SearchPage.css";
// React 상태 관리
import { useState } from 'react';

export default function SearchPage() {

  // 검색어 상태
  const [searchQuery, setSearchQuery] = useState('');

  // 필터 상태
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedDifficulty, setSelectedDifficulty] = useState('전체');
  const [selectedTime, setSelectedTime] = useState('전체');

  // 카테고리 목록
  const categories = ['전체', '한식', '중식', '일식', '양식', '디저트', '샐러드'];

  //  난이도 필터
  const difficulties = ['전체', '쉬움', '보통', '어려움'];

  // 조리 시간 필터
  const cookingTimes = ['전체', '15분 이하', '30분 이하', '1시간 이하', '1시간 이상'];

  // 인기 검색어
  const trendingRecipes = [
    '김치찌개',
    '까르보나라',
    '연어스테이크',
    '불고기',
    '초밥',
    '파스타',
  ];

  // 최근 검색어
  const recentSearches = [
    '닭가슴살 요리',
    '간단한 아침 메뉴',
    '다이어트 샐러드',
  ];

  //  추천 레시피 데이터
  const featuredRecipes = [
    {
      id: 1,
      title: '비빔밥',
      image: '이미지URL',
      time: '30분',
      difficulty: '보통',
      servings: '2인분',
    },
  ];

  // 검색 결과 데이터
  const recipeResults = [
    {
      id: 1,
      title: '마르게리타 피자',
      image: '이미지URL',
      description: '신선한 토마토와 모짜렐라 치즈로 만든 피자',
      time: '45분',
      difficulty: '보통',
      servings: '2-3인분',
    },
  ];

  // 검색 실행 함수
  const handleSearch = (e) => {
    e.preventDefault(); // 페이지 새로고침 방지
    console.log('검색:', searchQuery);
  };

  return (
    <div className="w-full max-w-[1536px] mx-auto px-4 py-8">

      {/* ================= 상단 검색 영역 ================= */}
      <div className="text-center py-12 mb-8">

        {/* 제목 + 아이콘 */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <ChefHat className="size-12 text-primary" />
          <h1>레시피를 찾아보세요</h1>
        </div>

        <p className="mb-8">
          원하는 레시피를 검색해보세요
        </p>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-container">
            {/* input 영역 */}
            <div className="search-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="재료나 요리 이름 입력"
                className="search-input"
              />
            </div>
            {/* 검색 버튼 */}
            <button type="submit" className="search-btn">
              검색
            </button>
          </div>
        </form>

        {/* 🏷 카테고리 필터 */}
        <div className="flex justify-center gap-2 mt-6 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full border ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* ================= 메인 레이아웃 ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/*  왼쪽: 검색 결과 영역 */}
        <div className="lg:col-span-2">

          {/* 상세 필터 */}
          <div className="border p-4 mb-6">
            <h2>상세 필터</h2>

            {/* 난이도 */}
            <div>
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          {/*  검색 결과 리스트 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recipeResults.map((recipe) => (
              <div key={recipe.id} className="border rounded-lg p-4">


                {/* 제목 */}
                <h3>{recipe.title}</h3>

                {/* 설명 */}
                <p>{recipe.description}</p>

                {/* 정보 */}
                <div className="flex gap-2 text-sm">
                  <span>{recipe.time}</span>
                  <span>{recipe.difficulty}</span>
                  <span>{recipe.servings}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*  오른쪽 사이드바 */}
        <div>

          {/* 인기 레시피 */}
          <div>
            <h3>인기 레시피</h3>
            {trendingRecipes.map((recipe, index) => (
              <div key={recipe}>
                {index + 1}. {recipe}
              </div>
            ))}
          </div>

          {/* 최근 검색 */}
          <div>
            <h3>최근 검색</h3>
            {recentSearches.map((search) => (
              <div key={search}>{search}</div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}