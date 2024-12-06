import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  message: { type: String, required: true }, // Mesaj alanı zorunlu
  mediaUrl: String, // Medyanın URL'si (isteğe bağlı)
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);
export default Report;
