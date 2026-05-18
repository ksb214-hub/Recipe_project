import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, ChefHat, Loader2, ChevronLeft, Heart, Edit2 } from 'lucide-react';

import customInstance from '../../api/api';
import './RecipeDetail.css';

export default function RecipeDetail() {
  const { id } = useParams(); // URL의 :id 파라미터를 가져옵니다.
  const navigate = useNavigate();
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  /* ---------------------------------------------------------
     1. 레시피 상세 데이터 로드 (GET: /api/recipes/{id})
     --------------------------------------------------------- */
  useEffect(() => {
    const fetchRecipeDetail = async () => {
      try {
        setLoading(true);
        const res = await customInstance.get(`/api/recipes/${id}`);
        
        if (res.data?.success) {
          setRecipe(res.data.data);
          // 북마크 상태 초기화
          setIsBookmarked(res.data.data.isBookmarked || false);
        }
      } catch (err) {
        console.error("레시피 상세 정보 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipeDetail();
    }
    window.scrollTo(0, 0);
  }, [id]);

  /* ---------------------------------------------------------
     2. 북마크 토글 핸들러
     --------------------------------------------------------- */
  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await customInstance.delete(`/api/recipes/${id}/bookmark`);
      } else {
        await customInstance.post(`/api/recipes/${id}/bookmark`);
      }
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      console.error("북마크 처리 실패:", err);
    }
  };

  // 로딩 중 UI
  if (loading) {
    return (
      <div className="detail_loading">
        <Loader2 className="spinner" size={40} />
        <p>레시피를 맛있게 불러오는 중입니다...</p>
      </div>
    );
  }

  // 데이터가 없을 경우
  if (!recipe) {
    return (
      <div className="recipe_detail_page">
        <div className="error_message">
          <p>레시피 정보를 불러올 수 없습니다.<br/>삭제되었거나 잘못된 경로입니다.</p>
          <button onClick={() => navigate(-1)} className="back_btn">이전으로</button>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe_detail_page">
      {/* 상단 액션 바 */}
      <div className="detail_top_nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px' }}>
        <button onClick={() => navigate(-1)} className="nav_icon_btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        
        <div className="nav_right_group" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* 🔗 [핵심 연동 포인트] App.js 라우터 규칙(/recipes/edit/:id)과 완벽 일치하도록 절대 경로 지정 */}
          <button 
            onClick={() => navigate(`/recipes/edit/${id}`)} 
            className="nav_icon_btn edit_btn"
            title="레시피 수정"
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Edit2 size={22} color="#333" />
          </button>
          
          <button 
            onClick={handleBookmark} 
            className={`nav_icon_btn ${isBookmarked ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Heart size={24} fill={isBookmarked ? "#ff6b6b" : "none"} color={isBookmarked ? "#ff6b6b" : "#333"} />
          </button>
        </div>
      </div>

      {/* 썸네일 영역 */}
      <div className="detail_thumbnail">
        <img
          src={recipe.thumbnailImageUrl}
          alt={recipe.title}
          className="thumbnail_image"
          referrerPolicy="no-referrer" 
        />
        <div className="thumbnail_badge">{recipe.category || "레시피"}</div>
      </div>

      {/* 본문 콘텐츠 영역 */}
      <div className="detail_content">
        <div className="detail_intro">
          <h1 className="detail_title">{recipe.title}</h1>
          <div className="detail_author">
            <span>작성자: <b>{recipe.authorNickname || "공공데이터"}</b></span>
            <span className="view_count" style={{ marginLeft: '10px', color: '#888', fontSize: '13px' }}>조회수 {recipe.viewCount || 0}</span>
          </div>
          <p className="detail_description">{recipe.description || "간편하고 맛있는 요리법을 소개합니다."}</p>
        </div>

        {/* 요리 정보 카드 섹션 */}
        <div className="detail_info_cards">
          <div className="info_card">
            <Clock className="info_icon" />
            <div className="info_text">
              <span className="info_label">조리시간</span>
              <span className="info_value">{recipe.cookingTime || "30분 이내"}</span>
            </div>
          </div>
          <div className="info_card">
            <Users className="info_icon" />
            <div className="info_text">
              <span className="info_label">인분</span>
              <span className="info_value">{recipe.servings || "2인분"}</span>
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

        {/* 재료 리스트 */}
        <div className="detail_section">
          <h3 className="section_title">🥕 필수 재료</h3>
          <div className="ingredients_list">
            {recipe.ingredients && recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="detail_ingredient_item">
                <span className="ingredient_name">{ing.name}</span>
                <span className="ingredient_amount" style={{ marginLeft: '6px', opacity: 0.8 }}>{ing.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 조리 순서 */}
        <div className="detail_section">
          <h3 className="section_title">👩‍🍳 조리 순서</h3>
          <div className="steps_list">
            {recipe.steps && recipe.steps.map((step, idx) => (
              <div key={idx} className="step_item">
                <div className="step_number_badge" style={{
                  width: '24px', height: '24px', backgroundColor: '#333', color: 'white',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                }}>
                  <span>{step.stepNo || idx + 1}</span>
                </div>
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