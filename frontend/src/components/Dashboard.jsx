import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container bg-white rounded-lg p-6 shadow-md w-full box-border overflow-hidden">
      <h2 className='text-xl font-semibold text-[#2c3e50] text-center'>Dashboard</h2>
      <div className="dashboard-content w-full mt-5">
        <p className='mb-2'>Bienvenido a tu panel de control, {user?.nombre || user?.email || 'Usuario'}!</p>
        <p>Esta es la página principal de tu aplicación SIGELED.</p>

        <div className="dashboard-stats w-full overflow-x-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-6">
          <div className="stat-card bg-[#2c3e50] text-white rounded-lg p-5 text-center shadow-sm">
            <h3 className='text-lg font-medium'>Usuarios activos</h3>
            <p className="stat-value text-2xl font-bold mt-2">45</p>
          </div>
          <div className="stat-card bg-[#2c3e50] text-white rounded-lg p-5 text-center shadow-sm">
            <h3 className='text-lg font-medium'>Actividades</h3>
            <p className="stat-value text-2xl font-bold mt-2">12</p>
          </div>
          <div className="stat-card bg-[#2c3e50] text-white rounded-lg p-5 text-center shadow-sm">
            <h3 className='text-lg font-medium'>Mensajes</h3>
            <p className="stat-value text-2xl font-bold mt-2">28</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;