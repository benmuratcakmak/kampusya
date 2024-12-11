import express from "express";
import path from "path";
import { app, server } from "./socket/socket.js"; // Socket.IO'dan app ve server import
// import { createServer } from "http";
// import { Server } from "socket.io";
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
import searchRoute from "./routes/search.js";
import followRoutes from "./routes/follow.js";
import postRoutes from "./routes/posts.js";
import postFeaturesRoutes from "./routes/postFeatures.js";
import notificationsRoutes from "./routes/notifications.js";
import conversationsRoutes from "./routes/conversations.js";
import messageRoutes from "./routes/messages.js";
import reportRoutes from "./routes/report.js";

// Middlewares
app.use(cors({
  origin: ["https://kampusya.com", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Proxy'nin güvenilir olduğunu belirtir
// app.set('trust proxy', 1);

app.use(express.json()); // JSON veri gönderebilmek için
app.use(express.urlencoded({ extended: true }));

// Statik olarak "uploads" klasörünü sunuyoruz
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// React uygulamanızın build dizini
app.use(express.static(path.join(__dirname, "client", "build")));  // React için static dosyalar

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send(`Server portundasin, port no ${port}`);
});

// API Rotalarını ekliyoruz
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoute);
app.use("/api/follow", followRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/postFeatures", postFeaturesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/conversations", conversationsRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/report", reportRoutes);


// Üretim ortamında React build dosyasını sunmak
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

server.listen(port, () => {
  conn();
  console.log("Server is running on port", port);
});