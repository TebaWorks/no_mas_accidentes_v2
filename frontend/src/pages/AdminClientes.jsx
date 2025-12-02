import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeError, setMensajeError] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    rut: "",
    direccion: "",
    telefono: "",
    email: "",
  });
  const [enviando, setEnviando] = useState(false);

  async function cargarClientes() {
    setLoading(true);
    setMensajeError("");
    try {
      const res = await fetch(`${API_URL}/api/clientes/`);
      if (!res.ok) throw new Error("Error al cargar clientes");
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error(err);
      setMensajeError("No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarClientes();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setMensajeError("");

    try {
      const res = await fetch(`${API_URL}/api/clientes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        console.error("Error al crear cliente", await res.text());
        throw new Error("Error al crear cliente");
      }

      setForm({
        nombre: "",
        rut: "",
        direccion: "",
        telefono: "",
        email: "",
      });
      await cargarClientes();
    } catch (err) {
      console.error(err);
      setMensajeError("No se pudo crear el cliente. Revisa los datos.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="card">
      <h2>Gestión de clientes (Admin)</h2>

      {mensajeError && (
        <p style={{ color: "#b00020", marginTop: "0.5rem" }}>{mensajeError}</p>
      )}

      <h3 style={{ marginTop: "1rem" }}>Crear nuevo cliente</h3>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "0.5rem", marginTop: "0.5rem" }}
      >
        <div className="form-group">
          <label>Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>RUT Empresa</label>
          <input
            name="rut"
            value={form.rut}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Dirección</label>
          <input
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-primario" disabled={enviando}>
          {enviando ? "Guardando..." : "Crear cliente"}
        </button>
      </form>

      <h3 style={{ marginTop: "1.5rem" }}>Listado de clientes</h3>

      {loading ? (
        <p>Cargando clientes...</p>
      ) : clientes.length === 0 ? (
        <p>No hay clientes registrados.</p>
      ) : (
        <div className="lista-clases">
          {clientes.map((c) => (
            <div key={c.id} className="item-clase">
              <h4>{c.nombre}</h4>
              <p>
                <strong>RUT:</strong> {c.rut}
              </p>
              {c.direccion && (
                <p>
                  <strong>Dirección:</strong> {c.direccion}
                </p>
              )}
              {c.telefono && (
                <p>
                  <strong>Teléfono:</strong> {c.telefono}
                </p>
              )}
              {c.email && (
                <p>
                  <strong>Email:</strong> {c.email}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminClientes;
