import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, SafeAreaView, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
const NotificationsButton = ({ handleAcceptRequest }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [pendingRequests, setPendingRequests] = useState([
    { id: "3", name: "John Doe", email: "johndoe@gmail.com" },
    { id: "4", name: "Jane Doe", email: "janedoe@gmail.com" },
    { id: "5", name: "Cool Me", email: "cool@gmail.com" },
    { id: "6", name: "Blabla", email: "bla@gmail.com" },
  ]);

  const handleAccept = (id) => {
    const acceptedRequest = pendingRequests.find((req) => req.id === id);
    if (acceptedRequest) {
      handleAcceptRequest([acceptedRequest]);
    }
    setPendingRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const handleDecline = (id) => {
    setPendingRequests((prev) => prev.filter((req) => req.id !== id));
  };

  // Filter notifications based on search text
  const filteredRequests = pendingRequests.filter((request) =>
    request.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)} className="relative mr-2">
        <Ionicons name="notifications" size={24} color="white" />
        {pendingRequests.length > 0 && (
          <View
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              backgroundColor: "red",
              width: 15,
              height: 15,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text className="text-xs text-white font-bold">{pendingRequests.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} className="flex-1 justify-center items-center px-4">
          <View className="bg-white w-full rounded-2xl p-6">
            <Text className="text-3xl font-semibold text-titlegray mb-2">Pending Requests</Text>

            {/* Search bar */}
            <TextInput
              placeholder="Search for a request"
              className="border border-gray-300 rounded-lg p-2 mb-4"
              value={searchText}
              onChangeText={setSearchText}
            />

            {/* Scrollable list of requests */}
            <ScrollView style={{ height: 300, marginTop: 10 }} contentContainerStyle={{ flexGrow: 1 }}>
              <View>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((item) => (
                    <View
                      key={item.id}
                      className="flex-row items-center justify-between bg-gray-100 rounded-lg p-4 mb-4"
                    >
                      <View className="flex-row items-center">
                        <View className="w-12 h-12 rounded-full bg-gray-200 mr-4 justify-center items-center">
                          <Ionicons name="person" size={24} color="#999" />
                        </View>

                        <View>
                          <Text className="font-semibold text-gray-800">{item.name}</Text>
                          <Text className="text-gray-500 text-sm">{item.email}</Text>
                        </View>
                      </View>

                      <View className="flex-row">
                        <TouchableOpacity
                          onPress={() => handleAccept(item.id)}
                          className="bg-primary px-3 py-2 rounded-full mr-2"
                        >
                          <Ionicons name="checkmark" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDecline(item.id)}
                          style={{ backgroundColor: "#F44336" }}
                          className="px-3 py-2 rounded-full"
                        >
                          <Ionicons name="close" size={20} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text className="text-center text-gray-500">No matching requests</Text>
                )}
              </View>
            </ScrollView>

            {/* Cancel Button */}
            <View className="flex-row justify-end py-2">
              <TouchableOpacity onPress={() => setModalVisible(false)} className="px-4 py-2">
                <Text className="text-black font-semibold text-base">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default NotificationsButton;
