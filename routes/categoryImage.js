// Paket
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');

// Tar med middleware för att se över användarens behörighet med JWT
const authenticateToken = require("../middleware/authToken.js");

// För att kunna använda miljövariabler
require('dotenv').config();

// Importerar modellen för en kategori-bild
const categoryImage = require("../models/categoryImage.js");

// Vart filerna av bilder ska lagras
const storage = multer.memoryStorage();
/*
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    }, // Unikt filnamn för varje bild så att de inte skriver över varandra
    
    }
})*/

// Skydd mot filtyper som inte ska kunna laddas upp i frontend
const allowedFileTypes = ["image/jpeg", "image/png", "image/gif"];
const fileFilter = (req, file, cb) => {
    if (!allowedFileTypes.includes(file.mimetype)) {
        return cb(new Error("Ej tillåten filtyp för bilden!"), false);
    }
    cb(null, true);
};

const upload = multer({ fileFilter, storage });

// Hämta alla bilder
router.get("/", async(req, res) => {
    try {
        const images = await categoryImage.find();
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: "Kunde inte hämta kategoribilder från menyn" });
    }
});

/*
// Hämta specifik bild från menyn
router.get("/:id", authenticateToken, async(req, res) => {
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
*/
// Lägga till en ny kategori-bild
router.post("/", authenticateToken, upload.single("image"), async(req, res) => {
    try {
        const { category, image, alt } = req.body;

        const categories = ["Förrätt", "Huvudrätt", "Efterrätt", "Dryck"];
        if (!categories.includes(category)) {
            return res.status(400).json({ error: "Ogiltig kategori. Kategorin måste vara förrätt, huvudrätt, efterrätt eller dryck" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Ingen bild försökte läggas till..." });
        }

        if (!alt || alt.length > 50) {
            return res.status(400).json({ error: "Alt-text måste anges och får inte vara längre än 50 tecken!" });
        }

        const outputFilename = `${Date.now()}.jpg`;

        await sharp(req.file.buffer)
            .resize(300, 300, { fit: "cover" })
            .jpeg({ quality: 80 })
            .toFile(`uploads/${outputFilename}`);

        const newImage = await categoryImage.create({
            category,
            alt,
            image: req.file ? `http://localhost:3000/uploads/${outputFilename}` : null
        });

        // Success-meddelande
        res.status(201).json({
            message: "Ny kategori-bild har lagts till!",
            info: newImage
        });

    } catch (error) {
        // Om man försöker lägga till en bild som redan finns
        if (error.code === 11000) {
            // Finns bilden redan?
            if (error.keyPattern.category) {
                return res.status(400).json({ error: "Kategorin har redan en bild" })
            }
        }
        // Om man försöker ange fel kategori eller stavar fel...
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: "Något gick fel: " + error.message });
        }
        // Slutlig felmeddelande
        console.error(error);
        res.status(500).json({ error: "Fel på server när bilden skulle laddas upp..." });
    }
});

// Exporterar router för att använda i server.js
module.exports = router;