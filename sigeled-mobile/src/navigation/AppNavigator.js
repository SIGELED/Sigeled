import React, { useEffect, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigationContainerRef } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { useAuth } from '../context/AuthContext';
import storage from '../utils/storage';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading, logout } = useAuth();
  const routeNameRef = useRef();
  const navigationRef = useNavigationContainerRef();

  // Verificar si la sesión sigue siendo válida al montar y periódicamente
  useEffect(() => {
    const checkSession = async () => {
      if (user) {
        const token = await storage.getItem('userToken');
        if (!token) {
          // Si hay user pero no token, limpiar la sesión
          console.warn('[AppNavigator] Usuario sin token válido, cerrando sesión');
          await logout();
        }
      }
    };
    
    // Verificar al montar
    checkSession();
    
    // Verificar periódicamente cada 30 segundos
    const interval = setInterval(checkSession, 30000);
    
    return () => clearInterval(interval);
  }, [user, logout]);

  // Listener para detectar cambios de navegación y validar token
  useEffect(() => {
    const validateOnNavigate = async () => {
      if (user) {
        const token = await storage.getItem('userToken');
        if (!token && navigationRef.isReady()) {
          console.warn('[AppNavigator] Token no válido durante navegación');
          await logout();
        }
      }
    };

    if (navigationRef.isReady()) {
      const unsubscribe = navigationRef.addListener('state', () => {
        validateOnNavigate();
      });
      return unsubscribe;
    }
  }, [user, navigationRef, logout]);

  if (loading) return null; // o un componente Loading

  return (
      <Stack.Navigator 
        ref={navigationRef}
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false // Deshabilitar gestos de retroceso en iOS
        }} 
        initialRouteName={user ? 'Main' : 'Auth'}
      >
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Main" 
          component={MainTabNavigator}
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
  );
};
};

export default AppNavigator;