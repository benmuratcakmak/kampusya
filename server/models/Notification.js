import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: [
      "message",
      "like",
      "comment",
      "commentLike",
      "commentReply",
      "commentReplyLike",
      "follow",
    ],
    required: true,
  },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

// DOSYA TEMEL YAPISI -----------------
// Bir bildirim model şeması oluşturuyoruz ve
// recipient kısmı bildirim alan kullanıcının id'sini temsil ediyor ref="User" user'dan referans alıyor
// sender kısmında bildirimi gönderen kullanıcının id'sini temsil ediyor yine ref="User"'dan referans alınıyor
// type kısmında enumlar bulunuyor enumlar  bir değeri alabilecek sabit seçenekler listesi sağlar. Yani, bir değişkenin sadece belirli bir değeri alabilmesi gerektiğinde enum kullanılır. ve biz type > enum[] dizisinde aslında Bu alanda, bildirim türlerini belirliyoruz işte bildirimin post begenme, mesaj, takipçi gibi

// Ve  mongoose.modal ile şema üzerinden bizim verdigimiz isimde bir şema oluşturur ilk parametrede 2.parametre ise bizim hazırlamış oldugumuz koleksiyon yani şemadır
// daha sonrasında modeli dışarda kullanabilmek için aktardık.
