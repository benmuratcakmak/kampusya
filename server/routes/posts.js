import express from "express";
import multer from "multer";
import cloudinary from "../config/forPost.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const router = express.Router();

// Multer yapılandırması
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary'ye dosya yükleme işlevi
const uploadToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "postMedia" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

router.post("/", upload.single("media"), async (req, res) => {
  const {
    content,
    sharePostId,
    userId,
    isSharedFromHome,
    originalPostId,
    eventTitle,
    eventDate,
    eventDescription,
    pollQuestion,
    pollOptions,
  } = req.body;

  let mediaUrl = null;

  try {
    // Medya dosyasını yükle
    if (req.file) {
      mediaUrl = await uploadToCloudinary(req.file.buffer);
    }

    // Anket seçeneklerini doğru formatta işleme
    const formattedPollOptions = Array.isArray(pollOptions)
      ? pollOptions.map((option) => ({ option, votes: 0 }))
      : [];

    // Yeni gönderi verilerini oluştur
    const newPostData = {
      content,
      sharePostId,
      userId,
      mediaUrl,
      eventTitle: isSharedFromHome ? null : eventTitle,
      eventDate: isSharedFromHome ? null : eventDate,
      eventDescription: isSharedFromHome ? null : eventDescription,
      pollQuestion: isSharedFromHome ? null : pollQuestion,
      pollOptions: isSharedFromHome ? [] : formattedPollOptions,
    };

    // Yeni gönderiyi oluştur ve kaydet
    const newPost = new Post(newPostData);

    // Orijinal gönderi paylaşım sayısını artır
    if (isSharedFromHome && originalPostId) {
      const originalPost = await Post.findById(originalPostId);
      if (originalPost) {
        originalPost.shareCount = (originalPost.shareCount || 0) + 1;
        await originalPost.save();
      }
    }

    await newPost.save();

    // Kullanıcı bilgilerini al
    const user = await User.findById(userId);

    // Yanıt oluştur
    const postWithUserInfo = {
      ...newPost.toObject(),
      username: user.username,
      photo: user.photo,
    };

    res.status(201).json(postWithUserInfo);
  } catch (error) {
    console.error("Gönderi oluşturulurken hata oluştu:", error);
    res.status(500).json({ error: "Gönderi kaydedilemedi. Lütfen tekrar deneyin." });
  }
});

router.post("/:postId/vote", async (req, res) => {
  const { postId } = req.params;
  const { userId, optionIndex } = req.body;

  console.log("Gelen veri:", req.body); // Gelen veriyi logluyoruz

  // postId'nin geçerliliğini kontrol edin
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ error: "Geçersiz gönderi ID'si" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Gönderi bulunamadı" });
    }

    if (!post.pollOptions || !post.pollOptions[optionIndex]) {
      return res
        .status(400)
        .json({ error: "Geçersiz veya eksik anket verisi" });
    }

    // Kullanıcının daha önce oy verip vermediğini kontrol et
    const existingVote = post.pollVotes.find(
      (vote) => vote.userId.toString() === userId.toString()
    );

    if (existingVote) {
      // Eğer kullanıcı daha önce oy verdiyse, oyu değiştirebiliriz
      const previousOptionIndex = existingVote.optionIndex;

      // Önceki seçeneğin oyunu bir azalt, yeni seçeneğin oyunu bir artır
      post.pollOptions[previousOptionIndex].votes -= 1;
      post.pollOptions[optionIndex].votes += 1;

      // Kullanıcı oylamasını güncelle
      existingVote.optionIndex = optionIndex;
    } else {
      // Eğer kullanıcı hiç oy vermemişse, yeni oy kaydedilir
      post.pollVotes.push({ userId, optionIndex });

      // Yeni seçeneğin oyunu artır
      post.pollOptions[optionIndex].votes += 1;
    }

    try {
      await post.save();
      return res.status(200).json({
        message: "Oylama başarılı",
        poll: post.pollOptions.map((option) => option.votes),
      });
    } catch (saveError) {
      console.error("Kaydetme hatası:", saveError);
      return res
        .status(500)
        .json({ error: "Veritabanı kaydı sırasında hata oluştu" });
    }
  } catch (error) {
    console.error("Oylama işlemi sırasında hata oluştu:", error);
    res.status(500).json({ error: "Oylama işlemi başarısız oldu" });
  }
});

// Postu silme
router.delete("/:postId", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: "Post bulunamadı" });
    }

    res.status(200).json({ message: "Post başarıyla silindi" });
  } catch (err) {
    console.error("Post silinirken hata oluştu:", err);
    res.status(500).json({ error: "Post silinirken hata oluştu" });
  }
});

// Ana sayfa için postları listeleme
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "username firstName lastName photo") // Ana postun kullanıcısını populate et
      .populate({
        path: "sharePostId", // Paylaşılan postu populate et
        // select: "content mediaUrl createdAt",
        populate: {
          path: "userId", // Paylaşılan postun kullanıcısını da populate et
          select: "username firstName lastName photo", // Hangi alanları alacağını belirt
        },
      })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Postlar getirilirken hata oluştu:", error);
    res.status(500).json({ message: "Postlar getirilemedi", error });
  }
});

// Kullanıcı profilindeki postları listeleme
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    const posts = await Post.find({ userId: user._id })
      .populate("userId", "username firstName lastName photo")
      .populate({
        path: "sharePostId", // Paylaşılan postu populate et
        // select: "content mediaUrl createdAt",
        populate: {
          path: "userId", // Paylaşılan postun kullanıcısını da populate et
          select: "username firstName lastName photo", // Hangi alanları alacağını belirt
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error("Profil postları getirilirken hata oluştu:", err);
    res.status(500).send(err);
  }
});

// Bildirim postunu getirir
router.get("/post/:postId", async (req, res) => {
  const { postId } = req.params; // URL'den postId alıyoruz

  try {
    const post = await Post.findById(postId).populate(
      "userId",
      "username firstName lastName photo"
    ); // Postu paylaşan kullanıcının bilgilerini alıyoruz
    if (!post) {
      return res.status(404).json({ error: "Post bulunamadı" }); // Post bulunamazsa hata mesajı gönderiyoruz
    }
    res.status(200).json(post); // Postu başarılı bir şekilde gönderiyoruz
  } catch (error) {
    console.error("Post bilgisi alınamadı:", error);
    res.status(500).json({ error: "Post verisi alınırken hata oluştu" }); // Hata mesajı gönderiyoruz
  }
});

// Takip edilen kullanıcıların gönderilerini getir
router.get("/following/:userId", async (req, res) => {
  try {
    // Önce kullanıcının takip ettiği kişileri bul
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Takip edilen kullanıcıların gönderilerini getir
    const posts = await Post.find({
      userId: { $in: user.followings }
    })
    .populate("userId", "username firstName lastName photo")
    .populate("comments.userId", "username firstName lastName photo")
    .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error("Takip edilen gönderiler alınırken hata:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

export default router;
