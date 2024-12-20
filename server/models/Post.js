import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
  },
  sharePostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  mediaUrl: {
    type: String,
    default: null,
  },
  eventTitle: {
    type: String,
    required: false,
  },
  eventDate: {
    type: Date,
    required: false,
  },
  eventDescription: {
    type: String,
    required: false,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      likes: {
        type: [mongoose.Schema.Types.ObjectId], // Yorum beğenileri
        default: [],
      },
      replies: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          content: {
            type: String,
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          likes: {
            type: [mongoose.Schema.Types.ObjectId], // Yorum beğenileri
            default: [],
          },
        },
      ],
    },
  ],
  shareCount: { type: Number, default: 0 },
  pollQuestion: { type: String },
  pollOptions: [
    {
      option: { type: String },
      votes: { type: Number, default: 0 },
    },
  ],
  pollVotes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      optionIndex: {
        type: Number,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model("Post", PostSchema);
export default Post;
