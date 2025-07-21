import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Define the type for toast props
type ToastProps = {
  visible: boolean;
  message: string;
  type: "success" | "error" | "info" | "warning";
  onDismiss: () => void;
  duration?: number; // Duration in milliseconds
  position?: "top" | "bottom"; // Position of the toast
};

const Toast = ({
  visible,
  message,
  type = "info",
  onDismiss,
  duration = 3000,
  position = "top",
}: ToastProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-100)).current;

  // Configure toast based on type
  const getToastConfig = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "#10B981", // Green
          icon: "checkmark-circle",
          iconColor: "#ffffff",
        };
      case "error":
        return {
          backgroundColor: "#EF4444", // Red
          icon: "close-circle",
          iconColor: "#ffffff",
        };
      case "warning":
        return {
          backgroundColor: "#F59E0B", // Amber
          icon: "warning",
          iconColor: "#ffffff",
        };
      case "info":
      default:
        return {
          backgroundColor: "#3B82F6", // Blue
          icon: "information-circle",
          iconColor: "#ffffff",
        };
    }
  };

  const { backgroundColor, icon, iconColor } = getToastConfig();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (visible) {
      // Show toast animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after duration
      timeoutId = setTimeout(() => {
        dismissToast();
      }, duration);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [visible]);

  const dismissToast = () => {
    // Hide toast animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
          backgroundColor,
          ...(position === "top" ? styles.topPosition : styles.bottomPosition),
        },
      ]}
    >
      <View style={styles.contentContainer}>
        <Ionicons name={icon} size={24} color={iconColor} />
        <Text style={styles.messageText}>{message}</Text>
      </View>
      <TouchableOpacity onPress={dismissToast} style={styles.closeButton}>
        <Ionicons name="close" size={20} color="#ffffff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    left: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
  },
  topPosition: {
    top: 50, // Adjusted to account for status bar
  },
  bottomPosition: {
    bottom: 16,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  messageText: {
    color: "#ffffff",
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default Toast;
