import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MiLegajoScreen from '../screens/MiLegajo/MiLegajoScreen';
import SubirDocumentoScreen from '../screens/SubirDocumento/SubirDocumentoScreen';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();

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
                    tabBarActiveTintColor: colors.primary.main,
                    tabBarInactiveTintColor: colors.text.tertiary,
                    tabBarStyle: {
                        backgroundColor: colors.background.secondary,
                        borderTopColor: colors.border.secondary,
                    },
                    headerStyle: {
                        backgroundColor: colors.background.secondary,
                    },
                    headerTintColor: colors.text.primary,
                })}
            >
                <Tab.Screen name="Mi Legajo" component={MiLegajoScreen} />
                <Tab.Screen name="Subir Documento" component={SubirDocumentoScreen} />
            </Tab.Navigator>
    );
};

export default MainTabNavigator;