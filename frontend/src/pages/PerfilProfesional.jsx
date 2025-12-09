import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function PerfilProfesional() {
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [detalleError, setDetalleError] = useState("");

  const [form, setForm] = useState({
    username: "",
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

  const token = localStorage.getItem("token");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function cargarPerfil() {
    if (!token) {
      setMensaje("Debes iniciar sesión como profesional para ver tu perfil.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setMensaje("");
    setDetalleError("");

    try {
      const res = await fetch(`${API_URL}/api/profesionales/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
        setMensaje("No se pudo cargar tu perfil.");
        setDetalleError(detalle.slice(0, 800));
        setLoading(false);
        return;
      }

      const data = await res.json();
      setForm({
        username: data.username || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        rut: data.rut || "",
        telefono: data.telefono || "",
        direccion: data.direccion || "",
        especialidad: data.especialidad || "",
        registro_profesional: data.registro_profesional || "",
        disponible: data.disponible ?? true,
      });
    } catch (error) {
      console.error(error);
      setMensaje("Error al cargar tu perfil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      setMensaje("Debes iniciar sesión.");
      return;
    }

    setMensaje("");
    setDetalleError("");

    // No dejamos editar username desde aquí
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      rut: form.rut,
      telefono: form.telefono,
      direccion: form.direccion,
      especialidad: form.especialidad,
      registro_profesional: form.registro_profesional,
      disponible: form.disponible,
    };

    try {
      const res = await fetch(`${API_URL}/api/profesionales/me/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let detalle = "";
        try {
          const dataError = await res.json();
          detalle = JSON.stringify(dataError, null, 2);
        } catch (e) {
          detalle = await res.text();
        }
        console.error("Error actualizando perfil profesional:", detalle);
        setMensaje("No se pudieron guardar los cambios. Revisa los datos.");
        setDetalleError(detalle.slice(0, 800));
        return;
      }

      const data = await res.json();
      setMensaje("Perfil actualizado correctamente.");
      // refrescamos form por si backend ajusta algo
      setForm((prev) => ({
        ...prev,
        especialidad: data.especialidad || prev.especialidad,
        registro_profesional: data.registro_profesional || prev.registro_profesional,
        disponible: data.disponible ?? prev.disponible,
      }));
    } catch (error) {
      console.error(error);
      setMensaje("Error al guardar los cambios.");
    }
  }

  return (
    <div className="card">
      <h2>Mi perfil profesional</h2>
      <p className="card-subtitle">
        Aquí puedes gestionar tus datos personales y profesionales. El
        administrador puede ver todo, pero solo tú puedes actualizar esta
        información (excepto tu eliminación, que es exclusiva del admin).
      </p>

      {loading ? (
        <p style={{ marginTop: "1rem" }}>Cargando tu perfil...</p>
      ) : (
        <>
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
            {/* Username solo lectura */}
            <div className="form-group">
              <label>Usuario (no editable)</label>
              <input value={form.username} disabled />
              <small>Este es tu nombre de usuario para iniciar sesión.</small>
            </div>

            <div className="form-group">
              <label>Nombres</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Tus nombres"
              />
            </div>

            <div className="form-group">
              <label>Apellidos</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Tus apellidos"
              />
            </div>

            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ej: tu.correo@empresa.cl"
              />
            </div>

            <div className="form-group">
              <label>RUT</label>
              <input
                name="rut"
                value={form.rut}
                onChange={handleChange}
                placeholder="Ej: 11.111.111-1"
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej: +56912345678"
              />
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <input
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Ej: Av. Siempre Viva 123, Santiago"
              />
            </div>

            <div className="form-group">
              <label>Especialidad</label>
              <input
                name="especialidad"
                value={form.especialidad}
                onChange={handleChange}
                placeholder="Ej: Prevención de riesgos en minería"
              />
              <small>Esto lo ven los clientes cuando se les asigna tu clase.</small>
            </div>

            <div className="form-group">
              <label>Registro profesional</label>
              <input
                name="registro_profesional"
                value={form.registro_profesional}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="disponible"
                  checked={form.disponible}
                  onChange={handleChange}
                  style={{ marginRight: "0.35rem" }}
                />
                Estoy disponible para recibir nuevas clases
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
                onClick={cargarPerfil}
              >
                Deshacer cambios
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default PerfilProfesional;
