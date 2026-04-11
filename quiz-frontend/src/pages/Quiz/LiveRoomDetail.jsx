import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import liveApi from "../../services/liveApi";

const LiveRoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await liveApi.getRoomDetail(id);
        // Sắp xếp người chơi theo điểm cao xuống thấp
        if (data.participants) {
          data.participants.sort((a, b) => b.score - a.score);
        }
        setRoom(data);
      } catch (err) {
        alert("Không tải được chi tiết phòng thi");
        navigate("/live/history");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  if (loading)
    return (
      <div className="text-center mt-20 font-bold text-gray-500">
        Đang tải dữ liệu...
      </div>
    );
  if (!room) return null;

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 pb-20 animate-fadeIn">
      <button
        onClick={() => navigate("/live/history")}
        className="mb-6 flex items-center text-gray-600 hover:text-purple-600 font-bold transition-colors"
      >
        <span className="mr-2 text-xl">⬅</span> Quay lại danh sách phòng
      </button>

      {/* Thông tin tổng quan phòng thi */}
      <div className="bg-purple-900 rounded-2xl shadow-xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div>
          <p className="text-purple-300 font-bold uppercase tracking-widest text-sm mb-2">
            Thống kê phòng thi
          </p>
          <h2 className="text-3xl font-black mb-2">
            {room.quiz?.title || "Đề thi không xác định"}
          </h2>
          <p className="text-purple-200">
            Tổ chức lúc: {new Date(room.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="text-center bg-purple-950 px-8 py-4 rounded-xl border border-purple-800">
          <p className="text-sm font-bold text-purple-300 uppercase mb-1">
            Mã PIN
          </p>
          <p className="text-5xl font-black tracking-[0.2em] text-yellow-400">
            {room.pin}
          </p>
        </div>
      </div>

      {/* Bảng điểm chi tiết */}
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        🏆 Bảng Xếp Hạng Chung Cuộc
      </h3>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-200 text-gray-700">
              <th className="p-5 font-black text-center w-20">Hạng</th>
              <th className="p-5 font-bold">Tên Thí Sinh</th>
              <th className="p-5 font-bold text-center">Điểm Số</th>
              <th className="p-5 font-bold text-center">Câu Đúng</th>
              <th className="p-5 font-bold text-center">Vi Phạm 🚨</th>
              <th className="p-5 font-bold text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {room.participants.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-8 text-gray-500">
                  Không có thí sinh tham gia
                </td>
              </tr>
            ) : (
              room.participants.map((p, index) => (
                <tr
                  key={p._id || index}
                  className={`border-b transition-colors ${index === 0 ? "bg-yellow-50" : "hover:bg-gray-50"}`}
                >
                  <td className="p-5 text-center font-black text-xl text-gray-400">
                    {index === 0 ? "👑 1" : index + 1}
                  </td>
                  <td className="p-5 font-bold text-gray-800 text-lg">
                    {p.name}
                  </td>
                  <td className="p-5 text-center font-black text-2xl text-blue-600">
                    {p.score}
                  </td>
                  <td className="p-5 text-center font-bold text-gray-600">
                    {p.correctCount} / {room.quiz?.questions.length || 0}
                  </td>
                  <td className="p-5 text-center">
                    {p.violations > 0 ? (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-sm">
                        {p.violations} lần
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="p-5 text-center">
                    <button
                      // 👉 Tận dụng luôn trang Chi tiết có sẵn
                      onClick={() =>
                        navigate("/live/detail", {
                          state: { participant: p, quizDetail: room.quiz },
                        })
                      }
                      className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                      👁️ Xem bài làm
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveRoomDetail;
