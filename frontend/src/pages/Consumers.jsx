import React, { useEffect, useState } from 'react';
import '../styles/consumers.css';

const Consumers = () => {
  const [consumers, setConsumers] = useState([]);
  const [form, setForm] = useState({ name: '', surname: '', type: 'Amviseri', address: '' });

  const API_URL = "http://localhost:5000/api/consumers";

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
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dërgo vetëm fushat që kërkohen, pa id (id gjenerohet nga backend)
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

      if (!response.ok) {
        throw new Error('Gabim gjatë shtimit të konsumatorit');
      }

      const data = await response.json();
      setConsumers([...consumers, data]);
      setForm({ name: '', surname: '', address: '', type: 'Amviseri' });
    } catch (err) {
      console.error('Gabim gjatë shtimit të konsumatorit:', err);
    }
  };

  return (
    <div className="consumers-container">
      <h2>Lista e Konsumatorëve</h2>

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
          <option value="Individual">Amviseri</option>
          <option value="Biznes">Biznes</option>
        </select>
        <button type="submit">Shto Konsumatorin</button>
      </form>

      <table>
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
              <td data-label='Emri'>{consumer.name}</td>
              <td data-label='Mbiemri'>{consumer.surname}</td>
              <td data-label='Adresa'>{consumer.address}</td>
              <td data-label='Lloji harxhues'>{consumer.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Consumers;
