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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import colors from '../../theme/colors';
import { getTiposDocumento, uploadFile, vincularDocumento, setAuthToken } from '../../services/api';
import storage from '../../utils/storage';

const Step1Documentos = ({ id_persona, onNext, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [documentosSubidos, setDocumentosSubidos] = useState({});
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

  useEffect(() => {
    cargarTiposDocumento();
    requestPermissions();
    verificarToken();
  }, []);

  const verificarToken = async () => {
    try {
      const token = await storage.getItem('userToken');
      console.log('[Step1Documentos] Token guardado:', token ? 'SÍ' : 'NO');
      if (token) {
        console.log('[Step1Documentos] Token primeros caracteres:', token.substring(0, 20));
        // Asegurarse de que el token esté configurado en la API
        setAuthToken(token);
        console.log('[Step1Documentos] Token configurado en API');
      } else {
        console.warn('[Step1Documentos] No hay token guardado - esto es un problema!');
      }
    } catch (error) {
      console.error('[Step1Documentos] Error verificando token:', error);
    }
  };

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
      
      // Asegurarse de que el token esté configurado antes de hacer la petición
      const token = await storage.getItem('userToken');
      console.log('[Step1Documentos] ===== INICIO CARGA TIPOS =====');
      console.log('[Step1Documentos] Token existe?', !!token);
      if (token) {
        console.log('[Step1Documentos] Configurando token...');
        setAuthToken(token);
        console.log('[Step1Documentos] Token configurado');
      } else {
        console.error('[Step1Documentos] ⚠️ NO HAY TOKEN GUARDADO');
      }
      
      console.log('[Step1Documentos] Haciendo petición a getTiposDocumento...');
      const tipos = await getTiposDocumento();
      console.log('[Step1Documentos] ✅ Respuesta recibida:', tipos);
      console.log('[Step1Documentos] Cantidad de tipos:', tipos?.length || 0);
      
      // Mostrar TODOS los códigos disponibles
      if (tipos && tipos.length > 0) {
        console.log('[Step1Documentos] 📋 CÓDIGOS DISPONIBLES:');
        tipos.forEach(t => {
          console.log(`  - ${t.codigo} (${t.nombre})`);
        });
      }
      
      // Mostrar TODOS los tipos de documento disponibles (igual que el web)
      console.log('[Step1Documentos] Mostrando todos los tipos disponibles');
      if (tipos && tipos.length === 0) {
        console.warn('[Step1Documentos] ⚠️ No hay tipos de documento disponibles');
      }
      setTiposDocumento(tipos || []);
      console.log('[Step1Documentos] ===== FIN CARGA TIPOS =====');
    } catch (error) {
      console.error('[Step1Documentos] ❌ ERROR cargando tipos de documento:', error);
      console.error('[Step1Documentos] Error mensaje:', error.message);
      console.error('[Step1Documentos] Error response:', error.response?.data);
      console.error('[Step1Documentos] Error status:', error.response?.status);
      
      const errorMsg = error.response?.data?.message || error.message || 'No se pudieron cargar los tipos de documento';
      console.error('[Step1Documentos] Mostrando error al usuario:', errorMsg);
      
      if (Platform.OS === 'web') {
        alert(`ERROR: ${errorMsg}\n\nRevisa la consola para más detalles.`);
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSource = (tipo) => {
    console.log('[Step1Documentos] ========================================');
    console.log('[Step1Documentos] Documento clickeado:', tipo);
    console.log('[Step1Documentos] Tipo nombre:', tipo.nombre);
    console.log('[Step1Documentos] Tipo codigo:', tipo.codigo);
    console.log('[Step1Documentos] ========================================');
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
    
    // En web, usar input file nativo del navegador
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,application/pdf';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          subirArchivo(file, tipoSeleccionado);
        }
      };
      input.click();
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        subirArchivo(result.assets[0].uri, tipoSeleccionado);
      }
    }
  };

  const handleDocumentPick = async () => {
    setShowSourceModal(false);
    
    // En web, usar el mismo input file que en gallery
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,application/pdf';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          subirArchivo(file, tipoSeleccionado);
        }
      };
      input.click();
    } else {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        subirArchivo(result.uri, tipoSeleccionado);
      }
    }
  };

  const subirArchivo = async (fileOrUri, tipo) => {
    try {
      setLoading(true);

      const formData = new FormData();
      
      // Distinguir entre archivo del navegador (File object) y URI de React Native
      if (Platform.OS === 'web' && fileOrUri instanceof File) {
        // En web, fileOrUri es un objeto File del navegador
        console.log('[Step1Documentos] Subiendo archivo File del navegador:', fileOrUri.name);
        formData.append('archivo', fileOrUri);
      } else {
        // En móvil nativo, fileOrUri es una URI
        const fileName = fileOrUri.split('/').pop();
        const fileType = fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
        
        console.log('[Step1Documentos] Subiendo archivo desde URI:', fileName);
        formData.append('archivo', {
          uri: fileOrUri,
          name: fileName,
          type: fileType,
        });
      }

      console.log('[Step1Documentos] Subiendo archivo para persona:', id_persona);
      
      // Subir archivo usando la misma ruta que el web
      const uploadResponse = await uploadFile(id_persona, formData, (progress) => {
        console.log(`Progreso: ${progress}%`);
      });

      console.log('[Step1Documentos] Upload response:', uploadResponse);

      // La respuesta del backend web es: { data: { id_archivo, ... } }
      const id_archivo = uploadResponse.data?.id_archivo || uploadResponse.id_archivo;
      
      if (!id_archivo) {
        throw new Error('Error al subir archivo - no se obtuvo id_archivo');
      }

      // Vincular con persona_documentos
      await vincularDocumento({
        id_persona,
        id_tipo_doc: tipo.id_tipo_doc,
        id_archivo: id_archivo,
      });

      // Obtener el nombre del archivo
      const fileName = Platform.OS === 'web' && fileOrUri instanceof File 
        ? fileOrUri.name 
        : fileOrUri.split('/').pop();

      // Usar forma funcional para evitar problemas de estado desactualizado
      setDocumentosSubidos(prevDocs => ({
        ...prevDocs,
        [tipo.codigo]: {
          nombre: fileName,
          id_archivo: id_archivo,
        },
      }));

      if (Platform.OS === 'web') {
        window.alert(`${tipo.nombre} subido correctamente`);
      } else {
        Alert.alert('Éxito', `${tipo.nombre} subido correctamente`);
      }
    } catch (error) {
      console.error('[Step1Documentos] ❌ Error subiendo archivo:', error);
      console.error('[Step1Documentos] Error message:', error.message);
      console.error('[Step1Documentos] Error response:', error.response?.data);
      console.error('[Step1Documentos] Error status:', error.response?.status);
      
      const errorMsg = error.response?.data?.message || error.message || 'No se pudo subir el documento';
      
      if (Platform.OS === 'web') {
        window.alert(`Error: ${errorMsg}`);
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinuar = () => {
    // Verificar documentos obligatorios según backend: DNI, DOM, TIT
    const requiredDocs = ['DNI', 'DOM', 'TIT'];
    const missing = requiredDocs.filter(codigo => !documentosSubidos[codigo]);

    if (missing.length > 0) {
      const missingNames = missing.map(codigo => {
        const tipo = tiposDocumento.find(t => t.codigo === codigo);
        return tipo?.nombre || codigo;
      });
      
      if (Platform.OS === 'web') {
        window.alert(
          `Documentos obligatorios faltantes:\n\n${missingNames.join('\n')}\n\nDebes subir al menos: DNI, Constancia de domicilio y Título habilitante para continuar.`
        );
      } else {
        Alert.alert(
          'Documentos obligatorios faltantes',
          `Debes subir al menos:\n\n${missingNames.join('\n')}`,
          [{ text: 'OK' }]
        );
      }
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
          <Text style={styles.debugText}>
            Documentos cargados: {tiposDocumento.length}
          </Text>
        </View>

        <View style={styles.documentsList}>
          {tiposDocumento.length === 0 && (
            <Text style={styles.noDocsText}>No se encontraron tipos de documento</Text>
          )}
          {tiposDocumento.map((tipo) => {
            const subido = documentosSubidos[tipo.codigo];
            console.log('[Step1Documentos] Renderizando documento:', tipo.nombre, 'subido:', !!subido);
            
            return (
              <TouchableOpacity
                key={tipo.id_tipo_doc}
                style={[styles.documentCard, subido && styles.documentCardSubido]}
                onPress={() => handleSelectSource(tipo)}
                disabled={loading}
                activeOpacity={0.7}
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
            Toca cada documento para subirlo. Son obligatorios: DNI, Constancia de domicilio y Título habilitante.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.buttonPrimary,
            loading && styles.buttonDisabled,
            (!documentosSubidos['DNI'] || !documentosSubidos['DOM'] || !documentosSubidos['TIT']) && styles.buttonDisabled
          ]}
          onPress={handleContinuar}
          disabled={loading || !documentosSubidos['DNI'] || !documentosSubidos['DOM'] || !documentosSubidos['TIT']}
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
            
            <TouchableOpacity key="camera" style={styles.sourceOption} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={32} color={colors.primary.main} />
              <Text style={styles.sourceOptionText}>Tomar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity key="gallery" style={styles.sourceOption} onPress={handlePickFromGallery}>
              <Ionicons name="images" size={32} color={colors.primary.main} />
              <Text style={styles.sourceOptionText}>Elegir de galería</Text>
            </TouchableOpacity>

            <TouchableOpacity key="document" style={styles.sourceOption} onPress={handleDocumentPick}>
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
  debugText: {
    fontSize: 12,
    color: colors.primary.main,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
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
    cursor: Platform.OS === 'web' ? 'pointer' : 'auto',
    minHeight: 70,
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
    cursor: Platform.OS === 'web' ? 'pointer' : 'auto',
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  noDocsText: {
    textAlign: 'center',
    color: colors.text.tertiary,
    fontSize: 14,
    padding: 20,
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
