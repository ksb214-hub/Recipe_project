import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import "./App.css";

function App() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("로그인 시도:", id, password);
  };

  return (
    <div className="container">
      <form className="card" onSubmit={handleLogin}>
        
        {/* 제목 */}
        <h2 className="title">Login</h2>

        {/* 아이디 */}
        <div className="input-group">
          <Mail className="icon-left" size={20} />
          <input
            type="text"
            placeholder="아이디"
            className="input"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </div>

        {/* 비밀번호 */}
        <div className="input-group">
          <Lock className="icon-left" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* 비밀번호 보기 */}
          <div
            className="icon-right"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        </div>

        {/* 로그인 버튼 */}
        <button className="button">로그인</button>
      </form>
    </div>
  );
}

export default App;