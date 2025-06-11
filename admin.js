const API_BASE = "https://consommation-api-1.onrender.com";
const products = ["Canette", "Nourriture", "Redbull"];
const productPrices = {
  "Canette": 1,
  "Nourriture": 0.6,
  "Redbull": 1.5
};

let data = [];

window.onload = async () => {
  await fetchData();
  renderTable();
};

async function fetchData() {
  const res = await fetch(`${API_BASE}/all`);
  data = await res.json();
}

function renderTable() {
  const table = document.getElementById("consumptionTable");
  const clients = [...new Set(data.map(e => e.client))].sort();

  let html = "<thead><tr><th>Client</th>";
  products.forEach(p => html += `<th>${p}</th>`);
  html += "<th>Prix total (€)</th></tr></thead><tbody>";

  clients.forEach(client => {
    html += `<tr><td>${client}</td>`;
    let totalPrice = 0;
    products.forEach(product => {
      const entry = data.find(e => e.client === client && e.product === product);
      const qty = entry ? entry.quantity : 0;
      html += `<td>${qty}</td>`;
      totalPrice += qty * (productPrices[product] || 0);
    });
    html += `<td>${totalPrice.toFixed(2)}</td></tr>`;
  });

  html += "</tbody>";
  table.innerHTML = html;
}

/*function resetData() {
  if (confirm("Voulez-vous vraiment réinitialiser toutes les données ?")) {
    fetch("https://consommation-api-1.onrender.com/reset", {
      method: "POST"
    })
    .then(res => res.json())
    .then(() => {
      data = [];
      renderTable();
      alert("✅ Données réinitialisées !");
    })
    .catch(err => {
      console.error("Erreur reset :", err);
      alert("❌ Erreur lors de la réinitialisation.");
    });
  }
}*/


async function resetData() {
  if (confirm("⚠️ Voulez-vous vraiment tout effacer ?")) {
    const res = await fetch(`${API_BASE}/reset`, { method: "POST" });
    if (res.ok) {
      await fetchData();
      renderTable();
      alert("Données réinitialisées.");
    } else {
      alert("Erreur lors de la réinitialisation.");
    }
  }
}

/*
app.post("/reset", (req, res) => {
  try {
    writeData([]); // Vide le fichier JSON
    res.json({ message: "Données réinitialisées" });
  } catch (err) {
    console.error("Erreur lors de la réinitialisation :", err);
    res.status(500).json({ error: "Erreur serveur lors de la réinitialisation" });
  }
});


async function resetData() {
  if (confirm("Voulez-vous vraiment tout réinitialiser ?")) {
    await fetch("/reset", { method: "POST" });
    location.reload(); // recharge les données
  }
}
*/




function exportCSV() {
  if (data.length === 0) return alert("Aucune donnée à exporter.");
  const clients = [...new Set(data.map(e => e.client))].sort();
  let csv = "Client," + products.join(",") + ",Prix total (€)\n";

  clients.forEach(client => {
    const row = [client];
    let total = 0;
    products.forEach(product => {
      const entry = data.find(e => e.client === client && e.product === product);
      const qty = entry ? entry.quantity : 0;
      row.push(qty);
      total += qty * (productPrices[product] || 0);
    });
    row.push(total.toFixed(2));
    csv += row.join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "consommation.csv";
  a.click();
  URL.revokeObjectURL(url);
}