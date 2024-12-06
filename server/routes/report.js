import express from "express";
import multer from "multer";
import cloudinary from "../config/forPost.js";
import Report from "../models/Report.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Multer konfigürasyonu: Hafızada dosya saklamak için
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 1000 * 1024 * 1024 }, // Maksimum dosya boyutu 1MB
  fileFilter: (req, file, cb) => {
    const validMimeTypes = ["image/", "video/"];
    if (validMimeTypes.some((type) => file.mimetype.startsWith(type))) {
      cb(null, true);
    } else {
      cb(new Error("Geçersiz dosya türü"), false);
    }
  },
});

// Nodemailer transporter kurulumu (Gmail kullanarak)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Medya yükleme ve rapor gönderme işlemi
const uploadMediaToCloudinary = async (file) => {
  const folderName = file.mimetype.startsWith("image/") ? "photos" : "videos";
  try {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      {
        folder: folderName,
        resource_type: "auto", // Medya türünü otomatik belirle
      }
    );
    return result.secure_url;
  } catch (error) {
    throw new Error("Cloudinary yükleme hatası: " + error.message);
  }
};

const sendEmailNotification = async (message, mediaUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Alıcı e-posta adresi
    subject: "Yeni Rapor Gönderildi",
    html: `
      <h3>Yeni Rapor</h3>
      <p><strong>Mesaj:</strong> ${message}</p>
      ${mediaUrl ? `<p><strong>Medya:</strong> <a href="${mediaUrl}">Medya Linki</a></p>` : ""}
      <p>Rapor başarıyla gönderildi!</p>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("E-posta gönderme hatası: " + error.message);
  }
};

router.post("/upload", upload.single("media"), async (req, res) => {
  const { message } = req.body;
  let mediaUrl = null;

  try {
    // Medya varsa Cloudinary'ye yükle
    if (req.file) {
      mediaUrl = await uploadMediaToCloudinary(req.file);
    }

    // Raporu veritabanına kaydet
    const newReport = new Report({
      message,
      mediaUrl,
    });
    await newReport.save();

    // E-posta gönder
    await sendEmailNotification(message, mediaUrl);

    res.status(200).json({
      success: true,
      message: "Rapor başarıyla kaydedildi ve e-posta gönderildi!",
    });
  } catch (error) {
    console.error("Rapor kaydetme veya e-posta gönderme hatası:", error.message);
    res.status(500).json({
      success: false,
      message: "Bir hata oluştu! " + error.message,
    });
  }
});

export default router;
