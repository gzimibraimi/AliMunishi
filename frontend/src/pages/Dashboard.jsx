import React, { useEffect, useState } from "react";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [consumers, setConsumers] = useState([]);
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/consumers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setConsumers(data);
        else setConsumers([]);
      })
      .catch(() => setConsumers([]));

    // Rregullim: thirr URL normal pa ${selectedId}, dhe me backticks nëse do përdoret variable
    fetch("http://localhost:5000/api/readings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReadings(data);
        else setReadings([]);
      })
      .catch(() => setReadings([]));
  }, []);

  const totalConsumers = consumers.length;
  const biznesCount = consumers.filter((c) => c.type === "Biznes").length;
  const individualCount = consumers.filter((c) => c.type === "Amviseri").length;

  // Përllogaritje për muajin aktual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const readingsThisMonth = readings.filter((r) => {
    const date = new Date(r.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  // Konsumi total në muajin aktual - siguro parseFloat për rast string
  const totalConsumptionThisMonth = readingsThisMonth.reduce(
    (acc, r) => acc + (parseFloat(r.consumption) || 0),
    0
  );

  // Pagesat totale për muajin aktual
  const totalPaymentsThisMonth = readingsThisMonth.reduce(
    (acc, r) => acc + (parseFloat(r.total) || 0),
    0
  );

  // Konsumatori me konsum më të lartë këtë muaj
  let topConsumer = null;
  if (readingsThisMonth.length > 0) {
    const consumptionByConsumer = {};
    readingsThisMonth.forEach((r) => {
      consumptionByConsumer[r.consumerId] =
        (consumptionByConsumer[r.consumerId] || 0) + (parseFloat(r.consumption) || 0);
    });
    const maxConsumption = Math.max(...Object.values(consumptionByConsumer));
    const topConsumerId = Object.keys(consumptionByConsumer).find(
      (id) => consumptionByConsumer[id] === maxConsumption
    );
    topConsumer = consumers.find((c) => c.id === Number(topConsumerId));
  }

  // Numri i leximeve këtë muaj
  const readingsCountThisMonth = readingsThisMonth.length;

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="cards">
        <div className="card">
          <h3>Totali i Konsumatorëve</h3>
          <p>{totalConsumers}</p>
        </div>
        <div className="card">
          <h3>Biznes</h3>
          <p>{biznesCount}</p>
        </div>
        <div className="card">
          <h3>Amvisëri</h3>
          <p>{individualCount}</p>
        </div>
        <div className="card">
          <h3>Konsumi Total Mujor (m³)</h3>
          <p>{totalConsumptionThisMonth.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Pagesat Totale Mujor (MKD)</h3>
          <p>{totalPaymentsThisMonth.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Konsumatori me Konsumin më të Lartë</h3>
          <p>
            {topConsumer
              ? `${topConsumer.name} ${topConsumer.surname}`
              : "Nuk ka lexime"}
          </p>
        </div>
        <div className="card">
          <h3>Numri i Leximeve Mujore</h3>
          <p>{readingsCountThisMonth}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
