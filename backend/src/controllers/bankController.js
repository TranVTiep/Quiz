import QuestionBank from "../models/QuestionBank.js";

// 1. Tạo ngân hàng mới (có thể nhận luôn danh sách câu hỏi từ file parse)
export const createBank = async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    const bank = await QuestionBank.create({
      title,
      description,
      questions: questions || [],
      author: req.user._id,
    });
    res.status(201).json({ message: "Tạo ngân hàng câu hỏi thành công", bank });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Lấy danh sách ngân hàng của user

export const getMyBanks = async (req, res) => {
  try {
    // Sử dụng aggregate để đếm số lượng câu hỏi cực nhanh
    const banks = await QuestionBank.aggregate([
      {
        $match: { author: req.user._id },
      },
      {
        $project: {
          title: 1,
          description: 1,
          createdAt: 1,
          // Đếm số lượng phần tử trong mảng questions và lưu vào biến questionCount
          questionCount: { $size: "$questions" },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.json(banks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Lấy chi tiết 1 ngân hàng (có danh sách câu hỏi)
export const getBankById = async (req, res) => {
  try {
    const bank = await QuestionBank.findById(req.params.id);
    if (!bank) return res.status(404).json({ message: "Không tìm thấy" });

    // Bảo mật: Chỉ chủ sở hữu mới được xem
    if (bank.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền" });
    }
    res.json(bank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Cập nhật ngân hàng (thêm/sửa/xóa câu hỏi bên trong)
export const updateBank = async (req, res) => {
  try {
    const bank = await QuestionBank.findById(req.params.id);
    if (!bank) return res.status(404).json({ message: "Không tìm thấy" });

    if (bank.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    const updated = await QuestionBank.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Xóa ngân hàng
export const deleteBank = async (req, res) => {
  try {
    const bank = await QuestionBank.findById(req.params.id);
    if (!bank) return res.status(404).json({ message: "Không tìm thấy" });

    if (bank.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    await bank.deleteOne();
    res.json({ message: "Đã xóa ngân hàng câu hỏi" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
