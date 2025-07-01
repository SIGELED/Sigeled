import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', contraseña: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await authService.login(credentials);
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="login-container w-[90%] max-w-md mx-auto mt-6 p-6 bg-white rounded-2xl shadow-xl">
      <h2 className='text-xl font-semibold text-center text-black mb-5'>¡Bienvenido de nuevo!</h2>
      {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4 break-words">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className='block mb-2 font-medium'>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded text-base focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="contraseña" className='block mb-2 font-medium'>Contraseña</label>
          <input
            type="password"
            id="contraseña"
            name="contraseña"
            value={credentials.contraseña}
            onChange={handleChange}
            required
            className='w-full p-3 border border-gray-300 rounded text-base focus:outline-none focus:border-blue-500'
          />
        </div>
        
        <button type="submit" className='w-full p-3 bg-[#1aab23] text-white rounded-3xl text-base font-medium hover:bg-[#21ca2c] transition-colors mt-4'>Iniciar Sesión</button>
      </form>
      
      <p className='mt-4 text-center text-sm'>
        ¿No tienes una cuenta? <a href="/register" className='text-blue-600 hover:underline'>Registrarse</a>
      </p>
    </div>
  );
};

export default Login;