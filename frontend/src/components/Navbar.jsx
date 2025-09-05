import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Inicio</Link> |{" "}
      <Link to="/registro">Registro</Link> |{" "}
      <Link to="/asignar-rol">Asignar Rol</Link>
    </nav>
  );
}