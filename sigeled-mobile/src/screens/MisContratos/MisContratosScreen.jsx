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
import { getMisContratos } from '../../services/api';
import ContractItem from '../../components/ContractItem';
import colors from '../../theme/colors';

const MisContratosScreen = () => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchContratos = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      setError(null);

      console.log('[MisContratos] Obteniendo contratos...');
      const data = await getMisContratos();
      
      console.log('[MisContratos] Contratos obtenidos:', data.length);
      setContratos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[MisContratos] Error al obtener contratos:', err);
      setError(err.message || 'Error al cargar contratos');
      
      Alert.alert(
        'Error',
        'No se pudieron cargar los contratos. Por favor, intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContratos();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchContratos(true);
  }, []);

  const handleContratoPress = (contrato) => {
    // Mostrar detalles del contrato
    Alert.alert(
      'Detalles del Contrato',
      `Materia: ${contrato.nombre_materia || 'N/A'}\n` +
      `Carrera: ${contrato.nombre_carrera || 'N/A'}\n` +
      `Horas/semana: ${contrato.horas_semanales || 'N/A'}\n` +
      `Fecha inicio: ${new Date(contrato.fecha_inicio).toLocaleDateString('es-AR')}\n` +
      `Fecha fin: ${new Date(contrato.fecha_fin).toLocaleDateString('es-AR')}`,
      [{ text: 'Cerrar' }]
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={colors.text.secondary} />
        <Text style={styles.emptyTitle}>No tienes contratos</Text>
        <Text style={styles.emptyText}>
          Cuando se te asigne un contrato, aparecerá aquí
        </Text>
      </View>
    );
  };

  const renderHeader = () => {
    if (contratos.length === 0) return null;

    const activos = contratos.filter(c => {
      const fechaFin = new Date(c.fecha_fin);
      return fechaFin >= new Date();
    }).length;

    return (
      <View style={styles.headerInfo}>
        <Text style={styles.headerText}>
          {activos} contrato{activos !== 1 ? 's' : ''} activo{activos !== 1 ? 's' : ''}
        </Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Cargando contratos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={contratos}
        keyExtractor={(item) => item.id_contrato_profesor?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <ContractItem 
            contrato={item} 
            onPress={handleContratoPress}
          />
        )}
        contentContainerStyle={[
          styles.listContainer,
          contratos.length === 0 && styles.listContainerEmpty
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
  headerInfo: {
    backgroundColor: colors.primary.main + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
    textAlign: 'center',
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

export default MisContratosScreen;
