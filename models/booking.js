// Paket
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schema för en ny bokning
const bookingSchema = new mongoose.Schema({

    // Namn på den som bokar
    name: {
        type: String,
        required: [true, "Ange ditt namn"],
        trim: true
    },

    email: {
        type: String,
        required: [true, "Ange din mejl"],
        trim: true,
        minLength: 5,
    },

    // Antal gäster
    guests: {
        type: Number,
        required: [true, "Ange antal gäster"],
        minLength: 1
    },
    // Datum för bokningen
    date: {
        type: Date,
        required: [true, "Ange datum för bokningen"],
    },
    // Tid för bokningen
    time: {
        type: String,
        required: [true, "Ange tid för bokningen"],
    },
    // Telefonnummer till den som bokar
    phone: {
        type: String,
        required: [true, "Ange ditt telefonnummer"],
        trim: true,
        minLength: 8,
    },
    // Eventuella meddelanden som användaren vill lämna
    message: {
        type: String,
        trim: true,
        minLength: 6,
        maxLength: 150
    },
    // Om bokningen är godkänd eller inte av personalen
    approved: {
        type: Boolean,
        default: false
    },
    // Timestamp när bokningen gjordes
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

// Lägger till bokningen inom collection booking i MongoDB
const Booking = mongoose.model("booking", bookingSchema);

// Export för att använda inom resten av projektet
module.exports = Booking;