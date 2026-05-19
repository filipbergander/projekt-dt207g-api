// Autentisering

// Paket
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cors = require('cors');

// För att kunna använda miljövariabler
require('dotenv').config();

// Importerar modellen för en user
const User = require("../models/user.js");

// Registera en ny användare
router.post("/register", async(req, res) => {
    try {
        const { username, email, password, role } = req.body;
        // Validera att alla fält blivit angivna
        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: "Ej fullständig information angiven. Kräver användarnamn, mejl, lösenord och roll" });
        }
        // Validera lösenord
        if (password.length < 6) {
            return res.status(400).json({ error: "Lösenordet måste vara minst 6 tecken..." })
        }
        // Om man lyckas med registreringen
        const user = new User({ username, email, password, role });
        await user.save();
        res.status(201).json({
            message: "Ny användare har skapats!",
            user: {
                username,
                email,
                role
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Fel på server när en användare skulle registreras..." });
    }
});

module.exports = router;