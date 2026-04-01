// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🔥 Layout (Header 포함)
import Layout from "./layout/Layout";

// 📄 Pages
import Main from "./pages/Main/Main";
import Login from "./pages/Login/Login";
import SearchPage from "./pages/Search/SearchPage";
import RegPage from "./pages/Reg/RegPage";   // 🔥 추가
import FindId from "./pages/Find/FindId/FindId";
import FindPw from "./pages/Find/FindPw/FindPw";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= 공통 Layout 적용 ================= */}
        <Route path="/" element={<Layout><Main /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/search" element={<Layout><SearchPage /></Layout>} />
        <Route path="/reg" element={<Layout><RegPage /></Layout>} /> {/* 🔥 추가 */}
        <Route path="/find-id" element={<Layout><FindId /></Layout>} />
        <Route path="/find-pw" element={<Layout><FindPw /></Layout>} />

        {/* ================= 404 ================= */}
        <Route path="*" element={<div>404 Not Found</div>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;