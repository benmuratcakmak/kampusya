import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from 'crypto'
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();


const router = express.Router();

// Nodemailer yapılandırması
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// E-posta gönderme fonksiyonu
const sendEmail = (to, subject, text) => {
  transporter.sendMail({
    from: process.env.EMAIL_USER, // E-posta gönderen adres
    to, // Alıcı e-posta adresi
    subject, // E-posta konusu
    text, // E-posta içeriği
  }, (error, info) => {
    if (error) {
      console.error("E-posta gönderilirken bir hata oluştu:", error);
    } else {
      console.log("E-posta başarıyla gönderildi:", info.response);
    }
  });
};


// Rastgele doğrulama kodu oluşturma fonksiyonu
const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Tum hasssas bilgiler icin rateLimiter ayarla middleware

const verifyCodeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 3, // Maksimum 5 istek
  message: {
    message:
      "Çok fazla istek yaptınız. Lütfen bir süre bekleyin ve tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.delete("/cancel-registration", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "E-posta adresi gerekli." });
    }

    // Email'e göre kullanıcıyı buluyoruz
    const user = await User.findOneAndDelete({ email, isVerified: false });

    if (!user) {
      return res.status(404).json({ message: "Silinecek kullanıcı bulunamadı." });
    }

    res.status(200).json({ message: "Kullanıcı kaydı başarıyla silindi." });
  } catch (error) {
    console.error("Hata oluştu:", error);
    res.status(500).json({
      message: "Kullanıcı silme işlemi sırasında bir hata oluştu.",
      error,
    });
  }
});


// Kayıt rotası
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    // Kullanıcının daha önce doğrulama kodu alıp almadığını kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.verificationCode) {
      return res.status(400).json({
        message: "Bu e-posta adresiyle zaten bir kayıt işlemi yapılmış. Lütfen doğrulama kodunu girin."
      });
    }

    // .edu uzantılı e-posta doğrulaması
    if (!email.endsWith(".edu") && !email.endsWith(".edu.tr")) {
      return res
        .status(400)
        .json({
          message: "Sadece .edu uzantılı e-posta adresleri kabul edilmektedir.",
        });
    }

    // Şifreleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Doğrulama kodu oluşturma
    const verificationCode = generateVerificationCode();

    // Kullanıcı oluşturma
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationCode,
    });
    
    try {
      const savedUser = await newUser.save();
      console.log("Kaydedilen kullanıcı:", savedUser);
    } catch (err) {
      console.error("Kullanıcı kaydedilirken hata oluştu:", err);
      return res.status(500).json({ message: "Kullanıcı kaydı sırasında hata oluştu", error: err });
    }
    

    await newUser.save();

    // Doğrulama e-postası gönderme
    try {
      await transporter.sendMail({
        from: "sizinEmail@gmail.com",
        to: newUser.email,
        subject: "E-posta Doğrulama Kodu",
        html: `<p>Merhaba ${newUser.firstName},</p><p>Hesabınızı doğrulamak için aşağıdaki doğrulama kodunu kullanın:</p><h2>${verificationCode}</h2>`,
      });
    } catch (err) {
      console.error("E-posta gönderilirken hata oluştu:", err);
      return res.status(500).json({ message: "E-posta gönderimi sırasında bir hata oluştu", error: err });
    }
    

    res
      .status(200)
      .json({
        message:
          "Kayıt başarılı. Lütfen e-posta adresinize gönderilen doğrulama kodunu girin.",
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Kayıt işlemi sırasında bir hata oluştu", error: err });
  }
});

// Doğrulama kodu kontrol rotası
router.post("/verify-code", verifyCodeLimiter, async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    if (!email || !verificationCode) {
      return res.status(400).json({ message: "E-posta ve doğrulama kodu gereklidir." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Kullanıcı zaten doğrulanmış." });
    }

    // Doğrulama kodunun süresi geçmiş mi kontrol et
    const currentTime = new Date();
    if (user.verificationCodeExpiresAt < currentTime) {
      return res.status(400).json({
        message: "Doğrulama kodu süresi dolmuş. Lütfen yeni bir kod talep edin.",
      });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Geçersiz doğrulama kodu." });
    }

    // Doğrulama başarılı
    user.isVerified = true;
    user.verificationCode = null; // Doğrulama kodunu sil
    user.verificationCodeExpiresAt = null; // Kod geçerliliği süresini sıfırla
    await user.save();

    res.status(200).json({ message: "E-posta başarıyla doğrulandı." });
  } catch (err) {
    res.status(500).json({
      message: "Doğrulama işlemi sırasında bir hata oluştu",
      error: err.message,
    });
  }
});


