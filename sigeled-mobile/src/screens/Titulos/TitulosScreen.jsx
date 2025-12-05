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
import { getTitulosByPersona, solicitarEliminacionTitulo } from '../../services/api';

const TitulosScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [titulos, setTitulos] = useState([]);

  const id_persona = user?.id_persona;

  useEffect(() => {
    if (id_persona) {
      cargarTitulos();
    }
  }, [id_persona]);

  const cargarTitulos = async () => {
    try {
      setLoading(true);
      const data = await getTitulosByPersona(id_persona);
      console.log('[Titulos] Datos:', data);
      setTitulos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[Titulos] Error cargando:', error);
      const msg = error.response?.data?.message || error.message || 'Error al cargar títulos';
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
    await cargarTitulos();
    setRefreshing(false);
  };

  const handleSolicitarEliminacion = (titulo) => {
    const mensaje = `¿Estás seguro de solicitar la eliminación del título "${titulo.nombre_titulo}"? Esta acción requiere aprobación del administrador.`;
    
    if (Platform.OS === 'web') {
      if (window.confirm(mensaje)) {
        solicitarEliminacionConfirmado(titulo);
      }
    } else {
      Alert.alert(
        'Confirmar solicitud',
        mensaje,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Solicitar', 
            style: 'destructive',
            onPress: () => solicitarEliminacionConfirmado(titulo)
          },
        ]
      );
    }
  };

  const solicitarEliminacionConfirmado = async (titulo) => {
    try {
      await solicitarEliminacionTitulo(titulo.id_titulo);
      
      const msg = 'Solicitud de eliminación enviada. Será revisada por el administrador.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Éxito', msg);
      }
      
      await cargarTitulos();
    } catch (error) {
      console.error('[Titulos] Error solicitando eliminación:', error);
      const msg = error.response?.data?.message || error.message || 'No se pudo solicitar la eliminación';
      if (Platform.OS === 'web') {
        window.alert(`Error: ${msg}`);
      } else {
        Alert.alert('Error', msg);
      }
    }
  };

  const handleAgregar = () => {
    navigation.navigate('AgregarTitulo');
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Cargando títulos...</Text>
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
          <Ionicons name="school" size={40} color={colors.primary.main} />
          <Text style={styles.title}>Mis Títulos</Text>
          <Text style={styles.subtitle}>
            Gestiona tus títulos académicos
          </Text>
        </View>

        {titulos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={80} color={colors.text.disabled} />
            <Text style={styles.emptyText}>No tenés títulos registrados</Text>
            <Text style={styles.emptySubtext}>
              Agregá tu primer título para completar tu legajo
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {titulos.map((titulo) => (
              <View key={titulo.id_titulo} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="ribbon" size={24} color={colors.primary.main} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{titulo.nombre_titulo}</Text>
                    <Text style={styles.cardSubtitle}>
                      {titulo.tipo_titulo_nombre || 'Sin tipo'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  {titulo.institucion && (
                    <View style={styles.detailRow}>
                      <Ionicons name="business-outline" size={16} color={colors.text.secondary} />
                      <Text style={styles.detailText}>{titulo.institucion}</Text>
                    </View>
                  )}
                  
                  {titulo.fecha_emision && (
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
                      <Text style={styles.detailText}>
                        Emitido: {formatFecha(titulo.fecha_emision)}
                      </Text>
                    </View>
                  )}

                  {titulo.matricula_prof && (
                    <View style={styles.detailRow}>
                      <Ionicons name="card-outline" size={16} color={colors.text.secondary} />
                      <Text style={styles.detailText}>
                        Matrícula: {titulo.matricula_prof}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleSolicitarEliminacion(titulo)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.status.error} />
                  <Text style={styles.deleteButtonText}>Solicitar eliminación</Text>
                </TouchableOpacity>
              </View>
            ))}
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
  cardDetails: {
    marginTop: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteButtonText: {
    color: colors.error,
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

export default TitulosScreen;
