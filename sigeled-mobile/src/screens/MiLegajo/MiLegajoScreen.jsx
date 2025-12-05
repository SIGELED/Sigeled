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
import { 
  getDocumentosByPersona, 
  getEstadosVerificacion,
  uploadFile,
  vincularDocumento,
  setAuthToken,
  solicitarEliminacionDocumento 
} from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import storage from '../../utils/storage';

const MiLegajoScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documentos, setDocumentos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [uploadingDocId, setUploadingDocId] = useState(null);

  const id_persona = user?.id_persona;

  useEffect(() => {
    if (id_persona) {
      cargarDatos();
    }
  }, [id_persona]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Asegurar token
      const token = await storage.getItem('userToken');
      if (token) {
        setAuthToken(token);
      }

      const [docsData, estadosData] = await Promise.all([
        getDocumentosByPersona(id_persona),
        getEstadosVerificacion(),
      ]);

      console.log('[MiLegajo] Documentos:', docsData);
      console.log('[MiLegajo] Estados:', estadosData);

      setDocumentos(Array.isArray(docsData) ? docsData : []);
      setEstados(Array.isArray(estadosData) ? estadosData : []);
    } catch (error) {
      console.error('[MiLegajo] Error cargando datos:', error);
      const msg = error.response?.data?.message || error.message || 'Error al cargar documentos';
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
    await cargarDatos();
    setRefreshing(false);
  };

  const getEstadoInfo = (id_estado) => {
    const estado = estados.find(e => e.id_estado === id_estado);
    return estado || { nombre: 'Desconocido', codigo: 'UNKNOWN' };
  };

  const getEstadoColor = (codigo) => {
    const c = String(codigo || '').toUpperCase();
    switch (c) {
      case 'APROBADO':
        return colors.success;
      case 'RECHAZADO':
        return colors.status.error;
      case 'OBSERVADO':
        return colors.status.warning;
      case 'PENDIENTE':
      default:
        return colors.info;
    }
  };

  const handleResubir = async (doc) => {
    setUploadingDocId(doc.id_persona_doc);

    // Mostrar opciones de selección
    const options = ['Tomar foto', 'Galería', 'Archivo', 'Cancelar'];
    
    if (Platform.OS === 'web') {
      handlePickFile(doc);
    } else {
      Alert.alert(
        'Resubir documento',
        `¿Cómo deseas subir "${doc.tipo_nombre}"?`,
        [
          {
            text: 'Tomar foto',
            onPress: () => handleTakePhoto(doc),
          },
          {
            text: 'Galería',
            onPress: () => handlePickFromGallery(doc),
          },
          {
            text: 'Archivo',
            onPress: () => handlePickDocument(doc),
          },
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setUploadingDocId(null),
          },
        ]
      );
    }
  };

  const handlePickFile = async (doc) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        await subirArchivo(file, doc);
      } else {
        setUploadingDocId(null);
      }
    };
    input.click();
  };

  const handleTakePhoto = async (doc) => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await subirArchivo(result.assets[0].uri, doc);
    } else {
      setUploadingDocId(null);
    }
  };

  const handlePickFromGallery = async (doc) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await subirArchivo(result.assets[0].uri, doc);
    } else {
      setUploadingDocId(null);
    }
  };

  const handlePickDocument = async (doc) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
      await subirArchivo(result.uri, doc);
    } else {
      setUploadingDocId(null);
    }
  };

  const subirArchivo = async (fileOrUri, doc) => {
    try {
      console.log('[MiLegajo] Subiendo archivo para:', doc.tipo_nombre);

      const formData = new FormData();
      
      if (Platform.OS === 'web' && fileOrUri instanceof File) {
        formData.append('archivo', fileOrUri);
      } else {
        const fileName = fileOrUri.split('/').pop();
        const fileType = fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
        formData.append('archivo', {
          uri: fileOrUri,
          name: fileName,
          type: fileType,
        });
      }

      const uploadResponse = await uploadFile(id_persona, formData);
      const id_archivo = uploadResponse.data?.id_archivo || uploadResponse.id_archivo;

      if (!id_archivo) {
        throw new Error('No se obtuvo id_archivo');
      }

      // Vincular nuevo archivo al documento existente
      await vincularDocumento({
        id_persona,
        id_tipo_doc: doc.id_tipo_doc,
        id_archivo,
      });

      if (Platform.OS === 'web') {
        window.alert(`${doc.tipo_nombre} resubido correctamente`);
      } else {
        Alert.alert('Éxito', `${doc.tipo_nombre} resubido correctamente`);
      }

      // Recargar documentos
      await cargarDatos();
    } catch (error) {
      console.error('[MiLegajo] Error resubiendo archivo:', error);
      const msg = error.response?.data?.message || error.message || 'No se pudo resubir el archivo';
      if (Platform.OS === 'web') {
        window.alert(`Error: ${msg}`);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleSolicitarEliminacion = (doc) => {
    const mensaje = `¿Deseas solicitar la eliminación de ${doc.tipo_nombre}? Esta acción requiere aprobación del administrador.`;
    
    if (Platform.OS === 'web') {
      if (window.confirm(mensaje)) {
        confirmarEliminacion(doc.id_persona_doc, doc.tipo_nombre);
      }
    } else {
      Alert.alert(
        'Confirmar',
        mensaje,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Solicitar', 
            style: 'destructive',
            onPress: () => confirmarEliminacion(doc.id_persona_doc, doc.tipo_nombre)
          },
        ]
      );
    }
  };

  const confirmarEliminacion = async (id_persona_doc, tipo_nombre) => {
    try {
      await solicitarEliminacionDocumento(id_persona_doc);
      
      const msg = `Solicitud de eliminación enviada para ${tipo_nombre}`;
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Éxito', msg);
      }
      
      // Recargar documentos
      await cargarDatos();
    } catch (error) {
      console.error('[MiLegajo] Error solicitando eliminación:', error);
      const msg = error.response?.data?.message || error.message || 'No se pudo solicitar la eliminación';
      if (Platform.OS === 'web') {
        window.alert(`Error: ${msg}`);
      } else {
        Alert.alert('Error', msg);
      }
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Cargando legajo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
        }
      >
        <View style={styles.header}>
          <Ionicons name="folder-open" size={40} color={colors.primary.main} />
          <Text style={styles.title}>Mi Legajo</Text>
          <Text style={styles.subtitle}>
            {user?.nombre} {user?.apellido}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis Documentos</Text>
          
          {documentos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>No hay documentos cargados</Text>
            </View>
          ) : (
            documentos.map((doc) => {
              const estado = getEstadoInfo(doc.id_estado_verificacion);
              const estadoColor = getEstadoColor(estado.codigo);
              const isRechazadoObservado = ['RECHAZADO', 'OBSERVADO'].includes(estado.codigo);
              const isUploading = uploadingDocId === doc.id_persona_doc;

              return (
                <View key={doc.id_persona_doc} style={styles.documentCard}>
                  <View style={styles.documentHeader}>
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentName}>{doc.tipo_nombre}</Text>
                      {doc.archivo_nombre && (
                        <Text style={styles.documentFileName}>{doc.archivo_nombre}</Text>
                      )}
                    </View>
                    
                    <View style={[styles.estadoBadge, { backgroundColor: `${estadoColor}20`, borderColor: estadoColor }]}>
                      <Text style={[styles.estadoText, { color: estadoColor }]}>
                        {estado.nombre}
                      </Text>
                    </View>
                  </View>

                  {doc.observacion && (
                    <View style={styles.observacionBox}>
                      <Ionicons name="alert-circle" size={16} color={colors.status.warning} />
                      <Text style={styles.observacionText}>{doc.observacion}</Text>
                    </View>
                  )}

                  <View style={styles.documentActions}>
                    {isRechazadoObservado && (
                      <TouchableOpacity
                        style={[styles.resubirButton, isUploading && styles.buttonDisabled]}
                        onPress={() => handleResubir(doc)}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Ionicons name="cloud-upload" size={20} color="#fff" />
                            <Text style={styles.resubirButtonText}>Resubir documento</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleSolicitarEliminacion(doc)}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.status.error} />
                      <Text style={styles.deleteButtonText}>Solicitar eliminación</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary.main,
    marginBottom: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    color: colors.text.tertiary,
    fontSize: 16,
  },
  documentCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  documentInfo: {
    flex: 1,
    marginRight: 10,
  },
  documentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  documentFileName: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  observacionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.status.warning}15`,
    borderLeftWidth: 3,
    borderLeftColor: colors.status.warning,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  observacionText: {
    flex: 1,
    marginLeft: 8,
    color: colors.text.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  documentActions: {
    gap: 10,
    marginTop: 10,
  },
  resubirButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary.main,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resubirButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.status.error,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: colors.status.error,
    fontWeight: '600',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default MiLegajoScreen;
