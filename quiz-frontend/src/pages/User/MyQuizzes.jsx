import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import quizApi from "../../services/quizApi";
import { AuthContext } from "../../contexts/AuthContext";

const MyQuizzes = () => {
  const { user } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyQuizzes();
  }, []);

  const fetchMyQuizzes = async () => {
    try {
      const data = await quizApi.getMyQuizzes();
      setQuizzes(data);
    } catch (err) {
      alert("Lỗi khi tải danh sách đề thi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đề thi này không?")) return;
    try {
      await quizApi.deleteQuiz(id);
      setQuizzes(quizzes.filter((q) => q._id !== id));
      alert("Đã xóa thành công!");
    } catch (err) {
      alert("Lỗi khi xóa đề thi");
    }
  };

  if (loading) return <div className="text-center mt-10">Đang tải...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Quản lý Đề Thi Của Tôi
        </h2>

        <div className="flex gap-3">
          <Link
            to="/my-quizzes/generate"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition flex items-center gap-2 shadow-sm"
          >
            <span>🎲</span> Tạo Từ Ngân Hàng
          </Link>
          <Link
            to="/my-quizzes/create-manual"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition flex items-center gap-2 shadow-sm"
          >
            <span>✍️</span> Tạo Thủ Công
          </Link>

          <Link
            to="/my-quizzes/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition flex items-center gap-2 shadow-sm"
          >
            <span>📁</span> Import File
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tên Đề Thi
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {quizzes.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-5 py-5 text-center text-gray-500">
                  Bạn chưa tạo đề thi nào.
                </td>
              </tr>
            ) : (
              quizzes.map((quiz) => (
                <tr key={quiz._id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap font-medium">
                      {quiz.title}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Số câu: {quiz.questions?.length || 0}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                    {quiz.timeLimit} phút
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                    <span
                      className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs
                      ${
                        quiz.status === "approved"
                          ? "text-green-700 bg-green-100"
                          : quiz.status === "pending"
                            ? "text-yellow-700 bg-yellow-100"
                            : "text-gray-700 bg-gray-100"
                      }`}
                    >
                      {quiz.status === "approved"
                        ? "Đã duyệt"
                        : quiz.status === "pending"
                          ? "Chờ duyệt"
                          : "Bản nháp"}
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center space-x-4">
                    <Link
                      to="/live/host"
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded font-bold hover:bg-purple-200 transition-colors mr-2 inline-block"
                    >
                      🔴 Tổ chức Live
                    </Link>
                    <Link
                      to={`/quizzes/${quiz._id}`}
                      className="text-green-600 hover:text-green-900 font-semibold mr-4"
                    >
                      Làm thử
                    </Link>
                    <Link
                      to={`/my-quizzes/edit/${quiz._id}`}
                      className="text-blue-600 hover:text-blue-900 font-semibold"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(quiz._id)}
                      className="text-red-600 hover:text-red-900 font-semibold"
                    >
                      Xóa
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

export default MyQuizzes;
