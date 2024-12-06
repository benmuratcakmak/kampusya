import express from "express";
import Conversation from "../models/Conversation.js";
const router = express.Router();
import mongoose from "mongoose";

router.post("/getOrCreateConversation", async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ message: "Gönderici ve alıcı ID'leri gereklidir." });
    }

    // Kullanıcıların zaten bir konuşması olup olmadığını kontrol et
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      // Yeni bir konuşma oluşturuluyor
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });
      await conversation.save();
    }

    // Başarıyla konuşma oluşturuldu
    res.status(200).json(conversation);
  } catch (err) {
    // Detaylı hata mesajı ve loglama
    console.error("Konuşma oluşturulurken hata:", err);
    res.status(500).json({
      message: "Konuşma başlatılırken bir hata oluştu",
      error: err.message,
    });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    // Konuşmaları getirirken lastMessage'i doldur
    const conversations = await Conversation.find({
      participants: req.params.userId,
    })
      .populate("lastMessage") // lastMessage alanını populate et
      .populate("lastMessage.sender", "username photo firstName lastName") // lastMessage.sender'ı populate et
      .populate("participants", "username photo firstName lastName") // participants alanındaki kullanıcıları populate et
      .sort({ updatedAt: -1 }); // Konuşmaları güncellenme tarihine göre sırala

    // Tüm konuşmaları kontrol edip eksik fotoğraf veya mesaj alanlarını işliyoruz
    const formattedConversations = conversations.map((conversation) => {
      const otherUser = conversation.participants.find(
        (participant) => participant._id.toString() !== req.params.userId
      );

      return {
        conversationId: conversation._id,
        lastMessage: conversation.lastMessage
          ? {
              text:
                conversation.lastMessage.text ||
                "Bu konuşmada henüz mesaj yok.",
              sender: conversation.lastMessage.sender,
            }
          : { text: "Bu konuşmada henüz mesaj yok." },
        otherUser: otherUser, // Diğer kullanıcının bilgilerini ekliyoruz
        isRead: conversation.isRead, // `isRead` bilgisini de dahil et
      };
    });

    res.status(200).json(formattedConversations);
  } catch (error) {
    console.error("Konuşmaları getirirken hata:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});


router.put("/mark-as-read/:conversationId", async (req, res) => {
  const { conversationId } = req.params;

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Konuşma bulunamadı." });
    }

    if (conversation.isRead) {
      return res.status(200).json({ message: "Konuşma zaten okundu." });
    }

    conversation.isRead = true;
    await conversation.save();

    return res
      .status(200)
      .json({ message: "Konuşma okundu olarak işaretlendi.", conversation });
  } catch (error) {
    console.error("Hata:", error);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
});

export default router;
