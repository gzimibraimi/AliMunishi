import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Consumers from "./pages/Consumers";
import Readings from "./pages/Readings";
import History from "./pages/History";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/consumers" element={<Consumers />} />
        <Route path="/readings" element={<Readings />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;
