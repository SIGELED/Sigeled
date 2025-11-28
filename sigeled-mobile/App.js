import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingIndicator from './src/components/LoadingIndicator';
import NotificationManager from './src/components/NotificationManager';

function RootNavigation() {
  const { loading } = useAuth();
  if (loading) return <LoadingIndicator />;
  return (
    <NavigationContainer>
      <AppNavigator />
      <NotificationManager />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}