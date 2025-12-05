import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import SigeledLogo from '../../components/SigeledLogo';

const RevisionScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <SigeledLogo style={styles.logo} />
        
        <View style={styles.iconContainer}>
          <Ionicons name="hourglass-outline" size={80} color={colors.primary} />
        </View>

        <Text style={styles.title}>Registro completado</Text>
        
        <Text style={styles.message}>
          Tu legajo ha sido enviado para revisión.
        </Text>

        <Text style={styles.submessage}>
          Un administrador revisará tu información y activará tu cuenta en breve. 
          Recibirás una notificación cuando esto suceda.
        </Text>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>¿Qué sigue?</Text>
            <Text style={styles.infoText}>
              • Revisaremos tus documentos{'\n'}
              • Validaremos tu información{'\n'}
              • Activaremos tu cuenta{'\n'}
              • Te notificaremos por email
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Ir al Login</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Mientras tanto, puedes cerrar esta aplicación.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 15,
  },
  message: {
    fontSize: 18,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  submessage: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    width: '100%',
    gap: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary.main,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.secondary,
    backgroundColor: colors.background.secondary,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: colors.primary.main,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default RevisionScreen;
