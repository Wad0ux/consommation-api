/* index.js
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

app.post("/reset", (req, res) => {
  fs.writeFileSync(DATA_FILE, "[]");
  res.json({ message: "Données réinitialisées." });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
*/


const express = require("express");
const fs = require("fs");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = "data.json";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "admin_secret_key",
  resave: false,
  saveUninitialized: true
}));
app.use(express.static("public"));

// Lecture des données
function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    next();
  } else {
    res.redirect("/login.html");
  }
}

// 🔐 Authentification
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "1234"; // à changer évidemment

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    res.redirect("/admin.html");
  } else {
    res.redirect("/login.html?error=1");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login.html"));
});

// 🟢 API - Consommations
app.get("/all", (req, res) => {
  res.json(readData());
});

app.post("/add", (req, res) => {
  const { client, product, quantity } = req.body;
  const data = readData();
  const existing = data.find(e => e.client === client && e.product === product);
  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    data.push({ client, product, quantity: Number(quantity) });
  }
  writeData(data);
  res.sendStatus(200);
});

app.post("/reset", (req, res) => {
  writeData([]);
  res.sendStatus(200);
});

// Protège l'accès à admin.html
app.get("/admin.html", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});