import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { createDomicilio, getLocalidades, getBarriosByLocalidad, createBarrio } from '../../services/api';

const Step2Domicilio = ({ id_persona, onNext, onBack, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [localidades, setLocalidades] = useState([]);
  const [barrios, setBarrios] = useState([]);
  
  const [showLocalidadModal, setShowLocalidadModal] = useState(false);
  const [showBarrioModal, setShowBarrioModal] = useState(false);
  
  const [formData, setFormData] = useState({
    id_localidad: '',
    localidad_nombre: '',
    id_barrio: '',
    barrio_nombre: '',
    calle: '',
    altura: '',
    manzana: '',
    casa: '',
    departamento: '',
    piso: '',
  });
  
  const [crearNuevoBarrio, setCrearNuevoBarrio] = useState(false);

  useEffect(() => {
    cargarLocalidades();
  }, []);

  useEffect(() => {
    if (formData.id_localidad) {
      cargarBarrios(formData.id_localidad);
    } else {
      setBarrios([]);
      setFormData(prev => ({ ...prev, id_barrio: '', barrio_nombre: '' }));
    }
  }, [formData.id_localidad]);

  const cargarLocalidades = async () => {
    try {
      setLoading(true);
      const locs = await getLocalidades();
      setLocalidades(locs);
    } catch (error) {
      console.error('Error cargando localidades:', error);
      Alert.alert('Error', 'No se pudieron cargar las localidades');
    } finally {
      setLoading(false);
    }
  };

  const cargarBarrios = async (id_localidad) => {
    try {
      setLoading(true);
      const barriosData = await getBarriosByLocalidad(id_localidad);
      setBarrios(barriosData);
    } catch (error) {
      console.error('Error cargando barrios:', error);
      setBarrios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectLocalidad = (localidad) => {
    setFormData(prev => ({
      ...prev,
      id_localidad: localidad.id_dom_localidad,
      localidad_nombre: localidad.localidad,
      id_barrio: '',
      barrio_nombre: '',
    }));
    setCrearNuevoBarrio(false);
    setShowLocalidadModal(false);
  };

  const handleSelectBarrio = (barrio) => {
    setFormData(prev => ({
      ...prev,
      id_barrio: barrio.id_dom_barrio,
      barrio_nombre: barrio.barrio,
    }));
    setShowBarrioModal(false);
  };

  const handleContinuar = async () => {
    // Validar campos requeridos
    if (!formData.calle.trim() || !formData.altura.trim() || !formData.id_localidad) {
      Alert.alert('Campos incompletos', 'Debes completar Localidad, Calle y Altura');
      return;
    }

    if (!crearNuevoBarrio && !formData.id_barrio) {
      Alert.alert('Barrio requerido', 'Selecciona un barrio o crea uno nuevo');
      return;
    }

    if (crearNuevoBarrio && !formData.barrio_nombre.trim()) {
      Alert.alert('Nombre de barrio', 'Ingresa el nombre del barrio');
      return;
    }

    try {
      setLoading(true);

      let id_barrio_final = formData.id_barrio;

      // Si está creando un nuevo barrio
      if (crearNuevoBarrio) {
        const nuevoBarrio = await createBarrio(formData.id_localidad, {
          barrio: formData.barrio_nombre.trim(),
          manzana: formData.manzana || null,
          casa: formData.casa || null,
          departamento: formData.departamento || null,
          piso: formData.piso || null,
        });
        id_barrio_final = nuevoBarrio.id_dom_barrio;
      }

      // Crear domicilio
      const domicilioPayload = {
        calle: formData.calle.trim(),
        altura: formData.altura.trim(),
        id_dom_barrio: id_barrio_final,
      };

      await createDomicilio(id_persona, domicilioPayload);

      Alert.alert('Éxito', 'Domicilio guardado correctamente');
      onNext();
    } catch (error) {
      console.error('Error guardando domicilio:', error);
      Alert.alert('Error', error.message || 'No se pudo guardar el domicilio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="home" size={40} color={colors.primary} />
          <Text style={styles.title}>Datos de domicilio</Text>
          <Text style={styles.subtitle}>
            Completá tu dirección para continuar con el registro
          </Text>
        </View>

        {/* Localidad */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Localidad *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowLocalidadModal(true)}
          >
            <Text style={formData.localidad_nombre ? styles.selectButtonTextFilled : styles.selectButtonText}>
              {formData.localidad_nombre || 'Seleccionar localidad...'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Barrio */}
        {formData.id_localidad && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Barrio *</Text>
            
            {!crearNuevoBarrio ? (
              <>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowBarrioModal(true)}
                  disabled={barrios.length === 0}
                >
                  <Text style={formData.barrio_nombre ? styles.selectButtonTextFilled : styles.selectButtonText}>
                    {formData.barrio_nombre || (barrios.length === 0 ? 'Cargando...' : 'Seleccionar barrio...')}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => setCrearNuevoBarrio(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                  <Text style={styles.linkText}>Crear nuevo barrio</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del barrio"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.barrio_nombre}
                  onChangeText={(value) => handleInputChange('barrio_nombre', value)}
                />
                
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Manzana</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Opcional"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.manzana}
                      onChangeText={(value) => handleInputChange('manzana', value)}
                    />
                  </View>
                  
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Casa</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Opcional"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.casa}
                      onChangeText={(value) => handleInputChange('casa', value)}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Piso</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Opcional"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.piso}
                      onChangeText={(value) => handleInputChange('piso', value)}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Depto</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Opcional"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.departamento}
                      onChangeText={(value) => handleInputChange('departamento', value)}
                    />
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => {
                    setCrearNuevoBarrio(false);
                    setFormData(prev => ({
                      ...prev,
                      barrio_nombre: '',
                      manzana: '',
                      casa: '',
                      departamento: '',
                      piso: '',
                    }));
                  }}
                >
                  <Ionicons name="arrow-back-circle-outline" size={20} color={colors.primary} />
                  <Text style={styles.linkText}>Seleccionar barrio existente</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Calle y Altura */}
        <View style={styles.row}>
          <View style={styles.flexInput}>
            <Text style={styles.label}>Calle *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Av. Siempre Viva"
              placeholderTextColor={colors.textSecondary}
              value={formData.calle}
              onChangeText={(value) => handleInputChange('calle', value)}
            />
          </View>
          
          <View style={styles.smallInput}>
            <Text style={styles.label}>Altura *</Text>
            <TextInput
              style={styles.input}
              placeholder="742"
              placeholderTextColor={colors.textSecondary}
              value={formData.altura}
              onChangeText={(value) => handleInputChange('altura', value)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Los campos marcados con * son obligatorios
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={onBack}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={styles.buttonSecondaryText}>Atrás</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonTertiary}
          onPress={handleOmitir}
          disabled={loading}
        >
          <Text style={styles.buttonTertiaryText}>Omitir</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
          onPress={handleContinuar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonPrimaryText}>Continuar</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de localidades */}
      <Modal
        visible={showLocalidadModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocalidadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar localidad</Text>
              <TouchableOpacity onPress={() => setShowLocalidadModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={localidades}
              keyExtractor={(item) => item.id_dom_localidad.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item.id_dom_localidad === formData.id_localidad && styles.modalItemSelected,
                  ]}
                  onPress={() => handleSelectLocalidad(item)}
                >
                  <Text style={styles.modalItemText}>{item.localidad}</Text>
                  {item.id_dom_localidad === formData.id_localidad && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de barrios */}
      <Modal
        visible={showBarrioModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBarrioModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar barrio</Text>
              <TouchableOpacity onPress={() => setShowBarrioModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={barrios}
              keyExtractor={(item) => item.id_dom_barrio.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item.id_dom_barrio === formData.id_barrio && styles.modalItemSelected,
                  ]}
                  onPress={() => handleSelectBarrio(item)}
                >
                  <Text style={styles.modalItemText}>{item.barrio}</Text>
                  {item.id_dom_barrio === formData.id_barrio && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    borderRadius: 10,
    padding: 12,
  },
  selectButtonText: {
    fontSize: 16,
    color: colors.text.tertiary,
  },
  selectButtonTextFilled: {
    fontSize: 16,
    color: colors.text.primary,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  flexInput: {
    flex: 2,
  },
  smallInput: {
    flex: 1,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  linkText: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.secondary,
    backgroundColor: colors.background.secondary,
  },
  buttonSecondary: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.secondary,
    gap: 8,
  },
  buttonSecondaryText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTertiary: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTertiaryText: {
    color: colors.text.tertiary,
    fontSize: 16,
  },
  buttonPrimary: {
    flex: 1,
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalItemSelected: {
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  modalItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
});

export default Step2Domicilio;
