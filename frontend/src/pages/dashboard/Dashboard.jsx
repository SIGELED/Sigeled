import { useAuth } from '../../context/AuthContext';
import Aside from '../../components/Aside';
import Nav from '../../components/Nav';
import { useState, Suspense, lazy } from 'react';
import UsuariosSection from './UsuariosSection';
import UsuarioDetalle from './UsuarioDetalle';
import { Routes, Route } from 'react-router-dom';

const DashboardHome = () => <div>Este es el dasboard</div>
const Legajo = () => <div><h1>Esta es la pestaña legajos</h1></div>
const Contratos = () => <div><h1>Esta es la pestaña contratos</h1></div>

const Dashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="min-h-screen flex bg-[#020c14] text-white">
      <Aside activeSection={activeSection} setActiveSection={setActiveSection}/>
      
      <div className='relative flex-1'> 
        <Nav/>
        <main>
          <Routes>
            <Route path = "/" element={<DashboardHome />}/>
            <Route path = "legajo" element={<Legajo />}/>
            <Route path = "contratos" element={<Contratos />}/>
            <Route path = "usuarios" element={<UsuariosSection user={user} />}/>
            <Route path = "usuarios/:id" element={<UsuarioDetalle />}/>
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;