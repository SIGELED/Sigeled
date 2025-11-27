import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, ActivityIndicator, Modal } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AuthContext } from '../../context/AuthContext';
import { uploadFile, getTiposDocumento, vincularDocumento } from '../../services/api';
import colors from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const SubirDocumentoScreen = () => {
    const { user } = useContext(AuthContext);
    const [document, setDocument] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
    const [showTipoSelector, setShowTipoSelector] = useState(false);
    const [loadingTipos, setLoadingTipos] = useState(true);

    useEffect(() => {
        const fetchTipos = async () => {
            try {
                const tipos = await getTiposDocumento();
                console.log('[SubirDocumento] Tipos disponibles:', tipos);
                setTiposDocumento(tipos);
            } catch (err) {
                console.error('Error al cargar tipos de documento:', err);
                Alert.alert('Error', 'No se pudieron cargar los tipos de documento');
            } finally {
                setLoadingTipos(false);
            }
        };
        fetchTipos();
    }, []);

    const handleDocumentPick = async () => {
        try {
            setError('');
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                
                // Validar tamaño (máx 10MB)
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    Alert.alert('Error', 'El archivo es demasiado grande. Máximo 10MB.');
                    return;
                }

                setDocument(file);
                console.log('Archivo seleccionado:', file);
            }
        } catch (err) {
            console.error('Error al seleccionar documento:', err);
            Alert.alert('Error', 'No se pudo seleccionar el archivo');
        }
    };

    const handleUpload = async () => {
        if (!user?.id_persona) {
            Alert.alert('Error', 'Debes iniciar sesión');
            return;
        }

        if (!document) {
            Alert.alert('Error', 'Debes seleccionar un archivo');
            return;
        }

        if (!tipoSeleccionado) {
            Alert.alert('Error', 'Debes seleccionar el tipo de documento');
            return;
        }

        setUploading(true);
        setError('');
        setUploadProgress(0);

        try {
            // Paso 1: Subir el archivo
            console.log('[handleUpload] Subiendo archivo...');
            const uploadResult = await uploadFile(
                document,
                user.id_persona,
                (progress) => {
                    setUploadProgress(Math.round(progress * 100));
                }
            );

            console.log('[handleUpload] Archivo subido:', uploadResult);

            // Paso 2: Vincular el archivo con persona_documentos
            console.log('[handleUpload] Vinculando documento...');
            await vincularDocumento(
                user.id_persona,
                tipoSeleccionado.id_tipo_doc,
                uploadResult.id_archivo
            );

            console.log('[handleUpload] Documento vinculado exitosamente');
            Alert.alert(
                'Éxito',
                `${tipoSeleccionado.nombre} enviado correctamente. Está en revisión.`,
                [{
                    text: 'OK',
                    onPress: () => {
                        setDocument(null);
                        setTipoSeleccionado(null);
                        setUploadProgress(0);
                    }
                }]
            );
        } catch (err) {
            console.error('Error al subir:', err);
            const errorMsg = err.response?.data?.error || err.message || 'Error al subir el archivo';
            setError(errorMsg);
            Alert.alert('Error', errorMsg);
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const getFileIcon = () => {
        if (!document) return 'document-outline';
        if (document.mimeType?.startsWith('image/')) return 'image-outline';
        if (document.mimeType === 'application/pdf') return 'document-text-outline';
        return 'document-outline';
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Subir Documento</Text>
                <Text style={styles.subtitle}>Selecciona un archivo para agregar a tu legajo</Text>

                {/* Selector de tipo de documento */}
                {loadingTipos ? (
                    <View style={styles.loadingTipos}>
                        <ActivityIndicator color={colors.primary.main} />
                        <Text style={styles.loadingText}>Cargando tipos...</Text>
                    </View>
                ) : (
                    <View style={styles.tipoSelectorContainer}>
                        <Text style={styles.tipoLabel}>Tipo de documento *</Text>
                        <TouchableOpacity
                            style={styles.tipoButton}
                            onPress={() => setShowTipoSelector(true)}
                            disabled={uploading}
                        >
                            <Ionicons 
                                name="document-text-outline" 
                                size={20} 
                                color={tipoSeleccionado ? colors.primary.main : colors.text.tertiary} 
                            />
                            <Text style={[
                                styles.tipoButtonText,
                                !tipoSeleccionado && styles.tipoButtonPlaceholder
                            ]}>
                                {tipoSeleccionado ? tipoSeleccionado.nombre : 'Selecciona el tipo'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={colors.text.tertiary} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Botón de selección de archivo */}
                <TouchableOpacity 
                    style={styles.selectButton}
                    onPress={handleDocumentPick}
                    disabled={uploading}
                >
                    <Ionicons name="cloud-upload-outline" size={32} color={colors.primary.main} />
                    <Text style={styles.selectButtonText}>Seleccionar Archivo</Text>
                    <Text style={styles.selectButtonSubtext}>PDF o imagen (máx 10MB)</Text>
                </TouchableOpacity>

                {/* Modal selector de tipos */}
                <Modal
                    visible={showTipoSelector}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowTipoSelector(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Selecciona el tipo</Text>
                                <TouchableOpacity onPress={() => setShowTipoSelector(false)}>
                                    <Ionicons name="close" size={28} color={colors.text.primary} />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.modalList}>
                                {tiposDocumento.map((tipo) => (
                                    <TouchableOpacity
                                        key={tipo.id_tipo_doc}
                                        style={[
                                            styles.tipoItem,
                                            tipoSeleccionado?.id_tipo_doc === tipo.id_tipo_doc && styles.tipoItemSelected
                                        ]}
                                        onPress={() => {
                                            setTipoSeleccionado(tipo);
                                            setShowTipoSelector(false);
                                        }}
                                    >
                                        <Ionicons 
                                            name={tipoSeleccionado?.id_tipo_doc === tipo.id_tipo_doc ? "checkmark-circle" : "ellipse-outline"}
                                            size={24} 
                                            color={tipoSeleccionado?.id_tipo_doc === tipo.id_tipo_doc ? colors.primary.main : colors.text.tertiary}
                                        />
                                        <View style={styles.tipoItemInfo}>
                                            <Text style={styles.tipoItemName}>{tipo.nombre}</Text>
                                            {tipo.descripcion && (
                                                <Text style={styles.tipoItemDesc}>{tipo.descripcion}</Text>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Preview del archivo seleccionado */}
                {document && (
                    <View style={styles.previewContainer}>
                        <View style={styles.previewHeader}>
                            <Ionicons name={getFileIcon()} size={40} color={colors.primary.main} />
                            <View style={styles.previewInfo}>
                                <Text style={styles.fileName} numberOfLines={1}>
                                    {document.name}
                                </Text>
                                <Text style={styles.fileSize}>
                                    {formatFileSize(document.size)}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => setDocument(null)}
                                disabled={uploading}
                            >
                                <Ionicons name="close-circle" size={28} color={colors.status.error} />
                            </TouchableOpacity>
                        </View>

                        {/* Preview de imagen */}
                        {document.mimeType?.startsWith('image/') && document.uri && (
                            <Image 
                                source={{ uri: document.uri }}
                                style={styles.imagePreview}
                                resizeMode="contain"
                            />
                        )}
                    </View>
                )}

                {/* Barra de progreso */}
                {uploading && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View 
                                style={[
                                    styles.progressFill,
                                    { width: `${uploadProgress}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>{uploadProgress}%</Text>
                    </View>
                )}

                {/* Mensaje de error */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={20} color={colors.status.errorText} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Botón de subir */}
                <TouchableOpacity 
                    style={[
                        styles.uploadButton,
                        (!document || !tipoSeleccionado || uploading) && styles.uploadButtonDisabled
                    ]}
                    onPress={handleUpload}
                    disabled={!document || !tipoSeleccionado || uploading}
                >
                    {uploading ? (
                        <ActivityIndicator color={colors.primary.main} size="small" />
                    ) : (
                        <Ionicons name="cloud-done-outline" size={24} color={colors.primary.main} />
                    )}
                    <Text style={styles.uploadButtonText}>
                        {uploading ? 'Subiendo...' : 'Subir Documento'}
                    </Text>
                </TouchableOpacity>

                {/* Información adicional */}
                <View style={styles.infoContainer}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.text.tertiary} />
                    <Text style={styles.infoText}>
                        Los documentos subidos serán revisados por el equipo de RRHH.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary.main,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.text.secondary,
        marginBottom: 32,
    },
    selectButton: {
        backgroundColor: colors.background.secondary,
        borderWidth: 2,
        borderColor: colors.primary.main,
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        marginBottom: 24,
    },
    selectButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
        marginTop: 12,
    },
    selectButtonSubtext: {
        fontSize: 14,
        color: colors.text.tertiary,
        marginTop: 4,
    },
    previewContainer: {
        backgroundColor: colors.background.secondary,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border.secondary,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    previewInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 12,
    },
    fileName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 4,
    },
    fileSize: {
        fontSize: 14,
        color: colors.text.tertiary,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        marginTop: 16,
        borderRadius: 12,
        backgroundColor: colors.background.primary,
    },
    progressContainer: {
        marginBottom: 24,
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.background.secondary,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary.main,
    },
    progressText: {
        fontSize: 14,
        color: colors.text.secondary,
        textAlign: 'center',
        fontWeight: '600',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.status.error,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        color: colors.status.errorText,
        fontWeight: '600',
        marginLeft: 8,
    },
    uploadButton: {
        flexDirection: 'row',
        height: 56,
        backgroundColor: 'transparent',
        borderRadius: 28,
        borderWidth: 3,
        borderColor: colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    uploadButtonDisabled: {
        opacity: 0.4,
    },
    uploadButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary.main,
        marginLeft: 8,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: colors.background.secondary,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border.secondary,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: colors.text.tertiary,
        marginLeft: 12,
        lineHeight: 20,
    },
    // Estilos para selector de tipo
    loadingTipos: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginBottom: 24,
    },
    loadingText: {
        marginLeft: 12,
        color: colors.text.secondary,
    },
    tipoSelectorContainer: {
        marginBottom: 24,
    },
    tipoLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 12,
    },
    tipoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.input,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border.secondary,
    },
    tipoButtonText: {
        flex: 1,
        fontSize: 16,
        color: colors.text.primary,
        marginLeft: 12,
    },
    tipoButtonPlaceholder: {
        color: colors.text.tertiary,
    },
    // Estilos del modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background.secondary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.secondary,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    modalList: {
        padding: 16,
    },
    tipoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: colors.background.primary,
        borderWidth: 1,
        borderColor: colors.border.secondary,
    },
    tipoItemSelected: {
        borderColor: colors.primary.main,
        borderWidth: 2,
        backgroundColor: colors.background.card,
    },
    tipoItemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    tipoItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 4,
    },
    tipoItemDesc: {
        fontSize: 14,
        color: colors.text.tertiary,
    },
});

export default SubirDocumentoScreen;