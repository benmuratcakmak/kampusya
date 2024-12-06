import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary'ye yükleme için Multer ayarları
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profilePhotos", // Cloudinary'deki klasör
    allowed_formats: ["jpg", "png"], // İzin verilen formatlar
  },
});

const upload = multer({ storage });

export default upload