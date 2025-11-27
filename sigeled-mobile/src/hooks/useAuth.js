import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const useAuth = () => {
    const { setUser, setIsAuthenticated } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/api/auth/login', credentials);
            setUser(response.data.user);
            setIsAuthenticated(true);
        } catch (err) {
            setError(err.response.data.message || 'Error de autenticación');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await api.post('/api/auth/logout');
            setUser(null);
            setIsAuthenticated(false);
        } catch (err) {
            setError(err.response.data.message || 'Error al cerrar sesión');
        } finally {
            setLoading(false);
        }
    };

    return {
        login,
        logout,
        loading,
        error,
    };
};

export default useAuth;