import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import RegistrarClase from "./pages/RegistrarClase.jsx";
import ClasesCliente from "./pages/ClasesCliente.jsx";
import ClasesProfesional from "./pages/ClasesProfesional.jsx";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [apiStatus, setApiStatus] = useState("Comprobando API...");
  const [rol, setRol] = useState("CLIENTE"); // CLIENTE | PROFESIONAL | ADMIN

  // Ping al backend solo para mostrar estado
  useEffect(() => {
    async function checkApi() {
      try {
        const res = await fetch(`${API_URL}/api/ping/`);
        if (!res.ok) throw new Error("Error en ping");
        const data = await res.json();
        setApiStatus(data.message || "API OK");
      } catch (err) {
        console.error(err);
        setApiStatus("Error conectando con la API 😢");
      }
    }
    checkApi();
  }, []);

  return (
    <div className="app-layout">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-top">
          <h1 className="app-title">No Más Accidentes</h1>
          <div className="header-right">
            <span className="api-status">{apiStatus}</span>

            {/* Selector de rol (simulado por ahora) */}
            <div className="rol-selector">
              <label htmlFor="rol-select">Rol:</label>
              <select
                id="rol-select"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
              >
                <option value="CLIENTE">Cliente</option>
                <option value="PROFESIONAL">Profesional</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="app-main">
        <div className="dashboard">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <nav>
              <p className="sidebar-title">Menú</p>

              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Inicio
              </NavLink>

              {rol === "CLIENTE" && (
                <>
                  <p className="sidebar-section">Cliente</p>
                  <NavLink
                    to="/cliente/registrar-clase"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    Registrar clase
                  </NavLink>
                  <NavLink
                    to="/cliente/clases"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    Mis clases
                  </NavLink>
                </>
              )}

              {rol === "PROFESIONAL" && (
                <>
                  <p className="sidebar-section">Profesional</p>
                  <NavLink
                    to="/profesional/clases"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    Clases asignadas
                  </NavLink>
                  {/* Más adelante: perfil profesional */}
                </>
              )}

              {rol === "ADMIN" && (
                <>
                  <p className="sidebar-section">Admin</p>
                  <NavLink
                    to="/admin/clientes"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    Gestionar clientes
                  </NavLink>
                  <NavLink
                    to="/admin/profesionales"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    Gestionar profesionales
                  </NavLink>
                  <NavLink
                    to="/admin/clases"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    Gestionar clases
                  </NavLink>
                </>
              )}
            </nav>
          </aside>

          {/* CONTENIDO CENTRAL */}
          <section className="content">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* Cliente */}
              <Route
                path="/cliente/registrar-clase"
                element={<RegistrarClase />}
              />
              <Route path="/cliente/clases" element={<ClasesCliente />} />

              {/* Profesional */}
              <Route
                path="/profesional/clases"
                element={<ClasesProfesional />}
              />

              {/* Admin (más adelante agregamos páginas reales) */}
              <Route
                path="/admin/clientes"
                element={
                  <div className="card">
                    <h2>Gestión de clientes (Admin)</h2>
                    <p>Página en construcción.</p>
                  </div>
                }
              />
              <Route
                path="/admin/profesionales"
                element={
                  <div className="card">
                    <h2>Gestión de profesionales (Admin)</h2>
                    <p>Página en construcción.</p>
                  </div>
                }
              />
              <Route
                path="/admin/clases"
                element={
                  <div className="card">
                    <h2>Gestión de clases (Admin)</h2>
                    <p>Página en construcción.</p>
                  </div>
                }
              />
            </Routes>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
