import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, ChefHat } from 'lucide-react';

/** * [1. 외부 컴포넌트 및 데이터 임포트]
 * - 성빈님이 기존에 만드신 Header 컴포넌트를 불러옵니다.
 * - 프로젝트 구조에 따라 경로('../../components/Header/Header')를 수정해야 할 수 있습니다.
 */
import Header from '../../components/Header/Header'; 
import { recipes2 } from '../../data/recipes2'; 
import './RecipeDetail.css';

export default function RecipeDetail() {
  // --- [A. 설정 및 상태 관리] ---
  const { title } = useParams(); // URL 파라미터에서 레시피 제목 추출 (:title)
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null); // 매칭된 레시피 데이터를 담을 상태

  /**
   * [B. 데이터 매칭 및 초기화 로직]
   * 페이지가 렌더링될 때 URL 제목과 일치하는 데이터를 recipes2에서 찾습니다.
   */
  useEffect(() => {
    // 1. URL의 인코딩된 텍스트를 한글로 변환 (공백 포함)
    const decodedTitle = decodeURIComponent(title || "");
    
    // 2. 유연한 매칭: 데이터와 URL 제목 모두 공백을 제거하고 비교하여 불일치 오류 방지
    const foundRecipe = recipes2.find(
      (item) => item.title.replace(/\s+/g, '') === decodedTitle.replace(/\s+/g, '')
    );

    // 3. 찾은 데이터를 상태에 저장
    setRecipe(foundRecipe);

    // 4. 새로운 레시피 진입 시 항상 화면 최상단에서 시작하도록 스크롤 조절
    window.scrollTo(0, 0);
  }, [title]);

  /**
   * [C. 예외 처리: 데이터가 없는 경우]
   * 잘못된 접근이거나 데이터를 찾는 중일 때 빈 화면 대신 에러 메시지를 보여줍니다.
   */
  if (!recipe) {
    return (
      <div className="recipe_detail_page">
        <Header /> {/* 데이터가 없어도 헤더는 유지하여 뒤로가기 등 제공 */}
        <div className="error_message">
          <p>레시피 정보를 불러올 수 없습니다.<br/>잠시 후 다시 시도해주세요.</p>
          <button onClick={() => navigate(-1)}>이전으로</button>
        </div>
      </div>
    );
  }

  // --- [D. 메인 UI 렌더링] ---
  return (
    <div className="recipe_detail_page">
      {/* 1. 공통 헤더 적용
        - 성빈님이 기존에 만든 Header 컴포넌트가 그대로 노출됩니다.
        - 만약 Header에서 title이나 버튼 노출 여부를 props로 받는다면 
          <Header title="상세보기" showBack={true} /> 형태로 수정 가능합니다.
      */}
      <Header />

      {/* 2. 대표 이미지(썸네일) 섹션 */}
      <div className="detail_thumbnail">
        <img
          src={recipe.thumbnailImageUrl}
          alt={recipe.title}
          className="thumbnail_image"
          // '만개의 레시피' 등 외부 사이트 이미지 깨짐 방지 정책 적용
          referrerPolicy="no-referrer" 
        />
        {/* 난이도 뱃지: 데이터에 없으면 'BEST'로 기본값 노출 */}
        <div className="thumbnail_badge">{recipe.difficulty || "BEST"}</div>
      </div>

      {/* 3. 상세 내용 컨테이너 */}
      <div className="detail_content">
        
        {/* 제목 및 소개 문구 */}
        <div className="detail_intro">
          <h1 className="detail_title">{recipe.title}</h1>
          <p className="detail_description">{recipe.description}</p>
        </div>

        {/* 요약 정보 카드 (시간/인분/난이도) */}
        <div className="detail_info_cards">
          <div className="info_card">
            <Clock className="info_icon" />
            <div className="info_text">
              <span className="info_label">조리시간</span>
              <span className="info_value">30분 이내</span>
            </div>
          </div>
          <div className="info_card">
            <Users className="info_icon" />
            <div className="info_text">
              <span className="info_label">인분</span>
              <span className="info_value">2인분</span>
            </div>
          </div>
          <div className="info_card">
            <ChefHat className="info_icon" />
            <div className="info_text">
              <span className="info_label">난이도</span>
              <span className="info_value">{recipe.difficulty || "초급"}</span>
            </div>
          </div>
        </div>

        {/* 식재료 목록 섹션 */}
        <div className="detail_section">
          <h3 className="section_title">🥕 재료 목록</h3>
          <div className="ingredients_list">
            {recipe.ingredients.map((ing) => (
              <div key={ing.ingredientId} className="ingredient_item">
                <div className="ingredient_bullet"></div>
                <span className="ingredient_text">{ing.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 조리 단계별 가이드 섹션 */}
        <div className="detail_section">
          <h3 className="section_title">👩‍🍳 조리 순서</h3>
          <div className="steps_list">
            {recipe.steps.map((step) => (
              <div key={step.stepNo} className="step_item">
                {/* 단계 번호 배지 */}
                <div className="step_number_badge">
                  <span>{step.stepNo}</span>
                </div>
                {/* 단계별 설명 및 이미지 */}
                <div className="step_content">
                  <p className="step_description">{step.description}</p>
                  {step.cookingImageUrl && (
                    <img
                      src={step.cookingImageUrl}
                      alt={`${step.stepNo}단계 이미지`}
                      className="step_image"
                      referrerPolicy="no-referrer" // 이미지 깨짐 방지
                      loading="lazy" // 스크롤 시 순차 로딩 (성능 최적화)
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}