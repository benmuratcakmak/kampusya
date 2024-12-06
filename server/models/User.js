import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
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
      minlength: [6, 'Şifre en az 6 karakter olmalıdır.'],
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    photo: {
      type: String,
    },
    faculty: { type: String, default: '' }, // Fakülte
    department: { type: String, default: '' }, // Bölüm
    isActive: { type: Boolean, default: true },
    bio: {
      type: String,
      max: 50,
      default: '',
    },
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
    verificationCode: String, // Doğrulama kodu
    verificationCodeExpiresAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ firstName: 1 });
UserSchema.index({ lastName: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

const User = mongoose.model("User", UserSchema);
export default User;
