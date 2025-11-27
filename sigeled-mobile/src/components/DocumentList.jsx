import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

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
        padding: 4,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
        backgroundColor: colors.background.secondary,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border.secondary,
    },
    emptyText: {
        fontSize: 16,
        color: colors.text.tertiary,
        fontStyle: 'italic',
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
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 4,
    },
    itemStatus: {
        fontSize: 14,
        color: colors.text.secondary,
    },
});

export default DocumentList;