import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import storage from '../../utils/storage';

const LoginScreen = ({ navigation }) => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [savedToken, setSavedToken] = useState(null);
    const [savedUser, setSavedUser] = useState(null);
    const handleLogin = async () => {
        setSubmitting(true);
        setStatus('Iniciando sesión...');
        try {
            // AuthContext.login expects an object with credentials
            const resp = await login({ email, password });
            console.log('[LoginScreen] login response:', resp);
            setStatus('Login correcto');
            setStatus('Login correcto');
            Alert.alert('Login correcto', 'Has iniciado sesión correctamente');
            // refresh saved auth to show token/user on screen
            await refreshStoredAuth();
            // Navigate to the main app stack (named 'Main' in AppNavigator)
            // use parent navigator as fallback when nested
            if (navigation.getParent && navigation.getParent()) {
                navigation.getParent().navigate('Main');
            } else {
                navigation.navigate('Main');
            }
            navigation.navigate('Main');
        } catch (error) {
            console.error('[LoginScreen] login error', error);
            setStatus('Error de login');
            Alert.alert('Error', 'Credenciales incorrectas. Inténtalo de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    const showStoredAuth = async () => {
        try {
            const token = await storage.getItem('userToken');
            const userRaw = await storage.getItem('user');
            console.log('[LoginScreen] storage userToken:', token);
            console.log('[LoginScreen] storage userRaw:', userRaw);
            Alert.alert('Stored auth', `token: ${!!token}\nuser: ${userRaw ? 'present' : 'null'}`);
        } catch (e) {
            console.error('Error reading storage', e);
            Alert.alert('Error', 'No se pudo leer storage');
        }
    };
    const refreshStoredAuth = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const userRaw = await SecureStore.getItemAsync('user');
            setSavedToken(token);
            if (userRaw) {
                try { setSavedUser(JSON.parse(userRaw)); } catch(e) { setSavedUser(userRaw); }
            } else setSavedUser(null);
        } catch (e) {
            console.error('Error reading SecureStore', e);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Iniciar Sesión</Text>
            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Iniciar Sesión" onPress={handleLogin} disabled={submitting} />
            <View style={{height:8}} />
            <Button title="Debug: mostrar auth almacenado" onPress={showStoredAuth} color="#888" disabled={submitting} />
            <View style={{height:12}} />
            <Text style={{textAlign:'center', color:'#333'}}>{status}</Text>
            <View style={{height:12}} />
            <Text style={{fontWeight:'600'}}>SecureStore</Text>
            <Text>token: {savedToken ? 'present' : 'null'}</Text>
            <Text>user: {savedUser ? JSON.stringify(savedUser) : 'null'}</Text>
            <Button
                title="¿No tienes una cuenta? Regístrate"
                onPress={() => navigation.navigate('Register')}
                color="#6c757d"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
});

export default LoginScreen;