import React, { useState, useEffect, useContext } from 'react';
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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { 
  getDepartamentos, 
  getLocalidades, 
  getBarriosByLocalidad, 
  createBarrio, 
  assignBarrioToPersona,
  createDomicilio 
} from '../../services/api';

const AgregarDomicilioScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [barrios, setBarrios] = useState([]);
  
  const [showDepartamentoModal, setShowDepartamentoModal] = useState(false);
  const [showLocalidadModal, setShowLocalidadModal] = useState(false);
  const [showBarrioModal, setShowBarrioModal] = useState(false);
  
  const [formData, setFormData] = useState({
    id_departamento: '',
    departamento_nombre: '',
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
    cargarDepartamentos();
  }, []);

  useEffect(() => {
    if (formData.id_departamento) {
      cargarLocalidades(formData.id_departamento);
    } else {
      setLocalidades([]);
      setFormData(prev => ({ 
        ...prev, 
        id_localidad: '', 
        localidad_nombre: '',
        id_barrio: '', 
        barrio_nombre: '' 
      }));
    }
  }, [formData.id_departamento]);

  useEffect(() => {
    if (formData.id_localidad) {
      cargarBarrios(formData.id_localidad);
    } else {
      setBarrios([]);
      setFormData(prev => ({ ...prev, id_barrio: '', barrio_nombre: '' }));
    }
  }, [formData.id_localidad]);

  const cargarDepartamentos = async () => {
    try {
      setLoading(true);
      const deptos = await getDepartamentos();
      setDepartamentos(deptos);
    } catch (error) {
      console.error('Error cargando departamentos:', error);
      Alert.alert('Error', 'No se pudieron cargar los departamentos');
    } finally {
      setLoading(false);
    }
  };

  const cargarLocalidades = async (id_departamento) => {
    try {
      setLoading(true);
      const locs = await getLocalidades(id_departamento);
      setLocalidades(locs);
    } catch (error) {
      console.error('Error cargando localidades:', error);
      Alert.alert('Error', 'No se pudieron cargar las localidades');
      setLocalidades([]);
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

  const handleSelectDepartamento = (departamento) => {
    setFormData(prev => ({
      ...prev,
      id_departamento: departamento.id_dom_departamento,
      departamento_nombre: departamento.departamento,
      id_localidad: '',
      localidad_nombre: '',
      id_barrio: '',
      barrio_nombre: '',
    }));
    setCrearNuevoBarrio(false);
    setShowDepartamentoModal(false);
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

  const handleGuardar = async () => {
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
      
      let barrioId = formData.id_barrio || null;

      // Crear barrio nuevo si es necesario
      if (!barrioId && crearNuevoBarrio) {
        const barrioCreado = await createBarrio(formData.id_localidad, {
          barrio: formData.barrio_nombre.trim(),
          manzana: formData.manzana || null,
          casa: formData.casa || null,
          departamento: formData.departamento || null,
          piso: formData.piso || null,
        });
        barrioId = barrioCreado.id_dom_barrio;
      }

      // Asignar barrio a la persona
      if (barrioId) {
        await assignBarrioToPersona(user.id_persona, barrioId);
      }

      // Crear domicilio
      await createDomicilio(user.id_persona, {
        calle: formData.calle.trim(),
        altura: formData.altura.trim(),
        id_dom_barrio: barrioId,
      });

      const msg = 'Domicilio agregado correctamente';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Éxito', msg);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error guardando domicilio:', error);
      const msg = error.response?.data?.message || error.message || 'No se pudo guardar el domicilio';
      if (Platform.OS === 'web') {
        window.alert(`Error: ${msg}`);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="home" size={40} color={colors.primary.main} />
          <Text style={styles.title}>Agregar Domicilio</Text>
          <Text style={styles.subtitle}>
            Completá los datos de tu nueva dirección
          </Text>
        </View>

        {/* Departamento */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Departamento *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowDepartamentoModal(true)}
          >
            <Text style={formData.departamento_nombre ? styles.selectButtonTextFilled : styles.selectButtonText}>
              {formData.departamento_nombre || 'Seleccionar departamento...'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Localidad */}
        {formData.id_departamento && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Localidad *</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowLocalidadModal(true)}
              disabled={localidades.length === 0}
            >
              <Text style={formData.localidad_nombre ? styles.selectButtonTextFilled : styles.selectButtonText}>
                {formData.localidad_nombre || (localidades.length === 0 ? 'Cargando...' : 'Seleccionar localidad...')}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}

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
                  <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => setCrearNuevoBarrio(true)}
                >
                  <Text style={styles.linkButtonText}>+ Crear nuevo barrio</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del barrio"
                  placeholderTextColor={colors.text.disabled}
                  value={formData.barrio_nombre}
                  onChangeText={(value) => handleInputChange('barrio_nombre', value)}
                />
                
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => {
                    setCrearNuevoBarrio(false);
                    handleInputChange('barrio_nombre', '');
                  }}
                >
                  <Text style={styles.linkButtonText}>← Seleccionar barrio existente</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Calle y Altura */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex2]}>
            <Text style={styles.label}>Calle *</Text>
            <TextInput
              style={styles.input}
              placeholder="Av. Libertad"
              placeholderTextColor={colors.text.disabled}
              value={formData.calle}
              onChangeText={(value) => handleInputChange('calle', value)}
            />
          </View>

          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Altura *</Text>
            <TextInput
              style={styles.input}
              placeholder="742"
              placeholderTextColor={colors.text.disabled}
              value={formData.altura}
              onChangeText={(value) => handleInputChange('altura', value)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={colors.primary.main} />
          <Text style={styles.infoText}>
            Los campos marcados con * son obligatorios
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Ionicons name="close" size={20} color={colors.text.primary} />
          <Text style={styles.buttonSecondaryText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
          onPress={handleGuardar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonPrimaryText}>Guardar</Text>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modales */}
      <Modal
        visible={showDepartamentoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDepartamentoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar departamento</Text>
              <TouchableOpacity onPress={() => setShowDepartamentoModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={departamentos}
              keyExtractor={(item) => item.id_dom_departamento.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectDepartamento(item)}
                >
                  <Text style={styles.modalItemText}>{item.departamento}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </Modal>

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
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={localidades}
              keyExtractor={(item) => item.id_dom_localidad.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectLocalidad(item)}
                >
                  <Text style={styles.modalItemText}>{item.localidad}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </Modal>

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
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={barrios}
              keyExtractor={(item) => item.id_dom_barrio.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectBarrio(item)}
                >
                  <Text style={styles.modalItemText}>{item.barrio}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    padding: 16,
  },
  header: {
    padding: 16,
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  selectButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: colors.text.disabled,
  },
  selectButtonTextFilled: {
    fontSize: 16,
    color: colors.text.primary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  linkButton: {
    marginTop: 8,
  },
  linkButtonText: {
    color: colors.primary.main,
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background.primary,
  },
  buttonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  buttonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.primary.main,
    gap: 8,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  modalItem: {
    padding: 16,
  },
  modalItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
});

export default AgregarDomicilioScreen;
