import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BotonesInicio = () => {
  const { user, logout } = useAuth()
  const location = useLocation()


  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div className='relative p-4'>
      <nav className="relative p-10 bg-[#020c14] text-white rounded-[100px] flex items-center justify-between ">
        <div className="flex-shrink-0 navbar-brand">
          
        </div>
        
        {!user && (
          <div className='absolute flex space-x-4 transform -translate-x-1/2 left-1/2'>
            <Link to="/login" className='inline-flex items-center justify-center
                h-16 px-10
                rounded-full font-black
                text-[2rem] leading-none whitespace-nowrap
                bg-gray-50 text-[#020c14]
                border-2 border-transparent
                hover:bg-white transition' onClick={() => setMenuOpen(false)}>
              Iniciar Sesión
            </Link>
            <Link to="/register" className='inline-flex items-center justify-center
                h-16 px-10
                rounded-full font-black
                text-[2rem] leading-none whitespace-nowrap
                bg-transparent text-white
                border-2 border-white
                hover:bg-white hover:text-[#020c14] transition
                ' onClick={() => setMenuOpen(false)}>
              Registrarse
            </Link>
          </div>
        )}

        {user &&(
          <div className='flex items-center space-x-4'>
            <span>Bienvenido de vuelta, {user.email}</span>
            <Link to="/dashboard" className='px-4 py-2 transition bg-blue-600 rounded-full font semibold hover:bg-blue-00'>
            Ir al Dashboard
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
};

export default BotonesInicio;