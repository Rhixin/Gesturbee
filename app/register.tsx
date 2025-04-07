import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import StepIndicator from "../components/StepIndicator";
import { useGlobal } from "@/components/GlobalContext";

const Register = () => {
  const router = useRouter();

  const navigateToLogin = () => {
    router.push("/login");
  };

  //User Form
  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    schoolName: "",
    selectedRole: null,
  });

  const [currentStep, setCurrentStep] = useState(1);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  //Focus states
  const [emailisFocused, emailsetIsFocused] = useState(false);
  const [passwordisFocused, passwordsetIsFocused] = useState(false);
  const [confirmpasswordisFocused, confirmpasswordsetIsFocused] =
    useState(false);
  const [firstnameisFocused, firstnamesetIsFocused] = useState(false);
  const [lastnameisFocused, lastnamesetIsFocused] = useState(false);
  const [schoolisFocused, schoolsetIsFocused] = useState(false);

  const totalSteps = 3;

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

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1 fields
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
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep == totalSteps) {
      alert(JSON.stringify(userForm));
    }
  };

  return (
    <View className="bg-primary h-[100vh] flex">
      {/* Top Message */}
      <View className="min-h-[100px] flex flex-row items-center justify-start gap-6 px-6 mt-20">
        <Text className="text-white font-poppins-bold text-3xl">Register</Text>

        <Image
          source={require("../assets/images/Bee.png")}
          style={{ width: 70, height: 70, resizeMode: "contain" }}
        />
      </View>

      {/* White Container */}
      <View className="bg-white h-[80vh] w-full rounded-t-3xl flex-1 p-6">
        <StepIndicator
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          totalSteps={totalSteps}
        />

        <Text className="text-2xl font-bold text-primary ">Sign Up</Text>
        {currentStep === 1 && (
          <View className="mt-6">
            <Text className="text-lg font-semibold text-titlegray mb-4">
              Enter your account details
            </Text>

            <View className="mb-5">
              <Text className="text-sm font-medium text-subtitlegray mb-2">
                Email
              </Text>
              <TextInput
                className={`border p-4 rounded-lg text-base bg-gray-100 ${
                  emailisFocused ? "border-blue-700" : "border-gray-300"
                } ${emailError ? "border-red-500" : "border-gray-300"}`}
                value={userForm.email}
                style={{
                  outlineStyle: "none",
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
                className={`flex-row items-center border p-2 rounded-lg bg-gray-100 ${
                  passwordisFocused ? "border-blue-700" : "border-gray-300"
                } ${passwordError ? "border-red-500" : ""}`}
              >
                <TextInput
                  className="flex-1 text-base focus:border-transparent bg-gray-100"
                  value={userForm.password}
                  style={{
                    outlineStyle: "none",
                  }}
                  onChangeText={(text) => {
                    setUserForm((prev: any) => ({ ...prev, password: text }));
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
                className={`flex-row items-center border p-2 rounded-lg bg-gray-100 
              ${
                confirmpasswordisFocused ? "border-blue-700" : "border-gray-300"
              }
              ${confirmPasswordError ? "border-red-500" : "border-gray-300"}`}
              >
                <TextInput
                  className="flex-1 text-base focus:border-transparent border-gray-300"
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
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  accessibilityLabel={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
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

            <TouchableOpacity
              className="bg-teal-500 p-4 rounded-lg flex-row justify-center items-center"
              onPress={handleNext}
              activeOpacity={0.8}
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
                  {" "}
                  Teacher{" "}
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
                userForm.selectedRole === "student" ? "bg-primary" : "bg-white"
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
                  {" "}
                  Student{" "}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-teal-500 p-4 rounded-lg flex-row justify-center items-center"
              onPress={handleNext}
              activeOpacity={0.8}
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

        {currentStep === 3 && (
          <View className="mt-6">
            <Text className="text-lg font-semibold text-titlegray mb-4">
              Enter your account details
            </Text>

            <View className="mb-5">
              <Text className="text-sm font-medium text-subtitlegray mb-2">
                First Name
              </Text>

              <TextInput
                className={`border p-4 rounded-lg text-base bg-gray-100 ${
                  firstnameisFocused ? "border-blue-700" : "border-gray-300"
                } `}
                value={userForm.firstName}
                onChangeText={(text) => {
                  setUserForm((prev: any) => ({
                    ...prev,
                    firstName: text,
                  }));
                }}
                style={{
                  outlineStyle: "none",
                }}
                placeholder="Enter your first name"
                placeholderTextColor="#888"
                onFocus={() => firstnamesetIsFocused(true)}
                onBlur={() => firstnamesetIsFocused(false)}
              />
            </View>

            <View className="mb-5">
              <Text className="text-sm font-medium text-subtitlegray mb-2">
                Last Name
              </Text>
              <TextInput
                className={`border p-4 rounded-lg text-base bg-gray-100 ${
                  lastnameisFocused ? "border-blue-700" : "border-gray-300"
                } `}
                value={userForm.lastName}
                onChangeText={(text) => {
                  setUserForm((prev: any) => ({
                    ...prev,
                    lastName: text,
                  }));
                }}
                style={{
                  outlineStyle: "none",
                }}
                placeholder="Enter your last name"
                placeholderTextColor="#888"
                onFocus={() => lastnamesetIsFocused(true)}
                onBlur={() => lastnamesetIsFocused(false)}
              />
            </View>

            <View className="mb-5">
              <Text className="text-sm font-medium text-subtitlegray mb-2">
                School Name
              </Text>
              <TextInput
                className={`border p-4 rounded-lg text-base bg-gray-100 ${
                  schoolisFocused ? "border-blue-700" : "border-gray-300"
                } `}
                value={userForm.schoolName}
                onChangeText={(text) => {
                  setUserForm((prev: any) => ({
                    ...prev,
                    schoolName: text,
                  }));
                }}
                style={{
                  outlineStyle: "none",
                }}
                placeholder="Enter your school name"
                placeholderTextColor="#888"
                onFocus={() => schoolsetIsFocused(true)}
                onBlur={() => schoolsetIsFocused(false)}
              />
            </View>

            <TouchableOpacity
              className="bg-teal-500 p-4 rounded-lg flex-row justify-center items-center"
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg font-semibold">Register</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="mt-6 items-center">
          <Text className="text-sm text-gray-500">
            Already have an account?{" "}
            <TouchableOpacity onPress={navigateToLogin}>
              <Text className="text-primary font-semibold text-sm">Log In</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Register;
