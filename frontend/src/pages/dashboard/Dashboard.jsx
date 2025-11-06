import { useAuth } from '../../context/AuthContext';
import Nav from '../../components/Nav';
import { Suspense, lazy } from 'react';
import Contratos from './Contratos';
import RequireRoles from '../../components/RequireRoles';
import UsuariosSection from './UsuariosSection';
import UsuarioDetalle from './UsuarioDetalle';
import MiLegajo from './MiLegajo';
import DashboardHome from './home/DashboardHome';
import MisContratos from './MisContratos';
import { Routes, Route } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#020c14] text-white">
      <div className='relative flex-1'> 
        <Nav/>
        <main>
          <Suspense fallback={<div className='p-6'>Cargando página...</div>}>
            <Routes>
              <Route path = "/" element={<DashboardHome />}/>
              <Route path = "legajo" element={<MiLegajo />}/>
              <Route path = "mis-contratos" element={<MisContratos />}/>

              <Route element={<RequireRoles anyOf={["ADMIN", "RRHH", "RECURSOS HUMANOS", "ADMINISTRADOR"]}/>}>
                <Route path = "usuarios" element={<UsuariosSection user={user} />}/>
                <Route path = "usuarios/:id" element={<UsuarioDetalle />}/>
                <Route path = "contratos" element={<Contratos />}/>
              </Route>
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;