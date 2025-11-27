import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { getSignedUrl } from '../services/api';

const DocumentList = ({ documents }) => {
    const [loadingDoc, setLoadingDoc] = useState(null);

    const handleViewDocument = async (document) => {
        if (!document.id_archivo) {
            Alert.alert('Aviso', 'Este documento aún no tiene archivo asociado');
            return;
        }

        setLoadingDoc(document.id_titulo || document.id_archivo);
        try {
            console.log('[DocumentList] Obteniendo URL para archivo:', document.id_archivo);
            const signedUrlData = await getSignedUrl(document.id_archivo);
            console.log('[DocumentList] URL obtenida:', signedUrlData);

            // Abrir el archivo en el navegador
            const supported = await Linking.canOpenURL(signedUrlData.url);
            if (supported) {
                await Linking.openURL(signedUrlData.url);
            } else {
                Alert.alert('Error', 'No se puede abrir este tipo de archivo');
            }
        } catch (error) {
            console.error('[DocumentList] Error al abrir documento:', error);
            Alert.alert('Error', 'No se pudo abrir el documento');
        } finally {
            setLoadingDoc(null);
        }
    };

    const getDocumentIcon = (doc) => {
        if (!doc.id_archivo) return 'document-outline';
        // Podrías verificar el content_type si está disponible
        return 'document-text';
    };

    const getStatusColor = (doc) => {
        // Si tiene estado de verificación
        if (doc.id_estado_verificacion === 1) return colors.status.success; // Aprobado
        if (doc.id_estado_verificacion === 2) return colors.status.error;   // Rechazado
        if (doc.id_estado_verificacion === 3) return colors.status.warning; // Pendiente
        return colors.text.tertiary;
    };

    if (!documents || documents.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color={colors.text.tertiary} />
                <Text style={styles.emptyText}>No hay documentos</Text>
            </View>
        );
    }

    return (
        <View style={styles.listContainer}>
            {documents.map((item, index) => {
                const isLoading = loadingDoc === (item.id_titulo || item.id_archivo);
                const hasFile = !!item.id_archivo;
                
                // Generar una key única
                const uniqueKey = item.id_titulo || item.id_persona_doc || item.id_archivo || `doc-${index}`;

                return (
                    <View key={uniqueKey} style={styles.itemContainer}>
                        <View style={styles.itemHeader}>
                            <Ionicons 
                                name={getDocumentIcon(item)} 
                                size={24} 
                                color={hasFile ? colors.primary.main : colors.text.tertiary}
                            />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemTitle} numberOfLines={2}>
                                    {item.nombre_titulo || item.title || item.tipo_nombre || 'Sin título'}
                                </Text>
                                {item.institucion && (
                                    <Text style={styles.itemSubtitle} numberOfLines={1}>
                                        {item.institucion}
                                    </Text>
                                )}
                                {item.archivo_nombre && (
                                    <Text style={styles.itemSubtitle} numberOfLines={1}>
                                        {item.archivo_nombre}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {hasFile ? (
                            <TouchableOpacity
                                style={styles.viewButton}
                                onPress={() => handleViewDocument(item)}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Text style={styles.viewButtonText}>Cargando...</Text>
                                ) : (
                                    <>
                                        <Ionicons name="eye-outline" size={18} color={colors.primary.main} />
                                        <Text style={styles.viewButtonText}>Ver archivo</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.noFileContainer}>
                                <Ionicons name="alert-circle-outline" size={16} color={colors.status.warning} />
                                <Text style={styles.noFileText}>Sin archivo</Text>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        padding: 4,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background.secondary,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border.secondary,
    },
    emptyText: {
        fontSize: 16,
        color: colors.text.tertiary,
        fontStyle: 'italic',
        marginTop: 12,
    },
    itemContainer: {
        padding: 16,
        marginVertical: 8,
        borderRadius: 16,
        backgroundColor: colors.background.secondary,
        borderWidth: 1,
        borderColor: colors.border.secondary,
        shadowColor: colors.primary.main,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 14,
        color: colors.text.secondary,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background.primary,
        borderWidth: 2,
        borderColor: colors.primary.main,
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary.main,
        marginLeft: 6,
    },
    noFileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        marginTop: 8,
        backgroundColor: colors.background.primary,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border.secondary,
    },
    noFileText: {
        fontSize: 14,
        color: colors.status.warning,
        marginLeft: 6,
    },
});

export default DocumentList;