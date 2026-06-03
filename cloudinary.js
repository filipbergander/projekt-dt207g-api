// använda miljövariabler
require('dotenv').config();
// Hämtar in cloudinary-paketet
const cloudinary = require('cloudinary').v2;

// Konfigurationen
cloudinary.config({
    cloud_url: process.env.CLOUDINARY_URL
});
// Exporterar konfigurationen
module.exports = cloudinary;