import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">SIGELED</Link>
        <button className="navbar-toggle" onClick={toggleMenu}>
          <span className="navbar-toggle-icon"></span>
        </button>
      </div>
      <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
        {user ? (
          <>
            <span className="navbar-welcome">Bienvenido, {user.nombre || user.email}</span>
            <Link to="/dashboard" className="navbar-item" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <button onClick={handleLogout} className="navbar-button">Cerrar Sesión</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-item" onClick={() => setMenuOpen(false)}>Iniciar Sesión</Link>
            <Link to="/register" className="navbar-item" onClick={() => setMenuOpen(false)}>Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;