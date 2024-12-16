import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isRead: { type: Boolean, default: false },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message", // Son mesajı işaret eder
    },
    // createdAt: {
    //   type: Date,
    //   default: Date.now,
    // },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);
export default Conversation;

// ConversationSchema: Konuşma verisinin yapısını belirler.
// participants: Konuşmadaki kullanıcıları belirler.
// isRead: Konuşmanın okunup okunmadığını belirler.
// lastMessage: Son mesajın ID'sini tutar.
// timestamps: Verinin oluşturulma ve güncellenme tarihlerini otomatik ekler.
// Bu model ile, bir konuşma (chat) sistemindeki kullanıcıların mesajlaştığı ve son mesajın takip edildiği verileri yönetebilirsiniz.,
// Model:
// Conversation: Bu şema bir Conversation modeline dönüştürülür. MongoDB'de bu modelin verileri conversations isimli koleksiyonda saklanır.
// Kullanım:
// participants kısmı, kullanıcıların kimler olduğunu belirler.
// isRead konuşmanın okunup okunmadığını takip eder.
// lastMessage son mesajın kim olduğunu belirler.
