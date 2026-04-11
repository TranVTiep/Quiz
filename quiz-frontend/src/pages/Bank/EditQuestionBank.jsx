import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import bankApi from "../../services/bankApi";
import quizApi from "../../services/quizApi"; // Dùng chung parseFile

const EditQuestionBank = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [formData, setFormData] = useState({ title: "", description: "" });
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const data = await bankApi.getBankById(id);
        setFormData({ title: data.title, description: data.description || "" });
        setQuestions(data.questions || []);
      } catch (error) {
        alert("Không tìm thấy Ngân hàng câu hỏi hoặc bạn không có quyền sửa!");
        navigate("/banks");
      } finally {
        setLoading(false);
      }
    };
    fetchBank();
  }, [id, navigate]);

  // Các hàm xử lý câu hỏi
  const handleQuestionChange = (index, field, value) => {
    const newQs = [...questions];
    newQs[index][field] = value;
    setQuestions(newQs);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQs = [...questions];
    newQs[qIndex].options[optIndex] = value;
    setQuestions(newQs);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        points: 10,
      },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1)
      return alert("Ngân hàng phải có ít nhất 1 câu hỏi!");
    if (window.confirm("Bạn có chắc muốn xóa câu này?")) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  // Nạp thêm câu hỏi từ file Excel/Word
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      const form = new FormData();
      form.append("file", selectedFile);
      const res = await quizApi.parseFile(form);

      // Nối câu hỏi mới vào mảng cũ
      setQuestions([...questions, ...res.questions]);
      alert(
        `Đã thêm thành công ${res.questions.length} câu hỏi mới vào danh sách. Vui lòng bấm "Lưu Thay Đổi" để cập nhật!`,
      );
    } catch (error) {
      alert("Lỗi khi đọc file. Kiểm tra lại định dạng.");
    } finally {
      setIsImporting(false);
      e.target.value = null; // Reset input file
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length === 0)
      return alert("Ngân hàng phải có ít nhất 1 câu hỏi!");

    setSaving(true);
    try {
      await bankApi.updateBank(id, { ...formData, questions });
      alert("Cập nhật Ngân hàng thành công!");
      navigate("/banks");
    } catch (error) {
      alert("Lỗi khi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-10">Đang tải dữ liệu ngân hàng...</div>
    );

  return (
    <div className="max-w-6xl mx-auto mt-8 pb-20 px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
        ✏️ Chỉnh sửa Ngân Hàng Câu Hỏi
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* THÔNG TIN CHUNG */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-blue-700">
            1. Thông tin chung
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-gray-700">
              Tên Ngân Hàng
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-gray-700">
              Mô tả thêm
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              rows="2"
            ></textarea>
          </div>
        </div>

        {/* NHỒI THÊM FILE */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-blue-800 mb-1">
              Thêm câu hỏi từ File
            </h3>
            <p className="text-sm text-blue-600">
              Bạn có thể import thêm file Excel/Word để cộng dồn vào ngân hàng
              này.
            </p>
          </div>
          <div>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".xlsx, .xls, .docx, .txt"
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
            {isImporting && (
              <p className="text-sm text-blue-500 mt-2 animate-pulse">
                Đang xử lý file...
              </p>
            )}
          </div>
        </div>

        {/* DANH SÁCH CÂU HỎI */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">
            2. Danh sách câu hỏi ({questions.length} câu)
          </h3>

          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative group"
            >
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="absolute top-4 right-4 text-red-400 hover:text-red-600 font-bold bg-red-50 px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Xóa câu
              </button>

              <div className="mb-4 pr-24">
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Câu hỏi {qIndex + 1}
                </label>
                <textarea
                  value={q.questionText}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "questionText", e.target.value)
                  }
                  required
                  className="w-full border p-3 rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  rows="2"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, optIndex) => (
                  <div
                    key={optIndex}
                    className={`flex items-center gap-2 p-2 rounded border ${q.correctAnswer === optIndex ? "bg-green-50 border-green-300" : "bg-gray-50"}`}
                  >
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctAnswer === optIndex}
                      onChange={() =>
                        handleQuestionChange(qIndex, "correctAnswer", optIndex)
                      }
                      className="w-5 h-5 cursor-pointer text-green-600"
                      title="Chọn làm đáp án đúng"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) =>
                        handleOptionChange(qIndex, optIndex, e.target.value)
                      }
                      required
                      className="w-full bg-transparent border-none focus:ring-0 p-1"
                      placeholder={`Đáp án ${String.fromCharCode(65 + optIndex)}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* NÚT ĐIỀU KHIỂN DƯỚI CÙNG */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border sticky bottom-4 z-10">
          <button
            type="button"
            onClick={addQuestion}
            className="bg-gray-800 text-white px-6 py-2 rounded font-semibold hover:bg-gray-700 transition"
          >
            + Thêm 1 câu hỏi tay
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/banks")}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded font-bold transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`text-white px-10 py-3 rounded font-bold text-lg transition shadow-md ${saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {saving ? "Đang lưu..." : "💾 Lưu Thay Đổi"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditQuestionBank;
