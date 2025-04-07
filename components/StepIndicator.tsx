import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

const theme = {
  colors: {
    primary: "#00BFAF",
    secondary: "#FBBC05",
    tertiary: "#104846",
    inactive: "#D1D5DB",
    textInactive: "#6B7280",
  },
  fonts: {
    poppins: "Poppins",
    poppinsMedium: "Poppins-Medium",
    poppinsBold: "Poppins-Bold"
  }
};

const StepIndicator = ({ currentStep, setCurrentStep, totalSteps = 3, stepLabels = [] }) => {
  if (totalSteps < 2) {
    throw new Error("Total steps must be at least 2");
  }

  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={step} style={styles.stepContainer}>
        
          <Pressable
            style={[
              styles.stepCircle,
              currentStep >= step ? styles.activeStep : styles.inactiveStep,
            ]}
            onPress={() => setCurrentStep(step)}
          >
            <Text style={currentStep >= step ? styles.activeStepText : styles.inactiveStepText}>
              {step}
            </Text>
          </Pressable>

          
          {index < steps.length - 1 && (
            <View
              style={[
                styles.stepLine,
                currentStep > step ? styles.activeLine : styles.inactiveLine,
              ]}
            />
          )}

         
          {stepLabels[index] && (
            <Text style={[styles.stepLabel, currentStep >= step && styles.activeStepLabel]}>
              {stepLabels[index]}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
    width: "100%",
  },
  stepContainer: {
    alignItems: "center",
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  activeStep: {
    backgroundColor: theme.colors.primary, 
  },
  inactiveStep: {
    backgroundColor: theme.colors.inactive,
  },
  activeStepText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontFamily: theme.fonts.poppinsBold,
  },
  inactiveStepText: {
    color: theme.colors.textInactive,
    fontWeight: "bold",
    fontFamily: theme.fonts.poppinsBold,
  },
  stepLine: {
    position: "absolute",
    top: 16,
    left: "50%",
    width: "100%",
    height: 4,
    zIndex: 1,
  },
  activeLine: {
    backgroundColor: theme.colors.primary, 
  },
  inactiveLine: {
    backgroundColor: theme.colors.inactive,
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 12,
    color: theme.colors.textInactive,
    fontFamily: theme.fonts.poppins,
  },
  activeStepLabel: {
    color: theme.colors.primary, 
    fontFamily: theme.fonts.poppinsMedium,
  },
});

export default StepIndicator;