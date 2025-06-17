import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="dashboard-content">
        <p>Bienvenido a tu panel de control, {user?.nombre || user?.email || 'Usuario'}!</p>
        <p>Esta es la página principal de tu aplicación SIGELED.</p>
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Usuarios activos</h3>
            <p className="stat-value">45</p>
          </div>
          <div className="stat-card">
            <h3>Actividades</h3>
            <p className="stat-value">12</p>
          </div>
          <div className="stat-card">
            <h3>Mensajes</h3>
            <p className="stat-value">28</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;