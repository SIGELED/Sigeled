import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Stepper from '../../components/Stepper';
import Step1Documentos from './Step1Documentos';
import Step2Domicilio from './Step2Domicilio';
import Step3Titulos from './Step3Titulos';
import colors from '../../theme/colors';
import { createDomicilio, createBarrio, assignBarrioToPersona as assignBarrio, createTitulo, recalcularLegajo } from '../../services/api';

const CompletarRegistroScreen = ({ route, navigation }) => {
  const { id_persona } = route.params;
  const [currentStep, setCurrentStep] = useState(1);
  const [domicilioData, setDomicilioData] = useState(null); // Igual que domPayload en web
  const [tituloData, setTituloData] = useState(null); // Igual que tituloDraft en web
  const [saving, setSaving] = useState(false);

  const steps = ['Documentos', 'Domicilio', 'Títulos'];

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Función finalizar - IGUAL que en el web
  const finalizarRegistro = async () => {
    if (!id_persona) {
      const msg = 'Falta id_persona';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
      return;
    }

    try {
      setSaving(true);
      console.log('[CompletarRegistro] ===== INICIO FINALIZAR =====');
      console.log('[CompletarRegistro] domicilioData:', domicilioData);
      console.log('[CompletarRegistro] tituloData:', tituloData);

      // 1. Guardar domicilio (si existe)
      if (domicilioData) {
        console.log('[CompletarRegistro] Guardando domicilio...');
        const { id_dom_barrio, barrioNuevo, calle, altura } = domicilioData;
        let barrioId = id_dom_barrio || null;

        // Crear barrio nuevo si es necesario
        if (!barrioId && barrioNuevo) {
          console.log('[CompletarRegistro] Creando nuevo barrio...');
          const { id_dom_localidad, barrio, manzana, casa, departamento, piso } = barrioNuevo;
          const barrioCreado = await createBarrio(id_dom_localidad, {
            barrio,
            manzana,
            casa,
            departamento,
            piso,
          });
          barrioId = barrioCreado.id_dom_barrio;
          console.log('[CompletarRegistro] Barrio creado:', barrioId);
        }

        // Asignar barrio a la persona
        if (barrioId) {
          console.log('[CompletarRegistro] Asignando barrio...');
          await assignBarrio(id_persona, barrioId);
        }

        // Crear domicilio
        console.log('[CompletarRegistro] Creando domicilio...');
        await createDomicilio(id_persona, { calle, altura, id_dom_barrio: barrioId });
        console.log('[CompletarRegistro] ✅ Domicilio guardado');
      }

      // 2. Guardar título (si existe y tiene datos mínimos)
      if (tituloData && tituloData.id_tipo_titulo && tituloData.nombre_titulo) {
        console.log('[CompletarRegistro] Guardando título...');
        await createTitulo({ id_persona, ...tituloData });
        console.log('[CompletarRegistro] ✅ Título guardado');
      }

      // 3. Recalcular legajo
      try {
        console.log('[CompletarRegistro] Recalculando legajo...');
        await recalcularLegajo(id_persona);
        console.log('[CompletarRegistro] ✅ Legajo recalculado');
      } catch (error) {
        console.warn('[CompletarRegistro] Error recalculando legajo (no crítico):', error);
      }

      // 4. Navegar a pantalla de Revisión
      console.log('[CompletarRegistro] ✅ TODO COMPLETADO - Navegando a Revisión');
      navigation.navigate('Revision');
    } catch (error) {
      console.error('[CompletarRegistro] ❌ Error finalizando registro:', error);
      console.error('[CompletarRegistro] Error response:', error.response?.data);
      
      const errorMsg = error.response?.data?.detalle || error.response?.data?.error || error.message || 'No se pudo finalizar el registro';
      
      if (Platform.OS === 'web') {
        window.alert(`Error: ${errorMsg}`);
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setSaving(false);
      console.log('[CompletarRegistro] ===== FIN FINALIZAR =====');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Stepper Header */}
      <Stepper currentStep={currentStep} totalSteps={3} steps={steps} />

      {/* Step Content */}
      <View style={styles.content}>
        {currentStep === 1 && (
          <Step1Documentos
            id_persona={id_persona}
            onNext={handleNextStep}
            navigation={navigation}
          />
        )}
        {currentStep === 2 && (
          <Step2Domicilio
            onSetDomicilio={setDomicilioData}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        )}
        {currentStep === 3 && (
          <Step3Titulos
            id_persona={id_persona}
            onSetTitulo={setTituloData}
            onBack={handlePreviousStep}
            onFinish={finalizarRegistro}
            saving={saving}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
});

export default CompletarRegistroScreen;
