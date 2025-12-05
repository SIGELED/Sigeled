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
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import colors from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { getTiposTitulo, createTitulo, uploadFile } from '../../services/api';

const AgregarTituloScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [tiposTitulo, setTiposTitulo] = useState([]);
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  
  const [formData, setFormData] = useState({
    id_tipo_titulo: '',
    tipo_titulo_nombre: '',
    nombre_titulo: '',
    institucion: '',
    fecha_emision: '',
    matricula_prof: '',
    id_archivo: null,
    archivo_nombre: '',
  });

  useEffect(() => {
    cargarTiposTitulo();
  }, []);

  const cargarTiposTitulo = async () => {
    try {
      setLoading(true);
      const tipos = await getTiposTitulo();
      setTiposTitulo(tipos);
    } catch (error) {
      console.error('Error cargando tipos de título:', error);
      Alert.alert('Error', 'No se pudieron cargar los tipos de título');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectTipo = (tipo) => {
    setFormData(prev => ({
      ...prev,
      id_tipo_titulo: tipo.id_tipo_titulo,
      tipo_titulo_nombre: tipo.nombre,
    }));
    setShowTipoModal(false);
  };

  const handleSelectSource = () => {
    if (Platform.OS === 'web') {
      handlePickFile();
    } else {
      setShowSourceModal(true);
    }
  };

  const handlePickFile = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        await subirArchivo(file);
      }
    };
    input.click();
  };

  const handleTakePhoto = async () => {
    setShowSourceModal(false);
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      subirArchivo(result.assets[0].uri);
    }
  };

  const handlePickFromGallery = async () => {
    setShowSourceModal(false);
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      subirArchivo(result.assets[0].uri);
    }
  };

  const handleDocumentPick = async () => {
    setShowSourceModal(false);
    
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
      subirArchivo(result.uri);
    }
  };

  const subirArchivo = async (fileOrUri) => {
    try {
      setLoading(true);

      const formDataToSend = new FormData();
      
      if (Platform.OS === 'web' && fileOrUri instanceof File) {
        formDataToSend.append('archivo', fileOrUri);
      } else {
        const fileName = fileOrUri.split('/').pop();
        const fileType = fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
        formDataToSend.append('archivo', {
          uri: fileOrUri,
          name: fileName,
          type: fileType,
        });
      }

      const uploadResponse = await uploadFile(user.id_persona, formDataToSend);

      if (!uploadResponse.archivo || !uploadResponse.archivo.id_archivo) {
        throw new Error('Error al subir archivo');
      }

      setFormData(prev => ({
        ...prev,
        id_archivo: uploadResponse.archivo.id_archivo,
        archivo_nombre: uploadResponse.archivo.nombre_original,
      }));

      Alert.alert('Éxito', 'Archivo subido correctamente');
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      Alert.alert('Error', 'No se pudo subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    // Validar campos requeridos
    if (!formData.id_tipo_titulo || !formData.nombre_titulo.trim()) {
      Alert.alert('Campos incompletos', 'Debes completar al menos Tipo de título y Nombre del título');
      return;
    }

    try {
      setLoading(true);
      
      await createTitulo({
        id_persona: user.id_persona,
        id_tipo_titulo: formData.id_tipo_titulo,
        nombre_titulo: formData.nombre_titulo.trim(),
        institucion: formData.institucion.trim() || null,
        fecha_emision: formData.fecha_emision || null,
        matricula_prof: formData.matricula_prof.trim() || null,
        id_archivo: formData.id_archivo || null,
      });

      const msg = 'Título agregado correctamente';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Éxito', msg);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error guardando título:', error);
      const msg = error.response?.data?.message || error.message || 'No se pudo guardar el título';
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
          <Ionicons name="school" size={40} color={colors.primary.main} />
          <Text style={styles.title}>Agregar Título</Text>
          <Text style={styles.subtitle}>
            Completá los datos de tu título académico
          </Text>
        </View>

        {/* Tipo de título */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo de título *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowTipoModal(true)}
          >
            <Text style={formData.tipo_titulo_nombre ? styles.selectButtonTextFilled : styles.selectButtonText}>
              {formData.tipo_titulo_nombre || 'Seleccionar tipo...'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Nombre del título */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre del título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Licenciado en Sistemas"
            placeholderTextColor={colors.text.disabled}
            value={formData.nombre_titulo}
            onChangeText={(value) => handleInputChange('nombre_titulo', value)}
          />
        </View>

        {/* Institución */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Institución</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Universidad Nacional"
            placeholderTextColor={colors.text.disabled}
            value={formData.institucion}
            onChangeText={(value) => handleInputChange('institucion', value)}
          />
        </View>

        {/* Fecha de emisión */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fecha de emisión</Text>
          <TextInput
            style={styles.input}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={colors.text.disabled}
            value={formData.fecha_emision}
            onChangeText={(value) => handleInputChange('fecha_emision', value)}
          />
        </View>

        {/* Matrícula profesional */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Matrícula profesional</Text>
          <TextInput
            style={styles.input}
            placeholder="Número de matrícula"
            placeholderTextColor={colors.text.disabled}
            value={formData.matricula_prof}
            onChangeText={(value) => handleInputChange('matricula_prof', value)}
          />
        </View>

        {/* Archivo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Archivo del título (opcional)</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleSelectSource}
            disabled={loading}
          >
            <Ionicons name="cloud-upload-outline" size={24} color={colors.primary.main} />
            <Text style={styles.uploadButtonText}>
              {formData.archivo_nombre || 'Subir archivo (PDF o imagen)'}
            </Text>
          </TouchableOpacity>
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

      {/* Modal tipos de título */}
      <Modal
        visible={showTipoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTipoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar tipo de título</Text>
              <TouchableOpacity onPress={() => setShowTipoModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={tiposTitulo}
              keyExtractor={(item) => item.id_tipo_titulo.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectTipo(item)}
                >
                  <Text style={styles.modalItemText}>{item.nombre}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </Modal>

      {/* Modal source selector */}
      {Platform.OS !== 'web' && (
        <Modal
          visible={showSourceModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSourceModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar origen</Text>
                <TouchableOpacity onPress={() => setShowSourceModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.modalItem} onPress={handleTakePhoto}>
                <Ionicons name="camera" size={24} color={colors.primary.main} />
                <Text style={styles.modalItemTextWithIcon}>Tomar foto</Text>
              </TouchableOpacity>
              
              <View style={styles.separator} />
              
              <TouchableOpacity style={styles.modalItem} onPress={handlePickFromGallery}>
                <Ionicons name="images" size={24} color={colors.primary.main} />
                <Text style={styles.modalItemTextWithIcon}>Galería</Text>
              </TouchableOpacity>
              
              <View style={styles.separator} />
              
              <TouchableOpacity style={styles.modalItem} onPress={handleDocumentPick}>
                <Ionicons name="document" size={24} color={colors.primary.main} />
                <Text style={styles.modalItemTextWithIcon}>Archivo PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  uploadButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  uploadButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  modalItemTextWithIcon: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
});

export default AgregarTituloScreen;
