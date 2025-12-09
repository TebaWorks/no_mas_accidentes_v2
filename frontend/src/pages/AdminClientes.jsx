import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [modo, setModo] = useState("lista"); // lista | crear | editar
  const [clienteActual, setClienteActual] = useState(null);

  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    nombre: "",
    rut: "",
    direccion: "",
    telefono: "",
    email: "",
    activo: true,
  });

  function resetForm() {
    setForm({
      nombre: "",
      rut: "",
      direccion: "",
      telefono: "",
      email: "",
      activo: true,
    });
    setClienteActual(null);
    setModo("lista");
  }

  async function cargarClientes() {
    setLoading(true);
    setMensaje("");

    try {
      const res = await fetch(`${API_URL}/api/clientes/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        setMensaje("No se pudieron cargar los clientes.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error(error);
      setMensaje("Error al cargar los clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarClientes();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function irACrear() {
    resetForm();
    setModo("crear");
  }

  function irAEditar(cliente) {
    setClienteActual(cliente);
    setForm({
      nombre: cliente.nombre || "",
      rut: cliente.rut || "",
      direccion: cliente.direccion || "",
      telefono: cliente.telefono || "",
      email: cliente.email || "",
      activo: cliente.activo ?? true,
    });
    setModo("editar");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje("");

    const url =
      modo === "crear"
        ? `${API_URL}/api/clientes/`
        : `${API_URL}/api/clientes/${clienteActual.id}/`;

    const method = modo === "crear" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        console.error("Error guardando cliente:", await res.text());
        setMensaje("No se pudo guardar el cliente. Revisa los datos.");
        return;
      }

      setMensaje("Cliente guardado correctamente.");
      resetForm();
      cargarClientes();
    } catch (error) {
      console.error(error);
      setMensaje("Error al guardar el cliente.");
    }
  }

  async function toggleActivo(cliente) {
    try {
      const res = await fetch(`${API_URL}/api/clientes/${cliente.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ activo: !cliente.activo }),
      });

      if (!res.ok) {
        setMensaje("No se pudo actualizar el estado del cliente.");
        return;
      }

      setMensaje("Estado del cliente actualizado.");
      cargarClientes();
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar el cliente.");
    }
  }

  return (
    <div className="card">
      <h2>Gestión de clientes</h2>
      <p className="card-subtitle">
        Como administrador puedes crear, editar y desactivar clientes del
        sistema.
      </p>

      <div
        style={{
          marginTop: "0.5rem",
          display: "flex",
          justifyContent: "space-between",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <button className="btn-primario" type="button" onClick={irACrear}>
          + Nuevo cliente
        </button>
        <button className="btn-secundario" type="button" onClick={cargarClientes}>
          Recargar lista
        </button>
      </div>

      {mensaje && (
        <p style={{ marginTop: "0.6rem", fontSize: "0.9rem" }}>{mensaje}</p>
      )}

      {/* Formulario crear/editar */}
      {(modo === "crear" || modo === "editar") && (
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ marginBottom: "0.4rem" }}>
            {modo === "crear" ? "Crear cliente" : "Editar cliente"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="form-grid form-grid-2"
            style={{
              background: "#f9fafb",
              borderRadius: "12px",
              padding: "0.8rem",
              marginBottom: "1rem",
            }}
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
              <label>Correo electrónico</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={handleChange}
                  style={{ marginRight: "0.35rem" }}
                />
                Cliente activo
              </label>
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
                Guardar
              </button>
              <button
                type="button"
                className="btn-secundario"
                onClick={resetForm}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de clientes */}
      {loading ? (
        <p style={{ marginTop: "1rem" }}>Cargando clientes...</p>
      ) : clientes.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>No hay clientes registrados.</p>
      ) : (
        <div className="table-wrapper" style={{ marginTop: "0.8rem" }}>
          <table className="table-basic">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cli) => (
                <tr key={cli.id}>
                  <td>{cli.nombre}</td>
                  <td>{cli.rut}</td>
                  <td>{cli.telefono || "—"}</td>
                  <td>{cli.email || "—"}</td>
                  <td>
                    <span
                      className={
                        cli.activo
                          ? "chip-estado chip-aceptada"
                          : "chip-estado chip-rechazada"
                      }
                    >
                      {cli.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secundario"
                      style={{ marginRight: "0.3rem" }}
                      onClick={() => irAEditar(cli)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-secundario"
                      onClick={() => toggleActivo(cli)}
                    >
                      {cli.activo ? "Desactivar" : "Activar"}
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

export default AdminClientes;

