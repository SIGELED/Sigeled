import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';
import storage from '../utils/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restore = async () => {
            try {
                const token = await storage.getItem('userToken');
                const storedUser = await storage.getItem('user');
                console.log('[AuthContext] restore token:', token);
                console.log('[AuthContext] restore user raw:', storedUser);
                if (token) {
                    setAuthToken(token);
                }
                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (e) {
                        console.warn('[AuthContext] storedUser JSON parse error', e);
                    }
                }
            } catch (err) {
                console.error('Error restoring auth', err);
            } finally {
                setLoading(false);
            }
        };
        restore();
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', credentials);
            console.log('[AuthContext] login response:', response.data);
            const { token, user } = response.data;
            if (token) {
                setAuthToken(token);
                await storage.setItem('userToken', token);
                console.log('[AuthContext] saved token to storage');
            }
            if (user) {
                setUser(user);
                await storage.setItem('user', JSON.stringify(user));
                console.log('[AuthContext] saved user to storage');
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
            // optionally call backend logout if exists
            try { await api.post('/auth/logout'); } catch(e) { /* ignore */ }
            setUser(null);
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
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};