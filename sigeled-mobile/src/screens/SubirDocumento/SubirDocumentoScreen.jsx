import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { UploadButton } from '../../components/UploadButton';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const SubirDocumentoScreen = () => {
    const [document, setDocument] = useState(null);
    const [documentType, setDocumentType] = useState('');

    const handleDocumentPick = async () => {
        const result = await DocumentPicker.getDocumentAsync({});
        if (result.type === 'success') {
            setDocument(result);
        }
    };

    const { user } = useContext(AuthContext);

    const handleUpload = async () => {
        if (!user) return Alert.alert('Error', 'Debes iniciar sesión');
        if (!documentType) return Alert.alert('Error', 'Seleccioná el tipo de documento (id)');
        setDocument(null);
        try {
            const body = {
                id_persona: user.id_persona,
                id_tipo_doc: Number(documentType),
                id_archivo: null
            };
            const res = await api.post('/persona-doc', body);
            Alert.alert('Éxito', 'Documento enviado correctamente');
            console.log('Documento creado:', res.data);
        } catch (err) {
            console.error('Upload error:', err);
            Alert.alert('Error', err.response?.data?.message || 'Error al subir documento');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Subir Documento</Text>
            <TextInput
                style={styles.input}
                placeholder="Tipo de documento"
                value={documentType}
                onChangeText={setDocumentType}
            />
            <Button title="Seleccionar Documento" onPress={handleDocumentPick} />
            {document && (
                <Text style={styles.documentInfo}>
                    Documento seleccionado: {document.name}
                </Text>
            )}
            <UploadButton onPress={handleUpload} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    documentInfo: {
        marginTop: 20,
        fontSize: 16,
    },
});

export default SubirDocumentoScreen;