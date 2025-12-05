import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Stepper from '../../components/Stepper';
import Step1Documentos from './Step1Documentos';
import Step2Domicilio from './Step2Domicilio';
import Step3Titulos from './Step3Titulos';
import colors from '../../theme/colors';

const CompletarRegistroScreen = ({ route, navigation }) => {
  const { id_persona } = route.params;
  const [currentStep, setCurrentStep] = useState(1);

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
            id_persona={id_persona}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
            navigation={navigation}
          />
        )}
        {currentStep === 3 && (
          <Step3Titulos
            id_persona={id_persona}
            onBack={handlePreviousStep}
            navigation={navigation}
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
