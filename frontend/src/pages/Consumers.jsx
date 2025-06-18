import { useEffect, useState } from "react";
import "../styles/consumers.css";

export default function Consumers() {
  const API_BASE = "https://ujesjellesi.onrender.com/api";
  const [consumers, setConsumers] = useState([]);
  const [form, setForm] = useState({ name: "", surname: "", address: "", type: "Amvisëri" });
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/consumers`)
      .then((res) => res.json())
      .then(setConsumers)
      .catch((err) => console.error("Gabim në marrjen e konsumatorëve:", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_BASE}/consumers/${editingId}` : `${API_BASE}/consumers`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (editingId) {
        setConsumers((prev) => prev.map((c) => (c.id === editingId ? data : c)));
        setEditingId(null);
      } else {
        setConsumers((prev) => [...prev, data]);
      }
      setForm({ name: "", surname: "", address: "", type: "Amvisëri" });
    } catch (err) {
      console.error("Gabim në ruajtje:", err);
    }
  };

  const handleEdit = (consumer) => {
    setForm(consumer);
    setEditingId(consumer.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("A jeni i sigurt që dëshironi të fshini këtë konsumator?")) return;

    try {
      await fetch(`${API_BASE}/consumers/${id}`, { method: "DELETE" });
      setConsumers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Gabim gjatë fshirjes:", err);
    }
  };

  const filteredConsumers = consumers.filter((c) =>
    `${c.name} ${c.surname} ${c.address}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="consumers-container">
      <h2>Menaxhimi i Konsumatorëve</h2>
      <form onSubmit={handleSubmit} className="consumer-form">
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
          <option value="Amvisëri">Amvisëri</option>
          <option value="Biznes">Biznes</option>
        </select>
        <button type="submit">{editingId ? "Përditëso" : "Shto"}</button>
      </form>

      <input
        className="search-input"
        type="text"
        placeholder="Kërko konsumator..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="consumers-table">
        <thead>
          <tr>
            <th>Emri</th>
            <th>Mbiemri</th>
            <th>Adresa</th>
            <th>Tipi</th>
            <th>Veprime</th>
          </tr>
        </thead>
        <tbody>
          {filteredConsumers.map((c) => (
            <tr key={c.id}>
              <td data-label="Emri">{c.name}</td>
              <td data-label="Mbiemri">{c.surname}</td>
              <td data-label="Adresa">{c.address}</td>
              <td data-label="Tipi konsumatorit">{c.type}</td>
              <td>
                <button onClick={() => handleEdit(c)}>Edito</button>
                <button onClick={() => handleDelete(c.id)}>Fshij</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
