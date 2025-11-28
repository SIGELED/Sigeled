import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MiLegajoScreen from '../screens/MiLegajo/MiLegajoScreen';
import SubirDocumentoScreen from '../screens/SubirDocumento/SubirDocumentoScreen';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import SigeledLogo from '../components/SigeledLogo';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

const LogoTitle = () => {
    return (
        <View style={styles.logoContainer}>
            <SigeledLogo width={40} height={40} />
        </View>
    );
};

const LogoutButton = () => {
    const { logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro que deseas salir?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Salir',
                    onPress: async () => {
                        await logout();
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    return (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
    );
};

const MainTabNavigator = () => {
    return (
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;

                        if (route.name === 'Mi Legajo') {
                            iconName = focused ? 'document-text' : 'document-text-outline';
                        } else if (route.name === 'Subir Documento') {
                            iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    headerTitle: () => <LogoTitle />,
                    headerRight: () => <LogoutButton />,
                    headerStyle: {
                        backgroundColor: colors.background.secondary,
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border.secondary,
                    },
                    headerTintColor: colors.text.primary,
                    tabBarActiveTintColor: colors.primary.main,
                    tabBarInactiveTintColor: colors.text.tertiary,
                    tabBarStyle: {
                        backgroundColor: colors.background.secondary,
                        borderTopColor: colors.border.secondary,
                    },
                })}
            >
                <Tab.Screen name="Mi Legajo" component={MiLegajoScreen} />
                <Tab.Screen name="Subir Documento" component={SubirDocumentoScreen} />
            </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButton: {
        marginRight: 16,
        padding: 4,
    },
});

export default MainTabNavigator;