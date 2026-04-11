import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import quizApi from "../../services/quizApi";
import liveApi from "../../services/liveApi";

const History = () => {
  const [activeTab, setActiveTab] = useState("taken"); // "taken" (Đã thi) | "hosted" (Đã tổ chức)

  const [takenHistory, setTakenHistory] = useState([]);
  const [hostedHistory, setHostedHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllHistory = async () => {
      try {
        // Gọi song song 2 API để tiết kiệm thời gian chờ
        const [takenData, hostedData] = await Promise.all([
          quizApi.getHistory(),
          liveApi.getHistory(),
        ]);
        setTakenHistory(takenData);
        setHostedHistory(hostedData);
      } catch (error) {
        alert("Không thể tải dữ liệu lịch sử.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllHistory();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20 text-xl font-semibold text-gray-600 animate-pulse">
        Đang tải dữ liệu lịch sử...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 pb-20 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-4 gap-4">
        <h2 className="text-3xl font-black text-gray-800">
          📜 Quản Lý Lịch Sử
        </h2>

        {/* NÚT CHUYỂN TAB */}
        <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
          <button
            onClick={() => setActiveTab("taken")}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === "taken"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ✍️ Bài Thi Đã Làm
          </button>
          <button
            onClick={() => setActiveTab("hosted")}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === "hosted"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🔴 Phòng Live Đã Tổ Chức
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: LỊCH SỬ LÀM BÀI (TAKEN) */}
      {/* ==================================================== */}
      {activeTab === "taken" && (
        <div className="animate-fadeIn">
          {takenHistory.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
              <span className="text-6xl mb-4 block">📭</span>
              <p className="text-xl text-gray-500">
                Bạn chưa hoàn thành bài thi nào.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-200">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 text-sm font-bold border-b-2">
                    <th className="px-5 py-4 text-left">Tên Đề Thi</th>
                    <th className="px-5 py-4 text-center">Thời Gian Nộp Bài</th>
                    <th className="px-5 py-4 text-center">Số Câu Đúng</th>
                    <th className="px-5 py-4 text-center">Điểm Số</th>
                  </tr>
                </thead>
                <tbody>
                  {takenHistory.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-blue-50 transition-colors border-b border-gray-100"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-blue-700">
                        {item.quiz ? item.quiz.title : "Đề thi đã bị xóa"}
                      </td>
                      <td className="px-5 py-4 text-sm text-center text-gray-600">
                        {new Date(item.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-5 py-4 text-sm text-center font-medium text-gray-700">
                        {item.correctCount} / {item.totalQuestions}
                      </td>
                      <td className="px-5 py-4 text-sm text-center">
                        <span
                          className={`font-black text-xl ${item.score >= 8 ? "text-green-600" : item.score >= 5 ? "text-yellow-600" : "text-red-600"}`}
                        >
                          {item.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: LỊCH SỬ TỔ CHỨC LIVE (HOSTED) */}
      {/* ==================================================== */}
      {activeTab === "hosted" && (
        <div className="animate-fadeIn">
          {hostedHistory.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
              <span className="text-6xl block mb-4">🛌</span>
              <p className="text-xl text-gray-500 font-medium mb-6">
                Bạn chưa tổ chức phòng thi Live nào hoàn tất.
              </p>
              <Link
                to="/live/host"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-md"
              >
                Tổ chức trận đấu ngay
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200 text-gray-700 text-sm font-bold">
                    <th className="p-5">Mã PIN</th>
                    <th className="p-5">Đề Thi</th>
                    <th className="p-5 text-center">Thời Gian Tổ Chức</th>
                    <th className="p-5 text-center">Số Thí Sinh</th>
                    <th className="p-5 text-center">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {hostedHistory.map((room) => (
                    <tr
                      key={room._id}
                      className="border-b border-gray-100 hover:bg-purple-50 transition-colors"
                    >
                      <td className="p-5 font-black text-xl text-purple-600 tracking-widest">
                        {room.pin}
                      </td>
                      <td className="p-5 font-bold text-gray-800">
                        {room.quiz?.title || "Đề thi đã bị xóa"}
                      </td>
                      <td className="p-5 text-center text-gray-600 text-sm font-medium">
                        {new Date(room.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="p-5 text-center">
                        <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-sm">
                          👥 {room.participants.length}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <Link
                          to={`/live/history/${room._id}`}
                          className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:text-indigo-800 font-bold px-4 py-2 rounded-lg transition-colors inline-block text-sm"
                        >
                          Xem Thống Kê
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;
