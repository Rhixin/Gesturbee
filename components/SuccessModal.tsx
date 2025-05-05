import React from "react";
import { View, Text, TouchableOpacity, Modal, Image } from "react-native";

type SuccessModalProps = {
  isVisible: boolean;
  onContinue: () => void;
};

const SuccessModal: React.FC<SuccessModalProps> = ({ isVisible, onContinue }) => {
  return (
    <Modal visible={isVisible} transparent animationType="slide">
      {/* Gray background for modal */}
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 30 }}>
          {/* Close Button */}
          <View style={{ alignItems: 'flex-end', marginBottom: 15 }}>
            <TouchableOpacity>
              <Text style={{ fontSize: 24, color: 'gray' }}>×</Text>
            </TouchableOpacity>
          </View>
            {/* Success Message */}
            <View style={{ flexDirection: 'row', backgroundColor: 'white', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
            <Image
            source={require("@/assets/images/Bee.png")} 
            style={{ width: 100, height: 100, marginLeft: 12 }} 
            />

              <View>
                <Text style={{ color: '#FFAA00', fontWeight: 'bold', fontSize: 30, marginLeft:14 }}>Bee-autiful!</Text>
                <Text style={{ color: '#4B4B4B',  marginLeft:14, marginTop: 10 }}>Your answer is correct.</Text>
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#FFAA00',
                width: '100%',
                paddingVertical: 16,
                borderRadius: 30,
                marginTop: 20,
              }}
              onPress={onContinue}
            >
              <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center', fontSize: 18 }}>
                Continue
              </Text>
            </TouchableOpacity>
         
        </View>
      </View>
    </Modal>
  );
};

export default SuccessModal;
