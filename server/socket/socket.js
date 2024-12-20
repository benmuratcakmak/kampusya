import { Server } from "socket.io";
import http from "http";
import express from "express";
// import helmet from "helmet";
// import rateLimit from "express-rate-limit";

import Message from "../models/Message.js";

const app = express();
// app.set('trust proxy', true);

// app.use(helmet());

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 dakika
//   max: 100, // 100 istek limiti
// });
// app.use(limiter);

const server = http.createServer(app);

// Socket.IO için CORS ayarlarını yapıyoruz
const io = new Server(server, {
  cors: {
    origin: ["https://kampusya.com", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

// Socket.IO olaylarını başlatıyoruz
io.on("connection", (socket) => {
  console.log("Kullanıcı bağlandı:", socket.id);

  // Kullanıcıyı belirli bir odaya dahil etme
  socket.on("joinRoom", (userId) => {

    socket.leaveAll();  // Tüm odalardan çıkartıyor

    socket.join(userId);
    console.log(`Kullanıcı odaya katıldı: ${userId}`);
  });

  // Konuşma odasına katılma işlemi
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });

  // Mesaj gönderme
  // socket.on("sendMessage", async (message) => {
  //   try {
  //     // Mesajı sender bilgileriyle doldur
  //     const populatedMessage = await Message.findById(message._id).populate(
  //       "sender",
  //       "username photo"
  //     );

  //     if (populatedMessage) {
  //       io.to(message.conversationId).emit("receiveMessage", populatedMessage);
  //     } else {
  //       console.error("Mesaj bulunamadı veya sender bilgileri eksik.");
  //     }
  //   } catch (err) {
  //     console.error("Mesaj gönderme hatası:", err);
  //   }
  // });

  socket.on("sendMessage", async (message) => {
    try {
      const populatedMessage = await Message.findById(message._id).populate(
        "sender",
        "username photo"
      );
      
      if (!populatedMessage || !populatedMessage.sender) {
        console.error("[Socket Error] Mesaj gönderme hatası: Sender bilgileri eksik", {
          messageId: message._id,
          populatedMessage
        });
        return;
      }

      io.to(message.conversationId).emit("receiveMessage", populatedMessage);
    } catch (err) {
      console.error("[Socket Error] Mesaj gönderme hatası:", {
        error: err.message,
        stack: err.stack,
        messageData: message
      });
    }
  });
  

  // Kullanıcı bağlantısı kesildiğinde
  socket.on("disconnect", () => {
    console.log("Kullanıcı bağlantısı kesildi:", socket.id);
  });
});

// Sunucu ve app örneklerini dışarıya aktarıyoruz
export { io, server, app };
