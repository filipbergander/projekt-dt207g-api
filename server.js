// Hämtar in paket och moduler
const express = require('express'); // Express-paketet
const bodyParser = require('body-parser'); // Kunna läsa JSON-data
const mongoose = require('mongoose'); // Mongoose-paketet
const cors = require('cors'); // Möjliggör anslutning från annan domän
const port = process.env.PORT || 3000; // Portanslutning

// För att kunna använda miljövariabler
require('dotenv').config();

const app = express();

app.get('/', async(req, res) => {
    res.json("Välkommen till webbtjänsten!")
});

app.listen(port, () => {
    console.log("Servern startade på port: ", port);
});