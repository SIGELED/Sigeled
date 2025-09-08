// AsignarRolUsuario.jsx
import React, { useState } from 'react';

export default function AsignarRolUsuario() {
  const [id_usuario, setIdUsuario] = useState('');
  const [id_rol, setIdRol] = useState('');
  const [asignado_por, setAsignadoPor] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:4000/api/roles/usuario/asignar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario, id_rol, asignado_por })
    });
    const data = await res.json();
    setMensaje(data.message || JSON.stringify(data));
  };

  // Aplica color blanco a los textos de inputs e instrucciones
  const inputStyle = { color: '#fff' };
  const labelStyle = { color: '#fff' };
  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="ID Usuario" value={id_usuario} onChange={e => setIdUsuario(e.target.value)} style={inputStyle} />
      <input placeholder="ID Rol" value={id_rol} onChange={e => setIdRol(e.target.value)} style={inputStyle} />
      <input placeholder="Asignado por (ID admin)" value={asignado_por} onChange={e => setAsignadoPor(e.target.value)} style={inputStyle} />
      <button type="submit" style={labelStyle}>Asignar Rol</button>
      <div style={labelStyle}>{mensaje}</div>
    </form>
  );
}