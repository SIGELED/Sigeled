import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const handleLogout = () => {
    logout();
  };

  const isDashboard = location.pathname.startsWith("/dashboard")

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className='p-4 relative'>
      <nav className="relative navbar bg-[#020c14] text-white p-7 rounded-[100px] flex items-center justify-between ">
        <div className="navbar-brand flex-shrink-0">
          <Link to="/" className='text-xl flex font-bold'>SIGELED</Link>
        </div>

        {!user && (
          <div className='absolute left-1/2 transform -translate-x-1/2 flex space-x-4'>
            <Link to="/login" className='bg-gray-50 text-[#020c14] px-4 flex items-center rounded-full font-bold hover:bg-white transition' onClick={() => setMenuOpen(false)}>
              Iniciar Sesión
            </Link>
            <Link to="/register" className='border-2 border-white text-white px-4 py-2 rounded-full font-bold hover:bg-white hover:text-[#020c14] transition' onClick={() => setMenuOpen(false)}>
              Registrarse
            </Link>
          </div>
        )}

        {user && (
          <div className='flex space-x-4 items-center'>
            <span className='hidden-sm:inline'>Bienvenido, {user.nombre || user.email}</span>
            <Link to="/dashboard" className='bg-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-blue-700 transition' onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
            <Link to="/" onClick={handleLogout} className='bg-red-600 px-2 py-2 rounded-full font-semibold hover:bg-red-700 transition hover:cursor-pointer'>
              Cerrar Sesión
            </Link>

            <Link to="/perfil" className='bg-[#1aab23] px-5 py-2 rounded-full font-semibold hover:bg-[#21ca2c] transition'>
              Mi Perfil
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;