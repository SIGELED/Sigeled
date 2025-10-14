import { useAuth } from '../../context/AuthContext';
import Aside from '../../components/Aside';
import Nav from '../../components/Nav';
import { useState, Suspense, lazy } from 'react';
import UsuariosSection from './UsuariosSection';
import UsuarioDetalle from './UsuarioDetalle';

const DashboardHome = () => <div>Este es el dasboard</div>
const Legajo = () => <div><h1>Esta es la pestaña legajos</h1></div>
const Contratos = () => <div><h1>Esta es la pestaña contratos</h1></div>
const Usuarios = lazy(() => import('./UsuariosSection'));

const Dashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="min-h-screen flex bg-[#020c14] text-white">
      <Aside activeSection={activeSection} setActiveSection={setActiveSection}/>
      
      <div className='relative flex-1'> 
        <Nav/>
        <main className='pt-20'>
          {activeSection === "dashboard" && <DashboardHome/>}
          {activeSection === "legajo" && <Legajo/>}
          {activeSection === "contratos" && <Contratos/>}
          {activeSection === "usuarios" && (
            <Usuarios user={user} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;