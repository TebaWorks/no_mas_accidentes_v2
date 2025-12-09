import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [detalleError, setDetalleError] = useState("");
  const [modo, setModo] = useState("lista"); // lista | editar
  const [userActual, setUserActual] = useState(null);

  const token = localStorage.getItem("token");

  // ======================
  // Cargar usuarios
  // ======================
  async function cargarUsuarios() {
    setLoading(true);
    setMensaje("");
    setDetalleError("");

    try {
      const res = await fetch(`${API_URL}/api/usuarios/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        setMensaje("No se pudieron cargar los usuarios.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error(error);
      setMensaje("Error al cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======================
  // Form editar
  // ======================
  const [formEditar, setFormEditar] = useState({
    first_name: "",
    last_name: "",
    email: "",
    rut: "",
    telefono: "",
    direccion: "",
    rol: "CLIENTE",
    is_active: true,
    new_password: "",
  });

  function irAEditar(u) {
    setUserActual(u);
    setFormEditar({
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      email: u.email || "",
      rut: u.profile?.rut || "",
      telefono: u.profile?.telefono || "",
      direccion: u.profile?.direccion || "",
      rol: u.profile?.rol || "CLIENTE",
      is_active: u.is_active,
      new_password: "",
    });
    setModo("editar");
    setMensaje("");
    setDetalleError("");
  }

  function handleChangeEditar(e) {
    const { name, value, type, checked } = e.target;
    setFormEditar((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function volverLista() {
    setModo("lista");
    setUserActual(null);
    setMensaje("");
    setDetalleError("");
  }

  // ======================
  // Guardar cambios usuario
  // ======================
  async function handleSubmitEditar(e) {
    e.preventDefault();
    if (!userActual) return;

    setMensaje("");
    setDetalleError("");

    // Payload para PATCH usuario
    const payload = {
      first_name: formEditar.first_name,
      last_name: formEditar.last_name,
      email: formEditar.email,
      is_active: formEditar.is_active,
      rut: formEditar.rut,
      telefono: formEditar.telefono,
      direccion: formEditar.direccion,
      rol: formEditar.rol,
    };

    try {
      const res = await fetch(`${API_URL}/api/usuarios/${userActual.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let detalle = "";
        try {
          const dataError = await res.json();
          detalle = JSON.stringify(dataError, null, 2);
        } catch (err) {
          detalle = await res.text();
        }
        console.error("Error actualizando usuario:", detalle);
        setMensaje("No se pudo actualizar el usuario.");
        setDetalleError(detalle.slice(0, 800));
        return;
      }

      setMensaje("Usuario actualizado correctamente.");
      await cargarUsuarios();
      volverLista();
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar el usuario.");
    }
  }

  // ======================
  // Resetear contraseña
  // ======================
  async function handleResetPassword() {
    if (!userActual) return;

    if (!formEditar.new_password || formEditar.new_password.length < 4) {
      setMensaje("La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }

    setMensaje("");
    setDetalleError("");

    try {
      const res = await fetch(
        `${API_URL}/api/usuarios/${userActual.id}/reset-password/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ new_password: formEditar.new_password }),
        }
      );

      if (!res.ok) {
        let detalle = "";
        try {
          const dataError = await res.json();
          detalle = JSON.stringify(dataError, null, 2);
        } catch (err) {
          detalle = await res.text();
        }
        console.error("Error reseteando contraseña:", detalle);
        setMensaje("No se pudo resetear la contraseña.");
        setDetalleError(detalle.slice(0, 800));
        return;
      }

      setMensaje("Contraseña resetada correctamente.");
      setFormEditar((prev) => ({ ...prev, new_password: "" }));
    } catch (error) {
      console.error(error);
      setMensaje("Error al resetear la contraseña.");
    }
  }

  // ======================
  // Eliminar usuario (opcional)
  // ======================
  async function eliminarUsuario(u) {
    if (
      !window.confirm(
        `¿Eliminar al usuario "${u.username}"? Esto también puede afectar su perfil asociado.`
      )
    ) {
      return;
    }

    setMensaje("");
    setDetalleError("");

    try {
      const res = await fetch(`${API_URL}/api/usuarios/${u.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.status === 204) {
        setMensaje("Usuario eliminado correctamente.");
        cargarUsuarios();
        return;
      }

      let detalle = "";
      try {
        const dataError = await res.json();
        detalle = JSON.stringify(dataError, null, 2);
      } catch (err) {
        detalle = await res.text();
      }

      setMensaje("No se pudo eliminar el usuario.");
      setDetalleError(detalle.slice(0, 800));
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar el usuario.");
    }
  }

  // ======================
  // UI
  // ======================

  return (
    <div className="card">
      <h2>Gestión de usuarios</h2>
      <p className="card-subtitle">
        Desde aquí el administrador puede consultar usuarios, cambiar su rol,
        actualizar datos de contacto, activar o desactivar cuentas y resetear
        contraseñas.
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
          onClick={cargarUsuarios}
        >
          Recargar lista
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

      {/* Form EDITAR */}
      {modo === "editar" && userActual && (
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ marginBottom: "0.4rem" }}>
            Editar usuario: {userActual.username}
          </h3>
          <form
            onSubmit={handleSubmitEditar}
            className="form-grid form-grid-2"
            style={{
              background: "#f9fafb",
              borderRadius: "12px",
              padding: "0.8rem",
              marginBottom: "1rem",
            }}
          >
            <div className="form-group">
              <label>Nombres</label>
              <input
                name="first_name"
                value={formEditar.first_name}
                onChange={handleChangeEditar}
                placeholder="Nombres"
              />
            </div>

            <div className="form-group">
              <label>Apellidos</label>
              <input
                name="last_name"
                value={formEditar.last_name}
                onChange={handleChangeEditar}
                placeholder="Apellidos"
              />
            </div>

            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                name="email"
                type="email"
                value={formEditar.email}
                onChange={handleChangeEditar}
                placeholder="correo@dominio.cl"
              />
            </div>

            <div className="form-group">
              <label>RUT</label>
              <input
                name="rut"
                value={formEditar.rut}
                onChange={handleChangeEditar}
                placeholder="Ej: 11.111.111-1"
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                name="telefono"
                value={formEditar.telefono}
                onChange={handleChangeEditar}
                placeholder="Ej: +56912345678"
              />
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <input
                name="direccion"
                value={formEditar.direccion}
                onChange={handleChangeEditar}
                placeholder="Dirección"
              />
            </div>

            <div className="form-group">
              <label>Rol</label>
              <select
                name="rol"
                value={formEditar.rol}
                onChange={handleChangeEditar}
              >
                <option value="ADMIN">Administrador</option>
                <option value="PROFESIONAL">Profesional</option>
                <option value="CLIENTE">Cliente / Usuario</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formEditar.is_active}
                  onChange={handleChangeEditar}
                  style={{ marginRight: "0.35rem" }}
                />
                Cuenta activa
              </label>
            </div>

            <div className="form-group">
              <label>Nueva contraseña (opcional)</label>
              <input
                name="new_password"
                type="password"
                value={formEditar.new_password}
                onChange={handleChangeEditar}
                placeholder="Dejar en blanco para no cambiar"
              />
              <button
                type="button"
                className="btn-secundario"
                style={{ marginTop: "0.4rem" }}
                onClick={handleResetPassword}
                disabled={!formEditar.new_password}
              >
                Aplicar nueva contraseña
              </button>
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
                Guardar cambios
              </button>
              <button
                type="button"
                className="btn-secundario"
                onClick={volverLista}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de usuarios */}
      {modo === "lista" && (
        <>
          {loading ? (
            <p style={{ marginTop: "1rem" }}>Cargando usuarios...</p>
          ) : usuarios.length === 0 ? (
            <p style={{ marginTop: "1rem" }}>No hay usuarios.</p>
          ) : (
            <div className="table-wrapper" style={{ marginTop: "0.8rem" }}>
              <table className="table-basic">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>
                        {(u.first_name || u.last_name) ?
                          `${u.first_name || ""} ${u.last_name || ""}`.trim() :
                          "—"}
                      </td>
                      <td>{u.email || "—"}</td>
                      <td>{u.profile?.rol || "—"}</td>
                      <td>
                        <span
                          className={
                            u.is_active
                              ? "chip-estado chip-aceptada"
                              : "chip-estado chip-rechazada"
                          }
                        >
                          {u.is_active ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-secundario"
                          style={{ marginRight: "0.3rem" }}
                          onClick={() => irAEditar(u)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-peligro"
                          onClick={() => eliminarUsuario(u)}
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
        </>
      )}
    </div>
  );
}

export default AdminUsuarios;
