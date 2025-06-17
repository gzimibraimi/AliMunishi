import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/Navbar.css";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/alimunishi.png" alt="Logo" className="navbar-logo" />
        <span className="navbar-title">Ujësjellësi "Ali Munishi"</span>
      </div>

      {/* Hamburger icon */}
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Links */}
      <div className={`navbar-center ${menuOpen ? "active" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        <Link to="/consumers" onClick={() => setMenuOpen(false)}>Konsumatorët</Link>
        <Link to="/history" onClick={() => setMenuOpen(false)}>Historiku</Link>
        {user.role === "admin" && (
          <Link to="/readings" onClick={() => setMenuOpen(false)}>Lexime</Link>
        )}
      </div>

      <div className="navbar-right">
        <span className="navbar-user">{user.username}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Dil
        </button>
      </div>
    </nav>
  );
}
