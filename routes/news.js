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
            author: row.author,
            created: {
                raw: row.createdAt,
                formatted: row.createdAt.toLocaleString("sv-SE", {
                    dateStyle: "short",
                    timeStyle: "short"
                }),
                date: row.createdAt.toLocaleDateString("sv-SE", { dateStyle: "short" }),
                time: row.createdAt.toLocaleTimeString("sv-SE", { timeStyle: "short" })
            }
        }));
        return res.json(formattedResult);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Kunde inte hämta nyhetsinlägg från databasen",
            error
        });
    }
});

// Hämtar specifikt inlägg
router.get("/:id", authenticateToken, async(req, res) => {
    try {
        const id = req.params.id;

        const newsArticle = await News.findById(id);

        if (!newsArticle) {
            return res.status(404).json({ error: "Inget inlägg hittades med angivet ID!" })
        }
        res.json(newsArticle);
    } catch (error) {
        res.status(400).json({
            error: "Fel format på angivet ID eller ogiltigt värde",
            details: error.message
        })
    }
});

// Skyddad route för att lägga till ett nyhetsinlägg, kräver autentisering med JWT genom middleware
router.post("/", authenticateToken, async(req, res) => {
    try {
        const existingNews = await News.findOne();

        if (existingNews) {
            return res.status(400).json({ error: "Max ett nyhetsinlägg" })
        }

        const { headline, content, author } = req.body;

        // Validera input
        if (!headline || !content || !author) {
            return res.status(400).json({ error: "Ett inlägg kräver rubrik och innehåll!" })
        }

        if (headline.length < 5) {
            return res.status(400).json({ error: "Rubriken måste vara minst 5 tecken!" })
        } else if (headline.length > 60) {
            return res.status(400).json({ error: "Rubriken kan högst vara 60 tecken!" })
        }

        if (content.length < 10) {
            return res.status(400).json({ error: "Ett inlägg kräver över 10 tecken för sitt innehåll!" })
        } else if (content.length > 175) {
            return res.status(400).json({ error: "Ett inläggs innehåll kan högst vara 175 tecken!" })
        }

        if (author.length < 3) {
            return res.status(400).json({ error: "Skribentens namn måste vara minst 3 tecken!" })
        } else if (author.length > 30) {
            return res.status(400).json({ error: "Skribentens namn kan högst vara 30 tecken!" })
        }

        // Om man angivet alla fälten för ett nyhetsinlägg hamnar man här
        const news = new News({ headline, content, author }); // Skapar nytt inlägg enligt schemat
        await news.save();
        res.status(201).json({
            message: "Nytt nyhetsinlägg har publicerats!",
            news: {
                id: news._id,
                headline: news.headline,
                content: news.content,
                author: news.author,
                created: news.createdAt
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Kunde inte skapa nyhetsinlägget!" });
    }
});

// Skyddad route för att radera ett nyhetsinlägg
router.delete("/:id", authenticateToken, async(req, res) => {
    try {
        // Hittar inlägg genom id och raderar
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
        const { headline, content, author } = req.body;

        // Validerar input
        if (!headline || !content || !author) {
            return res.status(400).json({ error: "Alla fält måste fyllas i!" })
        }
        // Specifika inputs
        if (headline.length < 5) {
            return res.status(400).json({ error: "Rubriken måste vara minst 5 tecken!" })
        } else if (headline.length > 70) {
            return res.status(400).json({ error: "Rubriken kan högst vara 70 tecken!" })
        }

        if (content.length < 10) {
            return res.status(400).json({ error: "Ett inlägg kräver över 10 tecken för sitt innehåll!" })
        } else if (content.length > 175) {
            return res.status(400).json({ error: "Ett inläggs innehåll kan högst vara 175 tecken!" })
        }

        if (author.length < 3) {
            return res.status(400).json({ error: "Skribentens namn måste vara minst 3 tecken!" })
        } else if (author.length > 30) {
            return res.status(400).json({ error: "Skribentens namn kan högst vara 30 tecken!" })
        }

        // Letar efter ett inlägg för att uppdatera genom ID
        let updatedNewsArticle = await News.findByIdAndUpdate(id, { headline, content, author }, {
            returnDocument: "after",
            runValidators: true
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
                created: updatedNewsArticle.createdAt
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