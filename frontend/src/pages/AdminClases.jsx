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
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const token = localStorage.getItem("token");

  async function cargarClases() {
    setLoading(true);
    setMensaje("");

    try {
      const res = await fetch(`${API_URL}/api/clases/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        setMensaje("No se pudieron cargar las clases.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setClases(data);
    } catch (error) {
      console.error(error);
      setMensaje("Error al cargar las clases.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarClases();
  }, []);

  async function actualizarClase(id, payload) {
    try {
      const res = await fetch(`${API_URL}/api/clases/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Error actualizando clase:", await res.text());
        setMensaje("No se pudo actualizar la clase.");
        return;
      }

      setMensaje("Clase actualizada correctamente.");
      cargarClases();
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar la clase.");
    }
  }

  function handleCambiarEstado(clase, nuevoEstado) {
    actualizarClase(clase.id, { estado: nuevoEstado });
  }

  function handleCambiarFecha(clase) {
    const nuevaFecha = window.prompt(
      "Nueva fecha solicitada (formato YYYY-MM-DD):",
      clase.fecha_solicitada || ""
    );

    if (!nuevaFecha) return;
    actualizarClase(clase.id, { fecha_solicitada: nuevaFecha });
  }

  async function handleEliminarClase(clase) {
    const confirmar = window.confirm(
      `¿Seguro que quieres eliminar la clase "${clase.titulo}"? Esta acción es permanente.`
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_URL}/api/clases/${clase.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.status !== 204 && !res.ok) {
        console.error("Error eliminando clase:", await res.text());
        setMensaje("No se pudo eliminar la clase.");
        return;
      }

      setMensaje("Clase eliminada correctamente.");
      cargarClases();
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar la clase.");
    }
  }

  const totalPendientes = clases.filter((c) => c.estado === "PENDIENTE").length;
  const totalActivas = clases.filter((c) =>
    ["PENDIENTE", "ASIGNADA", "ACEPTADA"].includes(c.estado)
  ).length;
  const totalCompletadas = clases.filter(
    (c) => c.estado === "COMPLETADA"
  ).length;

  return (
    <div className="card">
      <h2>Gestión de clases</h2>
      <p className="card-subtitle">
        Como administrador puedes revisar y administrar todas las clases
        solicitadas, cambiar su estado, modificar la fecha o eliminarlas.
      </p>

      <div className="grid-resumen">
        <div className="card" style={{ padding: "0.8rem" }}>
          <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Pendientes</p>
          <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            {totalPendientes}
          </p>
        </div>
        <div className="card" style={{ padding: "0.8rem" }}>
          <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Activas</p>
          <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            {totalActivas}
          </p>
        </div>
        <div className="card" style={{ padding: "0.8rem" }}>
          <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Completadas</p>
          <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            {totalCompletadas}
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: "0.5rem",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button className="btn-secundario" onClick={cargarClases}>
          Recargar
        </button>
      </div>

      {mensaje && (
        <p style={{ marginTop: "0.6rem", fontSize: "0.9rem" }}>{mensaje}</p>
      )}

      {loading ? (
        <p style={{ marginTop: "1rem" }}>Cargando clases...</p>
      ) : clases.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>No hay clases registradas.</p>
      ) : (
        <div className="table-wrapper" style={{ marginTop: "0.8rem" }}>
          <table className="table-basic">
            <thead>
              <tr>
                <th>Título</th>
                <th>Cliente</th>
                <th>Profesional</th>
                <th>Fecha solicitada</th>
                <th>Estado</th>
                <th>Cambiar estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clases.map((clase) => (
                <tr key={clase.id}>
                  <td>{clase.titulo}</td>
                  <td>{clase.cliente_nombre || clase.cliente || "—"}</td>
                  <td>
                    {clase.profesional_nombre ||
                      clase.profesional_asignado ||
                      "—"}
                  </td>
                  <td>{clase.fecha_solicitada || "—"}</td>
                  <td>
                    <span
                      className={`chip-estado ${
                        clase.estado === "PENDIENTE"
                          ? "chip-pendiente"
                          : clase.estado === "COMPLETADA" ||
                            clase.estado === "ACEPTADA"
                          ? "chip-aceptada"
                          : "chip-rechazada"
                      }`}
                    >
                      {clase.estado}
                    </span>
                  </td>
                  <td>
                    <select
                      value={clase.estado}
                      onChange={(e) =>
                        handleCambiarEstado(clase, e.target.value)
                      }
                    >
                      {ESTADOS.map((est) => (
                        <option key={est} value={est}>
                          {est}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn-secundario"
                      style={{ marginRight: "0.3rem" }}
                      onClick={() => handleCambiarFecha(clase)}
                    >
                      Cambiar fecha
                    </button>
                    <button
                      className="btn-secundario"
                      onClick={() => handleEliminarClase(clase)}
                    >
                      Eliminar
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

export default AdminClases;
