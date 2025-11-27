import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getMisEnviosByPersona } from '../../services/api';
import LoadingIndicator from '../../components/LoadingIndicator';

const MisEnviosScreen = () => {
    const { user } = useContext(AuthContext);
    const [envios, setEnvios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getEnvios = async () => {
            if (!user) return setLoading(false);
            try {
                const data = await getMisEnviosByPersona(user.id_persona);
                setEnvios(data);
            } catch (err) {
                setError(err.message || 'Error al obtener envíos');
            } finally {
                setLoading(false);
            }
        };

        getEnvios();
    }, [user]);

    if (loading) {
        return <LoadingIndicator />;
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={envios}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.itemText}>{item.estado}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    item: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    itemText: {
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default MisEnviosScreen;