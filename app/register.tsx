import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, Image } from 'react-native';
import { useRouter } from "expo-router";

import { Ionicons } from '@expo/vector-icons';
import StepIndicator from '../components/StepIndicator';


const Register = () => {

  const router = useRouter();


  const navigateToLogin = () => {
    router.push("/login");
  };

  const [currentStep, setCurrentStep] = useState(1);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [schoolName, setSchool] = useState('');
  

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [selectedRole, setSelectedRole] = useState(null); // Track selected role (Teacher/Student)

  const totalSteps = 3;

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1 fields
      const emailValidation = validateEmail(email);
      const passwordValidation = validatePassword(password);
      const confirmPasswordValidation = validateConfirmPassword(confirmPassword);
      
      setEmailError(emailValidation);
      setPasswordError(passwordValidation);
      setConfirmPasswordError(confirmPasswordValidation);
      
      if (emailValidation || passwordValidation || confirmPasswordValidation) {
        return; 
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Form submitted:', { email, password });
    }
  };

  
  return (
    <View className="flex-1 justify-center items-center">
      <View className="bg-white w-11/12 max-w-md my-5 rounded-2xl p-6 shadow-lg">
        <StepIndicator
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          totalSteps={totalSteps}
        />

        <Text className="text-2xl font-bold text-primary ">Sign Up</Text>
        {currentStep === 1 && (
          <View className="mt-6">
            <Text className="text-lg font-semibold text-gray-700 mb-4">Enter your account details</Text>

            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-500 mb-2">Email</Text>
              <TextInput
                className={`border p-4 rounded-lg text-base bg-gray-100 ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                value={email}
                style={{
                  outlineStyle: 'none',
                }}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError('');
                }}
                placeholder="Enter your email address"
                placeholderTextColor="#888"
                keyboardType="email-address"
              />
              {emailError ? <Text className="text-red-500 text-sm mt-1 ml-1">{emailError}</Text> : null}
            </View>

            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-500 mb-2">Password</Text>
              <View className={`flex-row items-center border p-2 rounded-lg bg-gray-100 ${passwordError ? 'border-red-500' : 'border-gray-300'}`}>
                <TextInput
                  className="flex-1 text-base focus:border-transparent bg-gray-100"
                  style={{
                    outlineStyle: 'none',
                  }}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#888"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  className="p-2"
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#777"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text className="text-red-500 text-sm mt-1 ml-1">{passwordError}</Text> : null}
            </View>

            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-500 mb-2">Confirm Password</Text>
              <View className={`flex-row items-center border p-2 rounded-lg bg-gray-100 ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'}`}>
                <TextInput
                  className="flex-1 text-base focus:border-transparent border-gray-300"
                  style={{
                    outlineStyle: 'none',
                  }}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError('');
                  }}
                  placeholder="Confirm your password"
                  placeholderTextColor="#888"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  className="p-2"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  accessibilityLabel={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#777"
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? <Text className="text-red-500 text-sm mt-1 ml-1">{confirmPasswordError}</Text> : null}
            </View>

            <TouchableOpacity 
              className="bg-teal-500 p-4 rounded-lg flex-row justify-center items-center"
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg font-semibold">Next</Text>
              <Ionicons name="arrow-forward" size={18} color="white" className="ml-2" />
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 2 && (
          <View className="mt-6">
            <Text className="text-lg font-semibold text-gray-700 mb-4">I am signing up as a...</Text>
            
            <TouchableOpacity
              onPress={() => setSelectedRole('teacher')}
              className={`${
                selectedRole === 'teacher' ? 'bg-primary' : 'bg-white'
              } rounded-xl p-4 mb-4 border border-gray-200 shadow-md`}
            >
              <View className="flex-row items-center">
                <Image 
                  source={require('../assets/images/teacher-icon.png')} 
                  className="w-12 h-12 mr-4" 
                />
                <Text className="text-base text-gray-600 font-medium">Teacher</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedRole('student')}
              className={`${
                selectedRole === 'student' ? 'bg-primary' : 'bg-white'
              } rounded-xl p-4 mb-4 border border-gray-200 shadow-md`}
            >
              <View className="flex-row items-center">
                <Image 
                  source={require('../assets/images/student-icon.png')} 
                  className="w-12 h-12 mr-4" 
                />
                <Text className="text-base text-gray-600 font-medium">Student</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-teal-500 p-4 rounded-lg flex-row justify-center items-center"
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg font-semibold">Next</Text>
              <Ionicons name="arrow-forward" size={18} color="white" className="ml-2" />
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 3 && (
          <View className="mt-6">
            <Text className="text-lg font-semibold text-gray-700 mb-4">Enter your account details</Text>

            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-500 mb-2">First Name</Text>
              <TextInput
                className={`border p-4 rounded-lg text-base bg-gray-100 border-gray-300`}
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                }}
                placeholder="Enter your first name"
                placeholderTextColor="#888"
              />
              </View>

              <View className="mb-5">
              <Text className="text-sm font-medium text-gray-500 mb-2">Last Name</Text>
              <TextInput
                className={`border p-4 rounded-lg text-base bg-gray-100 border-gray-300`}
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                }}
                placeholder="Enter your last name"
                placeholderTextColor="#888"
              />
              </View>

              <View className="mb-5">
              <Text className="text-sm font-medium text-gray-500 mb-2">School Name</Text>
              <TextInput
                className={`border p-4 rounded-lg text-base bg-gray-100 border-gray-300`}
                value={schoolName}
                onChangeText={(text) => {
                  setSchool(text);
                }}
                placeholder="Enter your school name"
                placeholderTextColor="#888"
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
          <Text className="text-sm text-gray-500">Already have an account?  <TouchableOpacity onPress={navigateToLogin}>
            <Text className="text-teal-500 font-semibold text-sm">Log In</Text>
          </TouchableOpacity>
          </Text>
         
        </View>
      </View>
    </View>
  );
};

export default Register;
