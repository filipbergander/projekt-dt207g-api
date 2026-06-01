// Paket
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schema för ett nyhetsinlägg på hemsidan
const newsSchema = new mongoose.Schema({
    headline: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 70
    },
    content: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 10,
        maxLength: 150
    },
    created: {
        type: Date,
        default: Date.now
    }
});

// Lägger till collectionen news -> users inom mongoDB
const News = mongoose.model("News", newsSchema);
// Exporterar schemat för att kunna användas inom resten av filer
module.exports = News;