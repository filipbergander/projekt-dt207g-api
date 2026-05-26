// Hämtar in paket och moduler
const express = require('express'); // Express-paketet
const bodyParser = require('body-parser'); // Kunna läsa JSON-data
const mongoose = require('mongoose'); // Mongoose-paketet
const cors = require('cors'); // Möjliggör anslutning från annan domän
const port = process.env.PORT || 3000; // Portanslutning

// För att kunna använda miljövariabler
require('dotenv').config();

// För att kunna skapa app med express
const app = express();
// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());


// Ansluter mot mongoDB
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Ansluten mot databasen mongoDB!")
}).catch((error) => {
    console.error("Fel vid anslutning mot mongoDB...");
});

// Routes
const authRoutes = require("./routes/authRoutes.js");
const dinnerRoutes = require("./routes/dinnerMenu.js");

// Använder routes
app.use("/", dinnerRoutes);
app.use("/", authRoutes);

// Välkomstmeddelande för webbtjänsten
app.get('/', async(req, res) => {
    res.json("Välkommen till webbtjänsten!")
});

// Startar servern
app.listen(port, () => {
    // console.log("Servern startade på port: ", port);
    console.log("Servern startade på http://localhost:" + port);
});