import express from "express";
const router = express.Router();
import User from "../models/User.js";
import upload from "../config/multerConfig.js";
import bcrypt from "bcryptjs";

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "username photo bio"
    );
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

// Get a user by username or userId
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update Profile
router.put("/update", upload.single("photo"), async (req, res) => {
  const { userId, firstName, lastName, bio, faculty, department } = req.body;
  const photo = req.file ? req.file.path : undefined; // Yeni fotoğraf varsa, yolu al

  try {
    // Kullanıcıyı ID'sine göre bul
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    // Kullanıcı verilerini güncelle
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.bio = bio || user.bio;
    user.faculty = faculty || user.faculty; // Fakülteyi güncelle
    user.department = department || user.department; // Bölümü güncelle
    if (photo) user.photo = photo; // Eğer yeni fotoğraf varsa, güncelle

    // Güncellenmiş kullanıcıyı kaydet
    await user.save();

    // Güncellenmiş kullanıcı verisini döndür
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Kullanıcı güncellenemedi" });
  }
});

// Get list of users based on search query
router.get("/search/list", async (req, res) => {
  try {
    const searchQuery = req.query.search || ""; // Search term from user
    const users = await User.find({
      username: { $regex: searchQuery, $options: "i" }, // Search by username
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Bir hata oluştu", error: err });
    console.error("routesHatasi", err);
  }
});

router.post("/verify-old-password", async (req, res) => {
  try {
    const { userId, oldPassword } = req.body;
    const user = await User.findById(userId);

    // Eski şifreyi kontrol et
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (isMatch) {
      res.status(200).send({ success: true });
    } else {
      res.status(400).send({ success: false, message: "Eski şifre yanlış" });
    }
  } catch (err) {
    console.error("Eski şifre doğrulama hatası:", err);
    res
      .status(500)
      .send("Eski şifre doğrulama işlemi sırasında bir hata oluştu.");
  }
});

router.put("/change-password", async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findById(userId);
    user.password = hashedPassword;
    await user.save();
    res.status(200).send("Şifre başarıyla değiştirildi.");
  } catch (err) {
    console.error("Şifre değiştirme hatası:", err);
    res.status(500).send("Şifre değiştirme işlemi sırasında bir hata oluştu.");
  }
});

router.post("/logout", (req, res) => {
  // Eğer JWT kullanıyorsanız, token'ı geçersiz kılınabilir
  res.clearCookie("authToken"); // Auth token'ı çerezden temizliyoruz (isteğe bağlı)

  // Başarıyla çıkış yapıldığını belirten yanıt döndürüyoruz
  res.status(200).json({ message: "Çıkış başarılı." });
});

export default router;
