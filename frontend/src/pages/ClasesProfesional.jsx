import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function ClasesProfesional() {
  const [profesionales, setProfesionales] = useState([]);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState("");
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  // Cargar profesionales al inicio
  useEffect(() => {
    async function fetchProfesionales() {
      try {
        const res = await fetch(`${API_URL}/api/profesionales/`);
        if (!res.ok) {
          throw new Error("No se pudo cargar la lista de profesionales");
        }
        const data = await res.json();
        setProfesionales(data);

        // Seleccionar primero por defecto si existe
        if (data.length > 0) {
          setProfesionalSeleccionado(String(data[0].id));
        }
      } catch (error) {
        console.error(error);
        setMensajeError("Error al cargar los profesionales.");
      }
    }

    fetchProfesionales();
  }, []);

  // Cargar clases cuando cambia el profesional seleccionado
  useEffect(() => {
    if (!profesionalSeleccionado) {
      setClases([]);
      return;
    }

    async function fetchClases() {
      setLoading(true);
      setMensajeError("");

      try {
        const res = await fetch(
          `${API_URL}/api/clases/?profesional_id=${profesionalSeleccionado}`
        );
        if (!res.ok) {
          throw new Error("No se pudo cargar la lista de clases");
        }
        const data = await res.json();
        setClases(data);
      } catch (error) {
        console.error(error);
        setMensajeError("Error al cargar las clases de este profesional.");
      } finally {
        setLoading(false);
      }
    }

    fetchClases();
  }, [profesionalSeleccionado]);

  return (
    <div className="card">
      <h2>Clases asignadas (vista profesional)</h2>

      {mensajeError && (
        <p style={{ color: "#b00020", marginTop: "0.5rem" }}>{mensajeError}</p>
      )}

      <div className="form-group" style={{ marginTop: "0.75rem" }}>
        <label htmlFor="profesional-select">Selecciona el profesional</label>
        <select
          id="profesional-select"
          value={profesionalSeleccionado}
          onChange={(e) => setProfesionalSeleccionado(e.target.value)}
        >
          <option value="">-- Selecciona un profesional --</option>
          {profesionales.map((p) => (
            <option key={p.id} value={p.id}>
              {p.user?.first_name || p.user?.username}{" "}
              {p.user?.last_name ? p.user.last_name : ""}{" "}
              {p.especialidad ? `- ${p.especialidad}` : ""}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Cargando clases...</p>}

      {!loading && profesionalSeleccionado && clases.length === 0 && (
        <p style={{ marginTop: "0.75rem" }}>
          No hay clases asignadas a este profesional.
        </p>
      )}

      {!loading && clases.length > 0 && (
        <div className="lista-clases" style={{ marginTop: "0.75rem" }}>
          {clases.map((clase) => (
            <div key={clase.id} className="item-clase">
              <h3>{clase.titulo}</h3>
              <p>{clase.descripcion}</p>
              <p>
                <strong>Cliente:</strong> {clase.cliente_nombre}
              </p>
              <p>
                <strong>Estado:</strong> {clase.estado}
              </p>
              {clase.fecha_solicitada && (
                <p>
                  <strong>Fecha solicitada:</strong> {clase.fecha_solicitada}
                </p>
              )}
              {clase.solicitante_nombre && (
                <p>
                    <strong>Solicitada por:</strong> {clase.solicitante_nombre}
                </p>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClasesProfesional;
