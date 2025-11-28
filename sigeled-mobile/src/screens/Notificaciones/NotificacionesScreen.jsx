import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMisNotificaciones, marcarNotificacionLeida } from '../../services/api';
import NotificationItem from '../../components/NotificationItem';
import colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

const NotificacionesScreen = () => {
  const { notifications, setNotifications, unreadCount, setUnreadCount } = useAuth();
  const [localNotifications, setLocalNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Sincronizar notificaciones del contexto con estado local
  useEffect(() => {
    if (notifications.length > 0) {
      setLocalNotifications(notifications);
    }
  }, [notifications]);

  const fetchNotificaciones = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      setError(null);

      console.log('[Notificaciones] Obteniendo notificaciones...');
      const data = await getMisNotificaciones();
      
      console.log('[Notificaciones] Notificaciones obtenidas:', data.length);
      const notifs = Array.isArray(data) ? data : [];
      setLocalNotifications(notifs);
      setNotifications(notifs);
      
      // Actualizar contador de no leídas
      const noLeidas = notifs.filter(n => !n.leido).length;
      setUnreadCount(noLeidas);
    } catch (err) {
      console.error('[Notificaciones] Error al obtener notificaciones:', err);
      setError(err.message || 'Error al cargar notificaciones');
      
      Alert.alert(
        'Error',
        'No se pudieron cargar las notificaciones. Por favor, intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotificaciones(true);
  }, []);

  const handleNotificacionPress = (notificacion) => {
    // Si no está leída, marcarla como leída
    if (!notificacion.leido && !notificacion.fecha_lectura) {
      handleMarkAsRead(notificacion.id_notificacion);
    }

    // Mostrar detalles completos
    Alert.alert(
      notificacion.tipo || 'Notificación',
      `${notificacion.mensaje}\n\n${notificacion.observacion || ''}`,
      [{ text: 'Cerrar' }]
    );
  };

  const handleMarkAsRead = async (id_notificacion) => {
    try {
      console.log('[Notificaciones] Marcando como leída:', id_notificacion);
      await marcarNotificacionLeida(id_notificacion);
      
      // Actualizar localmente
      const updatedNotifs = localNotifications.map(notif =>
        notif.id_notificacion === id_notificacion
          ? { ...notif, leido: true, fecha_lectura: new Date().toISOString() }
          : notif
      );
      setLocalNotifications(updatedNotifs);
      setNotifications(updatedNotifs);
      
      // Actualizar contador
      const noLeidas = updatedNotifs.filter(n => !n.leido).length;
      setUnreadCount(noLeidas);
    } catch (err) {
      console.error('[Notificaciones] Error al marcar como leída:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const noLeidas = localNotifications.filter(n => !n.leido && !n.fecha_lectura);
    
    if (noLeidas.length === 0) {
      Alert.alert('Info', 'No hay notificaciones sin leer');
      return;
    }

    Alert.alert(
      'Marcar todas como leídas',
      `¿Quieres marcar ${noLeidas.length} notificación${noLeidas.length !== 1 ? 'es' : ''} como leída${noLeidas.length !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Marcar',
          onPress: async () => {
            for (const notif of noLeidas) {
              await handleMarkAsRead(notif.id_notificacion);
            }
          },
        },
      ]
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-outline" size={64} color={colors.text.secondary} />
        <Text style={styles.emptyTitle}>No tienes notificaciones</Text>
        <Text style={styles.emptyText}>
          Cuando recibas notificaciones, aparecerán aquí
        </Text>
      </View>
    );
  };

  const renderHeader = () => {
    if (localNotifications.length === 0) return null;

    const noLeidas = localNotifications.filter(n => !n.leido && !n.fecha_lectura).length;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>
            {noLeidas > 0 
              ? `${noLeidas} sin leer` 
              : 'Todas leídas'
            }
          </Text>
        </View>
        
        {noLeidas > 0 && (
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Ionicons name="checkmark-done" size={18} color={colors.primary.main} />
            <Text style={styles.markAllText}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={localNotifications}
        keyExtractor={(item) => item.id_notificacion?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <NotificationItem 
            notificacion={item} 
            onPress={handleNotificacionPress}
            onMarkAsRead={handleMarkAsRead}
          />
        )}
        contentContainerStyle={[
          styles.listContainer,
          localNotifications.length === 0 && styles.listContainerEmpty
        ]}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.secondary,
  },
  listContainer: {
    padding: 16,
  },
  listContainerEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    backgroundColor: colors.primary.main + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.primary.main + '15',
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary.main,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NotificacionesScreen;
