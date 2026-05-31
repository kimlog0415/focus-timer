import { HashRouter, Routes, Route, NavLink } from "react-router-dom";
import Timer from "./pages/Timer";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";
import "./App.css";

// 활성 메뉴에 active 클래스를 붙여 강조
const navClass = ({ isActive }) => (isActive ? "active" : "");

function App() {
  return (
    <HashRouter>
      <nav className="nav">
        <NavLink to="/" end className={navClass}>
          Timer
        </NavLink>
        <NavLink to="/history" className={navClass}>
          History
        </NavLink>
        <NavLink to="/dashboard" className={navClass}>
          Dashboard
        </NavLink>
      </nav>

      <main className="content">
        <Routes>
          <Route path="/" element={<Timer />} />
          <Route path="/history" element={<History />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </HashRouter>
  );
}

export default App;
