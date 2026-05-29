import React, { useState } from "react";
import { X, AlertTriangle, Send, CheckCircle2, Loader2, Check } from "lucide-react";
import customInstance from "../../api/api";
import "./ReportModal.css";

/**
 * [ReportModal 컴포넌트]
 * - 로그인 상태에서 특정 레시피에 대한 문제 제기 및 신고 처리를 수행합니다.
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 모달 닫기 함수
 * @param {string|number} targetId - [필수] 백엔드 NOT NULL 제약조건 통과를 위한 레시피 고유 식별자 (recipe_id)
 * @param {string} targetName - 신고 대상 레시피 제목
 * @param {function} onReportSuccess - 신고 성공 시 부모 목록 화면에서 숨김 처리를 수행할 콜백 함수
 */
export default function ReportModal({ isOpen, onClose, targetId, targetName, onReportSuccess }) {
  // MySQL enum('COPYRIGHT','ETC','ILLEGAL','SPAM') 규격 준수
  const [reportReason, setReportReason] = useState("SPAM"); 
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. targetId 유효성 방어 검증 (부모로부터 props 바인딩 에러 유무 확인)
    if (!targetId || targetId === "undefined" || targetId === "null") {
      console.error("❌ [신고 에러] 레시피 고유 ID(targetId)가 누락되었습니다.");
      return alert("올바르지 않은 레시피 식별자입니다. 페이지 새로고침 후 다시 시도해 주세요.");
    }

    // 2. 허용된 4가지 규칙 카테고리 규격 유효성 체크 (QA 요구사항)
    const ALLOWED_REASONS = ["COPYRIGHT", "ETC", "ILLEGAL", "SPAM"];
    if (!ALLOWED_REASONS.includes(reportReason)) {
      return alert("올바르지 않은 신고 사유입니다.");
    }

    setLoading(true);
    try {
      // 📦 [MySQL 테이블 최적화] recipe_reports 스키마에 부합하는 정제된 Payload 구성
      // content 필드는 DB 테이블에 없으므로 제외하고, recipeId를 포함하여 전송합니다.
      const payload = {
        reason: reportReason,        // Enums: 'COPYRIGHT' | 'ETC' | 'ILLEGAL' | 'SPAM'
        recipeId: Number(targetId)   // NOT NULL 제약조건 방어용 타입 정제 주입
      };

      console.log(`📤 [POST] /api/recipes/${Number(targetId)}/report 호출 시도`, payload);

      // POST 메서드로 백엔드 통신 실행 (기획서 오기입 정정 반영)
      const res = await customInstance.post(`/api/recipes/${Number(targetId)}/report`, payload);

      if (res.status === 200 || res.data?.success) {
        // [QA 기대 결과 2번] "신고 됐습니다." 문구 팝업 출력
        alert("신고 됐습니다.");
        setIsSubmitted(true);

        // [QA 기대 결과 3번] 목록페이지 레시피 숨김 처리 연계 함수 작동
        if (onReportSuccess && targetId) {
          onReportSuccess(Number(targetId));
        }

        // 1.5초 후 모달 닫기 및 상태값 초기화 시퀀스
        setTimeout(() => {
          onClose();
          setIsSubmitted(false);
          setReportReason("SPAM");
        }, 1500);
      }
    } catch (err) {
      console.error("❌ 레시피 신고 접수 에러:", err);
      const serverErrorMessage = err.response?.data?.message || err.response?.data?.error || "서버 내부 통신 실패";
      alert(`신고 처리 중 오류가 발생했습니다: ${serverErrorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal_overlay">
      <div className="modal_container report_modal">
        <header className="modal_header">
          <h2>레시피 신고하기</h2>
          <button type="button" onClick={onClose} className="close_btn" disabled={loading}>
            <X size={24} />
          </button>
        </header>

        {isSubmitted ? (
          <div className="submission_success">
            <CheckCircle2 size={48} color="#FF3B30" className="success_checkmark" />
            <p>신고 접수가 정상 완료되었습니다.<br />해당 레시피는 목록에서 숨김 처리됩니다.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal_body">
            <div className="target_info">
              <AlertTriangle size={18} color="#FF3B30" />
              <span>신고 대상: <strong>{targetName || `레시피 #${targetId}`}</strong></span>
            </div>

            <label className="input_group_label">신고 사유 선택 (MySQL Schema Enum)</label>
            
            {/* 세련된 버튼 그리드 형태의 사유 선택기 */}
            <div className="report_types_grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '16px 0' }}>
              <button 
                type="button"
                className={`type_grid_btn ${reportReason === "SPAM" ? "active" : ""}`}
                onClick={() => setReportReason("SPAM")}
              >
                {reportReason === "SPAM" && <Check size={14} style={{ marginRight: '4px' }} />}
                스팸 / 도배 (SPAM)
              </button>
              <button 
                type="button"
                className={`type_grid_btn ${reportReason === "COPYRIGHT" ? "active" : ""}`}
                onClick={() => setReportReason("COPYRIGHT")}
              >
                {reportReason === "COPYRIGHT" && <Check size={14} style={{ marginRight: '4px' }} />}
                저작권 침해 (COPYRIGHT)
              </button>
              <button 
                type="button"
                className={`type_grid_btn ${reportReason === "ILLEGAL" ? "active" : ""}`}
                onClick={() => setReportReason("ILLEGAL")}
              >
                {reportReason === "ILLEGAL" && <Check size={14} style={{ marginRight: '4px' }} />}
                불법 정보 (ILLEGAL)
              </button>
              <button 
                type="button"
                className={`type_grid_btn ${reportReason === "ETC" ? "active" : ""}`}
                onClick={() => setReportReason("ETC")}
              >
                {reportReason === "ETC" && <Check size={14} style={{ marginRight: '4px' }} />}
                기타 사유 (ETC)
              </button>
            </div>

            <p className="report_notice_text">
              ※ 신고 제출 시 플랫폼 운영 규정에 의거하여 본 레시피 콘텐츠는 즉시 피드 목록에서 블라인드(숨김) 처리됩니다.
            </p>

            <button 
              type="submit" 
              className="submit_btn" 
              style={{ backgroundColor: '#FF3B30', color: '#fff', width: '100%', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px' }} 
              disabled={loading}
            >
              {loading ? <Loader2 className="spinner" size={18} /> : <Send size={18} />}
              {loading ? "신고 접수 중..." : "신고 완료하기"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}