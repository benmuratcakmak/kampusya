import express from 'express';
import Message from "../models/Message.js";
import Conversation from '../models/Conversation.js';
import mongoose from 'mongoose';
import { io } from "../socket/socket.js";

const router = express.Router();

// Belirli bir konuşmadaki mesajları getir
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).populate('sender', 'username photo').populate({
      path: "sharePostId", // Paylaşılan postu populate et
      select: "content mediaUrl createdAt",
      populate: {
        path: "userId", // Paylaşılan postun kullanıcısını da populate et
        select: "username firstName lastName photo", // Hangi alanları alacağını belirt
      },
    })

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Socket bildirimi icin alici id yi aldik
router.get("/forSocketNotification/:conversationId", async (req, res) => {
  try {
    const isValidId = mongoose.Types.ObjectId.isValid(
      req.params.conversationId
    );
    if (!isValidId) {
      return res.status(400).json({ message: "Geçersiz konuşma ID'si." });
    }

    const conversation = await Conversation.findById(
      req.params.conversationId
    ).populate("participants", "username photo firstName lastName");

    if (!conversation) {
      return res.status(404).json({ message: "Konuşma bulunamadı." });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Konuşma alınırken hata:", error.message);
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
});

// Mesaj kaydedildiğinde, konuşmayı güncelle
router.post("/", async (req, res) => {
  const { conversationId, sender, receiver, text, sharePostText, sharePostMedia, sharePostProfilePhoto, sharePostUsername, sharePostId } = req.body;

  try {
    // Yeni mesajı kaydet
    const message = new Message({ conversationId, sender, receiver, text, sharePostText, sharePostMedia, sharePostProfilePhoto, sharePostUsername, sharePostId });
    await message.save();

    io.emit("newMessageNotification", {
      type: "message",
      senderId: sender,
    });

    // Konuşmayı güncelle, son mesajı yeni mesajla değiştir
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { lastMessage: message },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: "Konuşma bulunamadı." });
    }

    res.status(201).json(message); // Mesajı döndür
  } catch (error) {
    console.error("Mesaj kaydedilemedi:", error); // Hata detaylarını yazdır
    res.status(500).json({ message: "Mesaj kaydedilemedi", error: error.message });
  }
});



// Belirli bir konuşmayı sil
router.delete("/:conversationId", async (req, res) => {
  try {
    // 1. Konuşmayı sil
    const conversation = await Conversation.findByIdAndDelete(req.params.conversationId);

    // 2. Konuşma bulunamadıysa
    if (!conversation) {
      return res.status(404).json({ message: "Konuşma bulunamadı." });
    }

    // 3. Konuşmaya ait mesajları sil
    await Message.deleteMany({ conversationId: req.params.conversationId });

    res.status(200).json({ message: "Konuşma ve ilgili mesajlar başarıyla silindi." });
  } catch (err) {
    res.status(500).json({ message: "Konuşma silinirken hata oluştu.", error: err });
  }
});


export default router;