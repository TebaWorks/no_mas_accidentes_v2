import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function ClasesCliente() {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  // Cargar clientes al inicio
  useEffect(() => {
    async function fetchClientes() {
      try {
        const res = await fetch(`${API_URL}/api/clientes/`);
        if (!res.ok) {
          throw new Error("No se pudo cargar la lista de clientes");
        }
        const data = await res.json();
        setClientes(data);

        // Si quieres, seleccionar automáticamente el primero:
        if (data.length > 0) {
          setClienteSeleccionado(String(data[0].id));
        }
      } catch (error) {
        console.error(error);
        setMensajeError("Error al cargar los clientes.");
      }
    }

    fetchClientes();
  }, []);

  // Cargar clases cuando cambie el cliente seleccionado
  useEffect(() => {
    if (!clienteSeleccionado) {
      setClases([]);
      return;
    }

    async function fetchClases() {
      setLoading(true);
      setMensajeError("");

      try {
        const res = await fetch(
          `${API_URL}/api/clases/?cliente_id=${clienteSeleccionado}`
        );
        if (!res.ok) {
          throw new Error("No se pudo cargar la lista de clases");
        }
        const data = await res.json();
        setClases(data);
      } catch (error) {
        console.error(error);
        setMensajeError("Error al cargar las clases de este cliente.");
      } finally {
        setLoading(false);
      }
    }

    fetchClases();
  }, [clienteSeleccionado]);

  return (
    <div className="card">
      <h2>Mis clases solicitadas (vista cliente)</h2>

      {mensajeError && (
        <p style={{ color: "#b00020", marginTop: "0.5rem" }}>{mensajeError}</p>
      )}

      <div className="form-group" style={{ marginTop: "0.75rem" }}>
        <label htmlFor="cliente-select">Selecciona el cliente (empresa)</label>
        <select
          id="cliente-select"
          value={clienteSeleccionado}
          onChange={(e) => setClienteSeleccionado(e.target.value)}
        >
          <option value="">-- Selecciona una empresa --</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} ({c.rut})
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Cargando clases...</p>}

      {!loading && clienteSeleccionado && clases.length === 0 && (
        <p style={{ marginTop: "0.75rem" }}>
          No hay clases registradas para este cliente.
        </p>
      )}

      {!loading && clases.length > 0 && (
        <div className="lista-clases" style={{ marginTop: "0.75rem" }}>
          {clases.map((clase) => (
            <div key={clase.id} className="item-clase">
              <h3>{clase.titulo}</h3>
              <p>{clase.descripcion}</p>
              <p>
                <strong>Estado:</strong> {clase.estado}
              </p>
              {clase.fecha_solicitada && (
                <p>
                  <strong>Fecha solicitada:</strong> {clase.fecha_solicitada}
                </p>
              )}
              {clase.profesional_nombre && (
                <p>
                  <strong>Profesional asignado:</strong>{" "}
                  {clase.profesional_nombre}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClasesCliente;

