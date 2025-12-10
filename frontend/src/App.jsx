import { useEffect, useState } from "react";
import {
  NavLink,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home.jsx";
import ClasesCliente from "./pages/ClasesCliente.jsx";
import ClasesProfesional from "./pages/ClasesProfesional.jsx";
import AdminClientes from "./pages/AdminClientes.jsx";
import AdminProfesionales from "./pages/AdminProfesionales.jsx";
import AdminClases from "./pages/AdminClases.jsx";
import Login from "./pages/Login.jsx";
import RegisterCliente from "./pages/RegisterCliente.jsx";
import PerfilProfesional from "./pages/PerfilProfesional.jsx";
import AdminUsuarios from "./pages/AdminUsuarios.jsx";
import AdminConfig from "./pages/AdminConfig.jsx";



const API_URL = import.meta.env.VITE_API_URL;

function AppContent() {
  const [apiStatus, setApiStatus] = useState("Comprobando API...");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const location = useLocation();

  // Cargar token y usuario desde localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

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

  const rol = user?.profile?.rol || null; // CLIENTE | PROFESIONAL | ADMIN | null

  function handleLogin({ token, user }) {
    setToken(token);
    setUser(user);
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  const isLoginRoute = location.pathname === "/login";
  const isRegisterRoute = location.pathname === "/registro-cliente";

  // Si no hay usuario y no estamos en login ni registro, redirigimos a /login
  if (!user && !isLoginRoute && !isRegisterRoute) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-top">
          <h1 className="app-title">No Más Accidentes</h1>
          <div className="header-right">
            <span className="api-status">{apiStatus}</span>

            {user ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.9rem" }}>
                    Conectado como <strong>{user.username}</strong>
                  </div>
                  {rol && (
                    <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                      Rol: <strong>{rol}</strong>
                    </div>
                  )}
                </div>
                <button
                  className="btn-primario"
                  type="button"
                  onClick={handleLogout}
                  style={{ paddingInline: "0.8rem", fontSize: "0.8rem" }}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <NavLink to="/login" className="nav-link">
                Iniciar sesión
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="app-main">
        <div className="dashboard">
          {/* SIDEBAR, solo si hay usuario */}
          {user && (
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
                      to="/profesional/perfil"
                      className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }
                    >
                      Mi perfil
                    </NavLink>
                    <NavLink
                      to="/profesional/clases"
                      className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }
                    >
                      Clases asignadas
                    </NavLink>
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
                    <NavLink
                      to="/admin/usuarios"
                      className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }
                    >
                      Gestionar usuarios
                    </NavLink>
                    <NavLink
                      to="/admin/config"
                      className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }
                    >
                      Configuración del sistema
                    </NavLink>
                  </>
                )}
              </nav>
            </aside>
          )}

          {/* CONTENIDO CENTRAL */}
          <section className="content">
            <Routes>
              {/* Rutas públicas */}
              <Route
                path="/login"
                element={<Login onLogin={handleLogin} />}
              />
              <Route
                path="/registro-cliente"
                element={<RegisterCliente />}
              />

              {/* Rutas protegidas: solo si hay user */}
              {user && (
                <>
                  {/* General */}
                  <Route path="/" element={<Home />} />

                  {/* Cliente */}
                  {rol === "CLIENTE" && (
                    <>
                      <Route
                        path="/cliente/clases"
                        element={<ClasesCliente />}
                      />
                    </>
                  )}

                  {/* Profesional */}
                  {rol === "PROFESIONAL" && (
                    <>
                      <Route
                        path="/profesional/perfil"
                        element={<PerfilProfesional />}
                      />
                      <Route
                        path="/profesional/clases"
                        element={<ClasesProfesional />}
                      />
                    </>
                  )}

                  {/* Admin */}
                  {rol === "ADMIN" && (
                    <>
                      <Route
                        path="/admin/clientes"
                        element={<AdminClientes />}
                      />
                      <Route
                        path="/admin/profesionales"
                        element={<AdminProfesionales />}
                      />
                      <Route
                        path="/admin/clases"
                        element={<AdminClases />}
                      />
                      <Route 
                      path="/admin/usuarios" 
                      element={<AdminUsuarios />} 
                      />
                      <Route 
                      path="/admin/config" 
                      element={<AdminConfig />} 
                      />
                    </>
                  )}
                </>
              )}

              {/* Fallback */}
              <Route
                path="*"
                element={<Navigate to={user ? "/" : "/login"} replace />}
              />
            </Routes>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
