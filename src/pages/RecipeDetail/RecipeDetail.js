import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, ChefHat } from 'lucide-react';

import Header from '../../components/Header/Header'; 
import './RecipeDetail.css';

// [수정] 두 데이터 소스를 모두 불러옵니다.
import { recipes2 } from '../../data/recipes2'; 
import { recipes3 as crawledRecipes } from '../../data/collection/recipes3'; 

export default function RecipeDetail() {
  const { title } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const decodedTitle = decodeURIComponent(title || "");
    
    // [핵심] 두 데이터를 하나로 합쳐서 검색 범위를 확장합니다.
    const allRecipes = [...recipes2, ...crawledRecipes];
    
    // 제목 공백 제거 후 비교 매칭
    const foundRecipe = allRecipes.find(
      (item) => item.title && item.title.replace(/\s+/g, '') === decodedTitle.replace(/\s+/g, '')
    );

    setRecipe(foundRecipe);
    window.scrollTo(0, 0);
  }, [title]);

  if (!recipe) {
    return (
      <div className="recipe_detail_page">
        <Header />
        <div className="error_message">
          <p>레시피 정보를 불러올 수 없습니다.<br/>잠시 후 다시 시도해주세요.</p>
          <button onClick={() => navigate(-1)}>이전으로</button>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe_detail_page">
      <Header />

      <div className="detail_thumbnail">
        <img
          src={recipe.thumbnailImageUrl}
          alt={recipe.title}
          className="thumbnail_image"
          referrerPolicy="no-referrer" 
        />
        {/* 크롤링 데이터의 경우 category 필드가 있으므로 이를 우선 표시 */}
        <div className="thumbnail_badge">{recipe.category || recipe.difficulty || "BEST"}</div>
      </div>

      <div className="detail_content">
        <div className="detail_intro">
          <h1 className="detail_title">{recipe.title}</h1>
          <p className="detail_description">{recipe.description}</p>
        </div>

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

        <div className="detail_section">
          <h3 className="section_title">🥕 재료 목록</h3>
          <div className="ingredients_list">
            {recipe.ingredients && recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="ingredient_item">
                <div className="ingredient_bullet"></div>
                <span className="ingredient_text">{ing.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="detail_section">
          <h3 className="section_title">👩‍🍳 조리 순서</h3>
          <div className="steps_list">
            {recipe.steps && recipe.steps.map((step, idx) => (
              <div key={idx} className="step_item">
                <div className="step_number_badge"><span>{step.stepNo || idx + 1}</span></div>
                <div className="step_content">
                  <p className="step_description">{step.description}</p>
                  {step.cookingImageUrl && (
                    <img
                      src={step.cookingImageUrl}
                      alt={`${step.stepNo || idx + 1}단계 이미지`}
                      className="step_image"
                      referrerPolicy="no-referrer"
                      loading="lazy"
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