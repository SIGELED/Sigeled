import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DocumentItem = ({ document }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{document.title}</Text>
            <Text style={styles.date}>{document.date}</Text>
            <Text style={styles.status}>{document.status}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 14,
        color: '#666',
    },
    status: {
        fontSize: 14,
        color: document.status === 'Aprobado' ? 'green' : document.status === 'Rechazado' ? 'red' : 'orange',
    },
});

export default DocumentItem;