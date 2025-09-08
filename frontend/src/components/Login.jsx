import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/svg/logoLetras.svg';

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
    <div className='flex flex-row justify-center items-center ml-10'>
      <div className='flex justify-center items-center bg-[#0C1A27] w-[80%] h-[90vh] rounded-2xl'>
        <img src={logo} alt="" className='h-100'/>
      </div>
      <div className='flex justify-end w-[100%] h-screen'>
        <div className="w-[90%] h-screen flex flex-col pl-20 pr-20 justify-center p-6">
          <h1 className='text-6xl font-semibold text-start text-[#19F124] mb-5'>Iniciar Sesión</h1>
          {error && <div className="p-3 mb-4 text-red-800 break-words bg-red-100 rounded">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className='block mb-2 font-medium'></label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder='juanqi3489@gmail.com'
                value={credentials.email}
                onChange={handleChange}
                required
                className="w-full text-white pl-5 p-3 bg-[#0E1F30] rounded-xl mb-2 text-3xl focus:outline-none"
              />
            </div>
            
            <div className="mb-5">
              <label htmlFor="contraseña" className='block mb-2 font-black' ></label>
              <input
                type="password"
                id="contraseña"
                name="contraseña"
                placeholder='● ● ● ● ● ●● ● ● '
                value={credentials.contraseña}
                onChange={handleChange}
                required
                className='w-full text-white pl-5 p-3 bg-[#0E1F30] rounded-xl text-3xl focus:outline-none'
              />
            </div>
            <p className='mt-4 mr-4 text-[1.2rem] text-white text-end'>
              ¿No tienes una cuenta? <a href="/register" className='text-[#1cff28] font-black hover:underline'>Registrarse</a>
            </p>
            
            <button type="submit" className='w-full p-3 bg-transparent border-3 border-[#19F124] text-[#19F124] rounded-full text-3xl font-black hover:bg-[#19F124] hover:text-[#020c14] cursor-pointer transition-colors mt-12 '>Ingresar</button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;