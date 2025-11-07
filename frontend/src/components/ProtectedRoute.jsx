import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const hasToken = !!localStorage.getItem('token');
  
  if (loading) {
    return <div className="p-8 mx-auto text-lg text-center loading">Cargando...</div>;
  }
  
  if (!user && !hasToken) {
    return <Navigate to="/" />;
  }
  
  return children;
};

export default ProtectedRoute;