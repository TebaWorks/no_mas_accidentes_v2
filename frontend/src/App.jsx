import { useEffect, useState } from "react";

function App() {
  const [mensaje, setMensaje] = useState("Cargando...");

  useEffect(() => {
    // En desarrollo, la API está en localhost:8000
    fetch("http://127.0.0.1:8000/api/ping/")
      .then((res) => res.json())
      .then((data) => {
        setMensaje(data.message);
      })
      .catch((err) => {
        console.error(err);
        setMensaje("Error conectando con la API 😢");
      });
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1>No Más Accidentes - Frontend</h1>
      <p>Respuesta del backend:</p>
      <pre>{mensaje}</pre>
    </div>
  );
}

export default App;
