// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🔥 Layout (Header 포함)
import Layout from "./layout/Layout";

// 📄 Pages
import Main from "./pages/Main/Main";
import Login from "./pages/Login/Login";
import SearchPage from "./pages/Search/SearchPage";
import RegPage from "./pages/Reg/RegPage";   // 🔥 추가
import RecipeRegPage from "./pages/RecipeReg/RecipeRegPage";
import FindId from "./pages/Find/FindId/FindId";
import FindPw from "./pages/Find/FindPw/FindPw";
import SignUpPage from "./pages/SignUp/SignUpPage";

// src/App.js 수정 버전
function App() {
  return (
    <BrowserRouter>
      {/* 📱 모바일 프레임 컨테이너 시작 */}
      <div className="App"> 
        <main>
          <Routes>
            {/* 공통 Layout 적용 */}
            <Route path="/" element={<Layout><Main /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/search" element={<Layout><SearchPage /></Layout>} />
            <Route path="/reg" element={<Layout><RegPage /></Layout>} />
            <Route path="/find-id" element={<Layout><FindId /></Layout>} />
            <Route path="/find-pw" element={<Layout><FindPw /></Layout>} />
            <Route path="/recipe-reg" element={<Layout><RecipeRegPage /></Layout>}/>
            <Route path="/join" element={<SignUpPage />} /> {/* 여기도 프레임 안으로 들어갑니다 */}
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </main>
      </div>
      {/* 📱 모바일 프레임 컨테이너 끝 */}
    </BrowserRouter>
  );
}

export default App;