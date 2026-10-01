const dotenv = require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// cet Route est juste pour tester la communication entre le client et le serveur
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Bonjour depuis Express !' });
});

 // Lancement
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
