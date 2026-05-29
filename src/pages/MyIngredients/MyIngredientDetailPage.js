import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, Trash2, Refrigerator, Info, Loader2, Edit3 } from "lucide-react";
import customInstance from "../../api/api";
import "./MyIngredientDetailPage.css";

export default function MyIngredientDetailPage() {
  const { id } = useParams(); // URL 파라미터에서 보유 식재료의 고유 ID 추출
  const navigate = useNavigate();
  
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  /* ---------------------------------------------------------
     [단건 조회] 내 냉장고 식재료 상세 정보 조회 (GET: /api/my/ingredients/{id})
     --------------------------------------------------------- */
  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        setLoading(true);
        const res = await customInstance.get(`/api/my/ingredients/${id}`);
        // 서버 응답 바인딩 규격 맞춤 (res.data.data 또는 res.data)
        setDetail(res.data?.data || res.data);
      } catch (err) {
        console.error("❌ 상세 정보 조회 실패:", err);
        alert("재료 정보를 가져오는 중 오류가 발생했습니다.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetailData();
  }, [id, navigate]);

  /* ---------------------------------------------------------
     [소진/삭제] 내 냉장고 식재료 삭제 (DELETE: /api/my/ingredients/{id})
     --------------------------------------------------------- */
  const handleDelete = async () => {
    if (!window.confirm("이 식재료를 냉장고에서 소진(삭제) 처리하시겠습니까?")) return;

    try {
      setDeleting(true);
      await customInstance.delete(`/api/my/ingredients/${id}`);
      alert("성공적으로 소진 처리되었습니다.");
      navigate("/my-ingredients"); // 삭제 완료 후 목록으로 리다이렉트
    } catch (err) {
      console.error("❌ 재료 삭제 에러:", err);
      alert("삭제 처리 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="ing_loading_full">
        <Loader2 className="spinner" />
        <p>재료 상세 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 디데이 텍스트 가공 처리 (목록 페이지와 규격 맞춤)
  const daysLeft = detail?.daysLeft !== undefined ? detail.daysLeft : (detail?.dDay || 0);
  let dDayText = "";
  if (daysLeft === 0) dDayText = "D-Day";
  else if (daysLeft > 0) dDayText = `D-${daysLeft}`;
  else dDayText = `D+${Math.abs(daysLeft)} (만료)`;

  return (
    <div className="mobile_container white_bg">
      {/* 헤더 영역 */}
      <header className="ing_header">
        <button onClick={() => navigate(-1)} className="back_btn">
          <ChevronLeft size={24} />
        </button>
        <h1>재료 상세 정보</h1>
        <div style={{ width: 24 }} /> {/* 레이아웃 좌우 균형을 위한 더미 공간 */}
      </header>

      <main className="detail_main_body">
        {/* 상단 비주얼 영역 */}
        <div className="detail_visual_card">
          <div className="visual_circle">
            <Refrigerator size={44} color="#00B341" />
          </div>
          <h2>{detail?.name || "알 수 없는 재료"}</h2>
          <div className={`detail_badge ${daysLeft <= 3 ? "danger" : ""}`}>
            {dDayText}
          </div>
        </div>

        {/* 상세 스펙 리스트 영역 */}
        <div className="info_list_group">
          <div className="info_item">
            <div className="info_label">
              <Info size={16} color="#555" />
              <span>보유 수량</span>
            </div>
            <div className="info_value">
              {detail?.quantity} {detail?.unit || "개"}
            </div>
          </div>

          <div className="info_item">
            <div className="info_label">
              <Calendar size={16} color="#555" />
              <span>소비/유통기한</span>
            </div>
            <div className="info_value">
              {detail?.expirationDate ? detail.expirationDate.split("T")[0] : "-"}
            </div>
          </div>

          {detail?.recommendedExpirationDate && (
            <div className="info_item">
              <div className="info_label">
                <Calendar size={16} color="#999" />
                <span className="sub_label">권장 소비기한</span>
              </div>
              <div className="info_value sub_value">
                {detail.recommendedExpirationDate.split("T")[0]}
              </div>
            </div>
          )}
        </div>

        {/* 하단 액션 버튼 영역 (정보 수정하기 버튼 통합 버전) */}
        <div className="detail_action_container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* 💡 새롭게 배치된 수정하기 네비게이트 버튼 */}
          <button 
            type="button" 
            className="edit_link_btn" 
            onClick={() => navigate(`/my-ingredients/edit/${id}`)}
            style={{ 
              width: '100%', 
              padding: '14px', 
              backgroundColor: '#00B341', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '15px', 
              fontWeight: '600', 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '8px' 
            }}
          >
            <Edit3 size={16} />
            정보 수정하기
          </button>

          {/* 소진(삭제) 버튼 */}
          <button 
            type="button" 
            className="delete_huge_btn" 
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 size={18} />
            {deleting ? "삭제 처리 중..." : "이 재료 냉장고에서 빼기"}
          </button>
        </div>
      </main>
    </div>
  );
}