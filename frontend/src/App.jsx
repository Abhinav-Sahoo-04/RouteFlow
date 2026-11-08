
import './App.css';
import { Routes, Route, useLocation } from "react-router-dom";

import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const location = useLocation();

  const currentPath = location.pathname.replace(/\/+$/, "");

  const showHome = currentPath === "/homepage";

  const keepHomeMounted =
    currentPath === "/homepage" ||
    currentPath === "/dashboard";

  return (
    <>
      {/* Keep Home and Map mounted while navigating */}
      {keepHomeMounted && (
        <div style={{ display: showHome ? "block" : "none" }}>
          <Home />
        </div>
      )}

      <Routes>
        <Route path="/homepage" element={null} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/*" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
