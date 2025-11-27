import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { getLegajoByPersona, getPersonaById, getTitulosByPersona, getDocumentosByPersona, getIdentificacionByPersona, getDomiciliosByPersona } from '../../services/api';
import DocumentList from '../../components/DocumentList';
import { useLegajoCache } from '../../hooks/useLegajoCache';
import { Ionicons } from '@expo/vector-icons';

const MiLegajoScreen = () => {
    const { user } = useContext(AuthContext);
    const [personaData, setPersonaData] = useState(null);
    const [identificacionData, setIdentificacionData] = useState(null);
    const [domiciliosData, setDomiciliosData] = useState([]);
    const [titulosData, setTitulosData] = useState([]);
    const [documentosData, setDocumentosData] = useState([]);
    const [legajoEstado, setLegajoEstado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [isOffline, setIsOffline] = useState(false);
    
    const { loadFromCache, saveToCache, isFromCache } = useLegajoCache(user?.id_persona);

    const fetchLegajoData = async (forceRefresh = false) => {
        if (!user?.id_persona) {
            setError('No se encontró información de persona');
            setLoading(false);
            return;
        }

        // Si no es refresh forzado, intentar cargar del cache primero
        if (!forceRefresh) {
            const cached = await loadFromCache();
            if (cached) {
                setPersonaData(cached.persona);
                setIdentificacionData(cached.identificacion);
                setDomiciliosData(cached.domicilios);
                setTitulosData(cached.titulos);
                setDocumentosData(cached.documentos);
                setLegajoEstado(cached.estado);
                setLoading(false);
                setIsOffline(false);
                return;
            }
        }

        try {
            // Obtener datos en paralelo desde el servidor
            const [persona, identificacion, domicilios, titulos, documentos, estado] = await Promise.all([
                getPersonaById(user.id_persona),
                getIdentificacionByPersona(user.id_persona).catch(() => null),
                getDomiciliosByPersona(user.id_persona).catch(() => []),
                getTitulosByPersona(user.id_persona),
                getDocumentosByPersona(user.id_persona),
                getLegajoByPersona(user.id_persona)
            ]);
            
            const legajoData = {
                persona,
                identificacion: identificacion?.[0] || null,
                domicilios: domicilios || [],
                titulos: titulos || [],
                documentos: documentos || [],
                estado
            };

            setPersonaData(persona);
            setIdentificacionData(identificacion?.[0] || null);
            setDomiciliosData(domicilios || []);
            setTitulosData(titulos || []);
            setDocumentosData(documentos || []);
            setLegajoEstado(estado);
            setIsOffline(false);
            setError(null);
            
            // Guardar en cache
            await saveToCache(legajoData);
            
            console.log('[MiLegajo] Datos actualizados desde servidor');
        } catch (err) {
            console.error('[MiLegajo] Error al cargar datos:', err);
            
            // Si falla, intentar cargar del cache
            const cached = await loadFromCache();
            if (cached) {
                setPersonaData(cached.persona);
                setIdentificacionData(cached.identificacion);
                setDomiciliosData(cached.domicilios);
                setTitulosData(cached.titulos);
                setDocumentosData(cached.documentos);
                setLegajoEstado(cached.estado);
                setIsOffline(true);
                setError('Sin conexión - Mostrando datos guardados');
            } else {
                setError(err.message || 'Error al obtener legajo');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLegajoData();
    }, [user]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLegajoData(true);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary.main]}
                    tintColor={colors.primary.main}
                />
            }
        >
            {(isOffline || isFromCache) && (
                <View style={styles.offlineBanner}>
                    <Ionicons name="cloud-offline" size={20} color={colors.text.primary} />
                    <Text style={styles.offlineText}>
                        {isOffline ? 'Sin conexión - Datos guardados' : 'Datos del cache'}
                    </Text>
                </View>
            )}
            
            <Text style={styles.title}>Mis Datos</Text>
            
            <View style={styles.dataSection}>
                <Text style={styles.label}>Nombre: 
                    <Text style={styles.value}>
                        {personaData ? `${personaData.nombre || ''} ${personaData.apellido || ''}`.trim() : 'No disponible'}
                    </Text>
                </Text>
                
                <Text style={styles.label}>Email: 
                    <Text style={styles.value}>
                        {user?.email || 'No disponible'}
                    </Text>
                </Text>
                
                <Text style={styles.label}>Teléfono: 
                    <Text style={styles.value}>
                        {personaData?.telefono || 'No registrado'}
                    </Text>
                </Text>

                {identificacionData && (
                    <>
                        <Text style={styles.label}>DNI: 
                            <Text style={styles.value}>
                                {identificacionData.dni || 'No registrado'}
                            </Text>
                        </Text>
                        
                        <Text style={styles.label}>CUIL: 
                            <Text style={styles.value}>
                                {identificacionData.cuil || 'No registrado'}
                            </Text>
                        </Text>
                    </>
                )}

                {domiciliosData && domiciliosData.length > 0 && (
                    <View style={styles.domicilioContainer}>
                        <Text style={styles.label}>Domicilio:</Text>
                        {domiciliosData.map((dom, idx) => (
                            <View key={dom.id_domicilio || `domicilio-${idx}`} style={styles.domicilioItem}>
                                <Text style={styles.value}>
                                    {[dom.calle, dom.numero, dom.barrio, dom.localidad, dom.departamento_admin]
                                        .filter(Boolean)
                                        .join(', ')}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <Text style={styles.sectionTitle}>Documentos</Text>
            <DocumentList documents={documentosData} />

            <Text style={styles.sectionTitle}>Títulos</Text>
            <DocumentList documents={titulosData} />
            
            {legajoEstado && (
                <View style={styles.estadoSection}>
                    <Text style={styles.estadoLabel}>Estado del Legajo:</Text>
                    <Text style={styles.estadoValue}>
                        {legajoEstado.estado?.codigo || 'No verificado'}
                    </Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: colors.background.primary,
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background.secondary,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary.main,
        gap: 8,
    },
    offlineText: {
        color: colors.text.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
    },
    errorText: {
        color: colors.status.error,
        fontSize: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: colors.primary.main,
    },
    dataSection: {
        marginBottom: 24,
        backgroundColor: colors.background.secondary,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border.secondary,
    },
    label: {
        fontSize: 16,
        marginVertical: 8,
        fontWeight: '600',
        color: colors.text.primary,
    },
    value: {
        fontWeight: '400',
        color: colors.text.secondary,
    },
    domicilioContainer: {
        marginTop: 8,
    },
    domicilioItem: {
        marginLeft: 16,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 12,
        color: colors.text.primary,
    },
    estadoSection: {
        marginTop: 24,
        marginBottom: 20,
        padding: 20,
        backgroundColor: colors.background.secondary,
        borderRadius: 16,
        borderLeftWidth: 5,
        borderLeftColor: colors.primary.main,
    },
    estadoLabel: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    estadoValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary.main,
    },
});

export default MiLegajoScreen;