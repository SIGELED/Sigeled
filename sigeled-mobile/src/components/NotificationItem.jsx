import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const NotificationItem = ({ notificacion, onPress, onMarkAsRead }) => {
  // Formatear fecha y hora
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Ahora';
    const date = new Date(dateString);
    const ahora = new Date();
    const diff = ahora - date;
    
    // Si es menos de 1 hora
    if (diff < 3600000) {
      const minutos = Math.floor(diff / 60000);
      return minutos <= 1 ? 'Hace un momento' : `Hace ${minutos} min`;
    }
    
    // Si es menos de 24 horas
    if (diff < 86400000) {
      const horas = Math.floor(diff / 3600000);
      return `Hace ${horas}h`;
    }
    
    // Si es más de 24 horas
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtener icono según tipo de notificación
  const getIcon = () => {
    const tipo = notificacion.tipo?.toUpperCase() || '';
    
    if (tipo.includes('CONTRATO')) {
      return { name: 'document-text', color: colors.primary.main };
    } else if (tipo.includes('DOCUMENTO') || tipo.includes('LEGAJO')) {
      return { name: 'folder-open', color: colors.status.warning };
    } else if (tipo.includes('ALERTA') || tipo.includes('WARNING')) {
      return { name: 'alert-circle', color: colors.status.error };
    } else if (tipo.includes('TEST') || tipo.includes('INFO')) {
      return { name: 'information-circle', color: colors.status.info };
    } else {
      return { name: 'notifications', color: colors.primary.main };
    }
  };

  // Obtener color según nivel
  const getNivelColor = () => {
    const nivel = notificacion.nivel?.toLowerCase() || 'info';
    
    switch (nivel) {
      case 'error':
      case 'danger':
        return colors.status.error;
      case 'warning':
        return colors.status.warning;
      case 'success':
        return colors.status.success;
      default:
        return colors.status.info;
    }
  };

  const icon = getIcon();
  const nivelColor = getNivelColor();
  const isLeida = notificacion.leido || notificacion.fecha_lectura;

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        !isLeida && styles.containerUnread
      ]} 
      onPress={() => onPress && onPress(notificacion)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: icon.color + '15' }]}>
          <Ionicons name={icon.name} size={24} color={icon.color} />
        </View>
        {!isLeida && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.time}>{formatDateTime(notificacion.fecha_creacion)}</Text>
          {!isLeida && onMarkAsRead && (
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                onMarkAsRead(notificacion.id_notificacion);
              }}
              style={styles.markReadButton}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary.main} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.mensaje, !isLeida && styles.mensajeUnread]}>
          {notificacion.mensaje}
        </Text>

        {notificacion.observacion && (
          <Text style={styles.observacion} numberOfLines={2}>
            {notificacion.observacion}
          </Text>
        )}

        {notificacion.nivel && (
          <View style={[styles.badge, { backgroundColor: nivelColor + '20' }]}>
            <Text style={[styles.badgeText, { color: nivelColor }]}>
              {notificacion.nivel.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  containerUnread: {
    backgroundColor: colors.primary.main + '08',
    borderColor: colors.primary.main + '30',
  },
  iconContainer: {
    marginRight: 12,
    position: 'relative',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.main,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  markReadButton: {
    padding: 4,
  },
  mensaje: {
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  mensajeUnread: {
    fontWeight: '600',
  },
  observacion: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
    lineHeight: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default NotificationItem;
