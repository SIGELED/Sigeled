import { createContext, useState, useEffect, useContext, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        let parsed = JSON.parse(userData);
        if (!parsed.id_persona) {
          const parts = token.split('.');
          if (parts.length === 3) {
            try {
              const payload = JSON.parse(atob(parts[1]));
              if (payload?.id_persona) {
                parsed = { ...parsed, id_persona: payload.id_persona };
              }
            } catch {}
          }
        }
        setUser(parsed);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateUser = useCallback((partialOrUpdater) => {
    setUser(prev => {
      const next = typeof partialOrUpdater === 'function'
        ? partialOrUpdater(prev)
        : { ...prev, ...partialOrUpdater };
        localStorage.setItem('user', JSON.stringify(next));
        return next;
    });
}, []);

  const updateUserPerfiles = useCallback((perfiles) => {
    updateUser(prev => ({ ...prev, perfiles }));
  }, [updateUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, updateUserPerfiles }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);