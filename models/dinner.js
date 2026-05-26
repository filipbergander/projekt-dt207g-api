// Paket
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schema för en en ny maträtt
const dinnerSchema = new mongoose.Schema({

    // Kategori för en maträtt
    category: {
        type: String,
        required: true,
        trim: true
    },

    // Namn
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // Beskrivning
    description: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 80
    },

    // Pris
    price: {
        type: Number,
        required: true
    },

    // Timestamp när maträtten lades till
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Lägger till den maträtten inom collection dinner i MongoDB
const Dinner = mongoose.model("dinner", dinnerSchema);

// Export för att använda inom resten av projektet
module.exports = Dinner;