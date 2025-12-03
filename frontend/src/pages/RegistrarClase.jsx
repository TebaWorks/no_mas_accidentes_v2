import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function RegistrarClase() {
  const [clientes, setClientes] = useState([]);
  const [usuariosCliente, setUsuariosCliente] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha_solicitada: "",
    modalidad: "",
    cliente: "",
    solicitada_por_id: "",
  });

  const [estadoEnvio, setEstadoEnvio] = useState(null); // "ok" | "error" | null
  const [mensajeError, setMensajeError] = useState("");

  // Cargar clientes al montar el componente
  useEffect(() => {
    async function fetchClientes() {
      try {
        const res = await fetch(`${API_URL}/api/clientes/`);
        if (!res.ok) {
          throw new Error("No se pudo cargar la lista de clientes");
        }
        const data = await res.json();
        setClientes(data);
      } catch (error) {
        console.error(error);
        setMensajeError("Error al cargar clientes. Intenta más tarde.");
      } finally {
        setLoadingClientes(false);
      }
    }

    fetchClientes();
  }, []);

  // Cargar usuarios de rol CLIENTE para selector de "solicitada por"
  useEffect(() => {
    async function fetchUsuariosCliente() {
      setLoadingUsuarios(true);
      try {
        const res = await fetch(`${API_URL}/api/usuarios/?rol=CLIENTE`);
        if (!res.ok) {
          throw new Error("No se pudo cargar usuarios cliente");
        }
        const data = await res.json();
        setUsuariosCliente(data);
      } catch (error) {
        console.error(error);
        // no es crítico, puede seguir sin usuarios
      } finally {
        setLoadingUsuarios(false);
      }
    }

    fetchUsuariosCliente();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEstadoEnvio(null);
    setMensajeError("");

    // Validaciones simples
    if (!form.titulo || !form.descripcion || !form.cliente) {
      setMensajeError("Título, descripción y cliente son obligatorios.");
      return;
    }

    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      fecha_solicitada: form.fecha_solicitada || null,
      modalidad: form.modalidad,
      cliente: form.cliente ? Number(form.cliente) : null,
      // Si se seleccionó un usuario solicitante, lo mandamos
      solicitada_por_id: form.solicitada_por_id
        ? Number(form.solicitada_por_id)
        : null,
    };

    try {
      const res = await fetch(`${API_URL}/api/clases/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Error al crear clase:", errorData);
        setEstadoEnvio("error");
        setMensajeError("No se pudo registrar la clase. Revisa los datos.");
        return;
      }

      // Si todo OK
      setEstadoEnvio("ok");
      setForm({
        titulo: "",
        descripcion: "",
        fecha_solicitada: "",
        modalidad: "",
        cliente: "",
        solicitada_por_id: "",
      });
    } catch (error) {
      console.error(error);
      setEstadoEnvio("error");
      setMensajeError("Ocurrió un error al enviar el formulario.");
    }
  }

  return (
    <div className="card">
      <h2>Registrar nueva clase</h2>
      <p>
        Como <strong>cliente</strong>, aquí puedes solicitar una nueva clase o asesoría
        para tu empresa.
      </p>

      {loadingClientes && <p>Cargando clientes...</p>}

      {!loadingClientes && clientes.length === 0 && (
        <p style={{ color: "#b00020" }}>
          No hay clientes registrados. Pídele al administrador que cree tu empresa primero.
        </p>
      )}

      {mensajeError && (
        <p style={{ color: "#b00020", marginTop: "0.5rem" }}>{mensajeError}</p>
      )}

      {estadoEnvio === "ok" && (
        <p style={{ color: "green", marginTop: "0.5rem" }}>
          Clase registrada correctamente ✅
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="form"
        style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}
      >
        <div className="form-group">
          <label htmlFor="cliente">Cliente (empresa)</label>
          <select
            id="cliente"
            name="cliente"
            value={form.cliente}
            onChange={handleChange}
            disabled={loadingClientes || clientes.length === 0}
            required
          >
            <option value="">Selecciona un cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.rut})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="solicitada_por_id">Solicitada por (usuario)</label>
          <select
            id="solicitada_por_id"
            name="solicitada_por_id"
            value={form.solicitada_por_id}
            onChange={handleChange}
            disabled={loadingUsuarios || usuariosCliente.length === 0}
          >
            <option value="">Opcional: selecciona un usuario...</option>
            {usuariosCliente.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}{" "}
                {u.first_name || u.last_name
                  ? `- ${u.first_name || ""} ${u.last_name || ""}`
                  : ""}
              </option>
            ))}
          </select>
          {loadingUsuarios && (
            <small>Cargando usuarios cliente...</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="titulo">Título</label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            value={form.titulo}
            onChange={handleChange}
            placeholder="Ej: Capacitación en uso de EPP"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            rows={4}
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Describe la necesidad, lugar, cantidad de participantes, etc."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fecha_solicitada">Fecha solicitada</label>
          <input
            id="fecha_solicitada"
            name="fecha_solicitada"
            type="date"
            value={form.fecha_solicitada}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="modalidad">Modalidad</label>
          <input
            id="modalidad"
            name="modalidad"
            type="text"
            value={form.modalidad}
            onChange={handleChange}
            placeholder="Presencial, Online, Mixta..."
          />
        </div>

        <button type="submit" className="btn-primario">
          Registrar clase
        </button>
      </form>
    </div>
  );
}

export default RegistrarClase;

