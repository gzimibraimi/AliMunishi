import React, { useEffect, useState } from 'react';
import '../styles/consumers.css';

const Consumers = () => {
  const [consumers, setConsumers] = useState([]);
  const [form, setForm] = useState({ name: '', surname: '', type: 'Amviseri', address: '' });

  const API_URL = process.env.REACT_APP_API_URL + "/consumers";

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setConsumers(data);
        } else if (data && Array.isArray(data.consumers)) {
          setConsumers(data.consumers);
        } else {
          setConsumers([]);
        }
      })
      .catch(err => {
        console.error('Gabim në fetch:', err);
        setConsumers([]);
      });
  }, [API_URL]);
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


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newConsumer = { 
      name: form.name, 
      surname: form.surname, 
      type: form.type, 
      address: form.address 
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConsumer),
      });

      if (!response.ok) throw new Error('Gabim gjatë shtimit të konsumatorit');

      const data = await response.json();
      setConsumers([...consumers, data]);
      setForm({ name: '', surname: '', address: '', type: 'Amviseri' });
    } catch (err) {
      console.error('Gabim gjatë shtimit të konsumatorit:', err);
    }
  };

  return (
  <div className="history-container">
    <h2>Lista e Konsumatorëve</h2>

    <div className="history-table-container">
      {consumers.length > 0 ? (
        <table className="history-table">
          <thead>
            <tr>
              <th>Emri</th>
              <th>Mbiemri</th>
              <th>Adresa</th>
              <th>Tipi</th>
            </tr>
          </thead>
          <tbody>
            {consumers.map((consumer) => (
              <tr key={consumer.id}>
                <td data-label="Emri">{consumer.name}</td>
                <td data-label="Mbiemri">{consumer.surname}</td>
                <td data-label="Adresa">{consumer.address}</td>
                <td data-label="Tipi">{consumer.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nuk ka të dhëna për konsumatorë.</p>
      )}
    </div>

    <h2 style={{ marginTop: '40px' }}>Shto Konsumatorin e Ri</h2>

    <form onSubmit={handleSubmit} className="form-container">
      <input
        type="text"
        name="name"
        placeholder="Emri"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="surname"
        placeholder="Mbiemri"
        value={form.surname}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="address"
        placeholder="Adresa"
        value={form.address}
        onChange={handleChange}
        required
      />
      <select name="type" value={form.type} onChange={handleChange}>
        <option value="Amviseri">Amvisëri</option>
        <option value="Biznes">Biznes</option>
      </select>
      <button type="submit">Shto Konsumatorin</button>
    </form>
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
};

export default Consumers;
