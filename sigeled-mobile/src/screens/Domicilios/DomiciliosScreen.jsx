import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { getDomiciliosByPersona, eliminarDomicilio } from '../../services/api';

const DomiciliosScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [domicilios, setDomicilios] = useState([]);

  const id_persona = user?.id_persona;

  useEffect(() => {
    if (id_persona) {
      cargarDomicilios();
    }
  }, [id_persona]);

  const cargarDomicilios = async () => {
    try {
      setLoading(true);
      const data = await getDomiciliosByPersona(id_persona);
      console.log('[Domicilios] Datos:', data);
      setDomicilios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[Domicilios] Error cargando:', error);
      const msg = error.response?.data?.message || error.message || 'Error al cargar domicilios';
      if (Platform.OS === 'web') {
        window.alert(`Error: ${msg}`);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDomicilios();
    setRefreshing(false);
  };

  const handleEliminar = (domicilio) => {
    const mensaje = `¿Estás seguro de eliminar el domicilio en ${domicilio.calle} ${domicilio.altura}?`;
    
    if (Platform.OS === 'web') {
      if (window.confirm(mensaje)) {
        eliminarDomicilioConfirmado(domicilio);
      }
    } else {
      Alert.alert(
        'Confirmar eliminación',
        mensaje,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Eliminar', 
            style: 'destructive',
            onPress: () => eliminarDomicilioConfirmado(domicilio)
          },
        ]
      );
    }
  };

  const eliminarDomicilioConfirmado = async (domicilio) => {
    try {
      await eliminarDomicilio(id_persona, domicilio.id_domicilio);
      
      const msg = 'Domicilio eliminado correctamente';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Éxito', msg);
      }
      
      await cargarDomicilios();
    } catch (error) {
      console.error('[Domicilios] Error eliminando:', error);
      const msg = error.response?.data?.message || error.message || 'No se pudo eliminar el domicilio';
      if (Platform.OS === 'web') {
        window.alert(`Error: ${msg}`);
      } else {
        Alert.alert('Error', msg);
      }
    }
  };

  const handleAgregar = () => {
    navigation.navigate('AgregarDomicilio');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Cargando domicilios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Ionicons name="home" size={40} color={colors.primary.main} />
          <Text style={styles.title}>Mis Domicilios</Text>
          <Text style={styles.subtitle}>
            Gestiona tus direcciones registradas
          </Text>
        </View>

        {domicilios.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={80} color={colors.text.disabled} />
            <Text style={styles.emptyText}>No tenés domicilios registrados</Text>
            <Text style={styles.emptySubtext}>
              Agregá tu primer domicilio para completar tu legajo
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {domicilios.map((domicilio) => {
              // Construir dirección completa
              let direccion = `${domicilio.calle} ${domicilio.altura}`;
              
              // Agregar datos adicionales del barrio si existen
              const extras = [];
              if (domicilio.barrio_manzana) extras.push(`Mz. ${domicilio.barrio_manzana}`);
              if (domicilio.barrio_casa) extras.push(`Casa ${domicilio.barrio_casa}`);
              if (domicilio.barrio_piso) extras.push(`Piso ${domicilio.barrio_piso}`);
              if (domicilio.barrio_depto) extras.push(`Depto ${domicilio.barrio_depto}`);
              
              if (extras.length > 0) {
                direccion += ` (${extras.join(', ')})`;
              }

              return (
                <View key={domicilio.id_domicilio} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="location" size={24} color={colors.primary.main} />
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>
                        {direccion}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        {domicilio.barrio || 'Sin barrio'}
                        {domicilio.localidad && ` - ${domicilio.localidad}`}
                        {domicilio.departamento_admin && `, ${domicilio.departamento_admin}`}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleEliminar(domicilio)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.status.error} />
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAgregar}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.disabled,
    marginTop: 8,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  deleteButtonText: {
    color: colors.status.error,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default DomiciliosScreen;
