import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getLegajoByPersona } from '../../services/api';
import DocumentList from '../../components/DocumentList';

const MiLegajoScreen = () => {
    const { user } = useContext(AuthContext);
    const [legajoData, setLegajoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLegajoData = async () => {
            if (!user) return setLoading(false);
            try {
                const data = await getLegajoByPersona(user.id_persona);
                setLegajoData(data);
            } catch (err) {
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
            <Text style={styles.label}>Nombre: {legajoData.nombre}</Text>
            <Text style={styles.label}>Email: {legajoData.email}</Text>
            <Text style={styles.label}>Teléfono: {legajoData.telefono}</Text>
            <Text style={styles.label}>Títulos:</Text>
            <DocumentList documents={legajoData.documentos} />
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
    label: {
        fontSize: 18,
        marginVertical: 4,
    },
});

export default MiLegajoScreen;