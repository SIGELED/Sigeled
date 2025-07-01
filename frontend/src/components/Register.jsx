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
    rol: 'usuario'
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
    <div className="register-container w-[90%] max-w-md mx-auto mt-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className='text-xl font-semibold text-center text-black mb-5'>Registro de Usuario</h2>
      {error && <div className="error-message bg-red-100 text-red-800 p-3 rounded mb-4 break-words">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-4">
          <label htmlFor="nombre" className='block mb-2 font-medium'>Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={userData.nombre}
            onChange={handleChange}
            required
            className='w-full p-3 border border-gray-300 rounded text-base focus:outline-none focus:border-blue-500'
          />
        </div>
        
        <div className="form-group mb-4">
          <label htmlFor="email" className='block mb-2 font-medium'>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
            className='w-full p-3 border border-gray-300 rounded text-base focus:outline-none focus:border-blue-500'
          />
        </div>
        
        <div className="form-group mb-4">
          <label htmlFor="contraseña" className='block mb-2 font-medium'>Contraseña</label>
          <input
            type="password"
            id="contraseña"
            name="contraseña"
            value={userData.contraseña}
            onChange={handleChange}
            required
            className='w-full p-3 border border-gray-300 rounded text-base focus:outline-none focus:border-blue-500'
          />
        </div>
        
        <div className="form-group mb-4">
          <label htmlFor="confirmarContraseña" className='block mb-2 font-medium'>Confirmar Contraseña</label>
          <input
            type="password"
            id="confirmarContraseña"
            name="confirmarContraseña"
            value={userData.confirmarContraseña}
            onChange={handleChange}
            required
            className='w-full p-3 border border-gray-300 rounded text-base focus:outline-none focus:border-blue-500'
          />
        </div>
        
        <div className="form-group mb-4">
          <label htmlFor="rol" className='block mb-2 font-medium'>Rol</label>
          <select
            id="rol"
            name="rol"
            value={userData.rol}
            onChange={handleChange}
            className='w-full p-3 border border-gray-300 rounded text-base focus:outline-none focus:border-blue-500'
          >
            <option value="usuario">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        
        <button type="submit" className='w-full p-3 bg-[#1aab23] text-white rounded-3xl text-base font-medium hover:bg-[#21ca2c] transition-colors mt-4'>Registrarse</button>
      </form>
      
      <p className='mt-4 text-center text-sm'>
        ¿Ya tienes una cuenta? <a href="/login" className='text-blue-600 hover:underline'>Iniciar Sesión</a>
      </p>
    </div>
  );
};

export default Register;