import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bankApi from "../../services/bankApi";

const QuestionBankList = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const data = await bankApi.getMyBanks();
      setBanks(data);
    } catch (err) {
      alert("Lỗi khi tải danh sách ngân hàng câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa ngân hàng này không? Tất cả câu hỏi bên trong sẽ bị xóa!",
      )
    )
      return;
    try {
      await bankApi.deleteBank(id);
      setBanks(banks.filter((b) => b._id !== id));
      alert("Đã xóa thành công!");
    } catch (err) {
      alert("Lỗi khi xóa ngân hàng");
    }
  };

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-500">Đang tải dữ liệu...</div>
    );

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">
          Ngân Hàng Câu Hỏi
        </h2>

        <Link
          to="/banks/create"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-md"
        >
          <span>➕</span> Tạo Ngân Hàng Mới
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {banks.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-500">
            <span className="text-4xl block mb-3">📭</span>
            Bạn chưa có ngân hàng câu hỏi nào. Hãy tạo một cái mới!
          </div>
        ) : (
          banks.map((bank) => (
            // Dùng flex flex-col và h-full để các card cao bằng nhau
            <div
              key={bank._id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow flex flex-col h-full relative overflow-hidden"
            >
              {/* Trang trí góc trái nhỏ cho đẹp */}
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>

              <h3
                className="text-xl font-bold text-gray-800 mb-2 truncate"
                title={bank.title}
              >
                {bank.title}
              </h3>

              {/* flex-grow giúp đẩy phần footer xuống dưới cùng */}
              <p className="text-gray-500 text-sm mb-6 flex-grow line-clamp-2">
                {bank.description || "Không có mô tả cho ngân hàng này..."}
              </p>

              {/* Footer của Card */}
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
                  📚 {bank.questionCount || 0} câu hỏi
                </span>

                <div className="flex gap-4">
                  <Link
                    to={`/banks/edit/${bank._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-bold transition-colors"
                  >
                    ✏️ Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(bank._id)}
                    className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors"
                  >
                    ❌ Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuestionBankList;
