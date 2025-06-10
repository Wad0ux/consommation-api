// index.js
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = "data.json";

app.use(cors());
app.use(bodyParser.json());

let data = [];
if (fs.existsSync(DATA_FILE)) {
  data = JSON.parse(fs.readFileSync(DATA_FILE));
}

app.post("/add", (req, res) => {
  const { client, product, quantity } = req.body;
  if (!client || !product || quantity <= 0) {
    return res.status(400).json({ error: "Données invalides" });
  }

  const existing = data.find(e => e.client === client && e.product === product);
  if (existing) {
    existing.quantity += quantity;
  } else {
    data.push({ client, product, quantity });
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json({ message: "Ajouté avec succès" });
});

app.get("/", (req, res) => {
  res.send("Bienvenue sur l'API de consommation !");
});

app.get("/all", (req, res) => {
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
