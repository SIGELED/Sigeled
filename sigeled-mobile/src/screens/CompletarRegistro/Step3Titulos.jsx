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
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import colors from '../../theme/colors';
import { getTiposTitulo, createTitulo, uploadFile, recalcularLegajo } from '../../services/api';

const Step3Titulos = ({ id_persona, onSetTitulo, onBack, onFinish, saving }) => {
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

  const subirArchivo = async (uri) => {
    try {
      setLoading(true);

      const formDataToSend = new FormData();
      const fileName = uri.split('/').pop();
      const fileType = fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';

      formDataToSend.append('archivo', {
        uri,
        name: fileName,
        type: fileType,
      });

      const uploadResponse = await uploadFile(id_persona, formDataToSend);

      if (!uploadResponse.archivo || !uploadResponse.archivo.id_archivo) {
        throw new Error('Error al subir archivo');
      }

      setFormData(prev => ({
        ...prev,
        id_archivo: uploadResponse.archivo.id_archivo,
        archivo_nombre: fileName,
      }));

      Alert.alert('Éxito', 'Archivo subido correctamente');
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      Alert.alert('Error', 'No se pudo subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizar = async () => {
    console.log('[Step3Titulos] ===== INICIO handleFinalizar =====');
    console.log('[Step3Titulos] formData:', JSON.stringify(formData, null, 2));
    
    // Validar campos requeridos
    if (!formData.id_tipo_titulo || !formData.nombre_titulo.trim()) {
      console.warn('[Step3Titulos] Validación fallida: campos requeridos vacíos');
      Alert.alert('Campos incompletos', 'Debes completar al menos Tipo de título y Nombre del título');
      return;
    }

    // NO llamamos al backend aquí - solo guardamos los datos localmente
    // Igual que en el web que usa setTituloDraft
    console.log('[Step3Titulos] Validaciones OK - Guardando datos localmente');
    
    const tituloPayload = {
      id_tipo_titulo: formData.id_tipo_titulo,
      nombre_titulo: formData.nombre_titulo.trim(),
      institucion: formData.institucion.trim() || null,
      fecha_emision: formData.fecha_emision || null,
      matricula_prof: formData.matricula_prof.trim() || null,
      id_archivo: formData.id_archivo || null,
    };
    
    console.log('[Step3Titulos] Payload a guardar:', tituloPayload);
    onSetTitulo(tituloPayload);
    
    // Llamar a la función finalizar del padre (CompletarRegistroScreen)
    // que guardará TODOS los datos (domicilio + título)
    console.log('[Step3Titulos] ✅ Datos guardados - Llamando a onFinish()');
    await onFinish();
    console.log('[Step3Titulos] ===== FIN handleFinalizar =====');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="school" size={40} color={colors.primary} />
          <Text style={styles.title}>Datos de título</Text>
          <Text style={styles.subtitle}>
            Agregá información sobre tu formación académica
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
              {formData.tipo_titulo_nombre || 'Seleccionar tipo de título...'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Nombre del título */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre del título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Licenciatura en Educación"
            placeholderTextColor={colors.textSecondary}
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
            placeholderTextColor={colors.textSecondary}
            value={formData.institucion}
            onChangeText={(value) => handleInputChange('institucion', value)}
          />
        </View>

        {/* Fecha de emisión y Matrícula */}
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Fecha de emisión</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              value={formData.fecha_emision}
              onChangeText={(value) => handleInputChange('fecha_emision', value)}
            />
          </View>
          
          <View style={styles.halfInput}>
            <Text style={styles.label}>Matrícula profesional</Text>
            <TextInput
              style={styles.input}
              placeholder="Opcional"
              placeholderTextColor={colors.textSecondary}
              value={formData.matricula_prof}
              onChangeText={(value) => handleInputChange('matricula_prof', value)}
            />
          </View>
        </View>

        {/* Archivo del título */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Archivo del título (opcional)</Text>
          
          {formData.id_archivo ? (
            <View style={styles.fileCard}>
              <View style={styles.fileInfo}>
                <Ionicons name="document-text" size={24} color={colors.primary} />
                <Text style={styles.fileName} numberOfLines={1}>
                  {formData.archivo_nombre}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, id_archivo: null, archivo_nombre: '' }))}
              >
                <Ionicons name="close-circle" size={24} color={colors.status.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => setShowSourceModal(true)}
              disabled={loading}
            >
              <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
              <Text style={styles.uploadButtonText}>Subir archivo del título</Text>
              <Text style={styles.uploadButtonSubtext}>PDF o imagen</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Los campos marcados con * son obligatorios. Puedes agregar más títulos después desde tu perfil.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={onBack}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
          <Text style={styles.buttonSecondaryText}>Atrás</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
          onPress={handleFinalizar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonPrimaryText}>Finalizar</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de tipos de título */}
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
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={tiposTitulo}
              keyExtractor={(item) => item.id_tipo_titulo.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.tipoItem,
                    item.id_tipo_titulo === formData.id_tipo_titulo && styles.tipoItemSelected,
                  ]}
                  onPress={() => handleSelectTipo(item)}
                >
                  <Text style={styles.tipoItemText}>{item.nombre}</Text>
                  {item.id_tipo_titulo === formData.id_tipo_titulo && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de selección de fuente */}
      <Modal
        visible={showSourceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSourceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona una opción</Text>
            
            <TouchableOpacity style={styles.sourceOption} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={32} color={colors.primary} />
              <Text style={styles.sourceOptionText}>Tomar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sourceOption} onPress={handlePickFromGallery}>
              <Ionicons name="images" size={32} color={colors.primary} />
              <Text style={styles.sourceOptionText}>Elegir de galería</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sourceOption} onPress={handleDocumentPick}>
              <Ionicons name="document" size={32} color={colors.primary} />
              <Text style={styles.sourceOptionText}>Seleccionar PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSourceModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
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
  uploadButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.secondary,
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    color: colors.text.primary,
    marginTop: 10,
    fontWeight: '600',
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderRadius: 10,
    padding: 15,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
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
    maxHeight: '80%',
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
  tipoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    marginBottom: 10,
  },
  tipoItemSelected: {
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  tipoItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  sourceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    marginBottom: 12,
    gap: 15,
  },
  sourceOptionText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
});

export default Step3Titulos;
