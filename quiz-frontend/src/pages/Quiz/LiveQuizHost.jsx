import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import quizApi from "../../services/quizApi";
import { AuthContext } from "../../contexts/AuthContext";

const SOCKET_SERVER_URL = "http://localhost:5000";

const LiveQuizHost = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [quizDetail, setQuizDetail] = useState(null);

  const [socket, setSocket] = useState(null);
  const [roomStatus, setRoomStatus] = useState("setup");
  const [pin, setPin] = useState("");
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await quizApi.getMyQuizzes();
        setQuizzes(data);
      } catch (error) {
        alert("Lỗi tải danh sách đề thi");
      }
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on("room-created", (data) => {
      setPin(data.pin);
      setRoomStatus("lobby");
    });

    newSocket.on("update-participants", (data) => {
      setParticipants(data);
    });

    newSocket.on("update-leaderboard", (data) => {
      const sorted = [...data].sort((a, b) => b.score - a.score);
      setParticipants(sorted);
    });

    newSocket.on("error", (msg) => {
      alert(msg);
    });

    return () => newSocket.disconnect();
  }, []);

  const handleCreateRoom = async () => {
    if (!selectedQuiz) return alert("Vui lòng chọn một đề thi!");
    try {
      const data = await quizApi.getQuizById(selectedQuiz);
      setQuizDetail(data);
      socket.emit("create-room", { quizId: selectedQuiz, hostId: user.id });
    } catch (error) {
      alert("Lỗi khi tải chi tiết đề thi để tạo phòng!");
    }
  };

  const handleStartQuiz = () => {
    socket.emit("start-quiz", { pin });
    setRoomStatus("playing");
  };

  const handleEndQuiz = () => {
    if (window.confirm("Bạn có chắc chắn muốn kết thúc bài thi sớm?")) {
      //
      socket.emit("end-quiz", { pin });
      setRoomStatus("finished");
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4 pb-20 relative">
      {/* ================= STEP 1: CHỌN ĐỀ THI ================= */}
      {roomStatus === "setup" && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-gray-800 mb-6 text-center">
            🎮 Tổ chức Live Quiz
          </h2>
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Chọn đề thi bạn muốn tổ chức
            </label>
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-0 focus:border-blue-500 font-medium"
            >
              <option value="">-- Vui lòng chọn đề thi --</option>
              {quizzes.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.title} ({q.questions?.length || 0} câu)
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreateRoom}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 text-lg"
          >
            Tạo Phòng Thi
          </button>
        </div>
      )}

      {/* ================= STEP 2: LOBBY ================= */}
      {roomStatus === "lobby" && (
        <div className="text-center animate-fadeIn">
          <div className="bg-white p-10 rounded-2xl shadow-xl border-t-8 border-yellow-400 mb-8 inline-block w-full max-w-3xl">
            <p className="text-gray-500 font-bold uppercase tracking-widest mb-2">
              Mã Tham Gia Phòng Thi
            </p>
            <h1 className="text-8xl font-black text-gray-900 tracking-[0.2em]">
              {pin}
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Yêu cầu học sinh truy cập{" "}
              <strong className="text-blue-600">/join</strong> và nhập mã này
            </p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              👥 Người tham gia ({participants.length})
            </h3>
            <button
              onClick={handleStartQuiz}
              disabled={participants.length === 0}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-black py-3 px-8 rounded-full shadow-lg transition-transform transform hover:-translate-y-1 text-xl"
            >
              BẮT ĐẦU THI NGAY
            </button>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {participants.length === 0 ? (
              <p className="text-gray-400 italic">
                Đang chờ người chơi tham gia...
              </p>
            ) : (
              participants.map((p, i) => (
                <div
                  key={i}
                  className="bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200 font-bold text-lg text-gray-700 animate-bounce"
                >
                  {p.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= STEP 3 & 4: PLAYING & FINISHED ================= */}
      {(roomStatus === "playing" || roomStatus === "finished") && (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-6 bg-gray-900 p-6 rounded-2xl shadow-lg">
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">
                Live Leaderboard
              </p>
              <h2 className="text-3xl font-black text-white">
                Mã PIN: <span className="text-yellow-400">{pin}</span>
              </h2>
            </div>
            {roomStatus === "playing" && (
              <button
                onClick={handleEndQuiz}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md"
              >
                ⏹️ Kết Thúc Sớm
              </button>
            )}
            {roomStatus === "finished" && (
              <span className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg shadow-md">
                ✅ Đã Kết Thúc
              </span>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200 text-gray-700">
                  <th className="p-5 font-black text-center w-20">#</th>
                  <th className="p-5 font-bold">Tên Người Chơi</th>
                  <th className="p-5 font-bold text-center">Trạng Thái</th>
                  <th className="p-5 font-bold text-center">Điểm Số</th>
                  <th className="p-5 font-bold text-center">Vi Phạm 🚨</th>
                  <th className="p-5 font-bold text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-gray-500">
                      Chưa có dữ liệu
                    </td>
                  </tr>
                ) : (
                  participants.map((p, index) => (
                    <tr
                      key={p.socketId}
                      className={`border-b transition-colors ${index === 0 && p.isSubmitted ? "bg-yellow-50" : "hover:bg-gray-50"}`}
                    >
                      <td className="p-5 text-center font-black text-gray-400">
                        {index === 0 && p.isSubmitted ? "👑 1" : index + 1}
                      </td>
                      <td className="p-5 font-bold text-gray-800 text-lg">
                        {p.name}
                      </td>
                      <td className="p-5 text-center">
                        {p.isSubmitted ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                            Đã nộp bài
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                            Đang làm...
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-center font-black text-2xl text-blue-600">
                        {p.isSubmitted ? p.score : "-"}
                      </td>
                      <td className="p-5 text-center">
                        {p.violations > 0 ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-sm">
                            {p.violations} lần thoát
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="p-5 text-center">
                        <button
                          onClick={() =>
                            navigate("/live/detail", {
                              state: { participant: p, quizDetail: quizDetail },
                            })
                          }
                          disabled={!p.isSubmitted}
                          className={`font-bold px-4 py-2 rounded-lg transition-colors ${
                            p.isSubmitted
                              ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          👁️ Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveQuizHost;
