import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import conn from "./mongoDB.js";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";

dotenv.config();

// __filename ve __dirname tanımlama
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import followRoutes from "./routes/follow.js";
import postRoutes from "./routes/posts.js";
import postFeaturesRoutes from "./routes/postFeatures.js";
import notificationsRoutes from "./routes/notifications.js";
import conversationsRoutes from "./routes/conversations.js";
import messageRoutes from "./routes/messages.js";
import reportRoutes from "./routes/report.js";

const app = express();
const server = createServer(app);  // HTTP server oluşturuluyor

// Socket.IO ile ilgili yapılandırma
const io = new Server(server, {
  cors: {
    origin: ["https://kampusya.com", "http://localhost:3000"],  // CORS ayarları
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});

// Middlewares
app.use(cors({
  origin: ["https://kampusya.com", "http://localhost:3000"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json()); // JSON veri gönderebilmek için
app.use(express.urlencoded({ extended: true }));

// Statik olarak "uploads" klasörünü sunuyoruz
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// React uygulamanızın build dizini
app.use(express.static(path.join(__dirname, "client", "build")));  // React için static dosyalar

// API Rotalarını ekliyoruz
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/postFeatures", postFeaturesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/conversations", conversationsRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/report", reportRoutes);

// Ana sayfa
app.get("/", (req, res) => {
  res.send(`Server portundasin, port no ${process.env.PORT}`);
});

// React yönlendirmesi
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// Socket.IO bağlantı dinleme
io.on("connection", (socket) => {
  console.log("A user connected");

  // Bağlantı kesildiğinde loglama
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Server başlatma
const port = process.env.PORT || 5001;
server.listen(port, () => {
  conn();  // MongoDB bağlantısı
  console.log("Server is running on port", port);
});
