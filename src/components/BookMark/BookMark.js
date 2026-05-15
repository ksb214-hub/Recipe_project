import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Bookmark.css"; // 전용 CSS (필요 시 Main.css와 공유 가능)
import "../../pages/Main/recipeMatch.css";

import Card from "../../components/Card/Card";
import Section from "../../components/Section/Section";
import customInstance from "../../api/api";
import { Heart, Loader2, Utensils } from "lucide-react";

export default function Bookmark() {
  const navigate = useNavigate();

  /* ---------------------------------------------------------
     1. 상태 관리
     --------------------------------------------------------- */
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState([]); // 북마크된 레시피 객체 목록
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     2. 서버 데이터 로드 (설계 문서 4.2 반영)
     --------------------------------------------------------- */
  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      // 서버에서 사용자의 북마크 목록을 가져옵니다.
      const response = await customInstance.get("/api/recipe/bookmarks");
      
      // 응답 데이터 구조에 따른 방어 코드 (설계 문서 4.2/7 참조)
      const rawData = response.data?.data || response.data?.content || response.data || [];
      setBookmarkedRecipes(rawData);
      
      console.log("⭐ 북마크 목록 로드 완료:", rawData);
    } catch (err) {
      console.error("❌ 북마크 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  /* ---------------------------------------------------------
     3. 북마크 토글 핸들러 (설계 문서 4.1, 4.4 반영)
     --------------------------------------------------------- */
  const handleToggleBookmark = async (e, recipeId) => {
    // 4.4 이벤트 전파 방지: 카드 클릭(상세페이지 이동)과 분리
    e.stopPropagation();

    try {
      // 4.1 상태에 따라 DELETE/POST 요청 (여기서는 목록에서 제거이므로 DELETE 위주)
      await customInstance.delete(`/api/recipes/${recipeId}/bookmark`);
      
      // 즉각적인 UI 피드백: 목록에서 해당 아이템 제거 (설계 문서 8 반영)
      setBookmarkedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      
      console.log(`✅ ${recipeId}번 북마크 해제 완료`);
    } catch (err) {
      console.error("❌ 북마크 해제 실패:", err);
      alert("북마크 해제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="bookmark_page_container">
      <main className="con">
        
        <header className="bookmark_header">
          <Section title="나의 BEST 요리 모음">
            <p className="bookmark_subtitle">좋아요를 누른 레시피들을 확인해보세요.</p>
          </Section>
        </header>

        {/* 4.3 UI 상태 반영 섹션 */}
        <div className="bookmark_content">
          {loading ? (
            <div className="loading_box">
              <Loader2 className="spinner" />
              <p>북마크를 불러오는 중...</p>
            </div>
          ) : bookmarkedRecipes.length > 0 ? (
            <div className="card-wrapper">
              {bookmarkedRecipes.map((recipe) => (
                <div key={`bookmark-${recipe.id}`} className="recipe-card-box">
                  <Card
                    title={recipe.title}
                    category={recipe.authorNickname || recipe.category || "레시피"}
                    thumbnailImageUrl={recipe.thumbnailImageUrl}
                    // 북마크 페이지이므로 기본적으로 모두 true 상태
                    isBookmarked={true} 
                    onToggleBookmark={(e) => handleToggleBookmark(e, recipe.id)}
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty_bookmark">
              <Heart size={48} color="#cbd5e0" />
              <p>아직 저장된 레시피가 없습니다.</p>
              <button 
                className="go_main_btn" 
                onClick={() => navigate("/")}
              >
                레시피 구경하러 가기
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}