import express from "express";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import { io } from "../socket/socket.js";

const router = express.Router();

// Like islemi
router.post("/:postId/like", async (req, res) => {
  const { userId } = req.body;

  try {
    const post = await Post.findById(req.params.postId).populate("userId");
    if (!post) return res.status(404).json({ error: "Post bulunamadı" });

    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);

      // Bildirim oluştur
      if (userId.toString() !== post.userId._id.toString()) {
        const notification = new Notification({
          recipient: post.userId._id,
          sender: userId,
          type: "like",
          postId: post._id,
        });
        await notification.save();

        // Emit notification to the recipient using Socket.IO
        io.to(post.userId._id.toString()).emit("newLikeNotification", {
          type: "like",
          senderId: userId,
          postId: post._id,
        });
      }
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("userId", "username firstName lastName photo")
      .populate("likes");

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Beğeni işlemi hatası:", err);
    res.status(500).json({ error: "Beğeni işlemi başarısız" });
  }
});

// Yorumlari getir
router.get("/:postId/comments", async (req, res) => {
  try {
    // Yorumları almak için postId'ye göre Post'u buluyoruz
    const post = await Post.findById(req.params.postId)
      .populate("comments.userId", "username firstName lastName photo")
      .populate("comments.replies.userId", "username photo")
      .exec();

    if (!post) {
      return res.status(404).json({ error: "Post bulunamadı" });
    }

    // Yorumları döndürüyoruz
    res.status(200).json(post.comments);
  } catch (err) {
    console.error("Yorumları alırken hata oluştu:", err);
    res.status(500).json({ error: "Yorumlar alınamadı" });
  }
});

// Yorum yapma
router.post("/:postId/comment", async (req, res) => {
  const { userId, content } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post bulunamadı" });

    // Yorum ekleme
    const comment = { userId, content, createdAt: new Date() };
    post.comments.push(comment);

    // Bildirim kontrolü (Kendi gönderisine yorum yapma durumunda bildirim gönderme)
    if (post.userId.toString() !== userId) {
      const notification = new Notification({
        recipient: post.userId._id,
        sender: userId,
        type: "comment",
        postId: post._id,
      });
      await notification.save();

      io.to(post.userId._id.toString()).emit("newCommentNotification", {
        type: "comment",
        senderId: userId,
        postId: post._id,
      });
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("userId", "username firstName lastName photo")
      .populate("comments.userId", "username firstName lastName photo");

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Yorum eklerken hata oluştu:", err);
    res.status(500).json({ error: "Yorum eklenemedi" });
  }
});

// Yanıt verme
router.post("/:postId/comment/:commentId/reply", async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId, content } = req.body;

  try {
    // Post'u bul
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send("Post bulunamadı.");
    }

    // Yorumu bul
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).send("Yorum bulunamadı.");
    }

    // Yeni yanıt oluştur
    const reply = {
      userId,
      content,
      createdAt: new Date(),
    };

    comment.replies.push(reply);

    // Bildirim gönder
    if (comment.userId.toString() !== userId) {
      const notification = new Notification({
        recipient: comment.userId,
        sender: userId,
        type: "commentReply",
        postId: post._id,
        commentId: comment._id,
        content,
        isRead: false,
      });
      await notification.save();

      io.to(comment.userId.toString()).emit("newCommentReplyNotification", {
        type: "commentReply",
        senderId: userId,
        postId: post._id,
        commentId: comment._id,
        replyContent: content,
      });
    }

    await post.save();

    // Güncellenmiş veriyi al ve döndür
    const updatedPost = await Post.findById(postId).populate(
      "comments.replies.userId",
      "username photo"
    );

    const updatedComment = updatedPost.comments.id(commentId);

    res.status(200).json(updatedComment.replies);
  } catch (err) {
    console.error("Yanıt eklerken hata oluştu:", err);
    res.status(500).send("Sunucu hatası");
  }
});

// Yorum begenme
router.post("/:postId/comment/:commentId/like", async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post bulunamadı" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });

    // Kullanıcı daha önce beğendi mi?
    if (comment.likes.includes(userId)) {
      // Beğeniyi kaldır
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      // Beğeni ekle
      comment.likes.push(userId);

      // Bildirim kontrolü (Kendi yorumunu beğenme durumunda bildirim gönderme)
      if (comment.userId.toString() !== userId) {
        const notification = new Notification({
          recipient: comment.userId, // Yorumun sahibi
          sender: userId, // Beğeniyi yapan kullanıcı
          type: "commentLike",
          postId: post._id,
          isRead: false,
        });
        await notification.save();

        io.to(comment.userId.toString()).emit("newCommentLikeNotification", {
          type: "commentLike",
          senderId: userId,
          postId: post._id,
          commentId: comment._id,
        });
      }
    }

    await post.save();
    const updatedComment = post.comments.id(commentId);
    res.status(200).json(updatedComment);
  } catch (err) {
    console.error("Yorum beğenirken hata:", err);
    res.status(500).json({ message: "Bir hata oluştu" });
  }
});

// Yanıt beğenme işlemi
router.post(
  "/:postId/comment/:commentId/reply/:replyId/like",
  async (req, res) => {
    const { postId, commentId, replyId } = req.params;
    const { userId } = req.body;

    try {
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ error: "Post bulunamadı" });

      const comment = post.comments.id(commentId);
      if (!comment) return res.status(404).json({ error: "Yorum bulunamadı" });

      const reply = comment.replies.id(replyId);
      if (!reply) return res.status(404).json({ error: "Yanıt bulunamadı" });

      // Yanıtın beğenilerini güncelleme
      const isLiked = reply.likes.includes(userId);
      if (isLiked) {
        reply.likes = reply.likes.filter((id) => id.toString() !== userId);
      } else {
        reply.likes.push(userId);
      }

      const notification = new Notification({
        recipient: reply.userId,
        sender: userId,
        type: "commentReplyLike",
        postId: post._id,
        commentId: comment._id,
        replyId: reply._id,
        isRead: false,
      });
      await notification.save();

      io.to(post.userId._id.toString()).emit(
        "newCommentReplyLikeNotification",
        {
          type: "commentReplyLike",
          senderId: userId,
          postId: post._id,
        }
      );

      await post.save();

      // Güncellenmiş yanıtı ve beğeni sayısını döndürüyoruz
      res.status(200).json(reply);
    } catch (err) {
      console.error("Yanıt beğenirken hata oluştu:", err);
      res.status(500).json({ error: "Yanıt beğeni işlemi başarısız" });
    }
  }
);

router.put("/:postId/incrementShareCount", async (req, res) => {
  try {
    const { postId } = req.params;

    // Postu bul ve shareCount'ı 1 artır
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post bulunamadı" });
    }

    post.shareCount += 1;
    await post.save();

    res.status(200).json({ message: "ShareCount başarıyla güncellendi." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu" });
  }
});

export default router;
