import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // Authorization başlığını kontrol et
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Yetkisiz erişim!" });
  }

  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Kullanıcı bilgilerini request objesine ekle
    next(); // Bir sonraki middleware'e geç
  } catch (err) {
    return res.status(401).json({ message: "Geçersiz veya süresi dolmuş token!" });
  }
};

export default authMiddleware;
