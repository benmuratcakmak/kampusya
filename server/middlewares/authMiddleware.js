import jwt from "jsonwebtoken"; // jwt'yi import etmeyi unutmayın

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // "Bearer <token>" formatında

  if (!token) {
    console.log("Token bulunamadı. Authorization header'ı mevcut değil.");
    return res.status(401).json({ message: "Yetkisiz erişim! Token bulunamadı." });
  }

  console.log("Token alındı:", token); // Token'ı log'la (güvenlik açısından dikkatli olun)

  try {
    // Access token doğrulama
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Access token'ı doğrulama
    console.log("Token doğrulandı:", decoded); // Token doğrulandıktan sonra kullanıcı bilgilerini log'la
    req.user = decoded; // Kullanıcı bilgilerini request objesine ekle

    // Eğer refresh token'ı da kontrol etmek istiyorsanız:
    const refreshToken = req.header("x-refresh-token"); // refresh token, genellikle ayrı bir header'da tutulur
    if (refreshToken) {
      jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decodedRefreshToken) => {
        if (err) {
          console.error("Refresh token doğrulama hatası:", err);
          return res.status(401).json({
            message: "Geçersiz veya süresi dolmuş refresh token!",
            error: err.message,
          });
        }
        console.log("Refresh token doğrulandı:", decodedRefreshToken);
        req.refreshToken = decodedRefreshToken; // Refresh token'ı request objesine ekle
        next();
      });
    } else {
      next();
    }

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.error("Token süresi dolmuş:", err);
      return res.status(401).json({
        message: "Geçersiz veya süresi dolmuş token!",
        error: err.message,
        expiredAt: err.expiredAt,
        expirationDate: new Date(err.expiredAt).toLocaleString(),
      });
    }
    console.error("Token doğrulama hatası:", err); // Genel hata log'u
    return res.status(401).json({
      message: "Geçersiz token!",
      error: err.message,
      stack: err.stack, // Hata yığını bilgisini log'la (geliştirme ortamında kullanılır)
    });
  }
};

export default authMiddleware;
