import mongoose from "mongoose"

const conn = () => {
    const uri =
        process.env.NODE_ENV === "production"
            ? process.env.MONGODB_URI_PRODUCTION
            : process.env.MONGODB_URI;

    mongoose
        .connect(uri)
        .then(() => {
            console.log("MongoDB bağlantısı başarılı...");
        })
        .catch((err) => {
            console.log("Bağlantı başarısız... Hata: " + err);
        });
};

export default conn