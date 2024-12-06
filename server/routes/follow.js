import express from 'express';
import User from '../models/User.js';
import { io } from '../socket/socket.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Kullanıcıyı takip etme
router.put('/follow/:id', async (req, res) => {
  try {
    const follower = await User.findById(req.body.followerId); // Takip eden kullanıcı
    const followed = await User.findById(req.params.id); // Takip edilen kullanıcı

    if (!follower || !followed) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    if (followed.followers.includes(follower._id)) {
      return res.status(400).json({ message: 'Zaten bu kullanıcıyı takip ediyorsunuz.' });
    }

    followed.followers.push(follower._id);
    follower.followings.push(followed._id);

    await followed.save();
    await follower.save();

    const notification = new Notification({
      sender: follower._id,
      recipient: followed._id,
      type: "follow",
    });
    await notification.save();

    io.to(followed._id.toString()).emit('newFollowNotification', {
      message: `${follower.username} sizi takip etmeye başladı!`,
      followerId: follower._id,
    });

    res.status(200).json({ message: 'Başarıyla takip ettiniz.' });
  } catch (err) {
    res.status(500).json({ message: 'Takip etme hatası', error: err });
  }
});

// Takibi kaldırma
router.put('/unfollow/:id', async (req, res) => {
  try {
    const follower = await User.findById(req.body.followerId);
    const followed = await User.findById(req.params.id);

    if (!follower || !followed) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    followed.followers = followed.followers.filter(
      (id) => id.toString() !== follower._id.toString()
    );
    follower.followings = follower.followings.filter(
      (id) => id.toString() !== followed._id.toString()
    );

    await followed.save();
    await follower.save();

    res.status(200).json({ message: 'Başarıyla takipten çıktınız.' });
  } catch (err) {
    res.status(500).json({ message: 'Takipten çıkarma hatası', error: err });
  }
});

// Kullanıcı takipçilerini getirme
router.get("/followers/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).populate("followers");

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Eğer takipçi listesi boşsa, boş bir dizi döndür
    if (user.followers.length === 0) {
      return res.status(200).json([]); // Takipçi yoksa boş liste döndür
    }

    res.json(user.followers); // Kullanıcının takipçilerini döndür
  } catch (err) {
    console.error("Takipçiler alınırken hata oluştu:", err);
    res.status(500).json({ message: "Takipçiler alınamadı." });
  }
});


// Kullanıcı takip ettiği kişileri getirme
router.get("/following/:username", async (req, res) => {
  try {
    // Kullanıcıyı username ile bul
    const user = await User.findOne({ username: req.params.username });
    
    // Eğer kullanıcı bulunamazsa hata mesajı döndür
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    if (!user.followings || user.followings.length === 0) {
      return res.status(200).json([]); // Boş bir liste döndür
    }
    

    // Takip ettiği kişileri almak için user.followings array'inde bulunan _id'lerle kullanıcıları ara
    const following = await User.find({ _id: { $in: user.followings } });

    // Eğer takip edilenler yoksa, boş liste dönebiliriz
    if (!following.length) {
      return res.status(404).json({ message: 'Takip edilenler bulunamadı.' });
    }

    res.status(200).json(following);
  } catch (err) {
    res.status(500).json({ error: "Takip edilenler alınamadı", details: err.message });
  }
});


export default router;
  