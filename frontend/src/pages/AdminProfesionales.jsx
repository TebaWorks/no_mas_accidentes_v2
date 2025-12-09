import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function AdminProfesionales() {
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [modo, setModo] = useState("lista"); // lista | crear | editar
  const [profActual, setProfActual] = useState(null);

  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    user: "", // ID de usuario
    especialidad: "",
    registro_profesional: "",
    disponible: true,
  });

  function resetForm() {
    setForm({
      user: "",
      especialidad: "",
      registro_profesional: "",
      disponible: true,
    });
    setProfActual(null);
    setModo("lista");
  }

  async function cargarProfesionales() {
    setLoading(true);
    setMensaje("");

    try {
      const res = await fetch(`${API_URL}/api/profesionales/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        setMensaje("No se pudieron cargar los profesionales.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setProfesionales(data);
    } catch (error) {
      console.error(error);
      setMensaje("Error al cargar los profesionales.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarProfesionales();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function irACrear() {
    resetForm();
    setModo("crear");
  }

  function irAEditar(prof) {
    setProfActual(prof);
    setForm({
      user: prof.user || "",
      especialidad: prof.especialidad || "",
      registro_profesional: prof.registro_profesional || "",
      disponible: prof.disponible ?? true,
    });
    setModo("editar");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje("");

    const url =
      modo === "crear"
        ? `${API_URL}/api/profesionales/`
        : `${API_URL}/api/profesionales/${profActual.id}/`;

    const method = modo === "crear" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        console.error("Error guardando profesional:", await res.text());
        setMensaje("No se pudo guardar el profesional. Revisa los datos.");
        return;
      }

      setMensaje("Profesional guardado correctamente.");
      resetForm();
      cargarProfesionales();
    } catch (error) {
      console.error(error);
      setMensaje("Error al guardar el profesional.");
    }
  }

  async function toggleDisponibilidad(prof) {
    try {
      const res = await fetch(`${API_URL}/api/profesionales/${prof.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ disponible: !prof.disponible }),
      });

      if (!res.ok) {
        setMensaje("No se pudo actualizar la disponibilidad.");
        return;
      }

      setMensaje("Disponibilidad actualizada.");
      cargarProfesionales();
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar la disponibilidad.");
    }
  }

  return (
    <div className="card">
      <h2>Gestión de profesionales</h2>
      <p className="card-subtitle">
        Registrar y administrar los profesionales que dictan clases, y controlar
        su disponibilidad.
      </p>

      <div
        style={{
          marginTop: "0.5rem",
          display: "flex",
          justifyContent: "space-between",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <button className="btn-primario" type="button" onClick={irACrear}>
          + Nuevo profesional
        </button>
        <button className="btn-secundario" type="button" onClick={cargarProfesionales}>
          Recargar lista
        </button>
      </div>

      {mensaje && (
        <p style={{ marginTop: "0.6rem", fontSize: "0.9rem" }}>{mensaje}</p>
      )}

      {/* Formulario crear/editar */}
      {(modo === "crear" || modo === "editar") && (
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ marginBottom: "0.4rem" }}>
            {modo === "crear" ? "Crear profesional" : "Editar profesional"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="form-grid form-grid-2"
            style={{
              background: "#f9fafb",
              borderRadius: "12px",
              padding: "0.8rem",
              marginBottom: "1rem",
            }}
          >
            <div className="form-group">
              <label>ID Usuario</label>
              <input
                name="user"
                value={form.user}
                onChange={handleChange}
                required={modo === "crear"}
              />
              <small style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                Debe ser el ID del usuario ya creado (admin crea cuenta y rol).
              </small>
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

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="disponible"
                  checked={form.disponible}
                  onChange={handleChange}
                  style={{ marginRight: "0.35rem" }}
                />
                Profesional disponible
              </label>
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: "0.6rem",
                marginTop: "0.4rem",
              }}
            >
              <button type="submit" className="btn-primario">
                Guardar
              </button>
              <button
                type="button"
                className="btn-secundario"
                onClick={resetForm}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <p style={{ marginTop: "1rem" }}>Cargando profesionales...</p>
      ) : profesionales.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>No hay profesionales registrados.</p>
      ) : (
        <div className="table-wrapper" style={{ marginTop: "0.8rem" }}>
          <table className="table-basic">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Especialidad</th>
                <th>Registro</th>
                <th>Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profesionales.map((prof) => (
                <tr key={prof.id}>
                  <td>{prof.id}</td>
                  <td>{prof.username || prof.user || "—"}</td>
                  <td>{prof.especialidad || "—"}</td>
                  <td>{prof.registro_profesional || "—"}</td>
                  <td>
                    <span
                      className={
                        prof.disponible
                          ? "chip-estado chip-aceptada"
                          : "chip-estado chip-rechazada"
                      }
                    >
                      {prof.disponible ? "Disponible" : "No disponible"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secundario"
                      style={{ marginRight: "0.3rem" }}
                      onClick={() => irAEditar(prof)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-secundario"
                      onClick={() => toggleDisponibilidad(prof)}
                    >
                      {prof.disponible ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminProfesionales;
