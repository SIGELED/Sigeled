import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Inicio from './pages/Inicio';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container flex flex-col min-h-screen w-full relative">
          <Navbar />
          <div className="content flex-1 p-4 w-full max-w-full mx-auto sm:p-6 md:p-8 lg:max-w-[1200px] box-border">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Inicio />}/>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
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