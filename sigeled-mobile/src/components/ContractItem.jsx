import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const ContractItem = ({ contrato, onPress }) => {
  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Determinar si el contrato está activo o próximo a vencer
  const getEstado = () => {
    const hoy = new Date();
    const fechaFin = new Date(contrato.fecha_fin);
    const diasRestantes = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return { texto: 'Vencido', color: colors.status.error };
    } else if (diasRestantes <= 30) {
      return { texto: 'Próximo a vencer', color: colors.status.warning };
    } else {
      return { texto: 'Activo', color: colors.status.success };
    }
  };

  const estado = getEstado();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress && onPress(contrato)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="document-text-outline" size={24} color={colors.primary.main} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {contrato.nombre_materia || 'Contrato'}
          </Text>
          <View style={[styles.badge, { backgroundColor: estado.color + '20' }]}>
            <Text style={[styles.badgeText, { color: estado.color }]}>
              {estado.texto}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>
            {formatDate(contrato.fecha_inicio)} - {formatDate(contrato.fecha_fin)}
          </Text>
        </View>

        {contrato.horas_semanales && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {contrato.horas_semanales} horas/semana
            </Text>
          </View>
        )}

        {contrato.nombre_carrera && (
          <View style={styles.detailRow}>
            <Ionicons name="school-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {contrato.nombre_carrera}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default ContractItem;
