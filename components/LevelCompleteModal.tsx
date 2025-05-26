import React from "react";
import { View, Text, TouchableOpacity, Modal, Image } from "react-native";

type SuccessModalProps = {
  isVisible: boolean;
  onContinue: () => void;
  message: string;
};

const SuccessModal: React.FC<SuccessModalProps> = ({
  isVisible,
  onContinue,
  message,
}) => {
  return (
    <Modal visible={isVisible} transparent={false} animationType="fade">
      {/* Full screen modal */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            paddingHorizontal: 40,
          }}
        >
          {/* Close Button */}
          <View
            style={{
              position: "absolute",
              top: 60,
              right: 30,
              zIndex: 1,
            }}
          >
            <TouchableOpacity>
              <Text style={{ fontSize: 32, color: "gray" }}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Main Title */}
          <Text
            style={{
              color: "#FFAA00",
              fontWeight: "bold",
              fontSize: 42,
              textAlign: "center",
              marginBottom: 15,
              letterSpacing: 2,
            }}
          >
            UN-BEE-LIEVABLE!
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              color: "#4B4B4B",
              fontSize: 24,
              textAlign: "center",
              marginBottom: 60,
              fontWeight: "500",
            }}
          >
            {message}
          </Text>

          {/* Bee Character */}
          <View style={{ marginBottom: 80 }}>
            <Image
              source={require("@/assets/images/level-complete-bee.png")}
              style={{
                width: 200,
                height: 200,
              }}
              resizeMode="contain"
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#FFAA00",
              width: "85%",
              paddingVertical: 20,
              borderRadius: 40,
            }}
            onPress={onContinue}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "600",
                textAlign: "center",
                fontSize: 20,
              }}
            >
              Continue to Next Level
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SuccessModal;
