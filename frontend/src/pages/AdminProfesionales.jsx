import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function AdminProfesionales() {
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const token = localStorage.getItem("token");

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
      setMensaje("Error al cargar la lista de profesionales.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarProfesionales();
  }, []);

  async function toggleDisponibilidad(id, disponibleActual) {
    try {
      const res = await fetch(`${API_URL}/api/profesionales/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ disponible: !disponibleActual }),
      });

      if (!res.ok) {
        setMensaje("No se pudo actualizar la disponibilidad.");
        return;
      }

      setMensaje("Disponibilidad actualizada correctamente.");
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
        Registrar y administrar profesionales vinculados a la prevención de
        riesgos. Puedes activar o desactivar su disponibilidad.
      </p>

      {mensaje && (
        <p style={{ marginTop: "0.6rem", fontSize: "0.9rem" }}>{mensaje}</p>
      )}

      {loading ? (
        <p style={{ marginTop: "1rem" }}>Cargando profesionales...</p>
      ) : profesionales.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>No hay profesionales registrados.</p>
      ) : (
        <div className="table-wrapper" style={{ marginTop: "1rem" }}>
          <table className="table-basic">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Especialidad</th>
                <th>Registro profesional</th>
                <th>Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profesionales.map((prof) => (
                <tr key={prof.id}>
                  <td>{prof.username || "—"}</td>
                  <td>{prof.nombre_completo || "—"}</td>
                  <td>{prof.especialidad || "—"}</td>
                  <td>{prof.registro_profesional || "—"}</td>
                  <td>
                    <span
                      className={
                        prof.disponible ? "chip-estado chip-aceptada" : "chip-estado chip-rechazada"
                      }
                    >
                      {prof.disponible ? "Disponible" : "No disponible"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secundario"
                      onClick={() =>
                        toggleDisponibilidad(prof.id, prof.disponible)
                      }
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
