import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../theme/colors';

const LoginScreen = ({ navigation }) => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async () => {
        setSubmitting(true);
        setError('');
        try {
            const resp = await login({ email, password });
            console.log('[LoginScreen] login response:', resp);
            
            // Navigate to the main app stack
            if (navigation.getParent && navigation.getParent()) {
                navigation.getParent().navigate('Main');
            } else {
                navigation.navigate('Main');
            }
        } catch (error) {
            console.error('[LoginScreen] login error', error);
            setError('Credenciales incorrectas. Inténtalo de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Iniciar Sesión</Text>
                <Text style={styles.subtitle}>SIGELED</Text>
                
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={colors.text.placeholder}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                    
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor={colors.text.placeholder}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoComplete="password"
                    />

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity 
                        style={[styles.button, submitting && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={submitting}
                    >
                        <Text style={styles.buttonText}>
                            {submitting ? 'Ingresando...' : 'Ingresar'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}>Registrarse</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 32,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.primary.main,
        marginBottom: 8,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 24,
        color: colors.text.secondary,
        marginBottom: 48,
        textAlign: 'left',
    },
    formContainer: {
        width: '100%',
    },
    input: {
        height: 56,
        backgroundColor: colors.background.input,
        borderRadius: 12,
        paddingHorizontal: 20,
        fontSize: 18,
        color: colors.text.primary,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    button: {
        height: 64,
        backgroundColor: 'transparent',
        borderRadius: 32,
        borderWidth: 3,
        borderColor: colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary.main,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    registerText: {
        fontSize: 16,
        color: colors.text.secondary,
    },
    registerLink: {
        fontSize: 16,
        color: colors.primary.main,
        fontWeight: '600',
    },
    errorContainer: {
        backgroundColor: colors.status.error,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    errorText: {
        color: colors.status.errorText,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default LoginScreen;