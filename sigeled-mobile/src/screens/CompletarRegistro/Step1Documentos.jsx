import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import colors from '../../theme/colors';
import { getTiposDocumento, uploadFile, vincularDocumento } from '../../services/api';

const Step1Documentos = ({ id_persona, onNext, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [documentosSubidos, setDocumentosSubidos] = useState({});
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

  useEffect(() => {
    cargarTiposDocumento();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Se necesitan permisos de cámara y galería para subir documentos'
      );
    }
  };

  const cargarTiposDocumento = async () => {
    try {
      setLoading(true);
      const tipos = await getTiposDocumento();
      // Filtrar los tipos más importantes
      const tiposRequeridos = tipos.filter(t => 
        ['DNI_FRENTE', 'DNI_DORSO', 'CERTIFICADO_DOMICILIO'].includes(t.codigo)
      );
      setTiposDocumento(tiposRequeridos);
    } catch (error) {
      console.error('Error cargando tipos de documento:', error);
      Alert.alert('Error', 'No se pudieron cargar los tipos de documento');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSource = (tipo) => {
    console.log('[Step1Documentos] Documento seleccionado:', tipo.nombre);
    setTipoSeleccionado(tipo);
    setShowSourceModal(true);
  };

  const handleTakePhoto = async () => {
    setShowSourceModal(false);
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      subirArchivo(result.assets[0].uri, tipoSeleccionado);
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
      subirArchivo(result.assets[0].uri, tipoSeleccionado);
    }
  };

  const handleDocumentPick = async () => {
    setShowSourceModal(false);
    
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
      subirArchivo(result.uri, tipoSeleccionado);
    }
  };

  const subirArchivo = async (uri, tipo) => {
    try {
      setLoading(true);

      // Crear FormData con el archivo
      const formData = new FormData();
      const fileName = uri.split('/').pop();
      const fileType = fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';

      formData.append('file', {
        uri,
        name: fileName,
        type: fileType,
      });

      // Subir archivo
      const uploadResponse = await uploadFile(formData, (progress) => {
        console.log(`Progreso: ${progress}%`);
      });

      if (!uploadResponse.file || !uploadResponse.file.id_archivo) {
        throw new Error('Error al subir archivo');
      }

      // Vincular con persona_documentos
      await vincularDocumento({
        id_persona,
        id_tipo_documento: tipo.id_tipo_documento,
        id_archivo: uploadResponse.file.id_archivo,
      });

      setDocumentosSubidos({
        ...documentosSubidos,
        [tipo.codigo]: {
          nombre: fileName,
          id_archivo: uploadResponse.file.id_archivo,
        },
      });

      Alert.alert('Éxito', `${tipo.nombre} subido correctamente`);
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      Alert.alert('Error', 'No se pudo subir el documento');
    } finally {
      setLoading(false);
    }
  };

  const handleContinuar = () => {
    // Verificar que se hayan subido al menos DNI frente y dorso
    const requiredDocs = ['DNI_FRENTE', 'DNI_DORSO'];
    const missing = requiredDocs.filter(codigo => !documentosSubidos[codigo]);

    if (missing.length > 0) {
      Alert.alert(
        'Documentos faltantes',
        'Debes subir al menos el DNI (frente y dorso) para continuar',
        [{ text: 'OK' }]
      );
      return;
    }

    onNext();
  };

  if (loading && tiposDocumento.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Cargando tipos de documento...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="document-text" size={40} color={colors.primary.main} />
          <Text style={styles.title}>Sube tus documentos</Text>
          <Text style={styles.subtitle}>
            Necesitamos tu DNI (frente y dorso) para verificar tu identidad
          </Text>
        </View>

        <View style={styles.documentsList}>
          {tiposDocumento.map((tipo) => {
            const subido = documentosSubidos[tipo.codigo];
            
            return (
              <TouchableOpacity
                key={tipo.id_tipo_documento}
                style={[styles.documentCard, subido && styles.documentCardSubido]}
                onPress={() => handleSelectSource(tipo)}
                disabled={loading}
              >
                <View style={styles.documentInfo}>
                  <Ionicons
                    name={subido ? 'checkmark-circle' : 'document-outline'}
                    size={24}
                    color={subido ? colors.primary.main : colors.text.tertiary}
                  />
                  <View style={styles.documentText}>
                    <Text style={styles.documentName}>{tipo.nombre}</Text>
                    {subido && (
                      <Text style={styles.documentFileName}>{subido.nombre}</Text>
                    )}
                  </View>
                </View>
                <Ionicons
                  name={subido ? 'checkmark' : 'cloud-upload-outline'}
                  size={24}
                  color={subido ? colors.primary.main : colors.text.tertiary}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={colors.primary.main} />
          <Text style={styles.infoText}>
            Toca cada documento para subirlo. El DNI (frente y dorso) es obligatorio para continuar.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.buttonPrimary,
            loading && styles.buttonDisabled,
            (!documentosSubidos['DNI_FRENTE'] || !documentosSubidos['DNI_DORSO']) && styles.buttonDisabled
          ]}
          onPress={handleContinuar}
          disabled={loading || !documentosSubidos['DNI_FRENTE'] || !documentosSubidos['DNI_DORSO']}
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
              <Ionicons name="camera" size={32} color={colors.primary.main} />
              <Text style={styles.sourceOptionText}>Tomar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sourceOption} onPress={handlePickFromGallery}>
              <Ionicons name="images" size={32} color={colors.primary.main} />
              <Text style={styles.sourceOptionText}>Elegir de galería</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sourceOption} onPress={handleDocumentPick}>
              <Ionicons name="document" size={32} color={colors.primary.main} />
              <Text style={styles.sourceOptionText}>Seleccionar archivo</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    marginTop: 10,
    color: colors.text.primary,
    fontSize: 16,
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
  documentsList: {
    gap: 15,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  documentCardSubido: {
    borderColor: colors.primary.main,
    backgroundColor: colors.background.secondary,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  documentText: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  documentFileName: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.primary,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.secondary,
    backgroundColor: colors.background.secondary,
  },
  buttonSecondary: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  buttonSecondaryText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPrimary: {
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
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

export default Step1Documentos;
