import express from "express";
import path from "path";
import { app, server } from "./socket/socket.js"; // Socket.IO'dan app ve server import
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import conn from "./mongoDB.js";

app.set("trust proxy", 1); // Sadece bir proxy kullanıyorsanız

dotenv.config();

// __filename ve __dirname tanımlama
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import searchRoute from "./routes/search.js";
import rankingRoute from "./routes/ranking.js";
import followRoutes from "./routes/follow.js";
import postRoutes from "./routes/posts.js";
import postFeaturesRoutes from "./routes/postFeatures.js";
import notificationsRoutes from "./routes/notifications.js";
import conversationsRoutes from "./routes/conversations.js";
import messageRoutes from "./routes/messages.js";
import reportRoutes from "./routes/report.js";

// app.use(cors({
//   origin: ["https://kampusya.com", "http://localhost:3000"],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://kampusya.com"]
    : ["http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, 'client/build'), {
//     maxAge: '1d', // 1 gün önbellek
//     etag: true // Dosya değiştiğinde yeni ETag ile tarayıcıya bildirilir
//   }));

//   // Eski cache'i devre dışı bırakmak için
//   app.use((req, res, next) => {
//     res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
//     res.setHeader('Pragma', 'no-cache');
//     res.setHeader('Expires', '0');
//     next();
//   });

//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//   });
// }

app.use(express.static(path.join(__dirname, "client", "build")));

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send(`Server portundasin, port no ${port}`);
});

// API Rotalarını ekliyoruz

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoute);
app.use("/api/ranking", rankingRoute);
app.use("/api/follow", followRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/postFeatures", postFeaturesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/conversations", conversationsRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/report", reportRoutes);

server.listen(port, () => {
  conn();
  console.log("Server is running on port", port);
});
