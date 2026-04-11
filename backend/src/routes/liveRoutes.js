import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getHostLiveHistory,
  getLiveRoomDetail,
} from "../controllers/liveController.js";

const router = express.Router();

// Bảo vệ toàn bộ route bằng middleware kiểm tra đăng nhập
router.use(protect);

router.get("/history", getHostLiveHistory);
router.get("/:id", getLiveRoomDetail);

export default router;
