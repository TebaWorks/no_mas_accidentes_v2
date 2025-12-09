import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function AdminConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [detalleError, setDetalleError] = useState("");

  const token = localStorage.getItem("token");

  async function cargarConfig() {
    setLoading(true);
    setMensaje("");
    setDetalleError("");
    try {
      const res = await fetch(`${API_URL}/api/config/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        let detalle = "";
        try {
          const dataError = await res.json();
          detalle = JSON.stringify(dataError, null, 2);
        } catch (e) {
          detalle = await res.text();
        }
        setMensaje("No se pudo cargar la configuración.");
        setDetalleError(detalle.slice(0, 800));
        setLoading(false);
        return;
      }

      const data = await res.json();
      setConfig(data);
    } catch (error) {
      console.error(error);
      setMensaje("Error al cargar la configuración.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!config) return;

    setMensaje("");
    setDetalleError("");

    try {
      const res = await fetch(`${API_URL}/api/config/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        let detalle = "";
        try {
          const dataError = await res.json();
          detalle = JSON.stringify(dataError, null, 2);
        } catch (err) {
          detalle = await res.text();
        }
        console.error("Error guardando config:", detalle);
        setMensaje("No se pudo guardar la configuración.");
        setDetalleError(detalle.slice(0, 800));
        return;
      }

      const data = await res.json();
      setConfig(data);
      setMensaje("Configuración guardada correctamente.");
    } catch (error) {
      console.error(error);
      setMensaje("Error al guardar la configuración.");
    }
  }

  return (
    <div className="card">
      <h2>Configuración del sistema</h2>
      <p className="card-subtitle">
        Aquí puedes administrar los datos generales de la empresa y algunos
        parámetros globales del sistema No Más Accidentes.
      </p>

      <div
        style={{
          marginTop: "0.5rem",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          className="btn-secundario"
          type="button"
          onClick={cargarConfig}
        >
          Recargar
        </button>
      </div>

      {mensaje && (
        <p
          style={{
            marginTop: "0.6rem",
            fontSize: "0.9rem",
            color: "#374151",
          }}
        >
          {mensaje}
        </p>
      )}

      {detalleError && (
        <pre
          style={{
            marginTop: "0.4rem",
            fontSize: "0.75rem",
            background: "#0f172a",
            color: "#e5e7eb",
            padding: "0.5rem",
            borderRadius: "8px",
            maxHeight: "220px",
            overflow: "auto",
          }}
        >
{detalleError}
        </pre>
      )}

      {loading ? (
        <p style={{ marginTop: "1rem" }}>Cargando configuración...</p>
      ) : !config ? (
        <p style={{ marginTop: "1rem" }}>
          No se pudo obtener la configuración.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="form-grid form-grid-2"
          style={{
            background: "#f9fafb",
            borderRadius: "12px",
            padding: "0.8rem",
            marginTop: "1rem",
          }}
        >
          <div className="form-group">
            <label>Nombre del sistema</label>
            <input
              name="nombre_sistema"
              value={config.nombre_sistema || ""}
              onChange={handleChange}
              placeholder="Ej: No Más Accidentes"
            />
          </div>

          <div className="form-group">
            <label>Razón social</label>
            <input
              name="razon_social"
              value={config.razon_social || ""}
              onChange={handleChange}
              placeholder="Nombre legal de la empresa"
            />
          </div>

          <div className="form-group">
            <label>RUT empresa</label>
            <input
              name="rut_empresa"
              value={config.rut_empresa || ""}
              onChange={handleChange}
              placeholder="Ej: 11.111.111-1"
            />
          </div>

          <div className="form-group">
            <label>Dirección</label>
            <input
              name="direccion"
              value={config.direccion || ""}
              onChange={handleChange}
              placeholder="Ej: Av. Siempre Viva 123, Santiago"
            />
          </div>

          <div className="form-group">
            <label>Teléfono de contacto</label>
            <input
              name="telefono_contacto"
              value={config.telefono_contacto || ""}
              onChange={handleChange}
              placeholder="Ej: +56912345678"
            />
          </div>

          <div className="form-group">
            <label>Correo de contacto</label>
            <input
              name="email_contacto"
              type="email"
              value={config.email_contacto || ""}
              onChange={handleChange}
              placeholder="Ej: contacto@empresa.cl"
            />
          </div>

          <div className="form-group">
            <label>Sitio web</label>
            <input
              name="sitio_web"
              value={config.sitio_web || ""}
              onChange={handleChange}
              placeholder="Ej: https://www.empresa.cl"
            />
          </div>

          <div className="form-group">
            <label>Días mínimos para cancelar clase</label>
            <input
              name="dias_min_anticipacion_cancelacion"
              type="number"
              min="0"
              value={config.dias_min_anticipacion_cancelacion ?? 0}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="permitir_registro_publico_clientes"
                checked={!!config.permitir_registro_publico_clientes}
                onChange={handleChange}
                style={{ marginRight: "0.35rem" }}
              />
              Permitir registro público de clientes
            </label>
          </div>

          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Mensaje de portada (Home)</label>
            <input
              name="texto_portada"
              value={config.texto_portada || ""}
              onChange={handleChange}
              placeholder="Texto breve que aparecerá en la pantalla de inicio."
            />
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
              Guardar configuración
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AdminConfig;
