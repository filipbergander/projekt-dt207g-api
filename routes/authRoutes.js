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

// Importerar modellen för en user
const User = require("../models/user.js");


// Registera en ny användare
router.post("/register", authenticateToken, async(req, res) => {
    try {
        const { username, email, password, role } = req.body;
        // Validera att alla fält blivit angivna
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Ej fullständig information angiven. Kräver användarnamn, mejl, lösenord och roll" });
        }
        // Validera lösenord
        if (password.length < 6) {
            return res.status(400).json({ error: "Lösenordet måste vara minst 6 tecken..." })
        }

        if (email.length < 5 || !email.includes("@") || !email.includes(".")) {
            return res.status(400).json({ error: "Felaktig mejladress angiven!" })
        }
        // Om man lyckas med registreringen
        const user = new User({ username, email, password, role });
        await user.save(); // Sparar användaren genom user-modellen
        // Success-meddelande
        res.status(201).json({
            message: "Ny användare har skapats!",
            user: {
                username,
                email,
                role
            }
        });
        // Felmeddelanden
    } catch (error) {
        /* Om man försöker spara en användare som redan finns,
         eftersom användarnamn och mejl är unika */
        if (error.code === 11000) {
            // Användarnamnet används redan?
            if (error.keyPattern.username) {
                return res.status(400).json({ error: "Användarnamnet används redan!" })
            }
            // Emailen används redan?
            if (error.keyPattern.email) {
                return res.status(400).json({ error: "Mejlen används redan!" })
            }
        }
        res.status(500).json({ error: "Fel på server när en användare skulle registreras..." });
        console.error(error);
        return;
    }
});

// Logga in en befintlig användare
router.post("/login", async(req, res) => {
    try {
        const { email, password } = req.body;

        // Validera input
        if (!email || !password) {
            return res.status(400).json({
                response: {
                    error: "Felaktig information angivet. Ange korrekt mejl och lösenord!"
                }
            });
        }

        // Finns användaren redan?
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                response: {
                    error: "Felaktig mejl eller lösenord!"
                }
            })
        }

        // Stämmer lösenorden med varandra? Angivet/lagrat
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                response: {
                    error: "Felaktig mejl eller lösenord!"
                }
            })
        }

        // Skapa jsonwebtoken
        else {
            const payload = {
                username: user.username,
                role: user.role
            };
            // Token som finns i en timme
            const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
            res.status(200).json({
                response: {
                    message: "Användare inloggad",
                    user: {
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        created: {
                            raw: user.createdAt,
                            formatted: user.createdAt.toLocaleString("sv-SE", {
                                dateStyle: "long",
                                timeStyle: "short"
                            })
                        }
                    },
                    token
                }
            });
        }
        // Felmeddelande om inloggningen inte fungerar
    } catch (error) {
        res.status(500).json({
            response: {
                error: "Fel på server vid inloggning"
            }
        });
        console.error(error);
    }
    console.log("Inloggning kallad...");
});

// Exporterar router för att använda i server.js
module.exports = router;