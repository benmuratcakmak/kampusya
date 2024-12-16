import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 20,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 20,
    },
    username: {
      type: String,
      required: true,
      min: 3,
      max: 20,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Şifre en az 6 karakter olmalıdır."],
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    photo: {
      type: String,
    },
    faculty: { type: String, default: null },
    department: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    bio: { type: String, max: 50, default: null },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // User reference for followers
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // User reference for following
      },
    ],
    isVerified: { type: Boolean, default: false }, // Doğrulama durumu
    // verificationCode: String,
    // verificationCodeExpiresAt: { type: Date },
    verificationCode: { type: String, default: null },
    verificationCodeExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

UserSchema.index({ username: 1, email: 1 }, { unique: true });
UserSchema.index({ firstName: 1, lastName: 1 });

const User = mongoose.model("User", UserSchema);
export default User;

// firstName: Kullanıcının adını tutar. Bu alan zorunlu ve minimum 2, maksimum 20 karakter olmalıdır.
// lastName: Kullanıcının soyadını tutar. Bu da zorunlu ve minimum 2, maksimum 20 karakter olmalıdır.
// username: Kullanıcının kullanıcı adını tutar. Bu alan zorunlu, en az 3, en fazla 20 karakter uzunluğunda olmalıdır. Ayrıca, bu alan benzersiz olmalıdır (yani her kullanıcı için farklı olmalıdır).
// email: Kullanıcının e-posta adresini tutar. Bu alan da zorunlu, en fazla 50 karakter uzunluğunda ve benzersiz olmalıdır.
// password: Kullanıcının şifresini tutar. Bu alan zorunlu olup, şifre en az 6 karakter olmalıdır. Ayrıca, şifrenin doğruluğu için özelleştirilmiş bir hata mesajı vardır (örneğin, şifre 6 karakterden kısa olduğunda bir hata mesajı gösterilir).
// resetPasswordToken: Şifresini sıfırlama işlemi için bir token tutulur. Şifre sıfırlama işlemi sırasında kullanılan geçici bir güvenlik token'ıdır.
// resetPasswordExpires: Şifre sıfırlama token'ının geçerlilik süresi.
// photo: Kullanıcının profil fotoğrafını tutar. Bu alan isteğe bağlıdır.
// faculty: Kullanıcının fakültesini belirtir. İsteğe bağlı bir alan olup, varsayılan olarak null gelir.
// department: Kullanıcının bölümünü belirtir. İsteğe bağlı bir alan olup, varsayılan olarak null gelir.
// isActive: Kullanıcının hesabının aktif olup olmadığını belirten bir alandır. Varsayılan değeri true olup, kullanıcı aktifken false yapılabilir.
// bio: Kullanıcının kendini tanıtan biyografisini tutar. Maksimum 50 karakter uzunluğunda olabilir. Varsayılan olarak null gelir.
// followers: Kullanıcının takipçilerini tutar. Bu, User modeline ait kullanıcıların ObjectId'lerini içerir.
// followings: Kullanıcının takip ettiği kişileri tutar. Yine User modeline ait kullanıcıların ObjectId'lerini içerir.
// isVerified: Kullanıcının doğrulama durumunu belirtir. Varsayılan olarak false (doğrulama yapılmamış) gelir. Eğer doğrulama yapılmışsa true olacaktır.
// verificationCode: Kullanıcının doğrulama kodunu tutar. Bu kod, kullanıcı e-posta doğrulaması için kullanılabilir.
// verificationCodeExpiresAt: Doğrulama kodunun geçerlilik süresi.
