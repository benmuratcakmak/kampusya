import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";

const router = express.Router();

// Kullanıcıları beğeni ve yorum sayısına göre listeleme
router.get("/", async (req, res) => {
  try {
    const userRanking = await Post.aggregate([
      { $unwind: { path: "$likes", preserveNullAndEmptyArrays: true } }, // Beğenileri ayır
      { $unwind: { path: "$comments", preserveNullAndEmptyArrays: true } }, // Yorumları ayır

      // Beğeni ve yorum sayılarını hesapla
      {
        $group: {
          _id: "$userId",
          likeCount: { $sum: { $cond: [{ $ifNull: ["$likes", false] }, 1, 0] } },
          commentCount: { $sum: { $cond: [{ $ifNull: ["$comments", false] }, 1, 0] } },
        },
      },

      // Kullanıcı bilgilerini User koleksiyonundan çek
      {
        $lookup: {
          from: "users", // 'users' koleksiyonu ile join
          localField: "_id", // Post userId
          foreignField: "_id", // User _id
          as: "userInfo",
        },
      },

      // Eşleşmeyen kullanıcıları hariç tut
      { $match: { userInfo: { $ne: [] } } },

      // Kullanıcı bilgilerini düzenle
      {
        $project: {
          _id: 0,
          username: { $arrayElemAt: ["$userInfo.username", 0] },
          firstName: { $arrayElemAt: ["$userInfo.firstName", 0] },
          lastName: { $arrayElemAt: ["$userInfo.lastName", 0] },
          photo: {
            $ifNull: [{ $arrayElemAt: ["$userInfo.photo", 0] }, "/default-avatar.png"],
          },
          faculty: {
            $ifNull: [{ $arrayElemAt: ["$userInfo.faculty", 0] }, "Bilinmiyor"],
          },
          department: {
            $ifNull: [{ $arrayElemAt: ["$userInfo.department", 0] }, "Bilinmiyor"],
          },
          likeCount: 1,
          commentCount: 1,
        },
      },

      // Beğeni ve yorum sıralaması
      { $sort: { likeCount: -1, commentCount: -1 } },
      { $limit: 10 }, // İlk 10 kullanıcıyı al
    ]);

    res.status(200).json(userRanking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
});

export default router;