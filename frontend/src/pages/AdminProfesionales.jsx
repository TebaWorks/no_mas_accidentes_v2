import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function AdminProfesionales() {
  const [profesionales, setProfesionales] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeError, setMensajeError] = useState("");
  const [form, setForm] = useState({
    user_id: "",
    especialidad: "",
    registro_profesional: "",
    disponible: true,
  });
  const [enviando, setEnviando] = useState(false);

  async function cargarProfesionales() {
    setLoading(true);
    setMensajeError("");
    try {
      const res = await fetch(`${API_URL}/api/profesionales/`);
      if (!res.ok) throw new Error("Error al cargar profesionales");
      const data = await res.json();
      setProfesionales(data);
    } catch (err) {
      console.error(err);
      setMensajeError("No se pudieron cargar los profesionales.");
    } finally {
      setLoading(false);
    }
  }

  async function cargarUsuarios() {
    try {
      const res = await fetch(`${API_URL}/api/usuarios/`);
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      setMensajeError("Error al cargar lista de usuarios.");
    }
  }

  useEffect(() => {
    cargarProfesionales();
    cargarUsuarios();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setMensajeError("");

    const payload = {
      user_id: form.user_id ? Number(form.user_id) : null,
      especialidad: form.especialidad,
      registro_profesional: form.registro_profesional,
      disponible: form.disponible,
    };

    try {
      const res = await fetch(`${API_URL}/api/profesionales/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Error al crear profesional", await res.text());
        throw new Error("Error al crear profesional");
      }

      setForm({
        user_id: "",
        especialidad: "",
        registro_profesional: "",
        disponible: true,
      });
      await cargarProfesionales();
    } catch (err) {
      console.error(err);
      setMensajeError("No se pudo crear el profesional. Revisa los datos.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="card">
      <h2>Gestión de profesionales (Admin)</h2>

      {mensajeError && (
        <p style={{ color: "#b00020", marginTop: "0.5rem" }}>{mensajeError}</p>
      )}

      <h3 style={{ marginTop: "1rem" }}>Crear nuevo profesional</h3>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "0.5rem", marginTop: "0.5rem" }}
      >
        <div className="form-group">
          <label>Usuario (debe existir previamente)</label>
          <select
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un usuario...</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}{" "}
                {u.profile?.rol ? `(${u.profile.rol})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Especialidad</label>
          <input
            name="especialidad"
            value={form.especialidad}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Registro profesional</label>
          <input
            name="registro_profesional"
            value={form.registro_profesional}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={{ display: "flex", gap: "0.5rem" }}>
          <input
            id="chk-disponible"
            type="checkbox"
            name="disponible"
            checked={form.disponible}
            onChange={handleChange}
          />
          <label htmlFor="chk-disponible">Disponible</label>
        </div>

        <button type="submit" className="btn-primario" disabled={enviando}>
          {enviando ? "Guardando..." : "Crear profesional"}
        </button>
      </form>

      <h3 style={{ marginTop: "1.5rem" }}>Listado de profesionales</h3>

      {loading ? (
        <p>Cargando profesionales...</p>
      ) : profesionales.length === 0 ? (
        <p>No hay profesionales registrados.</p>
      ) : (
        <div className="lista-clases">
          {profesionales.map((p) => (
            <div key={p.id} className="item-clase">
              <h4>
                {p.user_data?.first_name || p.user_data?.username}{" "}
                {p.user_data?.last_name || ""}
              </h4>
              <p>
                <strong>Usuario:</strong> {p.user_data?.username}
              </p>
              {p.especialidad && (
                <p>
                  <strong>Especialidad:</strong> {p.especialidad}
                </p>
              )}
              {p.registro_profesional && (
                <p>
                  <strong>Registro:</strong> {p.registro_profesional}
                </p>
              )}
              <p>
                <strong>Disponible:</strong>{" "}
                {p.disponible ? "Sí" : "No"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminProfesionales;
