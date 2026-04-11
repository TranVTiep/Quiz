import mongoose from "mongoose";

// Cấu trúc dữ liệu của 1 người chơi (Guest)
const participantSchema = new mongoose.Schema({
  socketId: { type: String, required: true }, // Dùng để gửi tin nhắn realtime
  name: { type: String, required: true }, // Tên khách nhập vào (Ví dụ: "Học sinh A")
  score: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  // Lưu chi tiết bài làm để Host xem lại
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId },
      selectedOption: { type: Number },
      isCorrect: { type: Boolean },
    },
  ],
  violations: { type: Number, default: 0 }, // 🚨 Đếm số lần chuyển tab/thoát trang
  isSubmitted: { type: Boolean, default: false }, // Đã nộp bài chưa
  joinedAt: { type: Date, default: Date.now },
});

const liveRoomSchema = new mongoose.Schema(
  {
    pin: { type: String, required: true, unique: true }, // Mã PIN 6 số
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    status: {
      type: String,
      enum: ["waiting", "playing", "ended"],
      default: "waiting",
    },
    participants: [participantSchema],
  },
  { timestamps: true },
);

export default mongoose.model("LiveRoom", liveRoomSchema);
