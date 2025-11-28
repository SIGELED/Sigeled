import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import NotificationToast from './NotificationToast';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const NotificationManager = () => {
  const { notifications } = useAuth();
  const [currentToast, setCurrentToast] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Cuando llega una nueva notificación, mostrar toast
    if (notifications.length > 0) {
      const latest = notifications[0];
      
      // Solo mostrar toast si es muy reciente (menos de 5 segundos)
      const now = new Date();
      const createdAt = new Date(latest.fecha_creacion);
      const diff = now - createdAt;
      
      if (diff < 5000) {
        setCurrentToast(latest);
      }
    }
  }, [notifications]);

  const handleToastPress = (notification) => {
    // Navegar a la pantalla de notificaciones
    try {
      navigation.navigate('Notificaciones');
    } catch (error) {
      console.log('[NotificationManager] Error navegando:', error);
    }
    setCurrentToast(null);
  };

  const handleToastDismiss = () => {
    setCurrentToast(null);
  };

  if (!currentToast) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <NotificationToast
        notification={currentToast}
        onPress={handleToastPress}
        onDismiss={handleToastDismiss}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});

export default NotificationManager;
