import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DocumentList = ({ documents }) => {
    if (!documents || documents.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay documentos</Text>
            </View>
        );
    }

    return (
        <View style={styles.listContainer}>
            {documents.map((item) => (
                <View key={item.id.toString()} style={styles.itemContainer}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemStatus}>{item.status}</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        padding: 16,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
    },
    itemContainer: {
        padding: 12,
        marginVertical: 8,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemStatus: {
        fontSize: 14,
        color: '#666',
    },
});

export default DocumentList;