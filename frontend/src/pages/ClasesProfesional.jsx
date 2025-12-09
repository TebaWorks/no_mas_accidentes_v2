import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function ClasesProfesional() {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODAS");

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
        setMensaje("No se pudieron cargar las clases asignadas.");
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

  async function cambiarEstadoClase(id, nuevoEstado) {
    try {
      const res = await fetch(`${API_URL}/api/clases/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) {
        setMensaje("No se pudo actualizar el estado de la clase.");
        return;
      }

      setMensaje("Estado actualizado correctamente.");
      cargarClases();
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar la clase.");
    }
  }

  const clasesFiltradas =
    filtroEstado === "TODAS"
      ? clases
      : clases.filter((c) => c.estado === filtroEstado);

  const totalPendientes = clases.filter((c) => c.estado === "PENDIENTE").length;
  const totalAceptadas = clases.filter((c) => c.estado === "ACEPTADA").length;
  const totalCompletadas = clases.filter(
    (c) => c.estado === "COMPLETADA"
  ).length;

  return (
    <div className="card">
      <h2>Clases asignadas</h2>
      <p className="card-subtitle">
        Aquí puedes ver las clases que te han sido asignadas y actualizar su
        estado.
      </p>

      <div className="grid-resumen">
        <div className="card" style={{ padding: "0.8rem" }}>
          <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Pendientes</p>
          <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            {totalPendientes}
          </p>
        </div>
        <div className="card" style={{ padding: "0.8rem" }}>
          <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Aceptadas</p>
          <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            {totalAceptadas}
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
          marginTop: "0.6rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label style={{ fontSize: "0.85rem", marginRight: "0.4rem" }}>
            Filtrar por estado:
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="TODAS">Todas</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="ACEPTADA">Aceptada</option>
            <option value="RECHAZADA">Rechazada</option>
            <option value="COMPLETADA">Completada</option>
          </select>
        </div>

        <button className="btn-secundario" onClick={cargarClases}>
          Recargar
        </button>
      </div>

      {mensaje && (
        <p style={{ marginTop: "0.6rem", fontSize: "0.85rem" }}>{mensaje}</p>
      )}

      {loading ? (
        <p style={{ marginTop: "1rem" }}>Cargando clases...</p>
      ) : clasesFiltradas.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>No hay clases para mostrar.</p>
      ) : (
        <div className="table-wrapper" style={{ marginTop: "1rem" }}>
          <table className="table-basic">
            <thead>
              <tr>
                <th>Título</th>
                <th>Cliente</th>
                <th>Fecha solicitada</th>
                <th>Modalidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clasesFiltradas.map((clase) => (
                <tr key={clase.id}>
                  <td>{clase.titulo}</td>
                  <td>{clase.cliente_nombre || "—"}</td>
                  <td>{clase.fecha_solicitada || "—"}</td>
                  <td>{clase.modalidad || "—"}</td>
                  <td>
                    <span
                      className={`chip-estado ${
                        clase.estado === "PENDIENTE"
                          ? "chip-pendiente"
                          : clase.estado === "ACEPTADA"
                          ? "chip-aceptada"
                          : clase.estado === "COMPLETADA"
                          ? "chip-aceptada"
                          : "chip-rechazada"
                      }`}
                    >
                      {clase.estado}
                    </span>
                  </td>
                  <td>
                    {clase.estado === "PENDIENTE" && (
                      <>
                        <button
                          className="btn-primario"
                          style={{ marginRight: "0.4rem" }}
                          onClick={() =>
                            cambiarEstadoClase(clase.id, "ACEPTADA")
                          }
                        >
                          Aceptar
                        </button>
                        <button
                          className="btn-secundario"
                          onClick={() =>
                            cambiarEstadoClase(clase.id, "RECHAZADA")
                          }
                        >
                          Rechazar
                        </button>
                      </>
                    )}

                    {clase.estado === "ACEPTADA" && (
                      <button
                        className="btn-primario"
                        onClick={() =>
                          cambiarEstadoClase(clase.id, "COMPLETADA")
                        }
                      >
                        Marcar completada
                      </button>
                    )}

                    {["RECHAZADA", "COMPLETADA"].includes(clase.estado) && (
                      <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                        Sin acciones
                      </span>
                    )}
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

export default ClasesProfesional;

