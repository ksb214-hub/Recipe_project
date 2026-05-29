import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 🔥 Layout (Header 포함)
import Layout from "./layout/Layout";

// 📄 Pages
import Main from "./pages/Main/Main";
import Login from "./pages/Login/Login";
import SearchPage from "./pages/Search/SearchPage";

// 인증 페이지
import FindId from "./pages/Find/FindId/FindId";
import FindPw from "./pages/Find/FindPw/FindPw";
import SignUpPage from "./pages/SignUp/SignUpPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import SettingsPage from "./pages/Setting/SettingPage";

// 지출 목록 페이지
import ExpensePage from "./pages/Expense/ExpensePage";

// 레시피 페이지
import RecipeDetail from './pages/RecipeDetail/RecipeDetail';
import RecipeRecommendPage from "./pages/RecipeRecommendPage/RecipeRecommendPage";
import MyRecipePage from "./pages/MyRecipe/MyRecipePage";
import RecipeEditPage from "./pages/RecipeEdit/RecipeEditPage";
import RecipeRegPage from "./pages/RecipeReg/RecipeRegPage";

// 재료 페이지
import MyIngredientsPage from "./pages/MyIngredients/MyIngredientsPage";
import MyIngredientDetailPage from "./pages/MyIngredients/MyIngredientDetailPage"; // 신규 임포트
import RegPage from "./pages/Reg/RegPage";
import MyIngredientEditPage from "./pages/MyIngredients/MyIngredientEditPage";


function App() {
  return (
    <BrowserRouter>
      <div className="App"> 
        <main>
          <Routes>
            {/* 1. 기본 경로 처리 */}
            <Route path="/" element={<Navigate to="/main" replace />} />

            {/* 2. Layout(Header 포함)이 적용되는 페이지들 */}
            <Route path="/main" element={<Layout><Main /></Layout>} />
            <Route path="/search" element={<Layout><SearchPage /></Layout>} />
            <Route path="/recommend" element={<Layout><RecipeRecommendPage /></Layout>} />
            <Route path="/reg" element={<Layout><RegPage /></Layout>} />
            <Route path="/recipe-reg" element={<Layout><RecipeRegPage /></Layout>}/>
            <Route path="/my-ingredients" element={<Layout><MyIngredientsPage /></Layout>} />
            <Route path="/my-recipes" element={<Layout><MyRecipePage /></Layout>} />
            
            {/* 레시피 상세/등록/수정 (헤더가 필요한 경우 Layout으로 감싸기) */}
            <Route path="/recipes/new" element={<Layout><RecipeEditPage /></Layout>} />
            <Route path="/recipes/edit/:id" element={<Layout><RecipeEditPage /></Layout>} />
            <Route path="/recipe/:id" element={<Layout><RecipeDetail /></Layout>} />

            {/* 유저 관련 서비스 */}
            <Route path="/expense" element={<Layout><ExpensePage /></Layout>} />
            <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
            <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />

            {/* 3. Layout(Header)이 필요 없는 페이지들 (로그인/가입 등) */}
            <Route path="/login" element={<Login />} />
            <Route path="/join" element={<SignUpPage />} />
            <Route path="/find-id" element={<FindId />} />
            <Route path="/find-pw" element={<FindPw />} />

            <Route path="/my-ingredients/:id" element={<MyIngredientDetailPage />} />
            <Route path="/my-ingredients/edit/:id" element={<Layout><MyIngredientEditPage /></Layout>} />

            {/* 4. 404 페이지 */}
            <Route path="*" element={<div className="p-20 text-center">404 Not Found</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;