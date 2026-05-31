// Autentisering

// Paket
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Tar med middleware för att se över användarens behörighet med JWT
const authenticateToken = require('../middleware/authToken.js');

// För att kunna använda miljövariabler
require('dotenv').config();

// Importerar modellen för en bokning
const Booking = require("../models/booking.js");

// Hämta bokningar, krävs autentisering
router.get("/", authenticateToken, async(req, res) => {
    // Hämtar in alla bokningar och sorterar dem efter tidigaste datum först i ordningen
    try {
        const bookings = await Booking.find().sort({ date: 1 });
        res.json(bookings);
        if (bookings.length === 0) {
            return res.status(404).json({ message: "Inga bokningar finns än!" });
        }
    } catch (error) {
        res.status(500).json({ error: "Kunde inte hämta bokningar från middagsmenyn" });
    }

});

// Radera en bokning
router.delete("/:id", authenticateToken, async(req, res) => {
    try {
        // Hittar en bokning genom id och raderar från databasen
        let booking = await Booking.findByIdAndDelete(req.params.id);

        // Om det inte finns något ID med det man försöker radera
        if (!booking) return res.status(404).json({ message: "Ingen bokning med detta ID hittades!" });

        // Om man lyckas med raderingen av en bokning
        return res.json({
            message: "Bokningen för en middag raderades!",
            deleted: booking
        });
    } catch (error) {
        return res.status(400).json({
            error: "Fel format på angivet ID eller ogiltigt värde",
            details: error.message
        });
    }
});

// Skapa en ny bokning, öppen-route för besökare
router.post("/", async(req, res) => {
    try {
        const { name, email, guests, date, time, phone, message } = req.body;

        // Validera att alla fält blivit angivna
        if (!name || !email || !guests || !date || !time || !phone) {
            return res.status(400).json({ error: "En bokning kräver information i alla nödvändiga textfält" });
        }

        // Validera särskilda inputs för en bokning
        if (email.length < 5 || !email.includes("@") || !email.includes(".")) {
            return res.status(400).json({ error: "Felaktig mejladress angiven!" })
        }

        if (guests < 1) {
            return res.status(400).json({ error: "En bokning kräver åtminstone en gäst" })
        }

        // Validerar datumet som en sträng med formatet yyyy-mm-dd
        const bookingToday = new Date().toISOString().split("T")[0];
        if (date < bookingToday) {
            return res.status(400).json({ error: "Bokningen måste vara i framtiden!" })
        }

        if (time < "16:00" || time > "21:00") {
            return res.status(400).json({ error: "Bokningstiden måste vara mellan 16:00 och 21:00!" })
        }

        if (phone.length < 7 || phone.length > 16) {
            return res.status(400).json({ error: "Felaktigt telefonnummer angivet, behöver vara mellan än 7 och 16 nummer!" })
        }

        if (message && (message.length < 6 || message.length > 150)) {
            return res.status(400).json({ error: "Meddelandet måste vara mellan 6 och 150 tecken!" })
        }

        // Om man försöker skapa dubbla bokningar, vid till exempel spamming eller av misstag
        const alreadyBooked = await Booking.findOne({ name, phone, date, time });
        if (alreadyBooked) {
            return res.status(400).json({
                error: "Bokningen har redan skapats!",
                details: `Besökaren ${alreadyBooked.name} försöker skapa dubbla bokningar den ${alreadyBooked.date.toISOString().split("T")[0]} kl ${alreadyBooked.time}.`
            })
        }

        // Om man lyckas skapa en bokning
        const booking = new Booking({ name, email, guests, date, time, phone, message });
        await booking.save(); // Sparar bokningen

        // Success-meddelande
        res.status(201).json({
            message: "Ny bokning har skapats!",
            booking: {
                name,
                email,
                guests,
                date,
                time,
                phone,
                message
            }
        });

        // Felmeddelanden
    } catch (error) {
        res.status(500).json({ error: "Fel på server när bokningen skulle registreras..." });
        console.error(error);
        return;
    }
});



// Exporterar router för att använda i server.js
module.exports = router;