import { useLocation, useNavigate } from "react-router-dom";

const LiveParticipantDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Nhận dữ liệu (thí sinh & đề thi) được truyền qua từ trang Host
  const { participant, quizDetail } = location.state || {};

  if (!participant || !quizDetail) {
    return (
      <div className="text-center mt-20">
        <p className="text-gray-500 mb-4">Không tìm thấy dữ liệu bài làm.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 font-bold hover:underline"
        >
          ⬅ Quay lại Bảng điều khiển
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 pb-20 animate-fadeIn">
      {/* Nút Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-blue-600 font-bold transition-colors"
      >
        <span className="mr-2 text-xl">⬅</span> Quay lại Bảng điều khiển
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header Thông tin chung */}
        <div className="bg-indigo-600 p-8 text-white flex flex-col md:flex-row justify-between items-md-center gap-4">
          <div>
            <h2 className="text-3xl font-black mb-2">
              Bài làm của:{" "}
              <span className="text-yellow-400">{participant.name}</span>
            </h2>
            <p className="text-indigo-200 font-medium text-lg">
              Đề thi: {quizDetail.title}
            </p>
          </div>
          <div className="bg-indigo-800 px-6 py-4 rounded-xl text-center shadow-inner">
            <p className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-1">
              Thành tích
            </p>
            <p className="text-3xl font-black text-white">
              {participant.score}
              <span className="text-lg text-indigo-300">/10 điểm</span>
            </p>
            <p className="text-sm font-medium mt-1">
              ({participant.correctCount}/{quizDetail.questions.length} câu
              đúng)
            </p>
          </div>
        </div>

        {/* Cảnh báo vi phạm */}
        {participant.violations > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-5 text-red-700 font-bold flex items-center gap-3">
            <span className="text-3xl animate-pulse">🚨</span>
            <div>
              <p className="text-lg">Cảnh báo Vi Phạm Giám Sát!</p>
              <p className="text-sm font-medium opacity-90">
                Hệ thống ghi nhận thí sinh này đã chuyển tab/thoát màn hình{" "}
                <strong>{participant.violations} lần</strong> trong quá trình
                thi.
              </p>
            </div>
          </div>
        )}

        {/* Chi tiết từng câu */}
        <div className="p-8 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
            Chi tiết đáp án
          </h3>
          <div className="space-y-6">
            {quizDetail.questions.map((q, i) => {
              const pAnswer = participant.answers?.find(
                (a) => a.questionId === q._id,
              );
              const isCorrect = pAnswer?.isCorrect;
              const selectedOpt = pAnswer?.selectedOption;

              return (
                <div
                  key={q._id}
                  className={`p-6 rounded-xl border-2 shadow-sm transition-all ${isCorrect ? "border-green-200 bg-white" : "border-red-200 bg-white"}`}
                >
                  <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-start justify-between">
                    <span className="pr-4">
                      Câu {i + 1}: {q.questionText}
                    </span>
                    <span
                      className={`text-sm px-4 py-1.5 rounded-full whitespace-nowrap shadow-sm ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {isCorrect ? "✓ Đúng" : "✗ Sai"}
                    </span>
                  </h4>

                  <div className="space-y-3 pl-2 md:pl-6">
                    {q.options.map((opt, optIdx) => {
                      let optStyle =
                        "text-gray-600 border border-gray-100 bg-gray-50";
                      let icon = "";

                      if (q.correctAnswer === optIdx) {
                        optStyle =
                          "text-green-800 font-bold bg-green-50 border-green-300 ring-1 ring-green-300";
                        icon = "✅ Đáp án đúng";
                      } else if (selectedOpt === optIdx) {
                        optStyle =
                          "text-red-800 font-bold bg-red-50 border-red-300 line-through opacity-80";
                        icon = "❌ Thí sinh chọn sai";
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${optStyle}`}
                        >
                          <span>
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </span>
                          {icon && (
                            <span className="text-sm font-bold ml-4">
                              {icon}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {selectedOpt == null && (
                      <div className="text-red-600 font-bold mt-4 p-3 bg-red-50 rounded-lg inline-block border border-red-200 shadow-sm">
                        ⚠️ Thí sinh bỏ trống câu này!
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveParticipantDetail;
