import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function RegistrarClase() {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha_solicitada: "",
    modalidad: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [detalleError, setDetalleError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const token = localStorage.getItem("token");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje("");
    setDetalleError("");
    setEnviando(true);

    try {
      const res = await fetch(`${API_URL}/api/clases/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          titulo: form.titulo,
          descripcion: form.descripcion,
          fecha_solicitada: form.fecha_solicitada || null,
          modalidad: form.modalidad,
          // 👇 NO mandamos "cliente" ni "solicitada_por":
          // el backend los asigna automáticamente según el usuario logueado.
        }),
      });

      if (!res.ok) {
        let detalle = "";
        try {
          const dataError = await res.json();
          detalle = JSON.stringify(dataError, null, 2);
        } catch (err) {
          detalle = await res.text();
        }
        console.error("Error creando clase:", detalle);

        // Mensaje amigable según el caso
        if (detalle.includes("No tienes un cliente asociado")) {
          setMensaje(
            "No tienes un cliente/empresa asociada. Pide al administrador que vincule tu usuario."
          );
        } else {
          setMensaje("No se pudo registrar la clase. Revisa los datos.");
        }
        setDetalleError(detalle.slice(0, 800));
        return;
      }

      setMensaje("Clase registrada correctamente. Quedará en estado PENDIENTE.");
      setForm({
        titulo: "",
        descripcion: "",
        fecha_solicitada: "",
        modalidad: "",
      });
    } catch (error) {
      console.error(error);
      setMensaje("Error de red o de servidor al registrar la clase.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="card">
      <h2>Registrar nueva clase</h2>
      <p className="card-subtitle">
        Desde aquí puedes solicitar una nueva clase o capacitación para tu empresa.
        El sistema usará automáticamente el cliente asociado a tu usuario,
        por lo que no es posible registrar clases para otras empresas.
      </p>

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
        <details style={{ marginTop: "0.4rem" }}>
          <summary style={{ fontSize: "0.8rem", cursor: "pointer" }}>
            Ver detalle técnico del error
          </summary>
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
        </details>
      )}

      <form
        onSubmit={handleSubmit}
        className="form-grid form-grid-2"
        style={{
          background: "#f9fafb",
          borderRadius: "12px",
          padding: "0.8rem",
          marginTop: "0.8rem",
        }}
      >
        <div className="form-group">
          <label>Título de la clase</label>
          <input
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            required
            placeholder="Ej: Capacitación en uso seguro de maquinaria"
          />
        </div>

        <div className="form-group">
          <label>Modalidad</label>
          <select
            name="modalidad"
            value={form.modalidad}
            onChange={handleChange}
          >
            <option value="">Selecciona una opción</option>
            <option value="Presencial">Presencial</option>
            <option value="Online">Online</option>
            <option value="Mixta">Mixta</option>
          </select>
        </div>

        <div className="form-group">
          <label>Fecha solicitada</label>
          <input
            type="date"
            name="fecha_solicitada"
            value={form.fecha_solicitada}
            onChange={handleChange}
          />
          <small>Puedes dejarla en blanco si aún no tienes una fecha exacta.</small>
        </div>

        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe el objetivo de la clase, cantidad aproximada de participantes, riesgos que se quieren abordar, etc."
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
          <button
            type="submit"
            className="btn-primario"
            disabled={enviando}
          >
            {enviando ? "Enviando..." : "Registrar clase"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegistrarClase;



