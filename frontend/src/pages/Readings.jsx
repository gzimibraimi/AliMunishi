import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/readings.css";

export default function Readings() {
  const API_BASE = "https://ujesjellesi.onrender.com/api";
  const [consumers, setConsumers] = useState([]);
  const [loadingConsumers, setLoadingConsumers] = useState(true);
  const [readings, setReadings] = useState([]);
  const [form, setForm] = useState({ consumerId: "", currentReading: "" });
  const [selectedConsumerId, setSelectedConsumerId] = useState(() => localStorage.getItem("selectedConsumerId") || "");
  const [selectedDate, setSelectedDate] = useState(() => localStorage.getItem("selectedDate") || "");
  const [submitting, setSubmitting] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [consumerSearch, setConsumerSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/consumers`)
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
    const loadReadings = async () => {
      try {
        const allReadings = [];
        for (const c of consumers) {
          const res = await fetch(`${API_BASE}/readings/${c.id}`);
          if (!res.ok) throw new Error("Gabim në kërkesë për lexime");
          const data = await res.json();
          const enriched = data.map((r) => ({
            ...r,
            name: c.name,
            surname: c.surname,
            address: c.address,
            type: c.type,
          }));
          allReadings.push(...enriched);
        }
        setReadings(allReadings);
      } catch (error) {
        console.error("Gabim gjatë marrjes së leximeve:", error);
      }
    };

    if (consumers.length > 0) {
      loadReadings();
    }
  }, [consumers]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedConsumerId", selectedConsumerId);
    localStorage.setItem("selectedDate", selectedDate);
  }, [selectedConsumerId, selectedDate]);

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

    try {
      const res = await fetch(`${API_BASE}/readings/${consumer.id}`);
      const data = await res.json();

      const lastReading = data.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      const previous = lastReading ? lastReading.currentReading : 0;

      if (current < previous) {
        alert(`Leximi i tanishëm (${current}) nuk mund të jetë më i vogël se leximi i mëparshëm (${previous})`);
        setSubmitting(false);
        return;
      }

      const pricePerM3 = consumer.type.toLowerCase() === "biznes" ? 15 : 5;
      const consumption = current - previous;
      const total = consumption * pricePerM3;

      const newReading = {
        consumerId: consumer.id,
        date: new Date().toISOString(),
        previousReading: previous,
        currentReading: current,
        consumption,
        total,
      };

      const response = await fetch(`${API_BASE}/readings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReading),
      });

      if (!response.ok) throw new Error("Gabim gjatë ruajtjes së leximit");

      const savedReading = await response.json();
      const enriched = {
        ...savedReading,
        name: consumer.name,
        surname: consumer.surname,
        address: consumer.address,
        type: consumer.type,
      };

      setReadings((prev) => [...prev, enriched]);
      setForm({ consumerId: "", currentReading: "" });
      setConsumerSearch("");
      alert("Leximi u ruajt me sukses!");
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDF = (reading) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Fatura për Ujë", 70, 20);

    doc.setFontSize(12);
    doc.text(`Emri: ${reading.name} ${reading.surname}`, 20, 40);
    doc.text(`Adresa: ${reading.address}`, 20, 50);
    doc.text(`Tipi: ${reading.type}`, 20, 60);
    doc.text(`Data: ${new Date(reading.date).toLocaleDateString()}`, 20, 70);

    autoTable(doc, {
      startY: 80,
      head: [["Leximi i Mëparshëm", "Leximi i Tanishëm", "Konsumi (m³)", "Çmimi për m³", "Totali"]],
      body: [[
        reading.previousReading ?? 0,
        reading.currentReading,
        reading.consumption,
        reading.type === "Biznes" ? "15" : "5",
        `${reading.total.toFixed(2)} MKD`,
      ]],
    });

    doc.save(`fature_${reading.name}_${reading.surname}.pdf`);
  };

  const generateAllPDFs = () => {
    filteredReadings.forEach(generatePDF);
  };

  const formatDate = (dateString) => dateString.split("T")[0];

  const filteredReadings = readings.filter((r) => {
    const matchConsumer = selectedConsumerId ? r.consumerId === parseInt(selectedConsumerId) : true;
    const matchDate = selectedDate ? formatDate(r.date) === selectedDate : true;
    return matchConsumer && matchDate;
  });

  return (
    <div className="readings-container">
      <h2>Lexim i ri i ujit</h2>
      <form onSubmit={submitReading} className="readings-form">
        <div className="autocomplete-wrapper">
          <input
            type="text"
            placeholder="Kërko konsumatorin (emër, mbiemër)"
            value={consumerSearch}
            onChange={(e) => {
              setConsumerSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            disabled={loadingConsumers || submitting}
          />
          {showSuggestions && consumerSearch && (
            <ul className="autocomplete-suggestions">
              {consumers
                .filter((c) =>
                  `${c.name} ${c.surname}`.toLowerCase().includes(consumerSearch.toLowerCase())
                )
                .map((c) => (
                  <li
                    key={c.id}
                    onClick={() => {
                      setForm({ ...form, consumerId: c.id });
                      setConsumerSearch(`${c.name} ${c.surname}`);
                      setShowSuggestions(false);
                    }}
                  >
                    {c.name} {c.surname} - {c.type}
                  </li>
                ))}
            </ul>
          )}
        </div>

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
      <div className="filters">
        <select value={selectedConsumerId} onChange={(e) => setSelectedConsumerId(e.target.value)}>
          <option value="">Të gjithë konsumatorët</option>
          {consumers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.surname}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button onClick={() => { setSelectedConsumerId(""); setSelectedDate(""); }}>
          Pastro filtrat
        </button>
        {filteredReadings.length > 0 && (
          <button className="pdf-button" onClick={generateAllPDFs}>Shkarko PDF për të gjithë</button>
        )}
      </div>

      {filteredReadings.length === 0 ? (
        <p className="no-readings-msg">Nuk ka lexime për këtë filtër.</p>
      ) : (
        <div className="readings-table-wrapper">
          <table className="readings-table">
            <thead>
              <tr>
                <th>Konsumatori</th>
                <th style={{ textAlign: "right" }}>Leximi i mëparshëm</th>
                <th style={{ textAlign: "right" }}>Leximi i tanishëm</th>
                <th style={{ textAlign: "right" }}>Konsumi (m³)</th>
                <th style={{ textAlign: "right" }}>Totali (MKD)</th>
                <th style={{ textAlign: "right" }}>Data</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {filteredReadings
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((r, i) => (
                  <tr key={i}>
                    <td>{r.name} {r.surname}</td>
                    <td className="numeric">{r.previousReading}</td>
                    <td className="numeric">{r.currentReading}</td>
                    <td className="numeric">{r.consumption}</td>
                    <td className="numeric">{r.total.toFixed(2)} MKD</td>
                    <td className="numeric">{new Date(r.date).toLocaleString()}</td>
                    <td>
                      <button className="pdf-button" onClick={() => generatePDF(r)}>Shkarko</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {showScrollTop && (
        <button
          className="scroll-to-top-float"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Kthehu lart"
        >
          ↑
        </button>
      )}
    </div>
  );
}
