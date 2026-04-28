import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import customInstance from "../../api/api"; 
import { User, Mail, Calendar, Award } from "lucide-react";
import "./ProfilePage.css";

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState({
    username: "불러오는 중...",
    loginId: "-",
    createdAt: "-",
    grade: "일반 회원",
    recipeCount: 0,
    ingredientCount: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await customInstance({ 
            url: "/api/auth/me", 
            method: "GET" 
        });

        // 서버 응답이 바로 객체인 경우 (콘솔 로그 확인 결과에 맞춤)
        const data = response.data; 
        console.log("서버 응답 확인:", data);
        
        if (data) {
          setUserInfo({
            username: data.nickname || "이름 없음",
            loginId: data.loginId || "아이디 없음",
            createdAt: data.createdAt || "정보 없음",
            grade: data.grade || "일반 회원",
            recipeCount: data.recipeCount || 0,
            ingredientCount: data.ingredientCount || 0
          });
        }
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="profile_page">
      <Header />
      <main className="profile_container">
        <div className="profile_header"><h2>내 프로필</h2></div>

        <section className="profile_card">
          <div className="profile_avatar"><User size={48} /></div>
          <h3 className="profile_name">{userInfo.username}</h3>
          <p className="profile_subtitle">제로냉 사용자</p>
        </section>

        <section className="profile_info_section">
          <h3 className="section_title">계정 정보</h3>
          <div className="info_list">
            <InfoItem icon={<Mail size={20}/>} label="아이디" value={userInfo.loginId} />
            <InfoItem icon={<User size={20}/>} label="닉네임" value={userInfo.username} />
            <InfoItem icon={<Calendar size={20}/>} label="가입일" value={userInfo.createdAt} />
            <InfoItem icon={<Award size={20}/>} label="등급" value={userInfo.grade} />
          </div>
        </section>

        <section className="profile_stats_section">
          <h3 className="section_title">활동 통계</h3>
          <div className="stats_grid">
            <StatCard value={userInfo.recipeCount} label="저장한 레시피" />
            <StatCard value={userInfo.ingredientCount} label="등록한 재료" />
          </div>
        </section>
      </main>
    </div>
  );
}

const InfoItem = ({ icon, label, value }) => (
  <div className="info_item">
    <div className="info_icon">{icon}</div>
    <div className="info_content">
      <p className="info_label">{label}</p>
      <p className="info_value">{value}</p>
    </div>
  </div>
);

const StatCard = ({ value, label }) => (
  <div className="stat_card">
    <p className="stat_value">{value}</p>
    <p className="stat_label">{label}</p>
  </div>
);