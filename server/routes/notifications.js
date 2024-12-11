import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

// Bildirimleri getir
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.params.userId,
    })
      .populate("sender", "username photo") // Gönderen kullanıcı bilgileri
      .populate("postId", "_id") // Post bilgisi
      .sort({ createdAt: -1 }); // En son eklenen bildirimler önce gelir

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Bildirimler alınamadı:", err);
    res
      .status(500)
      .json({ error: "Bildirimler alınamadı. Lütfen tekrar deneyin." });
  }
});

// Bildirim okundu olarak işaretle
router.put("/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { isRead } = req.body;

    // Bildirimin var olup olmadığını kontrol et
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Bildirim bulunamadı" });
    }

    // Bildirimi güncelle
    notification.isRead = isRead;
    await notification.save(); // Bildirimi kaydet

    res.status(200).json(notification);
  } catch (error) {
    console.error("Bildirim okundu olarak işaretlenemedi:", error);
    res
      .status(500)
      .json({
        message: "Bir hata oluştu. Bildirim okundu olarak işaretlenemedi.",
      });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Bildirim bulunamadı" });
    }

    if (!notification) {
      return res.status(404).json({ message: "Bildirim bulunamadı" });
    }

    // Bildirimi sil
    await notification.deleteOne();

    // Silme işleminden sonra başarı mesajı dön
    res.status(200).json({ message: "Bildirim başarıyla silindi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu" });
  }
});

export default router;
