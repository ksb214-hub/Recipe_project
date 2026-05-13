import React, { useState } from "react";
import { X, AlertTriangle, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import "./ReportModal.css";

/**
 * [ReportModal 컴포넌트]
 * - 사용자가 문제(재료 오기입, 레시피 오류 등)를 신고하거나 제보할 때 사용합니다.
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 모달 닫기 함수
 * @param {string} targetName - 신고 대상 이름 (예: "양배추", "김치찌개 레시피")
 */
export default function ReportModal({ isOpen, onClose, targetName }) {
  const [reportType, setReportType] = useState("error"); // error, suggestion, inappropriate
  const [content, setContent] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 실제 서비스에서는 여기서 API 호출을 진행합니다.
    const payload = {
      target: targetName,
      type: reportType,
      content: content,
      timestamp: new Date().toISOString()
    };
    
    console.log("🚀 [Report Submitted]:", payload);
    
    // 제출 완료 처리
    setIsSubmitted(true);
    
    // 2초 후 모달 자동 닫기 및 상태 초기화
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
      setContent("");
      setReportType("error");
    }, 2000);
  };

  return (
    <div className="modal_overlay">
      <div className="modal_container report_modal">
        <header className="modal_header">
          <h2>제보하기</h2>
          <button onClick={onClose} className="close_btn"><X size={24} /></button>
        </header>

        {isSubmitted ? (
          <div className="submission_success">
            <CheckCircle2 size={48} color="#00B341" />
            <p>소중한 의견이 접수되었습니다!<br/>더 나은 제로냉이 될게요.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal_body">
            <div className="target_info">
              <AlertTriangle size={18} color="#FF9500" />
              <span>대상: <strong>{targetName}</strong></span>
            </div>

            <div className="report_types">
              <button 
                type="button"
                className={`type_btn ${reportType === "error" ? "active" : ""}`}
                onClick={() => setReportType("error")}
              >
                정보 오류
              </button>
              <button 
                type="button"
                className={`type_btn ${reportType === "suggestion" ? "active" : ""}`}
                onClick={() => setReportType("suggestion")}
              >
                개선 제안
              </button>
              <button 
                type="button"
                className={`type_btn ${reportType === "inappropriate" ? "active" : ""}`}
                onClick={() => setReportType("inappropriate")}
              >
                부적절함
              </button>
            </div>

            <div className="input_group">
              <label><MessageSquare size={16} /> 상세 내용</label>
              <textarea 
                placeholder="내용을 입력해 주세요 (최대 200자)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={200}
                required
              />
            </div>

            <button type="submit" className="submit_btn" disabled={!content.trim()}>
              <Send size={18} /> 제출하기
            </button>
          </form>
        )}
      </div>
    </div>
  );
}