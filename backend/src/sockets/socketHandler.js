import LiveRoom from "../models/LiveRoom.js";
import Quiz from "../models/Quiz.js"; // Cần import Quiz để chấm điểm

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    // ==========================================
    // 1. HOST: TẠO PHÒNG THI
    // ==========================================
    socket.on("create-room", async ({ quizId, hostId }) => {
      try {
        // Sinh mã PIN ngẫu nhiên 6 chữ số
        const pin = Math.floor(100000 + Math.random() * 900000).toString();

        const newRoom = await LiveRoom.create({
          pin,
          host: hostId,
          quiz: quizId,
          status: "waiting",
          participants: [],
        });

        socket.join(pin); // Cho Host gia nhập vào "kênh" (room) có tên là mã PIN
        socket.emit("room-created", { pin, roomId: newRoom._id });
      } catch (error) {
        socket.emit("error", "Không thể tạo phòng thi");
      }
    });

    // ==========================================
    // 2. GUEST: KHÁCH NHẬP MÃ PIN ĐỂ VÀO PHÒNG
    // ==========================================
    socket.on("join-room", async ({ pin, name }) => {
      try {
        const room = await LiveRoom.findOne({ pin, status: "waiting" });
        if (!room) {
          return socket.emit("error", "Phòng không tồn tại hoặc đã khóa!");
        }

        // Tạo profile cho người chơi mới
        const newParticipant = {
          socketId: socket.id,
          name: name,
        };
        room.participants.push(newParticipant);
        await room.save();

        socket.join(pin); // Khách chính thức vào "kênh"

        // Gửi báo cáo thành công về cho Khách (kèm theo ID đề thi để load sẵn dữ liệu)
        socket.emit("join-success", { pin, name, quizId: room.quiz });

        // 🔔 Báo cho Host biết để cập nhật danh sách người chờ
        io.to(pin).emit("update-participants", room.participants);
      } catch (error) {
        socket.emit("error", "Lỗi khi tham gia phòng");
      }
    });

    // ==========================================
    // 3. HOST: BẤM NÚT BẮT ĐẦU THI
    // ==========================================
    socket.on("start-quiz", async ({ pin }) => {
      try {
        await LiveRoom.findOneAndUpdate({ pin }, { status: "playing" });
        // 🔔 Bắn tín hiệu "Bắt đầu" cho TẤT CẢ mọi người trong phòng (để màn hình Khách tự nhảy sang trang làm bài)
        io.to(pin).emit("quiz-started");
      } catch (error) {
        console.error(error);
      }
    });

    // ==========================================
    // 4. GUEST: HỆ THỐNG ANTI-CHEAT (CHUYỂN TAB)
    // ==========================================
    socket.on("report-violation", async ({ pin }) => {
      try {
        const room = await LiveRoom.findOne({ pin });
        if (!room) return;

        const participant = room.participants.find(
          (p) => p.socketId === socket.id,
        );
        if (participant) {
          participant.violations += 1; // Cộng 1 điểm vi phạm
          await room.save();
          // 🔔 Báo ngay lập tức lên Bảng điều khiển của Host
          io.to(pin).emit("update-leaderboard", room.participants);
        }
      } catch (error) {
        console.error(error);
      }
    });

    // ==========================================
    // 5. GUEST: NỘP BÀI (HOẶC HẾT GIỜ TỰ NỘP)
    // ==========================================
    socket.on("submit-live-quiz", async ({ pin, answers }) => {
      try {
        const room = await LiveRoom.findOne({ pin }).populate("quiz");
        if (!room) return;

        const participant = room.participants.find(
          (p) => p.socketId === socket.id,
        );
        if (!participant || participant.isSubmitted) return;

        // Tiến hành chấm điểm trực tiếp trên Server
        let totalScore = 0;
        let correctCount = 0;
        let maxScore = 0;

        const detailedAnswers = room.quiz.questions.map((q) => {
          maxScore += q.points;
          const userAnswer = answers.find(
            (a) => a.questionId === q._id.toString(),
          );
          let isCorrect = false;

          // So sánh đáp án
          if (userAnswer) {
            isCorrect = userAnswer.selectedOption === q.correctAnswer;
          }

          if (isCorrect) {
            correctCount++;
            totalScore += q.points;
          }

          return {
            questionId: q._id,
            selectedOption: userAnswer?.selectedOption ?? null,
            isCorrect,
          };
        });

        // Tính ra thang điểm 10
        const finalScore =
          maxScore > 0 ? Number(((totalScore / maxScore) * 10).toFixed(2)) : 0;

        // Cập nhật kết quả vào DB
        participant.score = finalScore;
        participant.correctCount = correctCount;
        participant.answers = detailedAnswers;
        participant.isSubmitted = true;

        await room.save();

        // 🔔 Cập nhật Bảng xếp hạng (Leaderboard) cho Host ngay lập tức
        io.to(pin).emit("update-leaderboard", room.participants);

        // Báo lại cho Guest biết là nộp thành công để hiện điểm
        socket.emit("submit-success", {
          score: finalScore,
          correctCount,
          totalQuestions: room.quiz.questions.length,
        });
      } catch (error) {
        console.error("Lỗi khi nộp bài live:", error);
      }
    });

    // ==========================================
    // CẬP NHẬT: HOST KẾT THÚC PHÒNG THI
    // ==========================================
    socket.on("end-quiz", async ({ pin }) => {
      try {
        // Đã sửa "finished" thành "ended" ở đây
        await LiveRoom.findOneAndUpdate({ pin }, { status: "ended" });

        // (Tùy chọn) Bắn lệnh báo cho tất cả học sinh biết là phòng đã đóng
        io.to(pin).emit("quiz-ended");
      } catch (error) {
        console.error(error);
      }
    });

    // ==========================================
    // 6. NGẮT KẾT NỐI (RỚT MẠNG / TẮT TRÌNH DUYỆT)
    // ==========================================
    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      // Ở phiên bản nâng cao, bạn có thể viết logic tìm user bị rớt mạng và báo cho Host biết.
    });
  });
};

export default setupSocket;
