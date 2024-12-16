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
  likes: {
    type: [mongoose.Schema.Types.ObjectId], // Post beğenileri
    default: [], // Başlangıçta boş
  },
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

// userId: Gönderiyi oluşturan kullanıcıyı temsil eder. Bu alan User modeline referans verir.
// content: Gönderinin içeriğini (metni) tutar. Bir kullanıcı metin paylaşırken burada saklanır.
// sharePostId: Gönderinin başka bir gönderiyi paylaştığı (reshare) durumunu belirtir. Bu alanda, paylaşılan gönderinin ID'si saklanır.
// mediaUrl: Gönderide bulunan medya içeriği (fotoğraf, video, vs.) için URL alanıdır. Bu, bir medya dosyasının bağlantısını tutar.
// eventTitle, eventDate, eventDescription: Eğer gönderi bir etkinlik (event) ile ilgiliyse, bu alanlarda etkinlik başlığı, tarihi ve açıklaması saklanır. Bunlar isteğe bağlı (optional) alanlardır.
// likes: Gönderiye yapılan beğenileri tutar. Bu, beğenen kullanıcıların ID'lerini içerir.
// comments: Gönderiye yapılacak yorumları tutar. Her yorum:
// userId: Yorum yapan kullanıcının ID'sini içerir.
// content: Yorumun içeriği.
// createdAt: Yorumun oluşturulma tarihi.
// likes: Yorumun beğenileri.
// replies: Yorumlara yapılan cevaplar (alt yorumlar). Bu da kullanıcı ID'si, içerik, oluşturulma tarihi ve beğeniler gibi özellikler içerir.
// shareCount: Gönderinin ne kadar paylaşıldığını gösterir. Başlangıçta 0 olarak ayarlanır.
// pollQuestion: Eğer gönderi bir anket içeriyorsa, anket sorusu burada tutulur.
// pollOptions: Anketin seçeneklerini tutar. Her seçenek:
// option: Seçeneğin metni.
// votes: Seçeneğin aldığı oy sayısı.
// pollVotes: Kullanıcıların hangi anket seçeneğine oy verdiklerini tutar. Her oy, kullanıcının ID'si ve seçtiği seçenek indeksini içerir.
// createdAt: Gönderinin oluşturulma tarihini tutar.
// Bu model, sosyal medya platformlarında bir gönderiye dair tüm bilgileri (metin, medya, yorumlar, anketler, beğeniler, paylaşımlar) saklamayı sağlar.
