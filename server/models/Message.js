import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
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
  sharePostText: {
    type: String,
  },
  sharePostMedia: {
    type: String,
    default: null,
  },
  sharePostProfilePhoto: {
    type: String,
  },
  sharePostUsername: {
    type: String,
  },
  sharePostId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Message", MessageSchema);
export default Message;
