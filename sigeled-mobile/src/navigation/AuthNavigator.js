import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import CompletarRegistroScreen from '../screens/CompletarRegistro/CompletarRegistroScreen';
import RevisionScreen from '../screens/Auth/RevisionScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
                options={{ headerShown: false }} 
            />
            <Stack.Screen 
                name="Register" 
                component={RegisterScreen} 
                options={{ headerShown: false }} 
            />
            <Stack.Screen 
                name="CompletarRegistro" 
                component={CompletarRegistroScreen} 
                options={{ 
                    headerShown: true,
                    title: 'Completar Registro',
                    headerBackVisible: false,
                }} 
            />
            <Stack.Screen 
                name="Revision" 
                component={RevisionScreen} 
                options={{ 
                    headerShown: false,
                    gestureEnabled: false,
                }} 
            />
        </Stack.Navigator>
    );
};

export default AuthNavigator;