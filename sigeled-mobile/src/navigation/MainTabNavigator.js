import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MiLegajoScreen from '../screens/MiLegajo/MiLegajoScreen';
import SubirDocumentoScreen from '../screens/SubirDocumento/SubirDocumentoScreen';
import MisEnviosScreen from '../screens/MisEnvios/MisEnviosScreen';
import { Ionicons } from '@expo/vector-icons';

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
                        } else if (route.name === 'Mis Envíos') {
                            iconName = focused ? 'paper-plane' : 'paper-plane-outline';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: 'tomato',
                    tabBarInactiveTintColor: 'gray',
                })}
            >
                <Tab.Screen name="Mi Legajo" component={MiLegajoScreen} />
                <Tab.Screen name="Subir Documento" component={SubirDocumentoScreen} />
                <Tab.Screen name="Mis Envíos" component={MisEnviosScreen} />
            </Tab.Navigator>
    );
};

export default MainTabNavigator;