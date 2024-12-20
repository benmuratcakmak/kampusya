import mongoose from "mongoose";

const conn = () => {
  const uri =
    process.env.NODE_ENV === "production"
      ? process.env.MONGODB_URI_PRODUCTION
      : process.env.MONGODB_URI_DEVELOPMENT;

  mongoose
    .connect(uri)
    .then(() => {
      console.log("[MongoDB] Bağlantı başarılı");
    })
    .catch((err) => {
      console.error("[MongoDB Error] Bağlantı hatası:", {
        error: err.message,
        stack: err.stack,
        uri: uri.replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/, 'mongodb+srv://[hidden]:[hidden]@') // Credentials'ları gizle
      });
    });
};

export default conn;
