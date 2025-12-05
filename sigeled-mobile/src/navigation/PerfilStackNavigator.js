import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

// Importar pantallas
import PerfilScreen from '../screens/Perfil/PerfilScreen';
import DomiciliosScreen from '../screens/Domicilios/DomiciliosScreen';
import AgregarDomicilioScreen from '../screens/Domicilios/AgregarDomicilioScreen';
import TitulosScreen from '../screens/Titulos/TitulosScreen';
import AgregarTituloScreen from '../screens/Titulos/AgregarTituloScreen';

const Stack = createNativeStackNavigator();

const PerfilStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.secondary,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="PerfilMain" 
        component={PerfilScreen}
        options={{ 
          title: 'Mi Perfil',
          headerShown: false, // Ocultar header porque el tab ya tiene uno
        }}
      />
      <Stack.Screen 
        name="Domicilios" 
        component={DomiciliosScreen}
        options={{ 
          title: 'Mis Domicilios',
        }}
      />
      <Stack.Screen 
        name="AgregarDomicilio" 
        component={AgregarDomicilioScreen}
        options={{ 
          title: 'Agregar Domicilio',
        }}
      />
      <Stack.Screen 
        name="Titulos" 
        component={TitulosScreen}
        options={{ 
          title: 'Mis Títulos',
        }}
      />
      <Stack.Screen 
        name="AgregarTitulo" 
        component={AgregarTituloScreen}
        options={{ 
          title: 'Agregar Título',
        }}
      />
    </Stack.Navigator>
  );
};

export default PerfilStackNavigator;
