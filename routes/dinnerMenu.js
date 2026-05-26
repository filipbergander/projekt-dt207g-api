// Paket
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cors = require('cors');

// För att kunna använda miljövariabler
require('dotenv').config();

// Importerar modellen för en middags-maträtt
const Dinner = require("../models/dinner.js");

// Lägg till en ny maträtt
router.post("/dinnermeal", async(req, res) => {
    try {
        const { category, name, description, price } = req.body;

        // Validera att alla fält blivit angivna
        if (!category || !name || !description || !price) {
            return res.status(400).json({ error: "Ej fullständig information angiven för en maträtt. Ange text för varje fält!" });
        }

        // Validera kategori
        const categories = ["förrätt", "varmrätt", "efterrätt"];
        if (!categories.includes(category.toLowerCase())) {
            return res.status(400).json({ error: "Felaktig kategori angiven. Kategorin måste vara förrätt, varmrätt eller efterrätt" });
        }

        // Validera beskrivning
        if (description.length < 6 || description.length > 80) {
            return res.status(400).json({ error: "Beskrivning för en maträtt måste vara mellan 6 och 80 tecken" });
        }

        // Validera priset
        if (price.value <= 0) {
            return res.status(400).json({ error: "Priset måste vara större än 0" });
        }


        // Om man lyckas med att lägga till en maträtt
        const dinner = new Dinner({ category, name, description, price });
        await dinner.save(); // Sparar maträtten

        // Success-meddelande
        res.status(201).json({
            message: "Ny maträtt har skapats!",
            dinner: {
                category,
                name,
                description,
                price
            }
        });
    } catch (error) {
        // Om man försöker lägga till en maträtt som redan finns
        if (error.code === 11000) {
            // Finns maträtten redan?
            if (error.keyPattern.name) {
                return res.status(400).json({ error: "Maträtten finns redan!" })
            }
        }
        // Slutligt felmeddelande
        res.status(500).json({ error: "Fel på server när maträtten skulle läggas till..." });
        console.error(error);
        return;
    }
});

// Exporterar router för att använda i server.js
module.exports = router;