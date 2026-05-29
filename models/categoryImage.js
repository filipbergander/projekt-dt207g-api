// Paket
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schema för bild till kategori av maträtt
const categoryImageSchema = new mongoose.Schema({

    // Kategori för en maträtt
    category: {
        type: String,
        required: [true, "En kategori måste anges!"],
        unique: true
    },

    // Bilden
    image: {
        type: String,
        required: true
    },
    // Alt-text till bilden
    alt: {
        type: String,
        required: [true, "Alt-text måste anges!"]
    },
    // Timestamp när bilden lades till
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Lägger till bilden inom collection CategoryImage i MongoDB
const categoryImage = mongoose.model("CategoryImage", categoryImageSchema);

// Export för att använda inom resten av projektet
module.exports = categoryImage;