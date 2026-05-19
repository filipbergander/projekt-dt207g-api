// Paket
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schema för en ny användare
const userSchema = new mongoose.Schema({

    // Användarnamn
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // Mejl
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // Lösenord
    password: {
        type: String,
        required: true,
        minlength: 6
    },

    // Roll
    role: {
        type: String,
        require: true,
        default: "Personal"
    },

    // Timestamp när kontot blev skapat
    account_created: {
        type: Date,
        default: Date.now
    }
});