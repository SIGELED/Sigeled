import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

/**
 * Badge para mostrar contador de notificaciones no leídas
 * Uso:
 * 
 * import NotificationBadge from './NotificationBadge';
 * import { useAuth } from '../context/AuthContext';
 * 
 * const MiComponente = () => {
 *   const { unreadCount } = useAuth();
 *   
 *   return (
 *     <View>
 *       <Ionicons name="notifications" size={24} />
 *       {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
 *     </View>
 *   );
 * };
 */
const NotificationBadge = ({ count, style }) => {
  if (!count || count === 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>{displayCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error?.main || '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default NotificationBadge;
