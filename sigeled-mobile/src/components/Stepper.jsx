import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const Stepper = ({ currentStep, totalSteps, steps }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const stepLabel = steps && steps[index] ? steps[index] : `Paso ${stepNumber}`;

        return (
          <View key={stepNumber} style={styles.stepWrapper}>
            {/* Step Circle */}
            <View style={styles.stepContainer}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCompleted,
                  isCurrent && styles.stepCurrent,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      isCurrent && styles.stepNumberCurrent,
                    ]}
                  >
                    {stepNumber}
                  </Text>
                )}
              </View>

              {/* Step Label */}
              <Text
                style={[
                  styles.stepLabel,
                  (isCompleted || isCurrent) && styles.stepLabelActive,
                ]}
              >
                {stepLabel}
              </Text>
            </View>

            {/* Connector Line */}
            {stepNumber < totalSteps && (
              <View
                style={[
                  styles.connector,
                  isCompleted && styles.connectorCompleted,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.secondary,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border.secondary,
  },
  stepCompleted: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  stepCurrent: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.tertiary,
  },
  stepNumberCurrent: {
    color: '#fff',
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  connector: {
    width: 30,
    height: 2,
    backgroundColor: colors.border.secondary,
    marginHorizontal: 5,
  },
  connectorCompleted: {
    backgroundColor: colors.primary.main,
  },
});

export default Stepper;
