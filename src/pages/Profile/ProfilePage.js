import React, { useState, useEffect, useCallback } from "react"; 
import { useNavigate } from "react-router-dom"; 
import customInstance from "../../api/api"; 
import { User, Mail, Award, CheckCircle2, ShieldAlert, Loader2, Lock, Sparkles } from "lucide-react";
import "./ProfilePage.css";

export default function ProfilePage() {
  const navigate = useNavigate(); 

  /* --- 1. 유저 정보 상태 관리 (level 필드 포함) --- */
  const [userInfo, setUserInfo] = useState({
    username: "불러오는 중...",
    loginId: "-",
    createdAt: "-",
    grade: "일반 회원",
    level: 1, 
    recipeCount: 0,
    ingredientCount: 0 
  });

  /* --- 2. 뱃지 시스템 상태 관리 --- */
  const [badges, setBadges] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [updatingBadgeId, setUpdatingBadgeId] = useState(null);

  /* ---------------------------------------------------------
     [API 연동 1] 유저 내 정보 로드 및 식재료 개수 동적 산출
     --------------------------------------------------------- */
  const fetchUserData = useCallback(async () => {
    try {
      console.log("📡 [GET] /api/auth/me (내 정보 API 요청 시작)");
      const response = await customInstance({ 
          url: "/api/auth/me", 
          method: "GET" 
      });

      console.log("📡 [GET] /api/my/ingredients (내 식재료 목록 조회 시작)");
      const ingredientRes = await customInstance.get("/api/my/ingredients");
      
      const ingredientList = 
        ingredientRes.data?.data?.items ||    
        ingredientRes.data?.data?.content ||  
        ingredientRes.data?.data ||           
        [];

      const realIngredientCount = 
        ingredientRes.data?.data?.totalCount !== undefined 
          ? ingredientRes.data.data.totalCount 
          : (Array.isArray(ingredientList) ? ingredientList.length : 0);

      const rootData = response.data;
      const actualData = rootData?.data !== undefined ? rootData.data : rootData;

      if (actualData) {
        const matchedUsername = actualData.nickname || actualData.username || actualData.name || "이름 없음";
        const matchedLoginId = actualData.loginId || actualData.userId || actualData.email || "아이디 없음";
        const matchedCreatedAt = actualData.createdAt || actualData.createdDate || actualData.regDate || null;
        const matchedGrade = actualData.grade || actualData.userGrade || "일반 회원";
        const matchedRecipeCount = actualData.recipeCount !== undefined ? actualData.recipeCount : 0;
        const matchedLevel = actualData.level !== undefined ? actualData.level : 1;

        setUserInfo({
          username: matchedUsername,
          loginId: matchedLoginId,
          createdAt: matchedCreatedAt,
          grade: matchedGrade,
          level: matchedLevel, 
          recipeCount: matchedRecipeCount,
          ingredientCount: realIngredientCount 
        });
      }
    } catch (err) {
      console.error("❌ 내 정보 및 식재료 개수 데이터 로드 실패:", err);
      setUserInfo(prev => ({ ...prev, username: "로드 실패", loginId: "오류 발생" }));
    }
  }, []);

  /* ---------------------------------------------------------
     🔥 백엔드 포맷 맞춤형 내 뱃지 목록 파싱 엔진
     --------------------------------------------------------- */
  const fetchMyBadges = useCallback(async () => {
    try {
      setLoadingBadges(true);
      console.log("📡 [GET] /api/my/badges (뱃지 목록 API 요청 시작)");
      const res = await customInstance.get("/api/my/badges");
      
      let badgeList = [];

      if (res.data && res.data.success && res.data.data) {
        const nestedData = res.data.data;
        
        if (Array.isArray(nestedData)) {
          badgeList = nestedData;
        } 
        else if (nestedData.items && Array.isArray(nestedData.items)) {
          badgeList = nestedData.items;
        } 
        else if (nestedData.content && Array.isArray(nestedData.content)) {
          badgeList = nestedData.content;
        }
        else if (nestedData.badges && Array.isArray(nestedData.badges)) {
          badgeList = nestedData.badges;
        }
        else if (typeof nestedData === "object") {
          const objectValues = Object.values(nestedData);
          const potentialArr = objectValues.find(val => Array.isArray(val));
          if (potentialArr) {
            badgeList = potentialArr;
          } else {
            badgeList = objectValues;
          }
        }
      }

      setBadges(badgeList);
    } catch (err) {
      console.error("❌ 뱃지 목록 로드 실패:", err);
      setBadges([]);
    } finally {
      setLoadingBadges(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchMyBadges();
  }, [fetchUserData, fetchMyBadges]);

  /* ---------------------------------------------------------
     [API 연동 3] 뱃지 장착 변경 핸들러
     --------------------------------------------------------- */
  const handleEquipBadge = async (badgeId, isCurrentlyEquipped) => {
    if (isCurrentlyEquipped) return; 

    try {
      setUpdatingBadgeId(badgeId);
      console.log(`📤 [PATCH] /api/my/badges/equipped - 장착 요청 ID: ${badgeId}`);
      
      const res = await customInstance.patch("/api/my/badges/equipped", {
        badgeId: badgeId
      });

      if (res.data?.success || res.status === 200) {
        alert("대표 뱃지가 성공적으로 변경되었습니다!");
        fetchMyBadges(); 
      }
    } catch (err) {
      console.error("❌ 뱃지 장착 변경 실패:", err);
      alert("뱃지 장착 처리 중 오류가 발생했습니다.");
    } finally {
      setUpdatingBadgeId(null);
    }
  };

  const getBadgeIcon = (code) => {
    switch (code) {
      case "DEFAULT": return <Award size={24} color="#4C51BF" />;
      case "FIRST_INGREDIENT": return <Award size={24} color="#E08967" />;
      case "INGREDIENT_COLLECTOR": return <Award size={24} color="#319795" />;
      case "FIRST_CHEF": return <Award size={24} color="#D69E2E" />;
      case "RECIPE_MASTER": return <Award size={24} color="#DD6B20" />;
      case "FIRST_BOOKMARK": return <Award size={24} color="#3182CE" />;
      case "BOOKMARK_EXPLORER": return <Award size={24} color="#E53E3E" />;
      default: return <Award size={24} color="#A0AEC0" />;
    }
  };

  return (
    <div className="profile_page">
      <main className="profile_container">
        
        {/* 프로필 상단 메인 카드 */}
        <section className="profile_card_section">
          <div className="profile_avatar" style={{ position: "relative" }}>
            <User size={48} />
            <div className="profile_level_badge" style={{
              position: "absolute",
              bottom: "-4px",
              right: "-4px",
              background: "linear-gradient(135deg, #ff6b6b, #ff8787)",
              color: "#fff",
              fontSize: "11px",
              fontWeight: "800",
              padding: "2px 6px",
              borderRadius: "10px",
              border: "2px solid #fff",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
            }}>
              Lv.{userInfo.level}
            </div>
          </div>
          <h3 className="profile_name" style={{ marginTop: "12px" }}>{userInfo.username}</h3>
          
          <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "4px" }}>
            <span className="profile_subtitle" style={{ margin: 0 }}>{userInfo.grade}</span>
            <span style={{ 
              fontSize: "12px", 
              color: "#764ba2", 
              background: "#f3f0ff", 
              padding: "1px 6px", 
              borderRadius: "4px", 
              fontWeight: "600" 
            }}>
              레벨 {userInfo.level}
            </span>
          </div>
        </section>

        {/* 활동 통계 섹션 */}
        <section className="profile_stats_section">
          <h3 className="section_title">활동 통계</h3>
          <div className="stat_grid">
            <StatCard value={userInfo.recipeCount} label="저장한 레시피" />
            <StatCard 
              value={userInfo.ingredientCount} 
              label="등록한 재료" 
              onClick={() => navigate("/my-ingredients")}
              style={{ cursor: "pointer" }} 
            />
          </div>
        </section>

        {/* 내 뱃지 컬렉션 섹션 */}
        <section className="profile_badges_section" style={{ marginTop: "24px" }}>
          <h3 className="section_title" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Award size={20} color="#ff6b6b" /> 내 뱃지 컬렉션
          </h3>
          
          <div className="badges_container" style={{ background: "#ffffff", padding: "15px", borderRadius: "12px", border: "1px solid #eee" }}>
            {loadingBadges ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "20px", alignItems: "center", gap: "8px" }}>
                <Loader2 className="spinner" size={18} />
                <span style={{ fontSize: "14px", color: "#666" }}>뱃지를 불러오는 중입니다...</span>
              </div>
            ) : badges.length > 0 ? (
              <div className="badges_grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                {badges.map((badge) => {
                  const bid = badge.badgeId; 
                  const isEquipped = badge.isEquipped || badge.equipped || false;
                  const isLocked = badge.name === "???";

                  return (
                    <div 
                      key={`profile-badge-${bid}`} 
                      className={`badge_item_card ${isEquipped ? "equipped" : ""} ${isLocked ? "locked" : "unlocked"}`}
                      onClick={() => !isLocked && handleEquipBadge(bid, isEquipped)}
                      style={{
                        padding: "12px",
                        borderRadius: "10px",
                        border: isEquipped ? "2px solid #ff6b6b" : "1px solid #e2e8f0",
                        backgroundColor: isEquipped ? "#fff5f5" : "#fff",
                        cursor: isLocked ? "not-allowed" : "pointer",
                        opacity: isLocked ? 0.6 : 1,
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {isLocked ? <Lock size={16} color="#A0AEC0" /> : getBadgeIcon(badge.code)}
                          <span style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                            {badge.name}
                          </span>
                        </div>
                        {isEquipped && <CheckCircle2 size={16} color="#ff6b6b" />}
                      </div>
                      
                      <p style={{ fontSize: "12px", color: "#666", margin: "0", lineHeight: "1.3", paddingLeft: "22px" }}>
                        {isLocked ? badge.achievementCondition : badge.description}
                      </p>

                      {updatingBadgeId === bid && (
                        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>
                          <Loader2 className="spinner" size={16} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "#999", fontSize: "14px" }}>
                <ShieldAlert size={24} style={{ margin: "0 auto 8px", display: "block", color: "#ccc" }} />
                아직 획득한 뱃지가 없습니다.
              </div>
            )}
          </div>
        </section>

        {/* 하단 계정 정보 */}
        <section className="profile_info_section" style={{ marginTop: "24px" }}>
          <h3 className="section_title">계정 정보</h3>
          <div className="info_list">
            <InfoItem icon={<Mail size={20}/>} label="아이디" value={userInfo.loginId} />
            <InfoItem icon={<User size={20}/>} label="닉네임" value={userInfo.username} />
            <InfoItem icon={<Sparkles size={20} color="#764ba2"/>} label="현재 요리 레벨" value={`Lv.${userInfo.level}`} />
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------------------------------------------------------
   💡 [해결 유닛] 메인 컴포넌트 내부에서 누락되었던 서브 컴포넌트 재정의
   --------------------------------------------------------- */
const InfoItem = ({ icon, label, value }) => (
  <div className="info_item">
    <div className="info_icon">{icon}</div>
    <div className="info_content">
      <p className="info_label">{label}</p>
      <p className="info_value">{value}</p>
    </div>
  </div>
);

const StatCard = ({ value, label, onClick, style }) => (
  <div className="stat_card" onClick={onClick} style={style}>
    <p className="stat_value">{value}</p>
    <p className="stat_label">{label}</p>
  </div>
);