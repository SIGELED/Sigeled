import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegistroUsuario from "./components/RegistroUsuario.jsx";
import AsignarRolUsuario from "./components/AsignarUsuario.jsx";
import CompletarDatosPersona from "./components/CompletarDatosPersona.jsx";
import Inicio from "./pages/Inicio.jsx";
import Navbar from "./components/Navbar.jsx";

function App() {
  // Simula el token (en producción, obtén el token tras el login/registro)
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/registro" element={<RegistroUsuario />} />
        <Route path="/asignar-rol" element={<AsignarRolUsuario />} />
        <Route path="/completar-datos" element={<CompletarDatosPersona token={token} />} />
      </Routes>
    </Router>
  );
}

export default App;