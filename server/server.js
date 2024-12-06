import express from "express";
import path from "path";
import { app, server } from "./socket/socket.js"; // Socket.IO'dan app ve server import
import conn from "./mongoDB.js";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";

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

// Middlewares
app.use(cors({
  origin: ["https://kampusya.com", "http://localhost:3000"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
// app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(express.json()); // JSON veri gönderebilmek için
// Statik olarak "uploads" klasörünü sunuyoruz
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.set('trust proxy', true);

// Dotenv config
dotenv.config();
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send(`Server portundasin, port no ${port}`);
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/follow", followRoutes);
app.use("/posts", postRoutes);
app.use("/postFeatures", postFeaturesRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/conversations", conversationsRoutes);
app.use("/messages", messageRoutes);
app.use("/report", reportRoutes);

server.listen(port, () => {
  conn();
  console.log("Server is running on port", port);
});
