import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import SigeledLogo from '../../components/SigeledLogo';
import { registerFull, setAuthToken } from '../../services/api';
import storage from '../../utils/storage';

const RegisterScreen = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [dni, setDni] = useState('');
    const [cuil, setCuil] = useState('');
    const [telefono, setTelefono] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [sexo, setSexo] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        setError('');

        // Validaciones
        if (!nombre.trim() || !apellido.trim() || !email.trim() || !password || !confirmPassword || 
            !dni.trim() || !cuil.trim() || !telefono.trim() || !fechaNacimiento.trim() || !sexo.trim()) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Email inválido');
            return;
        }

        // Validar DNI (solo números, 7-8 dígitos)
        if (!/^\d{7,8}$/.test(dni)) {
            setError('DNI inválido (debe tener 7-8 dígitos)');
            return;
        }

        // Validar CUIL (formato XX-XXXXXXXX-X)
        if (!/^\d{2}-?\d{8}-?\d{1}$/.test(cuil.replace(/\s/g, ''))) {
            setError('CUIL inválido (formato: XX-XXXXXXXX-X)');
            return;
        }

        // Validar fecha de nacimiento (formato YYYY-MM-DD o DD/MM/YYYY)
        let formattedDate = fechaNacimiento;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaNacimiento)) {
            // Convertir DD/MM/YYYY a YYYY-MM-DD
            const [day, month, year] = fechaNacimiento.split('/');
            formattedDate = `${year}-${month}-${day}`;
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
            setError('Fecha de nacimiento inválida (formato: DD/MM/YYYY o YYYY-MM-DD)');
            return;
        }

        setSubmitting(true);

        try {
            console.log('[RegisterScreen] Enviando registro...');
            const response = await registerFull({
                email: email.trim().toLowerCase(),
                password,
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                dni: dni.trim(),
                cuil: cuil.trim().replace(/\s/g, ''),
                telefono: telefono.trim(),
                fecha_nacimiento: formattedDate,
                sexo: sexo.trim()
            });

            console.log('[RegisterScreen] Registro exitoso:', response);

            // Guardar token y usuario
            if (response.token) {
                await storage.setItem('userToken', response.token);
                await storage.setItem('user', JSON.stringify(response.user));
                setAuthToken(response.token);
                console.log('[RegisterScreen] Token guardado');
            }

            // Extraer id_persona de la respuesta
            const id_persona = response.user?.id_persona || response.id_persona;

            if (!id_persona) {
                throw new Error('No se pudo obtener el ID de persona');
            }

            Alert.alert(
                'Registro Exitoso',
                'Tu cuenta ha sido creada. Ahora completa tus datos personales.',
                [
                    {
                        text: 'Continuar',
                        onPress: () => navigation.navigate('CompletarRegistro', { id_persona })
                    }
                ]
            );
        } catch (err) {
            console.error('[RegisterScreen] error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Error al crear la cuenta';
            setError(errorMsg);
            Alert.alert('Error', errorMsg);
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
                            placeholder="DNI (sin puntos)"
                            placeholderTextColor={colors.text.placeholder}
                            value={dni}
                            onChangeText={setDni}
                            keyboardType="numeric"
                            maxLength={8}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="CUIL (XX-XXXXXXXX-X)"
                            placeholderTextColor={colors.text.placeholder}
                            value={cuil}
                            onChangeText={setCuil}
                            keyboardType="numeric"
                            maxLength={13}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Teléfono"
                            placeholderTextColor={colors.text.placeholder}
                            value={telefono}
                            onChangeText={setTelefono}
                            keyboardType="phone-pad"
                            autoComplete="tel"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Fecha de Nacimiento (DD/MM/AAAA)"
                            placeholderTextColor={colors.text.placeholder}
                            value={fechaNacimiento}
                            onChangeText={setFechaNacimiento}
                            keyboardType="numeric"
                            maxLength={10}
                        />

                        <View style={styles.sexoContainer}>
                            <TouchableOpacity
                                style={[styles.sexoButton, sexo === 'M' && styles.sexoButtonSelected]}
                                onPress={() => setSexo('M')}
                            >
                                <Ionicons 
                                    name="male" 
                                    size={24} 
                                    color={sexo === 'M' ? colors.primary.main : colors.text.tertiary} 
                                />
                                <Text style={[styles.sexoText, sexo === 'M' && styles.sexoTextSelected]}>
                                    Masculino
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sexoButton, sexo === 'F' && styles.sexoButtonSelected]}
                                onPress={() => setSexo('F')}
                            >
                                <Ionicons 
                                    name="female" 
                                    size={24} 
                                    color={sexo === 'F' ? colors.primary.main : colors.text.tertiary} 
                                />
                                <Text style={[styles.sexoText, sexo === 'F' && styles.sexoTextSelected]}>
                                    Femenino
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sexoButton, sexo === 'X' && styles.sexoButtonSelected]}
                                onPress={() => setSexo('X')}
                            >
                                <Ionicons 
                                    name="transgender" 
                                    size={24} 
                                    color={sexo === 'X' ? colors.primary.main : colors.text.tertiary} 
                                />
                                <Text style={[styles.sexoText, sexo === 'X' && styles.sexoTextSelected]}>
                                    Otro
                                </Text>
                            </TouchableOpacity>
                        </View>
                        
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
    sexoContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    sexoButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 56,
        backgroundColor: colors.background.input,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border.input,
    },
    sexoButtonSelected: {
        borderColor: colors.primary.main,
        backgroundColor: colors.primary.main + '15',
    },
    sexoText: {
        fontSize: 14,
        color: colors.text.tertiary,
        fontWeight: '600',
    },
    sexoTextSelected: {
        color: colors.primary.main,
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