// Paket
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cors = require('cors');
require("dotenv").config();

// Tar med middleware för att se över användarens behörighet med JWT
const authenticateToken = require("../middleware/authToken.js");

// För att kunna använda miljövariabler
require('dotenv').config();

const News = require("../models/news.js");

// Route för att hämta nyhetsinlägg
router.get("/", async(req, res) => {
    try {
        let result = await News.find();
        const formattedResult = result.map(row => ({
            id: row._id,
            headline: row.headline,
            content: row.content,
            created: {
                raw: row.created,
                formatted: row.created.toLocaleString("sv-SE", {
                    dateStyle: "short",
                    timeStyle: "short"
                }),
                date: row.created.toLocaleDateString("sv-SE", { dateStyle: "short" }),
                time: row.created.toLocaleTimeString("sv-SE", { timeStyle: "short" })
            }
        }));

        if (result.length === 0) {
            return res.status(404).json({ message: "Det finns inga nyhetsinlägg lagrade!" })
        }
        console.log(result);
        return res.json(formattedResult);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Kunde inte hämta nyhetsinlägg från databasen",
            error
        });
    }
});

// Skyddad route för att lägga till ett nyhetsinlägg, kräver autentisering med JWT genom middleware
router.post("/", authenticateToken, async(req, res) => {
    try {
        const existingNews = await News.findOne();

        if (existingNews) {
            return res.status(400).json({ error: "Max ett nyhetsinlägg i databasen!" })
        }

        const { headline, content } = req.body;

        // Validera input
        if (!headline || !content) {
            return res.status(400).json({ error: "Ett inlägg kräver rubrik och innehåll!" })
        }

        if (headline.length < 5) {
            return res.status(400).json({ error: "Rubriken måste vara minst 5 tecken!" })
        } else if (headline.length > 70) {
            return res.status(400).json({ error: "Rubriken kan högst vara 70 tecken!" })
        }

        if (content.length < 10) {
            return res.status(400).json({ error: "Ett inlägg kräver över 10 tecken för sitt innehåll!" })
        } else if (content.length > 150) {
            return res.status(400).json({ error: "Ett inläggs innehåll kan högst vara 150 tecken!" })
        }

        // Om man angivet alla fälten för ett nyhetsinlägg hamnar man här
        const news = new News({ headline, content }); // Skapar nytt inlägg enligt schemat
        await news.save();
        res.status(201).json({
            message: "Nytt nyhetsinlägg har publicerats!",
            news: {
                id: news._id,
                headline: news.headline,
                content: news.content,
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Kunde inte skapa nyhetsinlägget!" });
    }
});

// Skyddad route för att radera ett nyhetsinlägg, skyddad route
router.delete("/:id", authenticateToken, async(req, res) => {
    try {
        let result = await News.findByIdAndDelete(req.params.id);

        // Om det inte finns något ID med det man försöker radera
        if (!result) return res.status(404).json({ message: "Ange ett ID som finns med i databasen för nyhetsinlägg!" });

        // Om man lyckas med raderingen
        return res.json({
            message: "Nyhetsinlägget raderades från databasen",
            deleted: result
        });
    } catch (error) {
        return res.status(400).json({
            error: "Fel format på angivet ID",
            details: error.message
        });
    }
});

// Uppdatera nyhetsinlägget
router.put("/:id", authenticateToken, async(req, res) => {
    try {
        // Hämtar id i requsten för att använda till att uppdatera posten
        const id = req.params.id;

        // Hämtar värden som angetts från frontend
        const { headline, content } = req.body;

        if (!headline || !content) {
            return res.status(400).json({ error: "Ett inlägg kräver rubrik och innehåll!" })
        }

        if (headline.length < 5) {
            return res.status(400).json({ error: "Rubriken måste vara minst 5 tecken!" })
        } else if (headline.length > 70) {
            return res.status(400).json({ error: "Rubriken kan högst vara 70 tecken!" })
        }

        if (content.length < 10) {
            return res.status(400).json({ error: "Ett inlägg kräver över 10 tecken för sitt innehåll!" })
        } else if (content.length > 150) {
            return res.status(400).json({ error: "Ett inläggs innehåll kan högst vara 150 tecken!" })
        }

        // Letar efter en maträtt för att uppdatera genom ID
        let updatedNewsArticle = await News.findByIdAndUpdate(id, { headline, content }, {
            new: true // Får tillbaka den uppdaterade "versionen" av nyhetsinlägget
        });

        // Om det inte finns något ID med det man försöker uppdatera
        if (!updatedNewsArticle) return res.status(404).json({ message: "Ingen nyhetsinlägg med detta ID hittades!" });

        // Om man lyckas med uppdateringen
        return res.json({
            message: "Nyhetsinlägget uppdaterades!",
            updated: {
                id: updatedNewsArticle._id,
                headline: updatedNewsArticle.headline,
                content: updatedNewsArticle.content,
                created: updatedNewsArticle.created
            }
        });
    } catch (error) {
        return res.status(400).json({
            error: "Fel format på angivet ID eller ogiltigt värde",
            details: error.message
        });
    }
});

module.exports = router;