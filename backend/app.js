const express = require("express");
const cors = require("cors");
const XLSX = require("xlsx");

const app = express();
app.use(cors());
app.use(express.json()); // Middleware për leximin e JSON, vendosur para route-ve

const workbook = XLSX.readFile("data.xlsx");
let consumers = XLSX.utils.sheet_to_json(workbook.Sheets["consumers"]);
const readings = XLSX.utils.sheet_to_json(workbook.Sheets["readings"]);

app.get("/api/consumers", (req, res) => {
  res.json(consumers);
});

app.get('/api/readings', (req, res) => {
  // Këtu merr leximet nga database ose nga skedari
  res.json(readings);
});

app.get("/api/readings/:id", (req, res) => {
  const consumerId = parseInt(req.params.id);
  const consumerReadings = readings
    .filter(r => r.consumerId === consumerId)
    .map(r => ({
      ...r,
      date: new Date(r.date),
      previousReading: Number(r.previousReading),
      currentReading: Number(r.currentReading),
      consumption: Number(r.consumption),
      total: Number(r.total),
    }));
  res.json(consumerReadings);
});
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});


app.post("/api/consumers", (req, res) => {
  try {
    const { name, surname, type, address } = req.body;

    if (!name || !surname || !type || !address) {
      return res.status(400).json({ error: "Duhet të plotësohen të gjitha fushat: name, surname, type, address" });
    }

    // Gjenero id unik (p.sh. max id + 1)
    const maxId = consumers.reduce((max, c) => (c.id > max ? c.id : max), 0);
    const newId = maxId + 1;

    const newConsumer = { id: newId, name, surname, type, address };

    // Shto në listën në memorie
    consumers.push(newConsumer);

    // Përshtat sheet-in për ta ruajtur në Excel
    const ws = XLSX.utils.json_to_sheet(consumers);
    workbook.Sheets["consumers"] = ws;

    // Ruaj workbook në disk (mbishkruaj skedarin)
    XLSX.writeFile(workbook, "data.xlsx");

    res.status(201).json(newConsumer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gabim gjatë shtimit të konsumatorit" });
  }
});

app.post("/api/readings", (req, res) => {
  try {
    const { consumerId, date, previousReading, currentReading, consumption, total } = req.body;

    if (
      !consumerId || !date ||
      isNaN(previousReading) || isNaN(currentReading) ||
      isNaN(consumption) || isNaN(total)
    ) {
      return res.status(400).json({ error: "Të gjitha fushat janë të detyrueshme" });
    }

    const newReading = {
      id: readings.length ? Math.max(...readings.map(r => r.id || 0)) + 1 : 1,
      consumerId: Number(consumerId),
      date,
      previousReading: Number(previousReading),
      currentReading: Number(currentReading),
      consumption: Number(consumption),
      total: Number(total),
    };

    readings.push(newReading);
    workbook.Sheets["readings"] = XLSX.utils.json_to_sheet(readings);
    XLSX.writeFile(workbook, "data.xlsx");

    res.status(201).json(newReading);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gabim gjatë shtimit të leximit" });
  }
});  // <-- Kjo është mbyllja e funksionit post për /api/readings

// Definimi i userave për login (nuk duhet të deklarohet dy herë)
const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "user", password: "user123", role: "user" },
]; 

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ username: user.username, role: user.role });
  } else {
    res.status(401).json({ error: 'Kredenciale të pavlefshme' });
  }
});

module.exports = app;
