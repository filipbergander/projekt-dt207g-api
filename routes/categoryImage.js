// Paket
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Vart filerna av bilder ska lagras
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    }, // Unikt filnamn för varje bild så att de inte skriver över varandra
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    }
})

const upload = multer({ storage });

// Tar med middleware för att se över användarens behörighet med JWT
const authenticateToken = require("../middleware/authToken.js");

// För att kunna använda miljövariabler
require('dotenv').config();

// Importerar modellen för en kategori-bild
const categoryImage = require("../models/categoryImage.js");

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
router.post("/", upload.single("image"), authenticateToken, async(req, res) => {
    const { category, image, alt } = req.body;
    console.log(req.file);
    try {
        const newImage = await categoryImage.create({
            category,
            image: `http://localhost:3000/${req.file.path}`,
            alt
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
        // Slutlig felmeddelande
        console.error(error);
        res.status(500).json({ error: "Fel på server när bilden skulle laddas upp..." });
    }
});
/*
// Radera en kategoribild från menyn
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
*/
// Exporterar router för att använda i server.js
module.exports = router;