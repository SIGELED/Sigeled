import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Inicio from './pages/Inicio';
import Perfil from './components/Perfil';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container flex flex-col min-h-screen w-full relative">
          <div className="flex-1 w-full box-border">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Dashboard />}/>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/perfil" element={<Perfil />} />
              
              {/* Ruta protegida */}
              <Route 
                path="/dashboard" 
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