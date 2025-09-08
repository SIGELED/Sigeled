import React, { useState } from "react";

export default function CompletarDatosPersona({ token }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    sexo: "",
    id_tipo_empleado: "",
  });
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/api/persona", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMensaje(data.message || JSON.stringify(data));
  };

  // Aplica color blanco a los textos de inputs e instrucciones
  const inputStyle = { color: '#fff' };
  const labelStyle = { color: '#fff' };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
      <h2 className="text-2xl font-bold text-center" style={labelStyle}>Datos personales</h2>
      <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required style={inputStyle} />
      <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} required style={inputStyle} />
      <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} required style={inputStyle} />
      <input name="sexo" placeholder="Sexo" value={form.sexo} onChange={handleChange} required style={inputStyle} />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
      <div style={labelStyle}>{mensaje}</div>
    </form>
  );
}