import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function ClasesCliente() {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    async function fetchClases() {
      try {
        const res = await fetch(`${API_URL}/api/clases/`);
        if (!res.ok) {
          throw new Error("No se pudo cargar la lista de clases");
        }
        const data = await res.json();
        setClases(data);
      } catch (error) {
        console.error(error);
        setMensajeError("Error al cargar las clases.");
      } finally {
        setLoading(false);
      }
    }

    fetchClases();
  }, []);

  if (loading) {
    return <p>Cargando clases...</p>;
  }

  if (mensajeError) {
    return <p style={{ color: "#b00020" }}>{mensajeError}</p>;
  }

  if (clases.length === 0) {
    return <p>No hay clases registradas aún.</p>;
  }

  return (
    <div className="card">
      <h2>Mis clases solicitadas (vista cliente)</h2>
      <div className="lista-clases">
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClasesCliente;