// Doğrulama kodunu yeniden gönderme endpoint'i
router.post("/resend-code", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "E-posta adresi gerekli." });
  }

  try {
    // E-posta ile kullanıcıyı bul
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Eğer kullanıcı zaten doğrulanmışsa, yeni bir kod göndermeye gerek yok
    if (user.isVerified) {
      return res.status(400).json({
        message: "Kullanıcı zaten doğrulanmış. Yeni doğrulama kodu gerekmez.",
      });
    }

    // Doğrulama kodunun süresi dolmuş mu kontrol et
    const currentTime = new Date();
    if (user.verificationCodeExpiresAt >= currentTime) {
      return res.status(400).json({
        message: "Doğrulama kodu süresi dolmamış. Yeni bir kod almanız gerekmez.",
      });
    }

    // Yeni doğrulama kodu oluştur
    const newVerificationCode = generateVerificationCode();

    // Yeni doğrulama kodunu kullanıcıya kaydet
    user.verificationCode = newVerificationCode;
    user.verificationCodeExpiresAt = new Date(currentTime.getTime() + 1 * 20 * 1000); // 20 saniye sonra geçerli olacak
    await user.save();

    // Yeni doğrulama kodunu e-posta ile gönder
    await transporter.sendMail({
      from: "sizinEmail@gmail.com", // E-posta gönderici adresiniz
      to: user.email,
      subject: "E-posta Doğrulama Kodu",
      html: `<p>Merhaba ${user.firstName},</p><p>Hesabınızı doğrulamak için aşağıdaki doğrulama kodunu kullanın:</p><h2>${newVerificationCode}</h2>`,
    });

    res.status(200).json({
      message: "Yeni doğrulama kodu başarıyla gönderildi.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Doğrulama kodu gönderme sırasında bir hata oluştu.",
      error: error.message,
    });
  }
});

// Login rotası
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });

    // Kullanıcı doğrulaması yapılmış mı kontrol et
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "E-posta doğrulaması yapılmamış." });
    }

    // Hesap dondurulmuşsa, hesabı aktif et
    if (!user.isActive) {
      // Hesabı aktif yap
      user.isActive = true;
      await user.save(); // Değişiklikleri kaydet

      // Hesap aktif olduğunda kullanıcıyı bilgilendir
      console.log(`Hesap aktif hale getirildi: ${user.email}`);
    }

    // Şifreyi doğrula
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(403).json({ message: "Geçersiz şifre!" });
    }

    // JWT token oluşturma
    const token = jwt.sign(
      { id: user._id, email: user.email }, // Payload
      process.env.JWT_SECRET, // Secret key, .env dosyasından alınmalı
      { expiresIn: "1h" } // Token'ın geçerlilik süresi
    );

    res.status(200).json({ user, token }); // Kullanıcıyı ve token'ı geri gönderiyoruz
  } catch (err) {
    res
      .status(500)
      .json({ message: "Giriş işlemi sırasında bir hata oluştu", error: err });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const temporaryPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = bcrypt.hashSync(temporaryPassword, 10);

    user.password = hashedPassword;
    await user.save();

    // E-posta gönderme
    sendEmail(
      user.email,
      "Şifre Sıfırlama",
      `Geçici şifreniz: ${temporaryPassword}\nLütfen giriş yaptıktan sonra şifrenizi değiştirin.`
    );

    res.status(200).json({ message: "Geçici şifre e-posta adresinize gönderildi." });
  } catch (err) {
    console.error("Hata:", err); // Hata bilgisini konsola yazdırın
    res.status(500).json({ message: "Bir hata oluştu.", error: err.message });
  }
});

export default router;