import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Consumers from "./pages/Consumers";
import Readings from "./pages/Readings";
import History from "./pages/History";
import Navbar from "./components/Navbar";
import { useState } from "react";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);

  // Komponent për rrethim të rrugëve që kërkojnë login
  const PrivateRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" replace />;
  };

  const isAdmin = user && user.role === "admin";

  return (
    <Router>
      {user && <Navbar user={user} setUser={setUser} />}

      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard user={user} />
            </PrivateRoute>
          }
        />

        <Route
          path="/consumers"
          element={
            <PrivateRoute>
              <Consumers user={user} />
            </PrivateRoute>
          }
        />

        {isAdmin && (
          <Route
            path="/readings"
            element={
              <PrivateRoute>
                <Readings user={user} />
              </PrivateRoute>
            }
          />
        )}

        <Route
          path="/history"
          element={
            <PrivateRoute>
              <History user={user} />
            </PrivateRoute>
          }
        />

        {/* Fsheh çdo rrugë tjetër, bazuar në login dhe rol */}
        <Route
          path="*"
          element={
            <Navigate to={user ? "/" : "/login"} replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
