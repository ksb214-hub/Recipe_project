import "./App.css";
import Login from "./Login";
import SearchPage from "./SearchPage";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="app">

        {/*  네비바 */}
        <nav className="navbar">
          <h2 className="logo">🍳 Recipe</h2>

          <div className="nav-buttons">
            <Link to="/search" className="nav-btn">검색</Link>
            <Link to="/" className="nav-btn">로그인</Link>
          </div>
        </nav>

        {/*  페이지 영역 */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;