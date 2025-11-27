import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BotonesInicio = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isDashboard = location.pathname.startsWith("/dashboard");
  const isActive = user?.activo === true;

  const displayName = user?.nombre || user?.nombre_completo || user?.email;

  return (
    <div className="relative p-4">
      <nav className="relative p-10 bg-[#020c14] text-white rounded-[100px] flex items-center justify-between">
        
        {!user && (
          <div className="absolute flex space-x-4 transform -translate-x-1/2 left-1/2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center
                h-16 px-10
                rounded-full font-black
                text-[2rem] leading-none whitespace-nowrap
                bg-gray-50 text-[#020c14]
                border-2 border-transparent
                hover:bg-white transition"
              onClick={() => setMenuOpen(false)}
            >
              Iniciar Sesión
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center
                h-16 px-10
                rounded-full font-black
                text-[2rem] leading-none whitespace-nowrap
                bg-transparent text-white
                border-2 border-white
                hover:bg-white hover:text-[#020c14] transition"
              onClick={() => setMenuOpen(false)}
            >
              Registrarse
            </Link>
          </div>
        )}

        {user && isActive && (
          <div className="flex items-center justify-between w-full">
            <span className="text-2xl">
              Bienvenido de vuelta, <span className="font-bold">{displayName}</span>
            </span>

            {!isDashboard && (
              <Link
                to="/dashboard"
                className="px-6 py-3 text-lg font-semibold transition  ml-3 bg-[#030C14] border text-[#19F124] border-[#19F124] rounded-full hover:bg-[#19F124] hover:text-[#030C14]"
              >
                Ir al Dashboard
              </Link>
            )}
          </div>
        )}

        {user && !isActive && (
          <div className="flex items-center justify-between w-full">
            <span className="text-xl">
              Tu cuenta está en revisión. Te avisaremos cuando esté activa.
            </span>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-full border border-white hover:bg-white hover:text-[#020c14] transition"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};

export default BotonesInicio;
