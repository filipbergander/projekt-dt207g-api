const jwt = require('jsonwebtoken'); // JWT för tokens

// För att kunna använda miljövariabler
require('dotenv').config();

// Validera token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    // Om ingen authorization skickats med inom header
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header saknas!" })
    }

    const token = authHeader.split(' ')[1] // Andra argumentet tar bort bearer och sedan använder enbart token

    // Om token inte finns
    if (!token) return res.status(401).json({ message: "Inte behörighet för denna sida - saknar token!" });

    // Verifierar token
    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
        if (error) return res.status(403).json({ message: "Ogiltig token" });

        req.username = decoded.username;
        // Next = klar gå vidare till nästa route / funktion / middleware
        next();
    });
}

// För att använda som middleware i anrop
module.exports = authenticateToken;