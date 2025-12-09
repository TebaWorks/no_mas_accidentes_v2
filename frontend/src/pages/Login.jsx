import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMensajeError("");

    try {
      // 1) Pedir token JWT
      const resToken = await fetch(`${API_URL}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!resToken.ok) {
        setMensajeError("Credenciales inválidas.");
        setLoading(false);
        return;
      }

      const dataToken = await resToken.json();
      const accessToken = dataToken.access;

      // 2) Pedir datos del usuario logueado
      const resMe = await fetch(`${API_URL}/api/auth/me/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!resMe.ok) {
        setMensajeError("No se pudo obtener información del usuario.");
        setLoading(false);
        return;
      }

      const userData = await resMe.json();

      // 3) Guardar en localStorage y subir al estado global
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      if (onLogin) {
        onLogin({ token: accessToken, user: userData });
      }

      navigate("/");
    } catch (error) {
      console.error(error);
      setMensajeError("Error en el login. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>Iniciar sesión</h2>
      <p>Ingresa con tu usuario y contraseña del sistema.</p>

      {mensajeError && (
        <p style={{ color: "#b00020", marginTop: "0.5rem" }}>{mensajeError}</p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}
      >
        <div className="form-group">
          <label>Usuario</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn-primario" disabled={loading}>
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>

      <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
        ¿Eres cliente nuevo?{" "}
        <Link to="/registro-cliente">Crear cuenta</Link>
      </p>
    </div>
  );
}

export default Login;
