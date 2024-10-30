const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require("dotenv")

dotenv.config();

cloudinary.config({
    cloud_name: process.env.VITE_APP_CLOUDINARY_CLOUD_NAME || "dthmpoy92",
    api_key: process.env.VITE_APP_CLOUDINARY_API_KEY || 299459394715193,
    api_secret: process.env.VITE_APP_CLOUDINARY_API_SECRET || "B1b0DsukzyC-vXOEhzFjYCHuqKI"
});
console.log(process.env.VITE_APP_CLOUDINARY_API_SECRET)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'real-estate-images',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };