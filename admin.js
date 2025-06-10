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

async function resetData() {
  if (confirm("⚠️ Voulez-vous vraiment tout effacer ?")) {
    await fetch(`${API_BASE}/reset`, { method: "POST" });
    await fetchData();
    renderTable();
  }
}

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