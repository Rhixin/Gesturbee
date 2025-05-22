import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ClassRoomService from "@/api/services/classroom-service";
import { useToast } from "@/context/ToastContext";

const NotificationsButton = ({
  handleAcceptRequest,
  enrollmentRequestsProfile,
  classId,
  loadData,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [loadingStates, setLoadingStates] = useState({}); // Track loading for each request
  const { showToast } = useToast();

  const [pendingRequests, setPendingRequests] = useState(
    enrollmentRequestsProfile
  );

  // Apis here
  const fetchAdmissionEnrollmentRequest = async (studentId, accept) => {
    // Set loading state for this specific request
    setLoadingStates((prev) => ({
      ...prev,
      [studentId]: { accept, reject: !accept },
    }));

    try {
      const response = await ClassRoomService.acceptOrRejectEnrollmentRequest(
        studentId,
        classId,
        accept,
        showToast
      );

      // Remove the request from local state on success
      setPendingRequests((prev) => prev.filter((req) => req.id !== studentId));

      loadData();
      return response;
    } catch (error) {
      console.error("Failed to process enrollment request:", error);
      showToast(
        `Failed to ${accept ? "accept" : "reject"} enrollment request`,
        "error"
      );
      throw error;
    } finally {
      // Clear loading state for this request
      setLoadingStates((prev) => {
        const newState = { ...prev };
        delete newState[studentId];
        return newState;
      });
    }
  };

  // Check if any request is currently being processed
  const isAnyRequestLoading = Object.keys(loadingStates).length > 0;

  // Filter notifications based on search text
  const filteredRequests = pendingRequests.filter((request) =>
    (request.firstName + request.lastName)
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const handleCloseModal = () => {
    if (isAnyRequestLoading) return; // Prevent closing while processing
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="relative mr-2"
      >
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
            <Text className="text-xs text-white font-bold">
              {pendingRequests.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          className="flex-1 justify-center items-center px-4"
        >
          <View className="bg-white w-full rounded-2xl p-6">
            <Text className="text-3xl font-semibold text-titlegray mb-2">
              Pending Requests
            </Text>

            {/* Search bar */}
            <TextInput
              placeholder="Search for a request"
              className={`border border-gray-300 rounded-lg p-2 mb-4 ${
                isAnyRequestLoading ? "opacity-50" : ""
              }`}
              value={searchText}
              onChangeText={setSearchText}
              editable={!isAnyRequestLoading}
            />

            {/* Scrollable list of requests */}
            <ScrollView
              style={{ height: 300, marginTop: 10 }}
              contentContainerStyle={{ flexGrow: 1 }}
              scrollEnabled={!isAnyRequestLoading}
            >
              <View>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((item) => {
                    const isThisRequestLoading = loadingStates[item.id];
                    const isAcceptLoading = isThisRequestLoading?.accept;
                    const isRejectLoading = isThisRequestLoading?.reject;

                    return (
                      <View
                        key={item.id}
                        className={`flex-row items-center justify-between bg-gray-100 rounded-lg p-4 mb-4 ${
                          isThisRequestLoading ? "opacity-75" : ""
                        }`}
                      >
                        <View className="flex-row items-center">
                          <View className="w-12 h-12 rounded-full bg-gray-200 mr-4 justify-center items-center">
                            <Ionicons name="person" size={24} color="#999" />
                          </View>

                          <View>
                            <Text className="font-semibold text-gray-800">
                              {item.firstName + " " + item.lastName}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row">
                          {/* Accept Button */}
                          <TouchableOpacity
                            onPress={() =>
                              fetchAdmissionEnrollmentRequest(item.id, true)
                            }
                            disabled={isThisRequestLoading}
                            className={`bg-primary px-3 py-2 rounded-full mr-2 flex-row items-center ${
                              isThisRequestLoading ? "opacity-50" : ""
                            }`}
                            style={{ minWidth: 40, justifyContent: "center" }}
                          >
                            {isAcceptLoading ? (
                              <ActivityIndicator size="small" color="white" />
                            ) : (
                              <Ionicons
                                name="checkmark"
                                size={20}
                                color="white"
                              />
                            )}
                          </TouchableOpacity>

                          {/* Reject Button */}
                          <TouchableOpacity
                            onPress={() =>
                              fetchAdmissionEnrollmentRequest(item.id, false)
                            }
                            disabled={isThisRequestLoading}
                            style={{
                              backgroundColor: "#F44336",
                              minWidth: 40,
                              justifyContent: "center",
                            }}
                            className={`px-3 py-2 rounded-full flex-row items-center ${
                              isThisRequestLoading ? "opacity-50" : ""
                            }`}
                          >
                            {isRejectLoading ? (
                              <ActivityIndicator size="small" color="white" />
                            ) : (
                              <Ionicons name="close" size={20} color="white" />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View className="flex-1 justify-center items-center py-8">
                    <Text className="text-center text-gray-500">
                      {searchText.trim()
                        ? `No requests found matching "${searchText}"`
                        : "No pending requests"}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Show processing indicator if any request is loading */}
            {isAnyRequestLoading && (
              <View className="flex-row items-center justify-center py-2">
                <ActivityIndicator size="small" color="#00BFAF" />
                <Text className="ml-2 text-gray-600">
                  Processing request...
                </Text>
              </View>
            )}

            {/* Cancel Button */}
            <View className="flex-row justify-end py-2">
              <TouchableOpacity
                onPress={handleCloseModal}
                className="px-4 py-2"
                disabled={isAnyRequestLoading}
              >
                <Text
                  className={`font-semibold text-base ${
                    isAnyRequestLoading ? "text-gray-400" : "text-black"
                  }`}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default NotificationsButton;
