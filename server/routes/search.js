import express from "express";
const router = express.Router();
import User from "../models/User.js";


router.get("/list", async (req, res) => {
    try {
      const searchQuery = req.query.search || ""; // Kullanıcıdan gelen arama terimi
      const page = parseInt(req.query.page) || 1; // Sayfa numarası
      const limit = parseInt(req.query.limit) || 10; // Sayfa başına sonuç limiti
      const skip = (page - 1) * limit; // Atlanacak kayıt sayısı
  
      // Tam eşleşmeler
      const exactMatches = await User.find({ username: searchQuery }).select(
        "username firstName lastName photo bio"
      );
  
      // Kısmi eşleşmeler (tam eşleşmeler hariç tutulur)
      const partialMatches = await User.find({
        $or: [
          { username: { $regex: searchQuery, $options: "i" } },
          { firstName: { $regex: searchQuery, $options: "i" } },
          { lastName: { $regex: searchQuery, $options: "i" } },
          { bio: { $regex: searchQuery, $options: "i" } },
        ],
        _id: { $nin: exactMatches.map((u) => u._id) }, // Tam eşleşmeleri hariç tut
      })
        .skip(skip)
        .limit(limit)
        .select("username firstName lastName photo bio");
  
      // Toplam sonuç sayısını bul
      const totalResults = exactMatches.length + partialMatches.length;
  
      // Sonuçları birleştir
      const users = [...exactMatches, ...partialMatches];
  
      res.status(200).json({
        users, // Kullanıcılar
        totalResults, // Toplam sonuç sayısı
        page, // Şu anki sayfa
        totalPages: Math.ceil(totalResults / limit), // Toplam sayfa sayısı
      });
    } catch (err) {
      res.status(500).json({ message: "Bir hata oluştu", error: err });
      console.error("routesHatasi", err);
    }
  });

export default router;
