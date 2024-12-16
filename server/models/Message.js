import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    sharePostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    // createdAt: {
    //   type: Date,
    //   default: Date.now,
    // },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);
export default Message;

// conversationId: Mesajın ait olduğu konuşmanın ID'sini tutar. Bu, hangi konuşma içinde olduğunu belirler. Conversation modeline referans (ref) verilir.
// sender: Mesajı gönderen kullanıcının ID'sini tutar. Bu da User modeline referans verir.
// text: Gönderilen mesajın metni (içeriği) burada tutulur.
// sharePostId: Eğer mesajda bir paylaşım (post) varsa, bu alanda o paylaşımın ID'si tutulur. Bu alan opsiyonel (isteğe bağlı) olduğu için bazı mesajlar sadece metin içerebilir, bazıları ise bir gönderiyle birlikte olabilir.
// timestamps: Bu özellik, mesajın ne zaman gönderildiğini ve en son ne zaman güncellendiğini otomatik olarak kaydeder.
// Bu model sayesinde bir sohbet uygulamasında mesajları takip edebilir, her mesajın hangi konuşmaya ait olduğunu görebilir ve gönderen kişiyi belirleyebilirsiniz.
