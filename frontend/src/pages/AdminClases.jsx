import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const ESTADOS = [
  "PENDIENTE",
  "ASIGNADA",
  "ACEPTADA",
  "RECHAZADA",
  "COMPLETADA",
];

function AdminClases() {
  const [clases, setClases] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeError, setMensajeError] = useState("");

  async function cargarClases() {
    setLoading(true);
    setMensajeError("");
    try {
      const res = await fetch(`${API_URL}/api/clases/`);
      if (!res.ok) throw new Error("Error al cargar clases");
      const data = await res.json();
      setClases(data);
    } catch (err) {
      console.error(err);
      setMensajeError("No se pudieron cargar las clases.");
    } finally {
      setLoading(false);
    }
  }

  async function cargarProfesionales() {
    try {
      const res = await fetch(`${API_URL}/api/profesionales/`);
      if (!res.ok) throw new Error("Error al cargar profesionales");
      const data = await res.json();
      setProfesionales(data);
    } catch (err) {
      console.error(err);
      setMensajeError("Error al cargar lista de profesionales.");
    }
  }

  useEffect(() => {
    cargarClases();
    cargarProfesionales();
  }, []);

  async function actualizarClase(id, cambios) {
    try {
      const res = await fetch(`${API_URL}/api/clases/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cambios),
      });

      if (!res.ok) {
        console.error("Error al actualizar clase", await res.text());
        throw new Error("Error al actualizar clase");
      }

      await cargarClases();
    } catch (err) {
      console.error(err);
      setMensajeError("No se pudo actualizar la clase.");
    }
  }

  function handleCambioEstado(id, nuevoEstado) {
    actualizarClase(id, { estado: nuevoEstado });
  }

  function handleCambioProfesional(id, profesionalId) {
    const payload =
      profesionalId === ""
        ? { profesional_asignado_id: null }
        : { profesional_asignado_id: Number(profesionalId) };
    actualizarClase(id, payload);
  }

  return (
    <div className="card">
      <h2>Gestión de clases (Admin)</h2>

      {mensajeError && (
        <p style={{ color: "#b00020", marginTop: "0.5rem" }}>{mensajeError}</p>
      )}

      {loading ? (
        <p>Cargando clases...</p>
      ) : clases.length === 0 ? (
        <p>No hay clases registradas.</p>
      ) : (
        <div className="lista-clases">
          {clases.map((clase) => (
            <div key={clase.id} className="item-clase">
              <h3>{clase.titulo}</h3>
              <p>{clase.descripcion}</p>
              <p>
                <strong>Cliente:</strong> {clase.cliente_nombre}
              </p>
              {clase.solicitante_nombre && (
                <p>
                  <strong>Solicitada por:</strong> {clase.solicitante_nombre}
                </p>
              )}

              {/* Estado */}
              <div className="form-group" style={{ marginTop: "0.5rem" }}>
                <label>Estado</label>
                <select
                  value={clase.estado}
                  onChange={(e) =>
                    handleCambioEstado(clase.id, e.target.value)
                  }
                >
                  {ESTADOS.map((est) => (
                    <option key={est} value={est}>
                      {est}
                    </option>
                  ))}
                </select>
              </div>

              {/* Profesional asignado */}
              <div className="form-group" style={{ marginTop: "0.5rem" }}>
                <label>Profesional asignado</label>
                <select
                  value={clase.profesional_asignado ?? ""}
                  onChange={(e) =>
                    handleCambioProfesional(clase.id, e.target.value)
                  }
                >
                  <option value="">— Sin asignar —</option>
                  {profesionales.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user_data?.first_name || p.user_data?.username}{" "}
                      {p.user_data?.last_name || ""}{" "}
                      {p.especialidad ? `- ${p.especialidad}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {clase.fecha_solicitada && (
                <p style={{ marginTop: "0.5rem" }}>
                  <strong>Fecha solicitada:</strong> {clase.fecha_solicitada}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminClases;
