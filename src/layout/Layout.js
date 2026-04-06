// src/layout/Layout.js
import Header from "../components/Header/Header";

function Layout({ children }) {
  return (
    <div className="layout_wrapper" style={{ width: "100%", position: "relative" }}>
      {/* 헤더는 Header 컴포넌트 내부에서 width: 100% 혹은 402px로 잡혀있어야 합니다 */}
      <Header />
      
      {/* 상단 헤더 높이만큼 여백을 주고, 내부 콘텐츠가 가득 차게 설정 */}
      <main style={{ 
        marginTop: "60px", 
        width: "100%", 
        minHeight: "calc(874px - 60px)", // 프레임 높이에서 헤더 높이를 뺀 나머지
        display: "flex",
        flexDirection: "column"
      }}>
        {children}
      </main>
    </div>
  );
}

export default Layout;