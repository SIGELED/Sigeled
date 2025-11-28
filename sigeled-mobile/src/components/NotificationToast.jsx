import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

const NotificationToast = ({ notification, onPress, onDismiss }) => {
  const [slideAnim] = useState(new Animated.Value(-100));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Animar entrada
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();

    // Auto-ocultar después de 5 segundos
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  }, [slideAnim, onDismiss]);

  const handlePress = useCallback(() => {
    handleDismiss();
    onPress?.(notification);
  }, [notification, onPress, handleDismiss]);

  if (!visible) return null;

  const getNivelIcon = (nivel) => {
    switch (nivel) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'alert-circle';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'error':
        return '#F44336';
      case 'info':
      default:
        return colors.primary.main;
    }
  };

  const iconName = getNivelIcon(notification.nivel);
  const iconColor = getNivelColor(notification.nivel);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.tipo} numberOfLines={1}>
            {notification.tipo || 'Notificación'}
          </Text>
          <Text style={styles.mensaje} numberOfLines={2}>
            {notification.mensaje}
          </Text>
        </View>

        <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  tipo: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  mensaje: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default NotificationToast;
