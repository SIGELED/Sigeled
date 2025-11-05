import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layout/DashboardLayout';

import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './pages/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Inicio from './pages/Inicio';
import Perfil from './components/Perfil';
import Revision from './pages/Revision';
import RegisterArchivos from './pages/RegisterArchivos';
import MiLegajo from './pages/dashboard/MiLegajo';

function App() {
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
              <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
              <Route path="/revision" element={<ProtectedRoute> <Revision /> </ProtectedRoute>}/>
              <Route path="/registro/archivos" element={<ProtectedRoute><RegisterArchivos /></ProtectedRoute>}/>
              
              <Route element={<DashboardLayout/>}>
                <Route 
                  path="/dashboard/*" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
              </Route>  

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