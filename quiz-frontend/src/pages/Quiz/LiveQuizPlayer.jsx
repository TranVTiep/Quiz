import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import quizApi from "../../services/quizApi";

// Khởi tạo socket ngoài component để tránh re-render liên tục
// Đảm bảo URL này khớp với URL Backend của bạn (Ví dụ: http://localhost:5000)
const SOCKET_SERVER_URL = "http://localhost:5000";

const LiveQuizPlayer = () => {
  const { pin } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const playerName = location.state?.playerName;

  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("connecting"); // connecting, waiting, playing, finished
  const [error, setError] = useState("");
  const [quizData, setQuizData] = useState(null);

  // State khi làm bài
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  // Dùng ref để theo dõi việc chuyển tab (Anti-cheat)
  const isTabActive = useRef(true);

  // ==========================================
  // KHỞI TẠO SOCKET & LẮNG NGHE SỰ KIỆN
  // ==========================================
  useEffect(() => {
    if (!playerName) {
      navigate("/join");
      return;
    }

    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    // Báo danh vào phòng
    newSocket.emit("join-room", { pin, name: playerName });

    // Lắng nghe: Vào phòng thành công
    newSocket.on("join-success", async ({ quizId }) => {
      setStatus("waiting");
      try {
        // Tải sẵn dữ liệu đề thi về máy (ẩn đáp án đúng)
        const data = await quizApi.getQuizForTake(quizId);
        setQuizData(data);
      } catch (err) {
        setError("Lỗi khi tải đề thi. Vui lòng thử lại.");
      }
    });

    // Lắng nghe: Chủ phòng bấm Bắt Đầu
    newSocket.on("quiz-started", () => {
      setStatus("playing");
    });

    // Lắng nghe: Nộp bài thành công (Server trả điểm về)
    newSocket.on("submit-success", (scoreData) => {
      setResult(scoreData);
      setStatus("finished");
    });

    // Lắng nghe: Lỗi
    newSocket.on("error", (msg) => {
      setError(msg);
      setStatus("error");
    });

    return () => newSocket.disconnect();
  }, [pin, playerName, navigate]);

  // ==========================================
  // HỆ THỐNG ANTI-CHEAT (BẮT CHUYỂN TAB)
  // ==========================================
  useEffect(() => {
    if (status !== "playing" || !socket) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabActive.current = false;
        // Bắn sự kiện gian lận lên Server
        socket.emit("report-violation", { pin });
        alert(
          "⚠️ CẢNH BÁO: Bạn vừa chuyển tab hoặc thu nhỏ trình duyệt! Hệ thống đã ghi nhận vi phạm.",
        );
      } else {
        isTabActive.current = true;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [status, socket, pin]);

  // ==========================================
  // XỬ LÝ LÀM BÀI
  // ==========================================
  const handleOptionSelect = (questionId, optionIndex) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) {
        return prev.map((a) =>
          a.questionId === questionId
            ? { ...a, selectedOption: optionIndex }
            : a,
        );
      }
      return [...prev, { questionId, selectedOption: optionIndex }];
    });
  };

  const handleSubmit = () => {
    if (window.confirm("Bạn có chắc chắn muốn nộp bài?")) {
      socket.emit("submit-live-quiz", { pin, answers });
    }
  };

  // ==========================================
  // RENDER GIAO DIỆN THEO TRẠNG THÁI
  // ==========================================
  if (status === "connecting")
    return (
      <div className="text-center mt-20 text-gray-500 font-medium">
        Đang kết nối tới phòng thi...
      </div>
    );
  if (status === "error")
    return (
      <div className="text-center mt-20 text-red-500 font-bold text-xl">
        ❌ {error}
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 pb-20">
      {/* ⏳ MÀN HÌNH PHÒNG CHỜ */}
      {status === "waiting" && (
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center border-t-8 border-yellow-400">
          <span className="text-6xl block mb-6 animate-bounce">⏳</span>
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            Đã vào phòng thành công!
          </h2>
          <p className="text-xl text-gray-600 font-medium">
            Xin chào,{" "}
            <span className="text-blue-600 font-bold">{playerName}</span>
          </p>
          <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500 mb-2">Mã PIN phòng thi:</p>
            <p className="text-4xl font-black tracking-[0.5em] text-gray-800">
              {pin}
            </p>
          </div>
          <p className="mt-8 text-yellow-600 font-bold text-lg flex items-center justify-center gap-2">
            <span className="animate-spin text-2xl">⚙️</span> Đang đợi chủ phòng
            bấm bắt đầu...
          </p>
        </div>
      )}

      {/* 🎮 MÀN HÌNH LÀM BÀI */}
      {status === "playing" && quizData && (
        <div className="animate-fadeIn">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-sm text-red-700 flex items-start gap-3">
            <span className="text-xl">🚨</span>
            <div>
              <p className="font-bold mb-1">Chế độ giám sát đang bật!</p>
              <p>
                Mọi hành vi chuyển tab, thu nhỏ trình duyệt, hoặc mở ứng dụng
                khác sẽ bị ghi nhận thành vi phạm và báo cáo trực tiếp cho Giám
                thị.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {quizData.questions.map((q, index) => (
              <div
                key={q._id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <h3 className="font-bold text-lg mb-4 text-gray-800">
                  Câu {index + 1}: {q.questionText}
                </h3>
                <div className="space-y-3">
                  {q.options.map((opt, optIndex) => {
                    const isSelected =
                      answers.find((a) => a.questionId === q._id)
                        ?.selectedOption === optIndex;
                    return (
                      <label
                        key={optIndex}
                        className={`flex items-center p-3 rounded-lg cursor-pointer border-2 transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 shadow-sm"
                            : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q._id}`}
                          checked={isSelected}
                          onChange={() => handleOptionSelect(q._id, optIndex)}
                          className="w-5 h-5 text-blue-600"
                        />
                        <span className="ml-3 font-medium text-gray-700">
                          {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center sticky bottom-6 z-50">
            <button
              onClick={handleSubmit}
              className="bg-green-500 hover:bg-green-600 text-white text-xl font-black py-4 px-12 rounded-full shadow-xl shadow-green-200 transition-transform transform hover:-translate-y-1 w-full md:w-auto"
            >
              NỘP BÀI NGAY
            </button>
          </div>
        </div>
      )}

      {/* 🎉 MÀN HÌNH KẾT QUẢ */}
      {status === "finished" && result && (
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center border-t-8 border-green-500 animate-fadeIn">
          <span className="text-6xl block mb-6">🎉</span>
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            Đã Nộp Bài Thành Công!
          </h2>
          <p className="text-gray-500 mb-8">Dưới đây là kết quả của bạn</p>

          <div className="flex justify-center items-center gap-12 mb-8 bg-gray-50 p-8 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
                Điểm Số
              </p>
              <p className="text-6xl font-black text-blue-600">
                {result.score}
                <span className="text-2xl text-gray-400">/10</span>
              </p>
            </div>
            <div className="h-16 w-px bg-gray-300"></div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
                Câu Đúng
              </p>
              <p className="text-4xl font-bold text-green-500">
                {result.correctCount}
                <span className="text-xl text-gray-400">
                  /{result.totalQuestions}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="text-gray-500 font-bold hover:text-gray-800 underline transition-colors"
          >
            Quay về trang chủ
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveQuizPlayer;
