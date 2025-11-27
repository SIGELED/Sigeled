import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';

const DocumentList = ({ documents }) => {
    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemStatus}>{item.status}</Text>
        </View>
    );

    return (
        <FlatList
            data={documents}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
        />
    );
};

const styles = StyleSheet.create({
    listContainer: {
        padding: 16,
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