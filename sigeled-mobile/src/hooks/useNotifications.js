import { useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { marcarNotificacionLeida } from '../services/api';

/**
 * Hook personalizado para manejar notificaciones
 * 
 * @returns {Object} Objeto con notificaciones y métodos para manejarlas
 * 
 * @example
 * const {
 *   notifications,
 *   unreadCount,
 *   markAsRead,
 *   markAllAsRead,
 *   getUnreadNotifications,
 *   getNotificationsByType
 * } = useNotifications();
 */
export const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    setNotifications,
    setUnreadCount,
  } = useContext(AuthContext);

  /**
   * Marcar una notificación como leída
   */
  const markAsRead = useCallback(
    async (id_notificacion) => {
      try {
        await marcarNotificacionLeida(id_notificacion);

        const updatedNotifs = notifications.map((notif) =>
          notif.id_notificacion === id_notificacion
            ? { ...notif, leido: true, fecha_lectura: new Date().toISOString() }
            : notif
        );

        setNotifications(updatedNotifs);

        const noLeidas = updatedNotifs.filter((n) => !n.leido).length;
        setUnreadCount(noLeidas);

        return true;
      } catch (error) {
        console.error('[useNotifications] Error marcando como leída:', error);
        return false;
      }
    },
    [notifications, setNotifications, setUnreadCount]
  );

  /**
   * Marcar todas las notificaciones como leídas
   */
  const markAllAsRead = useCallback(async () => {
    const noLeidas = notifications.filter((n) => !n.leido);

    for (const notif of noLeidas) {
      await markAsRead(notif.id_notificacion);
    }
  }, [notifications, markAsRead]);

  /**
   * Obtener solo las notificaciones no leídas
   */
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((n) => !n.leido);
  }, [notifications]);

  /**
   * Obtener notificaciones por tipo
   */
  const getNotificationsByType = useCallback(
    (tipo) => {
      return notifications.filter((n) => n.tipo === tipo);
    },
    [notifications]
  );

  /**
   * Obtener notificaciones por nivel
   */
  const getNotificationsByLevel = useCallback(
    (nivel) => {
      return notifications.filter((n) => n.nivel === nivel);
    },
    [notifications]
  );

  /**
   * Verificar si hay notificaciones de un tipo específico
   */
  const hasNotificationsOfType = useCallback(
    (tipo) => {
      return notifications.some((n) => n.tipo === tipo && !n.leido);
    },
    [notifications]
  );

  /**
   * Obtener la última notificación
   */
  const getLatestNotification = useCallback(() => {
    return notifications.length > 0 ? notifications[0] : null;
  }, [notifications]);

  /**
   * Obtener notificaciones de las últimas N horas
   */
  const getRecentNotifications = useCallback(
    (hours = 24) => {
      const now = new Date();
      const threshold = new Date(now.getTime() - hours * 60 * 60 * 1000);

      return notifications.filter((n) => {
        const createdAt = new Date(n.fecha_creacion);
        return createdAt >= threshold;
      });
    },
    [notifications]
  );

  return {
    // Estado
    notifications,
    unreadCount,

    // Métodos
    markAsRead,
    markAllAsRead,

    // Utilidades
    getUnreadNotifications,
    getNotificationsByType,
    getNotificationsByLevel,
    hasNotificationsOfType,
    getLatestNotification,
    getRecentNotifications,
  };
};

export default useNotifications;
