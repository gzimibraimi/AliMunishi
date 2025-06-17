import { useState, useEffect } from "react";
import '../styles/History.css';

export default function History() {
  const [consumers, setConsumers] = useState([]);
  const [readings, setReadings] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/api/consumers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setConsumers(data);
        } else {
          console.error("Data nga backend për konsumatorët nuk është array:", data);
          setConsumers([]);
        }
      })
      .catch(err => {
        console.error('Gabim gjatë marrjes së konsumatorëve:', err);
        setConsumers([]);
      });
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setReadings([]);
      return;
    }
    fetch(`http://localhost:5000/api/readings/${selectedId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const readingsWithDates = data.map(r => ({ ...r, date: new Date(r.date) }));
          setReadings(readingsWithDates);
        } else {
          console.error("Data nga backend për leximet nuk është array:", data);
          setReadings([]);
        }
      })
      .catch(err => {
        console.error('Gabim gjatë marrjes së leximeve:', err);
        setReadings([]);
      });
  }, [selectedId]);

  const [showScrollTop, setShowScrollTop] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);


  const selectedConsumer = Array.isArray(consumers)
    ? consumers.find(c => c.id === parseInt(selectedId))
    : null;

  return (
    <div className="history-container">
      <h2>Historiku i leximeve</h2>

      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="">Zgjedh konsumatorin</option>
        {Array.isArray(consumers) && consumers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} {c.surname}
          </option>
        ))}
      </select>

      {selectedId && (
        <div className="history-table-container">
          <h3>Lexime për: {selectedConsumer ? `${selectedConsumer.name} ${selectedConsumer.surname}` : 'N/A'}</h3>
          {readings.length > 0 ? (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Leximi mëparshëm</th>
                  <th>Leximi aktual</th>
                  <th>Konsumi</th>
                  <th>Pagesa</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((r) => (
                  <tr key={r.id}>
                    <td data-label='Data'>{r.date.toLocaleDateString()}</td>
                    <td data-label='Gjendja paraprake'>{r.previousReading}</td>
                    <td data-label='Gjendja e fundit'>{r.currentReading}</td>
                    <td data-label='Ujë i harxhuar'>{r.consumption} m³</td>
                    <td data-label='Pagesa'>{r.total.toFixed(2)} MKD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Nuk ka lexime për këtë konsumator.</p>
          )}
        </div>
      )}
    {showScrollTop && (
  <button 
    className="scroll-to-top-float"
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    aria-label="Kthehu lart"
  >
    ↑
  </button>
)}

    </div>
  );
}
