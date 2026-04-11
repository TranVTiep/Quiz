import LiveRoom from "../models/LiveRoom.js";
import Quiz from "../models/Quiz.js"; // Import để populate chi tiết đề thi

export const getHostLiveHistory = async (req, res) => {
  try {
    // Chỉ lấy những phòng do user này tạo và đã kết thúc
    const history = await LiveRoom.find({
      host: req.user._id,
      status: "ended",
    })
      .populate("quiz", "title") // Chỉ lấy tên đề thi cho nhẹ
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLiveRoomDetail = async (req, res) => {
  try {
    // Lấy toàn bộ thông tin phòng và chi tiết đề thi để đối chiếu
    const room = await LiveRoom.findById(req.params.id).populate("quiz");

    if (!room)
      return res.status(404).json({ message: "Không tìm thấy phòng thi này" });

    if (room.host.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xem phòng này" });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
