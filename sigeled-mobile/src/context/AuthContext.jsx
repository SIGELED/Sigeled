import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';
import storage from '../utils/storage';
import { isTokenExpired } from '../utils/jwtHelper';
import socketService from '../services/socketService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Configurar listener de notificaciones en tiempo real
    useEffect(() => {
        const handleNewNotification = (notificacion) => {
            console.log('[AuthContext] Nueva notificación recibida:', notificacion);
            setNotifications((prev) => [notificacion, ...prev]);
            if (!notificacion.leido) {
                setUnreadCount((prev) => prev + 1);
            }
        };

        socketService.on('nueva_notificacion', handleNewNotification);

        return () => {
            socketService.off('nueva_notificacion', handleNewNotification);
        };
    }, []);

    useEffect(() => {
        const restore = async () => {
            try {
                const token = await storage.getItem('userToken');
                const storedUser = await storage.getItem('user');
                console.log('[AuthContext] restore token:', token ? 'presente' : 'null');
                console.log('[AuthContext] restore user:', storedUser ? 'presente' : 'null');
                
                if (token && storedUser) {
                    // Verificar si el token ha expirado
                    if (isTokenExpired(token)) {
                        console.warn('[AuthContext] Token expirado al restaurar, limpiando sesión');
                        await storage.deleteItem('userToken');
                        await storage.deleteItem('user');
                        setAuthToken(null);
                    } else {
                        setAuthToken(token);
                        try {
                            setUser(JSON.parse(storedUser));
                            // Conectar socket después de restaurar sesión
                            socketService.connect(token);
                        } catch (e) {
                            console.warn('[AuthContext] storedUser JSON parse error', e);
                            // Si hay error parseando, limpiar todo
                            await storage.deleteItem('userToken');
                            await storage.deleteItem('user');
                            setAuthToken(null);
                        }
                    }
                } else {
                    // Si falta alguno, limpiar ambos
                    await storage.deleteItem('userToken');
                    await storage.deleteItem('user');
                    setAuthToken(null);
                }
            } catch (err) {
                console.error('Error restoring auth', err);
            } finally {
                setLoading(false);
            }
        };
        restore();
    }, []);

    // Verificar periódicamente si el token ha expirado
    useEffect(() => {
        if (!user) return;

        const checkTokenExpiration = async () => {
            const token = await storage.getItem('userToken');
            if (token && isTokenExpired(token)) {
                console.warn('[AuthContext] Token expirado detectado, cerrando sesión automáticamente');
                await logout();
            }
        };

        // Verificar cada 1 minuto
        const interval = setInterval(checkTokenExpiration, 60000);

        return () => clearInterval(interval);
    }, [user]);

    const login = async (credentials) => {
        setLoading(true);
        try {
            // Limpiar cualquier token antiguo antes de intentar login
            await storage.deleteItem('userToken');
            await storage.deleteItem('user');
            setAuthToken(null);
            console.log('[AuthContext] cleaned old session before login');
            
            const response = await api.post('/auth/login', credentials);
            console.log('[AuthContext] login response:', response.data);
            const { token, user } = response.data;
            
            // Guardar token primero
            if (token) {
                await storage.setItem('userToken', token);
                setAuthToken(token);
                console.log('[AuthContext] saved token to storage');
            }
            
            // Luego guardar usuario
            if (user) {
                await storage.setItem('user', JSON.stringify(user));
                setUser(user);
                console.log('[AuthContext] saved user to storage');
                
                // Conectar socket después de login exitoso
                socketService.connect(token);
            } else {
                console.warn('[AuthContext] login response user is undefined');
            }
            
            return response.data;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            // Desconectar socket antes de limpiar sesión
            socketService.disconnect();
            
            // Limpiar solo el almacenamiento local
            // No es necesario llamar al backend con JWT
            setUser(null);
            setNotifications([]);
            setUnreadCount(0);
            await storage.deleteItem('userToken');
            await storage.deleteItem('user');
            setAuthToken(null);
            console.log('[AuthContext] logged out and cleared storage');
        } catch (error) {
            console.error("Logout error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, notifications, unreadCount, setNotifications, setUnreadCount }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};