import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function RegisterCliente() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeOk, setMensajeOk] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMensajeError("");
    setMensajeOk("");

    try {
      const res = await fetch(`${API_URL}/api/auth/registro-cliente/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Error registro:", data);
        setMensajeError("No se pudo crear la cuenta. Revisa los datos.");
        setLoading(false);
        return;
      }

      setMensajeOk("Cuenta creada correctamente. Ahora puedes iniciar sesión.");
      // Opcional: limpiar formulario
      setForm({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
      });

      // Redirigir al login después de un momento
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(error);
      setMensajeError("Error al registrar la cuenta. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>Crear cuenta de cliente</h2>
      <p>
        Esta cuenta será de tipo <strong>CLIENTE</strong>. Si eres profesional,
        tu cuenta debe ser creada por el administrador.
      </p>

      {mensajeError && (
        <p style={{ color: "#b00020", marginTop: "0.5rem" }}>{mensajeError}</p>
      )}
      {mensajeOk && (
        <p style={{ color: "green", marginTop: "0.5rem" }}>{mensajeOk}</p>
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
            required
          />
        </div>

        <div className="form-group">
          <label>Nombre</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Apellido</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Correo electrónico</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-primario" disabled={loading}>
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
        ¿Ya tienes cuenta?{" "}
        <Link to="/login">Inicia sesión aquí</Link>.
      </p>
    </div>
  );
}

export default RegisterCliente;
