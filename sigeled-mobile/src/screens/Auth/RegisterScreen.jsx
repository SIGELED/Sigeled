import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import SigeledLogo from '../../components/SigeledLogo';

const RegisterScreen = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        setError('');

        // Validaciones
        if (!nombre.trim() || !apellido.trim() || !email.trim() || !password || !confirmPassword) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Email inválido');
            return;
        }

        setSubmitting(true);

        try {
            // Aquí iría la llamada al API de registro cuando esté implementada
            // await register({ nombre, apellido, email, password });
            
            Alert.alert(
                'Registro no disponible',
                'La funcionalidad de registro estará disponible próximamente. Por favor, contacta al administrador para crear tu cuenta.',
                [
                    {
                        text: 'Volver al Login',
                        onPress: () => navigation.navigate('Login')
                    }
                ]
            );
        } catch (err) {
            console.error('[RegisterScreen] error:', err);
            setError(err.response?.data?.error || 'Error al crear la cuenta');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    <View style={styles.logoContainer}>
                        <SigeledLogo width={100} height={100} />
                    </View>
                    
                    <Text style={styles.title}>Crear Cuenta</Text>
                    <Text style={styles.subtitle}>Completa tus datos para registrarte</Text>
                    
                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre"
                            placeholderTextColor={colors.text.placeholder}
                            value={nombre}
                            onChangeText={setNombre}
                            autoCapitalize="words"
                            autoComplete="name"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Apellido"
                            placeholderTextColor={colors.text.placeholder}
                            value={apellido}
                            onChangeText={setApellido}
                            autoCapitalize="words"
                            autoComplete="name-family"
                        />
                        
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
                        
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Contraseña"
                                placeholderTextColor={colors.text.placeholder}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoComplete="password-new"
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons 
                                    name={showPassword ? "eye-off" : "eye"} 
                                    size={24} 
                                    color={colors.text.tertiary} 
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Confirmar contraseña"
                                placeholderTextColor={colors.text.placeholder}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                autoComplete="password-new"
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <Ionicons 
                                    name={showConfirmPassword ? "eye-off" : "eye"} 
                                    size={24} 
                                    color={colors.text.tertiary} 
                                />
                            </TouchableOpacity>
                        </View>

                        {error ? (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={20} color={colors.status.errorText} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity 
                            style={[styles.button, submitting && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={submitting}
                        >
                            <Text style={styles.buttonText}>
                                {submitting ? 'Registrando...' : 'Registrarse'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Iniciar Sesión</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 32,
        paddingVertical: 48,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary.main,
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 32,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
    },
    input: {
        height: 56,
        backgroundColor: colors.background.input,
        borderRadius: 12,
        paddingHorizontal: 20,
        fontSize: 16,
        color: colors.text.primary,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border.input,
    },
    passwordContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    passwordInput: {
        height: 56,
        backgroundColor: colors.background.input,
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingRight: 56,
        fontSize: 16,
        color: colors.text.primary,
        borderWidth: 1,
        borderColor: colors.border.input,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 16,
        padding: 4,
    },
    button: {
        height: 56,
        backgroundColor: 'transparent',
        borderRadius: 28,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary.main,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    loginText: {
        fontSize: 16,
        color: colors.text.secondary,
    },
    loginLink: {
        fontSize: 16,
        color: colors.primary.main,
        fontWeight: '600',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.status.error,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    errorText: {
        flex: 1,
        color: colors.status.errorText,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default RegisterScreen;