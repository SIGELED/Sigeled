import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Inicio from './pages/Inicio';
import Perfil from './components/Perfil';
import Revision from './pages/Revision';
import UsuarioDetalle from './pages/dashboard/UsuarioDetalle';

function App() {
  // Simula el token (en producción, obtén el token tras el login/registro)
  const token = localStorage.getItem("token");
   // Aplica color blanco a los textos de inputs e instrucciones
   const inputStyle = { color: '#fff' };

  return (
    <AuthProvider>
      <Router>
        <div className="relative flex flex-col w-full min-h-screen app-container">
          <div className="box-border flex-1 w-full">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Inicio />}/>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/revision" element={<Revision />}/>
              
              {/* Ruta protegida */}
              <Route 
                path="/dashboard/*" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />  

              {/* Redirecciones */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;