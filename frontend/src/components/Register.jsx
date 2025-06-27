import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    contraseña: '',
    confirmarContraseña: '',
    rol: 'docente'
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (userData.contraseña !== userData.confirmarContraseña) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      // Eliminamos confirmarContraseña antes de enviar al servidor
      const { confirmarContraseña, ...dataToSubmit } = userData;
      const response = await authService.register(dataToSubmit);
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Error al registrar usuario');
    }
  };

  return (
    <div className="register-container">
      <h2>Registro de Usuario</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={userData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contraseña">Contraseña</label>
          <input
            type="password"
            id="contraseña"
            name="contraseña"
            value={userData.contraseña}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmarContraseña">Confirmar Contraseña</label>
          <input
            type="password"
            id="confirmarContraseña"
            name="confirmarContraseña"
            value={userData.confirmarContraseña}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="rol">Rol</label>
          <select
            id="rol"
            name="rol"
            value={userData.rol}
            onChange={handleChange}
          >
            <option value="docente">Docente</option>
            <option value="rrhh">RRHH</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        
        <button type="submit">Registrarse</button>
      </form>
      
      <p>
        ¿Ya tienes una cuenta? <a href="/login">Iniciar Sesión</a>
      </p>
    </div>
  );
};

export default Register;