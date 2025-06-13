import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: '10px', background: '#eee' }}>
      <Link to="/">Dashboard</Link> |{" "}
      <Link to="/consumers">Konsumatorët</Link> |{" "}
      <Link to="/readings">Lexime</Link> |{" "}
      <Link to="/history">Historiku</Link>
    </nav>
  );
}
