import { useEffect, useState } from "react";
import '../styles/readings.css';
export default function Readings() {
  const [consumers, setConsumers] = useState([]);
  const [loadingConsumers, setLoadingConsumers] = useState(true);
  const [readings, setReadings] = useState(() => {
    const saved = localStorage.getItem("readings");
    return saved ? JSON.parse(saved) : [];
  });
  const [form, setForm] = useState({
    consumerId: "",
    currentReading: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/consumers")
      .then((res) => res.json())
      .then((data) => {
        setConsumers(data);
        setLoadingConsumers(false);
      })
      .catch((err) => {
        console.error("Gabim gjatë marrjes së konsumatorëve:", err);
        setLoadingConsumers(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("readings", JSON.stringify(readings));
  }, [readings]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitReading = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const consumerIdNum = parseInt(form.consumerId);
    const consumer = consumers.find((c) => c.id === consumerIdNum);
    if (!consumer) {
      alert("Zgjidh një konsumator të vlefshëm");
      setSubmitting(false);
      return;
    }

    const current = parseFloat(form.currentReading);
    if (isNaN(current) || current < 0) {
      alert("Fut një lexim të vlefshëm numerik");
      setSubmitting(false);
      return;
    }

    const lastReading = readings
      .filter((r) => r.consumerId === consumerIdNum)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const previous = lastReading ? lastReading.currentReading : 0;

    if (current < previous) {
      alert(
        `Leximi i tanishëm (${current}) nuk mund të jetë më i vogël se leximi i mëparshëm (${previous})`
      );
      setSubmitting(false);
      return;
    }

    const pricePerM3 = consumer.type.toLowerCase() === "biznes" ? 1.2 : 0.5;
    const consumption = current - previous;
    const total = consumption * pricePerM3;

    const newReading = {
      consumerId: consumer.id,
      previousReading: previous,
      currentReading: current,
      consumption,
      total,
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:5000/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReading),
      });

      if (!response.ok) {
        throw new Error("Gabim gjatë ruajtjes së leximit në backend");
      }

      const savedReading = await response.json();

      setReadings((prev) => [...prev, savedReading]);
      setForm({ consumerId: "", currentReading: "" });
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
  <div className="readings-container">
    <h2>Lexim i ri i ujit</h2>
    <form onSubmit={submitReading} className="readings-form">
      <select
        name="consumerId"
        value={form.consumerId}
        onChange={handleChange}
        required
        disabled={loadingConsumers || submitting}
      >
        <option value="">Zgjedh konsumatorin</option>
        {consumers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} {c.surname} - {c.type}
          </option>
        ))}
      </select>
      <input
        type="number"
        name="currentReading"
        placeholder="Leximi i tanishëm"
        value={form.currentReading}
        onChange={handleChange}
        required
        min="0"
        step="any"
        disabled={submitting}
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Po ruhet..." : "Ruaj leximin"}
      </button>
    </form>

    <h3>Historiku i leximeve</h3>

    {readings.length === 0 ? (
      <p className="no-readings-msg">Nuk ka lexime të regjistruara ende.</p>
    ) : (
      <div className="readings-table-wrapper">
        <table className="readings-table">
          <thead>
            <tr>
              <th>Konsumatori</th>
              <th style={{ textAlign: "right" }}>Leximi i mëparshëm</th>
              <th style={{ textAlign: "right" }}>Leximi i tanishëm</th>
              <th style={{ textAlign: "right" }}>Konsumi (m³)</th>
              <th style={{ textAlign: "right" }}>Totali (€)</th>
              <th style={{ textAlign: "right" }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {readings
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((r) => (
                <tr key={r.id}>
                  <td>{r.name} {r.surname}</td>
                  <td data-label='Leximi paraprak' className="numeric">{r.previousReading}</td>
                  <td data-label='Leximi i ri' className="numeric">{r.currentReading}</td>
                  <td data-label='Gjithsej m³' className="numeric">{r.consumption}</td>
                  <td data-label='Total' className="numeric">€{r.total.toFixed(2)}</td>
                  <td data-label='Data e leximit' className="numeric">{new Date(r.date).toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

}
