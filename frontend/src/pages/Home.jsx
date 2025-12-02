function Home() {
  return (
    <div className="card">
      <h2>Bienvenido a No Más Accidentes</h2>
      <p>
        Selecciona tu rol en la parte superior (Cliente, Profesional o Admin) y
        utiliza el menú lateral para navegar.
      </p>
      <ul>
        <li><strong>Cliente:</strong> puede registrar nuevas clases y ver sus solicitudes.</li>
        <li><strong>Profesional:</strong> puede revisar las clases asignadas y su información.</li>
        <li><strong>Admin:</strong> gestionará clientes, profesionales y clases (lo implementamos después).</li>
      </ul>
    </div>
  );
}

export default Home;
