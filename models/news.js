// Paket
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schema för ett nyhetsinlägg på hemsidan
const newsSchema = new mongoose.Schema({
    // Rubrik
    headline: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 70
    },
    // Innehåll
    content: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 10,
        maxLength: 175
    },
    // Skribent
    author: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    // Timestamp
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Lägger till collectionen news -> users inom mongoDB
const News = mongoose.model("News", newsSchema);
// Exporterar schemat för att kunna användas inom resten av filer
module.exports = News;