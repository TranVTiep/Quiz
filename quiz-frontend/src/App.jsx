import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Layouts & Components
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages - Auth & Public
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

// Pages - Quiz (Thi cử)
import QuizDetail from "./pages/Quiz/QuizDetail";
import TakeQuiz from "./pages/Quiz/TakeQuiz";
import QuizResult from "./pages/Quiz/QuizResult";
import JoinLiveQuiz from "./pages/Quiz/JoinLiveQuiz";
import LiveQuizPlayer from "./pages/Quiz/LiveQuizPlayer";
import LiveQuizHost from "./pages/Quiz/LiveQuizHost";
import LiveParticipantDetail from "./pages/Quiz/LiveParticipantDetail";
// Pages - User Dashboard (Quản lý cá nhân)
import MyQuizzes from "./pages/User/MyQuizzes";
import CreateQuiz from "./pages/User/CreateQuiz";
import CreateQuizManual from "./pages/User/CreateQuizManual";
import EditQuiz from "./pages/User/EditQuiz";
import History from "./pages/User/History";
import LiveRoomDetail from "./pages/Quiz/LiveRoomDetail";

// Pages - Question Bank (Ngân hàng câu hỏi)
import QuestionBankList from "./pages/Bank/QuestionBankList";
import CreateQuestionBank from "./pages/Bank/CreateQuestionBank";
import EditQuestionBank from "./pages/Bank/EditQuestionBank";
import GenerateQuizFromBank from "./pages/Bank/GenerateQuizFromBank";

// Pages - Admin
import ManageUsers from "./pages/Admin/ManageUsers";
import ModerateQuizzes from "./pages/Admin/ModerateQuizzes";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* =========================================
              NHÓM 1: GIAO DIỆN CHUNG (MainLayout) 
              ========================================= */}
          <Route path="/" element={<MainLayout />}>
            {/* 🟢 PUBLIC ROUTES (Ai cũng vào được) */}
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="join" element={<JoinLiveQuiz />} />
            <Route path="live/:pin" element={<LiveQuizPlayer />} />

            {/* 🔴 PROTECTED ROUTES (Bắt buộc phải đăng nhập) */}
            <Route element={<ProtectedRoute />}>
              {/* --- 1. Luồng Thi Cử (Chi tiết, Làm bài, Kết quả) --- */}
              <Route path="quizzes/:id" element={<QuizDetail />} />
              <Route path="quizzes/:id/take" element={<TakeQuiz />} />
              <Route path="quizzes/:id/result" element={<QuizResult />} />

              {/* --- 2. Quản lý Đề Thi Của Tôi --- */}
              <Route path="my-quizzes" element={<MyQuizzes />} />
              <Route path="my-quizzes/create" element={<CreateQuiz />} />
              <Route
                path="my-quizzes/create-manual"
                element={<CreateQuizManual />}
              />
              <Route path="my-quizzes/edit/:id" element={<EditQuiz />} />
              <Route
                path="my-quizzes/generate"
                element={<GenerateQuizFromBank />}
              />
              <Route path="live/host" element={<LiveQuizHost />} />
              <Route path="live/detail" element={<LiveParticipantDetail />} />

              {/* --- 3. Quản lý Ngân Hàng Câu Hỏi --- */}
              <Route path="banks" element={<QuestionBankList />} />
              <Route path="banks/create" element={<CreateQuestionBank />} />
              <Route path="banks/edit/:id" element={<EditQuestionBank />} />

              {/* --- 4. Lịch Sử Làm Bài --- */}
              <Route path="history" element={<History />} />
              <Route path="live/history/:id" element={<LiveRoomDetail />} />
            </Route>
          </Route>

          {/* =========================================
              NHÓM 2: GIAO DIỆN QUẢN TRỊ (AdminLayout) 
              ========================================= */}
          {/* Lưu ý: Component AdminLayout của bạn đã tự check role admin rồi */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<ManageUsers />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="quizzes" element={<ModerateQuizzes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
