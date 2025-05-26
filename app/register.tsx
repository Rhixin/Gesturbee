// new update:
// fixed birthday,
// can't click to the next sa step indicator but maka previous click
// should use the next button for next step

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable } from "react-native";

import StepIndicator from "../components/StepIndicator";
import CustomDropdown from "../components/GenderDropDown";
import { useGlobal } from "@/context/GlobalContext";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useToast } from "@/context/ToastContext";
import AuthService from "@/api/services/auth-service";

const Register = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const inputBaseClass = "flex-1 text-base bg-gray-100 min-h-[40px]";
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const router = useRouter();

  const navigate = (path) => {
    router.push(path);
  };

  //User Form
  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    gender: "",
    birthday: "",
    contactNumber: "",
    selectedRole: null,
  });

  const genderOptions = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];

  //Step Indicator Steps
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  //Eye close open states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");

  //Focus states
  const [emailisFocused, emailsetIsFocused] = useState(false);
  const [passwordisFocused, passwordsetIsFocused] = useState(false);
  const [confirmpasswordisFocused, confirmpasswordsetIsFocused] =
    useState(false);
  const [firstnameisFocused, firstnamesetIsFocused] = useState(false);
  const [lastnameisFocused, lastnamesetIsFocused] = useState(false);
  const [contactNumberIsFocused, setContactNumberIsFocused] = useState(false);
  const [birthdayisFocused, birthdaysetIsFocused] = useState(false);
  const [genderisFocused, gendersetIsFocused] = useState(false);

  //birthday
  const [showPicker, setShowPicker] = useState(false);
  const [birthdayDate, setBirthdayDate] = useState(new Date());

  const handleBirthdayPress = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      setShowPicker(true);
    }, 100);
  };

  const handleStepChange = (targetStep) => {
    if (targetStep <= currentStep) {
      setCurrentStep(targetStep);
    }
  };

  const validateEmail = (email: string | undefined) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password: string | any[] | undefined) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return "";
  };

  const validateConfirmPassword = (confirmPassword: string | undefined) => {
    if (!userForm.confirmPassword) return "Please confirm your password";
    if (userForm.confirmPassword !== userForm.password)
      return "Passwords do not match";
    return "";
  };

  const validateFirstName = (firstName: string | undefined) => {
    if (!firstName || firstName.trim() === "") return "First name is required";
    return "";
  };

  const validateLastName = (lastName: string | undefined) => {
    if (!lastName || lastName.trim() === "") return "Last name is required";
    return "";
  };

  // Check if current step is valid
  const isCurrentStepValid = () => {
    if (currentStep === 1) {
      return (
        userForm.firstName.trim() &&
        userForm.lastName.trim() &&
        userForm.contactNumber.trim() &&
        userForm.gender &&
        userForm.birthday
      );
    }

    if (currentStep === 2) {
      return userForm.selectedRole;
    }

    if (currentStep === 3) {
      return (
        userForm.email.trim() &&
        userForm.password &&
        userForm.confirmPassword &&
        !validateEmail(userForm.email) &&
        !validatePassword(userForm.password) &&
        !validateConfirmPassword(userForm.confirmPassword)
      );
    }

    return false;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const firstNameValidation = validateFirstName(userForm.firstName);
      const lastNameValidation = validateLastName(userForm.lastName);

      setFirstNameError(firstNameValidation);
      setLastNameError(lastNameValidation);

      // Check if all required fields in step 1 are filled
      if (
        firstNameValidation ||
        lastNameValidation ||
        !userForm.firstName.trim() ||
        !userForm.lastName.trim() ||
        !userForm.contactNumber.trim() ||
        !userForm.gender ||
        !userForm.birthday
      ) {
        if (!userForm.contactNumber.trim()) {
          showToast("Contact number is required", "error");
        }
        if (!userForm.gender) {
          showToast("Please select your gender", "error");
        }
        if (!userForm.birthday) {
          showToast("Please select your birthday", "error");
        }
        return;
      }
    }

    if (currentStep === 2) {
      // Check if role is selected
      if (!userForm.selectedRole) {
        showToast("Please select your role (Teacher or Student)", "error");
        return;
      }
    }

    if (currentStep === 3) {
      const emailValidation = validateEmail(userForm.email);
      const passwordValidation = validatePassword(userForm.password);
      const confirmPasswordValidation = validateConfirmPassword(
        userForm.confirmPassword
      );

      setEmailError(emailValidation);
      setPasswordError(passwordValidation);
      setConfirmPasswordError(confirmPasswordValidation);

      if (emailValidation || passwordValidation || confirmPasswordValidation) {
        return;
      }

      normalRegisterListener();
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep == totalSteps) {
      normalRegisterListener();
    }
  };

  // TODO: birthdate
  const normalRegisterListener = async () => {
    setIsLoading(true);
    const body = {
      email: userForm.email,
      password: userForm.password,
      firstName: userForm.firstName,
      lastName: userForm.lastName,
      contactNumber: userForm.contactNumber,
      gender: userForm.gender,
      birthDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const response = await AuthService.register(body);

    if (response?.success) {
      showToast("Successfully registered an Account", "success");
      navigate("/");
    } else {
      showToast(response?.error, "error");
    }

    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View className="bg-primary flex-1">
        <View className="min-h-[100px] flex flex-row items-center justify-start gap-6 px-6 mt-20">
          <Text className="text-white font-poppins-bold text-3xl">
            Register
          </Text>
          <Image
            source={require("../assets/images/Bee.png")}
            style={{ width: 70, height: 70, resizeMode: "contain" }}
          />
        </View>

        <View className="bg-white flex-1 w-full rounded-t-3xl">
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              paddingVertical: 24,
              paddingBottom: 40,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <StepIndicator
              currentStep={currentStep}
              setCurrentStep={handleStepChange}
              totalSteps={totalSteps}
            />

            <Text className="text-2xl font-bold text-primary">Sign Up</Text>

            {currentStep === 3 && (
              <View className="mt-6">
                <Text className="text-lg font-semibold text-titlegray mb-4">
                  Enter your account details
                </Text>

                <View className="mb-5">
                  <Text className="text-sm font-medium text-subtitlegray mb-2">
                    Email
                  </Text>
                  <View
                    className={`border rounded-lg bg-gray-100 px-4 py-1 ${
                      emailError
                        ? "border-red-500"
                        : emailisFocused
                        ? "border-blue-700"
                        : "border-gray-300"
                    }`}
                  >
                    <TextInput
                      className={"text-base bg-gray-100 w-full min-h-[40px]"}
                      value={userForm.email}
                      style={{
                        outlineStyle: "none",
                        textAlignVertical: "center",
                      }}
                      onChangeText={(text) => {
                        setUserForm((prev: any) => ({ ...prev, email: text }));
                        setEmailError("");
                      }}
                      placeholder="Enter your email address"
                      placeholderTextColor="#888"
                      keyboardType="email-address"
                      onFocus={() => emailsetIsFocused(true)}
                      onBlur={() => emailsetIsFocused(false)}
                    />
                  </View>

                  {emailError ? (
                    <Text className="text-red-500 text-sm mt-1 ml-1">
                      {emailError}
                    </Text>
                  ) : null}
                </View>

                <View className="mb-5">
                  <Text className="text-sm font-medium text-subtitlegray mb-2">
                    Password
                  </Text>
                  <View
                    className={`flex-row items-center border px-4 py-1 rounded-lg bg-gray-100 ${
                      passwordisFocused ? "border-blue-700" : "border-gray-300"
                    } ${passwordError ? "border-red-500" : ""}`}
                  >
                    <TextInput
                      ref={passwordInputRef}
                      className={inputBaseClass}
                      style={{
                        outlineStyle: "none",
                      }}
                      value={userForm.password}
                      onChangeText={(text) => {
                        setUserForm((prev: any) => ({
                          ...prev,
                          password: text,
                        }));
                        setPasswordError("");
                      }}
                      placeholder="Enter your password"
                      placeholderTextColor="#888"
                      secureTextEntry={!showPassword}
                      onFocus={() => passwordsetIsFocused(true)}
                      onBlur={() => passwordsetIsFocused(false)}
                    />
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => setShowPassword(!showPassword)}
                      accessibilityLabel={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={24}
                        color="#777"
                      />
                    </TouchableOpacity>
                  </View>
                  {passwordError ? (
                    <Text className="text-red-500 text-sm mt-1 ml-1">
                      {passwordError}
                    </Text>
                  ) : null}
                </View>

                <View className="mb-5">
                  <Text className="text-sm font-medium text-subtitlegray mb-2">
                    Confirm Password
                  </Text>
                  <View
                    className={`flex-row items-center border px-4 py-1 rounded-lg bg-gray-100 ${
                      confirmpasswordisFocused
                        ? "border-blue-700"
                        : "border-gray-300"
                    }
              ${confirmPasswordError ? "border-red-500" : ""}`}
                  >
                    <TextInput
                      ref={confirmPasswordInputRef}
                      className={inputBaseClass}
                      style={{
                        outlineStyle: "none",
                      }}
                      value={userForm.confirmPassword}
                      onChangeText={(text) => {
                        setUserForm((prev: any) => ({
                          ...prev,
                          confirmPassword: text,
                        }));
                        setConfirmPasswordError("");
                      }}
                      placeholder="Confirm your password"
                      placeholderTextColor="#888"
                      secureTextEntry={!showConfirmPassword}
                      onFocus={() => confirmpasswordsetIsFocused(true)}
                      onBlur={() => confirmpasswordsetIsFocused(false)}
                    />
                    <TouchableOpacity
                      className="p-2"
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      accessibilityLabel={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={24}
                        color="#777"
                      />
                    </TouchableOpacity>
                  </View>
                  {confirmPasswordError ? (
                    <Text className="text-red-500 text-sm mt-1 ml-1">
                      {confirmPasswordError}
                    </Text>
                  ) : null}
                </View>

                {isLoading ? (
                  <TouchableOpacity
                    className="bg-teal-500 p-4 rounded-lg flex-row justify-center items-center"
                    onPress={handleNext}
                    activeOpacity={0.8}
                  >
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="text-white text-lg font-semibold">
                      Registering..
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="bg-primary py-3 rounded-lg mt-6"
                    onPress={handleNext}
                    disabled={isLoading}
                  >
                    <Text className="text-white text-center text-lg font-semibold">
                      {currentStep === totalSteps ? "Register" : "Next"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {currentStep === 2 && (
              <View className="mt-6">
                <Text className="text-lg font-semibold text-titlegray mb-4">
                  I am signing up as a...
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setUserForm((prev: any) => ({
                      ...prev,
                      selectedRole: "teacher",
                    }))
                  }
                  className={`${
                    userForm.selectedRole === "teacher"
                      ? "bg-primary text-white"
                      : "bg-white"
                  } rounded-xl p-4 mb-4 border border-gray-200 shadow-md`}
                >
                  <View className="flex-row items-center">
                    <Image
                      source={require("../assets/images/teacher-icon.png")}
                      className="w-12 h-12 mr-4"
                    />
                    <Text
                      className={`text-base font-medium ${
                        userForm.selectedRole === "teacher"
                          ? "text-white"
                          : "text-gray-600"
                      }`}
                    >
                      Teacher
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    setUserForm((prev: any) => ({
                      ...prev,
                      selectedRole: "student",
                    }))
                  }
                  className={`${
                    userForm.selectedRole === "student"
                      ? "bg-primary"
                      : "bg-white"
                  } rounded-xl p-4 mb-4 border border-gray-200 shadow-md`}
                >
                  <View className="flex-row items-center">
                    <Image
                      source={require("../assets/images/student-icon.png")}
                      className="w-12 h-12 mr-4"
                    />
                    <Text
                      className={`text-base font-medium ${
                        userForm.selectedRole === "student"
                          ? "text-white"
                          : "text-gray-600"
                      }`}
                    >
                      Student
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`p-4 rounded-lg flex-row justify-center items-center mb-6 ${
                    isCurrentStepValid() ? "bg-teal-500" : "bg-gray-400"
                  }`}
                  onPress={isCurrentStepValid() ? handleNext : undefined}
                  activeOpacity={isCurrentStepValid() ? 0.8 : 1}
                  disabled={!isCurrentStepValid()}
                >
                  <Text className="text-white text-lg font-semibold">Next</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="white"
                    className="ml-2"
                  />
                </TouchableOpacity>
              </View>
            )}

            {currentStep === 1 && (
              <View className="mt-6">
                <Text className="text-lg font-semibold text-titlegray mb-4">
                  Enter your profile information
                </Text>

                <View className="mb-5">
                  <Text className="text-sm font-medium text-subtitlegray mb-2">
                    First Name
                  </Text>
                  <View
                    className={`border rounded-lg bg-gray-100 px-4 py-1 ${
                      firstNameError
                        ? "border-red-500"
                        : firstnameisFocused
                        ? "border-blue-700"
                        : "border-gray-300"
                    }`}
                  >
                    <TextInput
                      className={"text-base bg-gray-100 w-full min-h-[40px]"}
                      value={userForm.firstName}
                      style={{
                        outlineStyle: "none",
                        textAlignVertical: "center",
                      }}
                      onChangeText={(text) => {
                        setUserForm((prev: any) => ({
                          ...prev,
                          firstName: text,
                        }));
                        setFirstNameError("");
                      }}
                      placeholder="Enter your first name"
                      placeholderTextColor="#888"
                      onFocus={() => firstnamesetIsFocused(true)}
                      onBlur={() => firstnamesetIsFocused(false)}
                    />
                  </View>

                  {firstNameError ? (
                    <Text className="text-red-500 text-sm mt-1 ml-1">
                      {firstNameError}
                    </Text>
                  ) : null}
                </View>

                <View className="mb-5">
                  <Text className="text-sm font-medium text-subtitlegray mb-2">
                    Last Name
                  </Text>
                  <View
                    className={`border rounded-lg bg-gray-100 px-4 py-1 ${
                      lastNameError
                        ? "border-red-500"
                        : lastnameisFocused
                        ? "border-blue-700"
                        : "border-gray-300"
                    }`}
                  >
                    <TextInput
                      className={"text-base bg-gray-100 w-full min-h-[40px]"}
                      value={userForm.lastName}
                      style={{
                        outlineStyle: "none",
                        textAlignVertical: "center",
                      }}
                      onChangeText={(text) => {
                        setUserForm((prev: any) => ({
                          ...prev,
                          lastName: text,
                        }));
                        setLastNameError("");
                      }}
                      placeholder="Enter your last name"
                      placeholderTextColor="#888"
                      onFocus={() => lastnamesetIsFocused(true)}
                      onBlur={() => lastnamesetIsFocused(false)}
                    />
                  </View>

                  {lastNameError ? (
                    <Text className="text-red-500 text-sm mt-1 ml-1">
                      {lastNameError}
                    </Text>
                  ) : null}
                </View>

                <View className="mb-5">
                  <Text className="text-sm font-medium text-subtitlegray mb-2">
                    Contact Number
                  </Text>
                  <View
                    className={`border rounded-lg bg-gray-100 px-4 py-1 ${
                      contactNumberIsFocused
                        ? "border-blue-700"
                        : "border-gray-300"
                    }`}
                  >
                    <TextInput
                      className={"text-base bg-gray-100 w-full min-h-[40px]"}
                      value={userForm.contactNumber}
                      style={{
                        outlineStyle: "none",
                        textAlignVertical: "center",
                      }}
                      onChangeText={(text) => {
                        setUserForm((prev) => ({
                          ...prev,
                          contactNumber: text,
                        }));
                      }}
                      placeholder="Enter your contact number"
                      placeholderTextColor="#888"
                      keyboardType="phone-pad"
                      onFocus={() => setContactNumberIsFocused(true)}
                      onBlur={() => setContactNumberIsFocused(false)}
                    />
                  </View>
                </View>

                <CustomDropdown
                  label="Gender"
                  value={userForm.gender}
                  options={genderOptions}
                  placeholder="Select Gender"
                  onSelect={(value) => {
                    setUserForm((prev) => ({
                      ...prev,
                      gender: value,
                    }));
                  }}
                />

                <View className="mb-5">
                  <Text className="text-sm font-medium text-subtitlegray mb-2">
                    Birthday
                  </Text>
                  <TouchableOpacity
                    onPress={handleBirthdayPress}
                    className={`border p-4 rounded-lg text-base bg-gray-100 ${
                      birthdayisFocused ? "border-blue-700" : "border-gray-300"
                    }`}
                    onFocus={() => birthdaysetIsFocused(true)}
                    onBlur={() => birthdaysetIsFocused(false)}
                  >
                    <Text className="text-base text-gray-700">
                      {userForm.birthday
                        ? new Date(userForm.birthday).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Select your birthday"}
                    </Text>
                  </TouchableOpacity>

                  {Platform.OS === "ios" ? (
                    <Modal
                      transparent
                      visible={showPicker}
                      animationType="slide"
                      onRequestClose={() => setShowPicker(false)}
                    >
                      <Pressable
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          backgroundColor: "rgba(0,0,0,0.3)",
                        }}
                        onPress={() => setShowPicker(false)}
                      >
                        <Pressable
                          onPress={() => {}}
                          style={{
                            backgroundColor: "white",
                            marginHorizontal: 20,
                            borderRadius: 10,
                            padding: 10,
                          }}
                        >
                          <DateTimePicker
                            value={birthdayDate}
                            mode="date"
                            display="spinner"
                            maximumDate={new Date()}
                            onChange={(event, selectedDate) => {
                              if (event.type === "set" && selectedDate) {
                                setBirthdayDate(selectedDate);
                                setUserForm((prev: any) => ({
                                  ...prev,
                                  birthday: selectedDate.toISOString(),
                                }));
                              }
                            }}
                          />
                        </Pressable>
                      </Pressable>
                    </Modal>
                  ) : (
                    showPicker && (
                      <DateTimePicker
                        value={birthdayDate}
                        mode="date"
                        display="spinner"
                        maximumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          setShowPicker(false);
                          if (event.type === "set" && selectedDate) {
                            setBirthdayDate(selectedDate);
                            setUserForm((prev: any) => ({
                              ...prev,
                              birthday: selectedDate.toISOString(),
                            }));
                          }
                        }}
                      />
                    )
                  )}
                </View>

                <TouchableOpacity
                  className={`p-4 rounded-lg flex-row justify-center items-center mb-6 ${
                    isCurrentStepValid() ? "bg-teal-500" : "bg-gray-400"
                  }`}
                  onPress={isCurrentStepValid() ? handleNext : undefined}
                  activeOpacity={isCurrentStepValid() ? 0.8 : 1}
                  disabled={!isCurrentStepValid()}
                >
                  <Text className="text-white text-lg font-semibold">Next</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="white"
                    className="ml-2"
                  />
                </TouchableOpacity>
              </View>
            )}

            <View className="mt-6 items-center">
              <Text
                className="text-sm text-gray-500"
                style={{ textAlign: "center" }}
              >
                Already have an account?{" "}
                <TouchableOpacity
                  onPress={() => {
                    navigate("/(auth)/home");
                  }}
                >
                  <Text
                    className="text-primary font-semibold text-sm"
                    style={{ textAlign: "center" }}
                  >
                    Log In
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Register;
