// Paket
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Tar med middleware för att se över användarens behörighet med JWT
const authenticateToken = require("../middleware/authToken.js");

// För att kunna använda miljövariabler
require('dotenv').config();

// Importerar modellen för en middags-maträtt
const Dinner = require("../models/dinner.js");

// Hämta alla maträtter
router.get("/dinner", authenticateToken, async(req, res) => {
    try {
        const dishes = await Dinner.find();
        res.json(dishes);
    } catch (error) {
        res.status(500).json({ error: "Kunde inte hämta maträtter från middagsmenyn" });
    }
});

// Hämta specifik rätt från middagsmenyn
router.get("/dinner/:id", authenticateToken, async(req, res) => {
    try {
        const id = req.params.id;

        const dish = await Dinner.findById(id);

        if (!dish) {
            return res.status(404).json({ error: "Ingen maträtt hittades med angivet ID!" })
        }
        res.json(dish);
    } catch (error) {
        res.status(400).json({
            error: "Fel format på angivet ID eller ogiltigt värde",
            details: error.message
        })
    }
});

// Lägga till en ny maträtt
router.post("/dinner", authenticateToken, async(req, res) => {
    try {
        const { category, name, description, price } = req.body;

        // Validera att alla fält blivit angivna
        if (!category || !name || !description || !price) {
            return res.status(400).json({ error: "Ej fullständig information angiven för en maträtt. Ange text för varje fält!" });
        }

        // Validera kategori
        const categories = ["Förrätt", "Huvudrätt", "Efterrätt"];
        if (!categories.includes(category)) {
            return res.status(400).json({ error: "Felaktig kategori angiven. Kategorin måste vara förrätt, huvudrätt eller efterrätt" });
        }

        // Validera beskrivning
        if (description.length < 6 || description.length > 100) {
            return res.status(400).json({ error: "Beskrivning för en maträtt måste vara mellan 6 och 100 tecken" });
        }

        // Validera priset
        if (price <= 0 || price > 1000) {
            return res.status(400).json({ error: "Priset måste vara större än 0 men under 1000 kr" });
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
        // Slutlig felmeddelande
        res.status(500).json({ error: "Fel på server när maträtten skulle läggas till..." });
        console.error(error);
        return;
    }
});

// Radera en maträtt från middagsmenyn
router.delete("/dinner/:id", authenticateToken, async(req, res) => {
    try {
        // Hittar maträtt genom id och raderar från databasen
        let deleteDish = await Dinner.findByIdAndDelete(req.params.id);

        // Om det inte finns något ID med det man försöker radera
        if (!deleteDish) return res.status(404).json({ message: "Ingen middagsrätt med detta ID hittades!" });

        // Om man lyckas med raderingen
        return res.json({
            message: "Maträtten i middagsmenyn raderades från databasen",
            deleted: deleteDish
        });
    } catch (error) {
        return res.status(400).json({
            error: "Fel format på angivet ID eller ogiltigt värde",
            details: error.message
        });
    }
});

// Uppdatera en maträtt från middagsmenyn
router.put("/dinner/:id", authenticateToken, async(req, res) => {
    try {
        // Hämtar id i requsten för att använda till att radera en post
        const id = req.params.id;

        // Hämtar värden som angetts från frontend
        const { category, name, price, description } = req.body;

        // Letar efter en maträtt för att uppdatera genom ID
        let updateDish = await Dinner.findByIdAndUpdate(id, { category, name, price, description }, {
            new: true // Får tillbaka den uppdaterade "versionen" av maträtten
        });

        // Om det inte finns något ID med det man försöker radera
        if (!updateDish) return res.status(404).json({ message: "Ingen middagsrätt med detta ID hittades!" });

        // Om man lyckas med raderingen
        return res.json({
            message: "Maträtten i middagsmenyn uppdaterades!",
            deleted: updateDish
        });
    } catch (error) {
        return res.status(400).json({
            error: "Fel format på angivet ID eller ogiltigt värde",
            details: error.message
        });
    }
});

// Exporterar router för att använda i server.js
module.exports = router;