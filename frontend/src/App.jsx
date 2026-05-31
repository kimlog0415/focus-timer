import { HashRouter, Routes, Route, Link } from "react-router-dom";
import Timer from "./pages/Timer";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  return (
    <HashRouter>
      <nav>
        <Link to="/">Timer</Link>
        <Link to="/history">History</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Timer />} />
        <Route path="/history" element={<History />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
