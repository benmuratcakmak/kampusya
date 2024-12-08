import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors"; 
import Message from "../models/Message.js";

const app = express();
const server = http.createServer(app);

// Socket.IO için CORS ayarlarını yapıyoruz
// const io = new Server(server, {
//   cors: {
//     origin: ["https://kampusya.com", "http://localhost:3000"],
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
//   transports: ['websocket', 'polling'],
// });

// CORS ayarlarını Express için uyguluyoruz
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
/////// yukardaki server.js de de var bunu ben sonradak ekledim

const io = new Server(server, {
  cors: {
    origin: "*", // Tüm istemcilere izin vermek için. Daha güvenli bir yapılandırma için belirli bir adres girin.
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Socket.IO olaylarını başlatıyoruz
io.on("connection", (socket) => {
  console.log("Kullanıcı bağlandı:", socket.id);

  // Kullanıcıyı belirli bir odaya dahil etme
  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`Kullanıcı odaya katıldı: ${userId}`);
  });

  // Konuşma odasına katılma işlemi
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });

  // Mesaj gönderme
  socket.on("sendMessage", async (message) => {
    try {
      // Mesajı sender bilgileriyle doldur
      const populatedMessage = await Message.findById(message._id).populate(
        "sender",
        "username photo"
      );
  
      if (populatedMessage) {
        io.to(message.conversationId).emit("receiveMessage", populatedMessage);
      } else {
        console.error("Mesaj bulunamadı veya sender bilgileri eksik.");
      }
    } catch (err) {
      console.error("Mesaj gönderme hatası:", err);
    }
  });

  // Kullanıcı bağlantısı kesildiğinde
  socket.on("disconnect", () => {
    console.log("Kullanıcı bağlantısı kesildi:", socket.id);
  });
});

// Sunucu ve app örneklerini dışarıya aktarıyoruz
export { io, server, app };
