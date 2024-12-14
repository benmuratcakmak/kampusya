import jwt from 'jsonwebtoken';
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Token yenileme endpointi
router.post("/", async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token gerekli!" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }  // Kısa süreli geçerlilik
    );

    res.status(200).json({ accessToken: newAccessToken });

  } catch (err) {
    res.status(500).json({ message: "Token yenileme hatası", error: err });
  }
});

export default router;
