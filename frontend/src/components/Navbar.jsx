import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

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

      <div className="navbar-center">
        <Link to="/">Dashboard</Link>
        <Link to="/consumers">Konsumatorët</Link>
        <Link to="/history">Historiku</Link>
        {user.role === "admin" && <Link to="/readings">Lexime</Link>}
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
