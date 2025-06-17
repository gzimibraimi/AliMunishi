import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importo navigimin
import "../styles/login.css";


export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Inicializo

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    const { username, password } = form;

    try {
      const res = await fetch("https://ujesjellesi.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Gabim gjatë logimit");
        return;
      }

      const data = await res.json();
      onLogin(data); // Vendos user-in në App.jsx

      // Ridhrejto pas logimit
      navigate("/"); // ose "/dashboard" nëse e ke të ndarë
    } catch (error) {
      alert("Gabim gjatë komunikimit me serverin");
    }
  };

  return (
  <div className="login-page">
    <img src="/alimunishi.png" alt="Logo" className="logo" />
    <h1>Ujësjellësi "Ali Munishi"</h1>
    <form onSubmit={handleSubmit}>
      {error && <p className="error-message">{error}</p>}
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Kyçu</button>
    </form>
  </div>
);

}
