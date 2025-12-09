import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function AdminProfesionales() {
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [detalleError, setDetalleError] = useState("");
  const [modo, setModo] = useState("lista"); // lista | crear | editar
  const [profActual, setProfActual] = useState(null);

  const token = localStorage.getItem("token");

  // Formulario para CREAR profesional (usuario + perfil + profesional)
  const [formCrear, setFormCrear] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    rut: "",
    telefono: "",
    direccion: "",
    especialidad: "",
    registro_profesional: "",
    disponible: true,
  });

  // Formulario para EDITAR datos del profesional (no tocamos usuario aquí)
  const [formEditar, setFormEditar] = useState({
    especialidad: "",
    registro_profesional: "",
    disponible: true,
  });

  function resetEstado() {
    setFormCrear({
      username: "",
      password: "",
      first_name: "",
      last_name: "",
      email: "",
      rut: "",
      telefono: "",
      direccion: "",
      especialidad: "",
      registro_profesional: "",
      disponible: true,
    });
    setFormEditar({
      especialidad: "",
      registro_profesional: "",
      disponible: true,
    });
    setProfActual(null);
    setModo("lista");
    setMensaje("");
    setDetalleError("");
  }

  // ======================
  // Cargar profesionales
  // ======================
  async function cargarProfesionales() {
    setLoading(true);
    setMensaje("");
    setDetalleError("");

    try {
      const res = await fetch(`${API_URL}/api/profesionales/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        setMensaje("No se pudieron cargar los profesionales.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setProfesionales(data);
    } catch (error) {
      console.error(error);
      setMensaje("Error al cargar los profesionales.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarProfesionales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======================
  // Handlers formularios
  // ======================
  function handleChangeCrear(e) {
    const { name, value, type, checked } = e.target;
    setFormCrear((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleChangeEditar(e) {
    const { name, value, type, checked } = e.target;
    setFormEditar((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function irACrear() {
    resetEstado();
    setModo("crear");
  }

  function irAEditar(prof) {
    setProfActual(prof);
    setFormEditar({
      especialidad: prof.especialidad || "",
      registro_profesional: prof.registro_profesional || "",
      disponible: prof.disponible ?? true,
    });
    setModo("editar");
  }

  // ======================
  // Validación simple en front
  // ======================
  function validarFormularioCrear() {
    if (!formCrear.username.trim()) {
      return "El nombre de usuario es obligatorio.";
    }
    if (!formCrear.password || formCrear.password.length < 4) {
      return "La contraseña es obligatoria y debe tener al menos 4 caracteres.";
    }
    if (!formCrear.first_name.trim()) {
      return "Los nombres son obligatorios.";
    }
    if (!formCrear.last_name.trim()) {
      return "Los apellidos son obligatorios.";
    }
    if (!formCrear.email.trim()) {
      return "El correo electrónico es obligatorio.";
    }
    if (!formCrear.email.includes("@")) {
      return "El correo electrónico no parece válido.";
    }
    return null;
  }

  // ======================
  // Crear profesional
  // ======================
  async function handleSubmitCrear(e) {
    e.preventDefault();
    setMensaje("");
    setDetalleError("");

    const errorFront = validarFormularioCrear();
    if (errorFront) {
      setMensaje(errorFront);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/profesionales/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(formCrear),
      });

      if (!res.ok) {
        let detalle = "";
        try {
          const dataError = await res.json();
          detalle = JSON.stringify(dataError, null, 2);
        } catch (e) {
          detalle = await res.text();
        }
        console.error("Error creando profesional:", detalle);
        setMensaje("No se pudo crear el profesional. Revisa los datos.");
        setDetalleError(detalle.slice(0, 800));
        return;
      }

      setMensaje("Profesional creado correctamente.");
      resetEstado();
      cargarProfesionales();
    } catch (error) {
      console.error(error);
      setMensaje("Error al crear el profesional (fallo de red o servidor).");
    }
  }

  // ======================
  // Editar profesional (solo especialidad / registro / disponible)
  // ======================
  async function handleSubmitEditar(e) {
    e.preventDefault();
    if (!profActual) return;
    setMensaje("");
    setDetalleError("");

    try {
      const res = await fetch(
        `${API_URL}/api/profesionales/${profActual.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(formEditar),
        }
      );

      if (!res.ok) {
        let detalle = "";
        try {
          const dataError = await res.json();
          detalle = JSON.stringify(dataError, null, 2);
        } catch (e) {
          detalle = await res.text();
        }
        console.error("Error editando profesional:", detalle);
        setMensaje("No se pudo actualizar el profesional.");
        setDetalleError(detalle.slice(0, 800));
        return;
      }

      setMensaje("Profesional actualizado correctamente.");
      resetEstado();
      cargarProfesionales();
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar el profesional.");
    }
  }

  // ======================
  // Toggle disponibilidad
  // ======================
  async function toggleDisponibilidad(prof) {
    setMensaje("");
    setDetalleError("");
    try {
      const res = await fetch(`${API_URL}/api/profesionales/${prof.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ disponible: !prof.disponible }),
      });

      if (!res.ok) {
        let detalle = "";
        try {
          const dataError = await res.json();
          detalle = JSON.stringify(dataError, null, 2);
        } catch (e) {
          detalle = await res.text();
        }
        setMensaje("No se pudo actualizar la disponibilidad.");
        setDetalleError(detalle.slice(0, 800));
        return;
      }

      setMensaje("Disponibilidad actualizada.");
      cargarProfesionales();
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar la disponibilidad.");
    }
  }

  // ======================
  // Eliminar profesional
  // ======================
  async function eliminarProfesional(prof) {
    const nombreMostrar = prof.nombre_completo || prof.username || `ID ${prof.id}`;

    if (
      !window.confirm(
        `¿Eliminar al profesional "${nombreMostrar}" y su usuario asociado? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setMensaje("");
    setDetalleError("");

    try {
      const res = await fetch(`${API_URL}/api/profesionales/${prof.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.status === 204) {
        setMensaje("Profesional eliminado correctamente.");
        cargarProfesionales();
        return;
      }

      let detalle = "";
      try {
        const dataError = await res.json();
        detalle = JSON.stringify(dataError, null, 2);
      } catch (e) {
        detalle = await res.text();
      }

      setMensaje("No se pudo eliminar el profesional.");
      setDetalleError(detalle.slice(0, 800));
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar el profesional.");
    }
  }

  // ======================
  // UI
  // ======================

  const totalDisponibles = profesionales.filter((p) => p.disponible).length;
  const totalNoDisponibles = profesionales.filter((p) => !p.disponible).length;

  return (
    <div className="card">
      <h2>Gestión de profesionales</h2>
      <p className="card-subtitle">
        Como administrador puedes crear profesionales desde cero (usuario, perfil y
        datos técnicos), editar su información y administrar su disponibilidad.
      </p>

      <div className="grid-resumen">
        <div className="card" style={{ padding: "0.8rem" }}>
          <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Total</p>
          <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            {profesionales.length}
          </p>
        </div>
        <div className="card" style={{ padding: "0.8rem" }}>
          <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Disponibles</p>
          <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            {totalDisponibles}
          </p>
        </div>
        <div className="card" style={{ padding: "0.8rem" }}>
          <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>No disponibles</p>
          <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            {totalNoDisponibles}
          </p>
        </div>
      </div>

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
          + Nuevo profesional
        </button>
        <button
          className="btn-secundario"
          type="button"
          onClick={cargarProfesionales}
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

      {/* Form CREAR */}
      {modo === "crear" && (
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ marginBottom: "0.4rem" }}>Crear profesional</h3>
          <form
            onSubmit={handleSubmitCrear}
            className="form-grid form-grid-2"
            style={{
              background: "#f9fafb",
              borderRadius: "12px",
              padding: "0.8rem",
              marginBottom: "1rem",
            }}
          >
            <div className="form-group">
              <label>Nombre de usuario (login)</label>
              <input
                name="username"
                value={formCrear.username}
                onChange={handleChangeCrear}
                required
                placeholder="Ej: jperez_pro"
              />
              <small>Debe ser único. Se usará para iniciar sesión.</small>
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                name="password"
                type="password"
                value={formCrear.password}
                onChange={handleChangeCrear}
                required
                placeholder="Mínimo 4 caracteres"
              />
              <small>
                No se muestra luego. El profesional la podrá cambiar más
                adelante.
              </small>
            </div>

            <div className="form-group">
              <label>Nombres</label>
              <input
                name="first_name"
                value={formCrear.first_name}
                onChange={handleChangeCrear}
                required
                placeholder="Ej: Juan Andrés"
              />
            </div>

            <div className="form-group">
              <label>Apellidos</label>
              <input
                name="last_name"
                value={formCrear.last_name}
                onChange={handleChangeCrear}
                required
                placeholder="Ej: Pérez Soto"
              />
            </div>

            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                name="email"
                type="email"
                value={formCrear.email}
                onChange={handleChangeCrear}
                required
                placeholder="Ej: juan.perez@empresa.cl"
              />
            </div>

            <div className="form-group">
              <label>RUT</label>
              <input
                name="rut"
                value={formCrear.rut}
                onChange={handleChangeCrear}
                placeholder="Ej: 11.111.111-1"
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                name="telefono"
                value={formCrear.telefono}
                onChange={handleChangeCrear}
                placeholder="Ej: +56912345678"
              />
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <input
                name="direccion"
                value={formCrear.direccion}
                onChange={handleChangeCrear}
                placeholder="Ej: Av. Siempre Viva 123, Santiago"
              />
            </div>

            <div className="form-group">
              <label>Especialidad</label>
              <input
                name="especialidad"
                value={formCrear.especialidad}
                onChange={handleChangeCrear}
                placeholder="Ej: Prevención de riesgos en construcción"
              />
              <small>Esto sí es visible para los clientes.</small>
            </div>

            <div className="form-group">
              <label>Registro profesional</label>
              <input
                name="registro_profesional"
                value={formCrear.registro_profesional}
                onChange={handleChangeCrear}
                placeholder="N° de registro, matrícula, etc."
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="disponible"
                  checked={formCrear.disponible}
                  onChange={handleChangeCrear}
                  style={{ marginRight: "0.35rem" }}
                />
                Profesional disponible
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
                Crear profesional
              </button>
              <button
                type="button"
                className="btn-secundario"
                onClick={resetEstado}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Form EDITAR */}
      {modo === "editar" && profActual && (
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ marginBottom: "0.4rem" }}>
            Editar profesional:{" "}
            {profActual.nombre_completo || profActual.username || `ID ${profActual.id}`}
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
              <label>Especialidad</label>
              <input
                name="especialidad"
                value={formEditar.especialidad}
                onChange={handleChangeEditar}
                placeholder="Ej: Prevención de riesgos en minería"
              />
            </div>

            <div className="form-group">
              <label>Registro profesional</label>
              <input
                name="registro_profesional"
                value={formEditar.registro_profesional}
                onChange={handleChangeEditar}
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="disponible"
                  checked={formEditar.disponible}
                  onChange={handleChangeEditar}
                  style={{ marginRight: "0.35rem" }}
                />
                Profesional disponible
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
                Guardar cambios
              </button>
              <button
                type="button"
                className="btn-secundario"
                onClick={resetEstado}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <p style={{ marginTop: "1rem" }}>Cargando profesionales...</p>
      ) : profesionales.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>No hay profesionales registrados.</p>
      ) : (
        <div className="table-wrapper" style={{ marginTop: "0.8rem" }}>
          <table className="table-basic">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Especialidad</th>
                <th>Registro</th>
                <th>Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profesionales.map((prof) => (
                <tr key={prof.id}>
                  <td>{prof.id}</td>
                  <td>{prof.username || prof.user || "—"}</td>
                  <td>{prof.nombre_completo || "—"}</td>
                  <td>{prof.especialidad || "—"}</td>
                  <td>{prof.registro_profesional || "—"}</td>
                  <td>
                    <span
                      className={
                        prof.disponible
                          ? "chip-estado chip-aceptada"
                          : "chip-estado chip-rechazada"
                      }
                    >
                      {prof.disponible ? "Disponible" : "No disponible"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secundario"
                      style={{ marginRight: "0.3rem" }}
                      onClick={() => irAEditar(prof)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-secundario"
                      style={{ marginRight: "0.3rem" }}
                      onClick={() => toggleDisponibilidad(prof)}
                    >
                      {prof.disponible ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      className="btn-peligro"
                      onClick={() => eliminarProfesional(prof)}
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

export default AdminProfesionales;
