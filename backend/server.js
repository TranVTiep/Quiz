import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import http from "http"; // 👈 Import http
import { Server } from "socket.io"; // 👈 Import Socket.io
import setupSocket from "./src/sockets/socketHandler.js"; // File xử lý logic socket (tạo ở bước 4)
import liveRoutes from "./src/routes/liveRoutes.js";

import authRoutes from "./src/routes/authRoutes.js";
import quizRoutes from "./src/routes/quizRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import bankRoutes from "./src/routes/bankRoutes.js";

dotenv.config();
const app = express();

// Kết nối Database
await connectDB();

// 🌐 Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// 🚀 Khởi tạo HTTP Server và Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép frontend gọi
    methods: ["GET", "POST"],
  },
});

// Truyền io vào hàm xử lý
setupSocket(io);

// 🧾 Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 🚀 Routes API
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/live", liveRoutes);

app.get("/", (req, res) => {
  res.send("API & Socket.io đang chạy ngon lành!");
});

// 404 & Error Handler
app.use((req, res) => {
  res.status(404).json({ message: "API không tồn tại" });
});
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ message: err.message || "Lỗi server" });
});

const PORT = process.env.PORT || 5000;

// ⚠️ Thay thế app.listen bằng server.listen
server.listen(PORT, () => {
  console.log(`🚀 Server & Socket running on http://localhost:${PORT}`);
});
