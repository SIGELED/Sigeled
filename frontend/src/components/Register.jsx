import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/svg/logoLetras.svg'

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
    <div className='flex flex-row justify-center items-center ml-10'>
      <div className='flex justify-center items-center bg-[#0C1A27] w-[80%] h-[90vh] rounded-2xl'>
        <img src={logo} alt="" className='h-100'/>
      </div>
        <div className="flex justify-end w-[100%] h-screen">
          <div className="w-[90%] h-screen flex flex-col pl-20 pr-20 justify-center p-6">
          <h2 className='text-6xl font-semibold text-start text-[#19F124] mb-5'>Registro de Usuario</h2>
          {error && <div className="error-message bg-red-100 text-red-800 p-3 rounded mb-4 break-words">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <label htmlFor="nombre" className='block mb-2 font-medium'></label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={userData.nombre}
                onChange={handleChange}
                required
                placeholder='Nombre'
                className='w-full text-white pl-5 p-3 bg-[#0E1F30] rounded-xl mb-2 text-3xl focus:outline-none'
              />
            </div>
            
            <div className="form-group mb-4">
              <label htmlFor="email" className='block mb-2 font-medium'></label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                required
                placeholder='Email'
                className='w-full text-white pl-5 p-3 bg-[#0E1F30] rounded-xl mb-2 text-3xl focus:outline-none'
              />
            </div>
            
            <div className="form-group mb-4">
              <label htmlFor="contraseña" className='block mb-2 font-medium'></label>
              <input
                type="password"
                id="contraseña"
                name="contraseña"
                value={userData.contraseña}
                onChange={handleChange}
                required
                placeholder='Contraseña'
                className='w-full text-white pl-5 p-3 bg-[#0E1F30] rounded-xl mb-2 text-3xl focus:outline-none'
              />
            </div>
            
            <div className="form-group mb-4">
              <label htmlFor="confirmarContraseña" className='block mb-2 font-medium'></label>
              <input
                type="password"
                id="confirmarContraseña"
                name="confirmarContraseña"
                value={userData.confirmarContraseña}
                onChange={handleChange}
                required
                placeholder='Confirmar contraseña'
                className='w-full text-white pl-5 p-3 bg-[#0E1F30] rounded-xl mb-2 text-3xl focus:outline-none'
              />
            </div>
            
            <div className="form-group mb-4">
              <label htmlFor="rol" className='block mb-2 font-medium text-white'>Rol</label>
              <select
                id="rol"
                name="rol"
                value={userData.rol}
                onChange={handleChange}
                className='w-full text-white pl-5 p-3 bg-[#0E1F30] rounded-xl mb-2 text-3xl focus:outline-none'
              >
                <option value="docente">Docente</option>
                <option value="rrhh">RRHH</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            
            <button type="submit" className='w-full p-3 bg-transparent border-3 border-[#19F124] text-[#19F124] rounded-full text-3xl font-black hover:bg-[#19F124] hover:text-[#020c14] cursor-pointer transition-colors mt-12'>Registrarse</button>
          </form>
          
          <p className='mt-4 mr-4 text-[1.2rem] text-white text-center'>
            ¿Ya tienes una cuenta? <a href="/login" className='text-[#1cff28] font-black hover:underline'>Iniciar Sesión</a>
          </p>
          </div>
        </div>
    </div>
  );
};

export default Register;