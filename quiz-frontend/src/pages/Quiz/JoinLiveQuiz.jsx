import { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinLiveQuiz = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleJoin = (e) => {
    e.preventDefault();
    if (!pin || !name) {
      setError("Vui lòng nhập đầy đủ Mã PIN và Tên hiển thị!");
      return;
    }

    // Chuyển hướng sang trang Live Quiz kèm theo mã PIN và Tên
    navigate(`/live/${pin}`, { state: { playerName: name } });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <span className="text-6xl block mb-4">🚀</span>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">
            Tham Gia Thi
          </h2>
          <p className="text-gray-500 mt-2">
            Nhập mã PIN từ giáo viên/chủ phòng
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Mã PIN Phòng Thi
            </label>
            <input
              type="text"
              required
              maxLength="6"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border-2 border-gray-200 p-4 rounded-xl text-center text-3xl font-black tracking-[0.5em] text-blue-600 focus:border-blue-500 focus:ring-0 transition-colors uppercase placeholder:text-gray-300"
              placeholder="------"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tên của bạn
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-gray-200 p-4 rounded-xl text-lg font-medium focus:border-blue-500 focus:ring-0 transition-colors"
              placeholder="Ví dụ: Nguyễn Văn A"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xl py-4 rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1"
          >
            VÀO PHÒNG
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinLiveQuiz;
