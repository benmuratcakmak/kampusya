import mongoose from "mongoose"

const conn = () => {
    mongoose
        .connect(process.env.MONGODB_URI)
        // .connect(process.env.MONGODB_URI_PRODUCTION)
        .then(() => {
            console.log('mongoDb baglantisi basarili...')
        })
        .catch((err) => {
            console.log('baglanti basarisiz... Hata ise bu ' + err)
        })
}

export default conn