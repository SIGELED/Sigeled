import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { getLegajoByPersona, getPersonaById, getTitulosByPersona, getDocumentosByPersona, getIdentificacionByPersona, getDomiciliosByPersona } from '../../services/api';
import DocumentList from '../../components/DocumentList';

const MiLegajoScreen = () => {
    const { user } = useContext(AuthContext);
    const [personaData, setPersonaData] = useState(null);
    const [identificacionData, setIdentificacionData] = useState(null);
    const [domiciliosData, setDomiciliosData] = useState([]);
    const [titulosData, setTitulosData] = useState([]);
    const [documentosData, setDocumentosData] = useState([]);
    const [legajoEstado, setLegajoEstado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLegajoData = async () => {
            if (!user?.id_persona) {
                setError('No se encontró información de persona');
                setLoading(false);
                return;
            }
            try {
                // Obtener datos en paralelo
                const [persona, identificacion, domicilios, titulos, documentos, estado] = await Promise.all([
                    getPersonaById(user.id_persona),
                    getIdentificacionByPersona(user.id_persona).catch(() => null),
                    getDomiciliosByPersona(user.id_persona).catch(() => []),
                    getTitulosByPersona(user.id_persona),
                    getDocumentosByPersona(user.id_persona),
                    getLegajoByPersona(user.id_persona)
                ]);
                
                setPersonaData(persona);
                setIdentificacionData(identificacion?.[0] || null);
                setDomiciliosData(domicilios || []);
                setTitulosData(titulos || []);
                setDocumentosData(documentos || []);
                setLegajoEstado(estado);
                
                console.log('[MiLegajo] Identificación:', identificacion);
                console.log('[MiLegajo] Domicilios:', domicilios?.length || 0);
                console.log('[MiLegajo] Títulos:', titulos?.length || 0);
                console.log('[MiLegajo] Documentos:', documentos?.length || 0);
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError(err.message || 'Error al obtener legajo');
            } finally {
                setLoading(false);
            }
        };

        fetchLegajoData();
    }, [user]);

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
        <ScrollView style={styles.container}>
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