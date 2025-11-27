import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getLegajoByPersona, getPersonaById, getTitulosByPersona } from '../../services/api';
import DocumentList from '../../components/DocumentList';

const MiLegajoScreen = () => {
    const { user } = useContext(AuthContext);
    const [personaData, setPersonaData] = useState(null);
    const [titulosData, setTitulosData] = useState([]);
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
                const [persona, titulos, estado] = await Promise.all([
                    getPersonaById(user.id_persona),
                    getTitulosByPersona(user.id_persona),
                    getLegajoByPersona(user.id_persona)
                ]);
                
                setPersonaData(persona);
                setTitulosData(titulos || []);
                setLegajoEstado(estado);
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
                <ActivityIndicator size="large" color="#0000ff" />
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
            </View>

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
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    dataSection: {
        marginBottom: 24,
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 8,
    },
    label: {
        fontSize: 16,
        marginVertical: 8,
        fontWeight: '600',
        color: '#333',
    },
    value: {
        fontWeight: '400',
        color: '#666',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 12,
        color: '#333',
    },
    estadoSection: {
        marginTop: 24,
        padding: 16,
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2196f3',
    },
    estadoLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    estadoValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1976d2',
    },
});

export default MiLegajoScreen;