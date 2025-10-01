import { useRouter, useFocusEffect } from "expo-router";
import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  PinchGestureHandler,
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { stageData } from "@/utils/stageData";
import { useLevel } from "@/context/LevelContext";

const MovingCloud = ({
  size = 80,
  top = 100,
  opacity = 0.7,
  speed = 1,
  delay = 0,
  restartDelay = 2000,
  startPosition = null,
}) => {
  const screenWidth = Dimensions.get("window").width;
  const initialPos = startPosition !== null ? startPosition : -size;
  const [position, setPosition] = useState(initialPos);

  useEffect(() => {
    const moveCloud = () => {
      setPosition(-size);

      const interval = setInterval(() => {
        setPosition((prev) => {
          const newPos = prev + speed * 0.3;
          if (newPos > screenWidth + size) {
            clearInterval(interval);
            setTimeout(moveCloud, restartDelay);
            return -size;
          }
          return newPos;
        });
      }, 16); // 60fps - much smoother (16ms = ~60fps)

      return () => clearInterval(interval);
    };

    const timer = setTimeout(moveCloud, delay); // Use specific delay, not random
    return () => clearTimeout(timer);
  }, [size, screenWidth, speed, delay, restartDelay]);

  return (
    <View
      style={{
        position: "absolute",
        top: top,
        left: position,
        opacity: opacity,
      }}
    >
      <Image
        source={require("@/assets/images/Cloud/xl.png")}
        style={{
          width: size,
          height: size,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

// Stage place images mapping - locked versions
const stageImages = {
  1: require("@/assets/images/Stages/Vigan_1.png"),
  2: require("@/assets/images/Stages/Manila_4.png"),
  3: require("@/assets/images/Stages/Boracay_6.png"),
  4: require("@/assets/images/Stages/Siargao_2.png"),
  5: require("@/assets/images/Stages/Palawan_3.png"),
  6: require("@/assets/images/Stages/Cebu_5.png"),
  7: require("@/assets/images/Stages/Bohol_7.png"),
};

// Stage place images mapping - unlocked versions
const stageUnlockedImages = {
  1: require("@/assets/images/Stages/Vigan_1.png"), // Add Vigan_Unlocked.png when available
  2: require("@/assets/images/Stages/Manila_Unlocked.png"),
  3: require("@/assets/images/Stages/Boracay_Unlocked.png"),
  4: require("@/assets/images/Stages/Siargao_Unlocked.png"),
  5: require("@/assets/images/Stages/Palawan_Unlocked.png"),
  6: require("@/assets/images/Stages/Cebu_Unlocked.png"),
  7: require("@/assets/images/Stages/Bohol_Unlocked.png"),
};

// Stage positions ordered from top to bottom (1-7), scattered on x-axis
const stagePositions = {
  1: { left: "35%", top: "15%" }, // Stage 1 - Top left
  2: { left: "40%", top: "32%" }, // Stage 2 - Top right
  3: { left: "62%", top: "37%" }, // Stage 3 - Upper middle left
  4: { left: "47%", top: "52%" }, // Stage 4 - Middle right
  5: { left: "20%", top: "56%" }, // Stage 5 - Lower middle left
  6: { left: "70%", top: "61%" }, // Stage 6 - Lower right
  7: { left: "50%", top: "68%" }, // Stage 7 - Bottom center
};

// Stage descriptions
const stageDescriptions = {
  1: {
    title: "Vigan Alphabets",
    description:
      "Begin your journey learning the FSL alphabet in the historic cobblestone streets of Vigan. Master the foundation of Filipino sign language with beautiful colonial architecture as your backdrop.",
    theme: "Learn the fundamentals of FSL alphabets",
  },
  2: {
    title: "Manila Numbers",
    description:
      "Count through the bustling streets of Manila while mastering FSL numbers. Practice numerical expressions in the vibrant capital city with its urban energy.",
    theme: "Master FSL numbers and counting",
  },
  3: {
    title: "Boracay Greetings",
    description:
      "Relax on white sand beaches while learning essential FSL greetings. Connect with others through welcoming gestures in this tropical paradise.",
    theme: "Express greetings and basic interactions",
  },
  4: {
    title: "Siargao Colors",
    description:
      "Surf through the colorful waves of Siargao while learning FSL color expressions. Discover vibrant hues in this tropical island paradise.",
    theme: "Describe colors and visual elements",
  },
  5: {
    title: "Palawan Family",
    description:
      "Explore the underground river of family connections by learning FSL family terms. Build relationships through sign language in this natural wonder.",
    theme: "Express family relationships and bonds",
  },
  6: {
    title: "Cebu Days",
    description:
      "Navigate the Queen City of the South by mastering FSL days of the week. Plan activities and discuss time in this historic trading hub.",
    theme: "Communicate days and time concepts",
  },
  7: {
    title: "Bohol Months",
    description:
      "Watch the Chocolate Hills change through the seasons as you master FSL month expressions. Complete your temporal vocabulary in this geological wonder.",
    theme: "Express months and seasonal concepts",
  },
};

export default function Home() {
  const router = useRouter();
  const { userSavedStage, userSavedLevel, userSavedTotalLesson } = useLevel();

  // Zoom and pan state management
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const [currentScale, setCurrentScale] = useState(1);
  const [currentTranslateX, setCurrentTranslateX] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const [showZoomHint, setShowZoomHint] = useState(true);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [showStageInfo, setShowStageInfo] = useState(false);

  // Gesture state tracking
  const baseScale = useRef(1);
  const pinchScale = useRef(1);
  const lastPanX = useRef(0);
  const lastPanY = useRef(0);

  // Auto-hide zoom hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowZoomHint(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const navigateToStage = (id: number) => {
    router.push(`/home/stage/${id}`);
  };

  // Zoom to specific stage
  const zoomToStage = (stageId: number) => {
    const position = stagePositions[stageId];
    if (!position) return;

    // Much simpler approach - use smaller scale and direct positioning
    const targetScale = 1.8;

    // Convert stage position percentages to simple offsets
    // For stage at 35%, 15% we want to move it towards center
    const stageLeftPercent = parseFloat(position.left) / 100;
    const stageTopPercent = parseFloat(position.top) / 100;

    // Calculate how much to move the stage towards center
    // If stage is at 35% (0.35), we want to move it 15% towards center (0.5 - 0.35 = 0.15)
    const moveX = (0.5 - stageLeftPercent) * screenWidth * 0.3; // Reduced multiplier
    const moveY = (0.5 - stageTopPercent) * screenHeight * 0.2; // Reduced multiplier

    console.log("Stage:", stageId, "Position:", position);
    console.log("Stage percentages:", stageLeftPercent, stageTopPercent);
    console.log("Move amounts:", moveX, moveY);

    // Animate to stage
    Animated.parallel([
      Animated.timing(scale, {
        toValue: targetScale,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: moveX,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: moveY,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Update state
    baseScale.current = targetScale;
    pinchScale.current = targetScale;
    lastPanX.current = moveX;
    lastPanY.current = moveY;
    setCurrentScale(targetScale);
    setCurrentTranslateX(moveX);
    setCurrentTranslateY(moveY);
    setSelectedStage(stageId);
    setShowStageInfo(true);
    setShowZoomHint(false);
  };

  const handleStagePress = (id: number) => {
    const locked = isStageLocked(id);

    if (selectedStage === id && !locked) {
      // If already selected and unlocked, navigate to stage
      navigateToStage(id);
    } else {
      // Otherwise, zoom to stage (works for both locked and unlocked)
      zoomToStage(id);
    }
  };

  const isStageLocked = (stageNumber: number) => {
    return stageNumber > userSavedStage;
  };

  // Pinch gesture handler
  const onPinchGestureEvent = (event) => {
    const newScale = Math.max(
      0.5,
      Math.min(3, baseScale.current * event.nativeEvent.scale)
    );
    pinchScale.current = newScale;
    scale.setValue(newScale);
    setCurrentScale(newScale);
    setShowZoomHint(false); // Hide hint when user starts zooming
  };

  const onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      baseScale.current = pinchScale.current;
    }
  };

  // Pan gesture handler
  const onPanGestureEvent = (event) => {
    const { translationX, translationY } = event.nativeEvent;
    const newX = lastPanX.current + translationX;
    const newY = lastPanY.current + translationY;

    translateX.setValue(newX);
    translateY.setValue(newY);
    setCurrentTranslateX(newX);
    setCurrentTranslateY(newY);
  };

  const onPanHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastPanX.current = currentTranslateX;
      lastPanY.current = currentTranslateY;
    }
  };

  // Calculate dynamic stage icon size based on zoom level and selection
  const getDynamicStageSize = (stageId?: number) => {
    const baseSize = 70;
    if (selectedStage && stageId !== selectedStage) {
      // Non-selected stages remain small when a stage is selected
      return baseSize * 0.8;
    }
    const scaleFactor = Math.max(0.6, Math.min(2, currentScale));
    return baseSize * scaleFactor;
  };

  // Calculate dynamic font sizes
  const getDynamicFontSize = (baseSize: number, stageId?: number) => {
    if (selectedStage && stageId !== selectedStage) {
      // Non-selected stages have smaller text when a stage is selected
      return baseSize * 0.8;
    }
    const scaleFactor = Math.max(0.8, Math.min(1.5, currentScale));
    return baseSize * scaleFactor;
  };

  // Zoom control functions
  const zoomIn = () => {
    const newScale = Math.min(3, currentScale * 1.2);
    Animated.timing(scale, {
      toValue: newScale,
      duration: 200,
      useNativeDriver: true,
    }).start();
    baseScale.current = newScale;
    pinchScale.current = newScale;
    setCurrentScale(newScale);
  };

  const zoomOut = () => {
    const newScale = Math.max(0.5, currentScale / 1.5);
    Animated.timing(scale, {
      toValue: newScale,
      duration: 200,
      useNativeDriver: true,
    }).start();
    baseScale.current = newScale;
    pinchScale.current = newScale;
    setCurrentScale(newScale);
  };

  const resetZoom = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    baseScale.current = 1;
    pinchScale.current = 1;
    lastPanX.current = 0;
    lastPanY.current = 0;
    setCurrentScale(1);
    setCurrentTranslateX(0);
    setCurrentTranslateY(0);
    setSelectedStage(null);
    setShowStageInfo(false);
  };

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1">
        <StatusBar barStyle="light-content" backgroundColor="#00BFAF" />

        {/* Sky gradient background */}
        <LinearGradient
          colors={["#87CEEB", "#00BFAF", "#007F8B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        >
          {/* Floating Header */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              paddingTop: StatusBar.currentHeight || 0,
            }}
          >
            <SafeAreaView>
              <View
                style={{
                  marginHorizontal: 20,
                  backgroundColor: "white",
                  borderRadius: 16,
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                  marginTop: 8,
                }}
              >
                <View
                  style={{
                    borderRadius: 12,
                    width: 240,
                    height: 32,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#01D3C1",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "white",
                      letterSpacing: 1,
                      textAlign: "center",
                    }}
                  >
                    Roadmap
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </View>

          {/* Natural Moving Clouds with Initial Positioning */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: screenWidth,
              height: screenHeight,
              zIndex: 15,
              pointerEvents: "none",
            }}
          >
            {/* Initial clouds already on screen */}
            <MovingCloud
              size={90}
              top={screenHeight * 0.1}
              opacity={0.6}
              speed={0.8}
              delay={0}
              restartDelay={3000}
              startPosition={screenWidth * 0.2}
            />
            <MovingCloud
              size={110}
              top={screenHeight * 0.2}
              opacity={0.5}
              speed={1.0}
              delay={0}
              restartDelay={4000}
              startPosition={screenWidth * 0.6}
            />
            <MovingCloud
              size={85}
              top={screenHeight * 0.4}
              opacity={0.7}
              speed={0.9}
              delay={0}
              restartDelay={3500}
              startPosition={screenWidth * 0.8}
            />
            <MovingCloud
              size={100}
              top={screenHeight * 0.6}
              opacity={0.6}
              speed={1.1}
              delay={0}
              restartDelay={5000}
              startPosition={screenWidth * 0.3}
            />
            <MovingCloud
              size={95}
              top={screenHeight * 0.75}
              opacity={0.8}
              speed={0.7}
              delay={0}
              restartDelay={4000}
              startPosition={screenWidth * 0.7}
            />

            {/* Moving clouds that come from left edge */}
            <MovingCloud
              size={100}
              top={screenHeight * 0.08}
              opacity={0.7}
              speed={0.8}
              delay={3000}
              restartDelay={3000}
            />
            <MovingCloud
              size={80}
              top={screenHeight * 0.12}
              opacity={0.6}
              speed={1.2}
              delay={6000}
              restartDelay={5000}
            />
            <MovingCloud
              size={90}
              top={screenHeight * 0.15}
              opacity={0.8}
              speed={0.6}
              delay={10000}
              restartDelay={2000}
            />

            <MovingCloud
              size={110}
              top={screenHeight * 0.25}
              opacity={0.5}
              speed={0.9}
              delay={4000}
              restartDelay={4000}
            />
            <MovingCloud
              size={95}
              top={screenHeight * 0.3}
              opacity={0.7}
              speed={1.1}
              delay={15000}
              restartDelay={6000}
            />

            <MovingCloud
              size={85}
              top={screenHeight * 0.45}
              opacity={0.6}
              speed={1.3}
              delay={8000}
              restartDelay={3500}
            />
            <MovingCloud
              size={120}
              top={screenHeight * 0.5}
              opacity={0.8}
              speed={0.7}
              delay={18000}
              restartDelay={7000}
            />

            <MovingCloud
              size={100}
              top={screenHeight * 0.65}
              opacity={0.7}
              speed={1.0}
              delay={2000}
              restartDelay={4500}
            />
            <MovingCloud
              size={75}
              top={screenHeight * 0.7}
              opacity={0.5}
              speed={1.4}
              delay={12000}
              restartDelay={2500}
            />

            <MovingCloud
              size={90}
              top={screenHeight * 0.8}
              opacity={0.6}
              speed={0.8}
              delay={9000}
              restartDelay={5500}
            />
            <MovingCloud
              size={105}
              top={screenHeight * 0.85}
              opacity={0.8}
              speed={1.1}
              delay={14000}
              restartDelay={3000}
            />
            <MovingCloud
              size={80}
              top={screenHeight * 0.9}
              opacity={0.7}
              speed={1.2}
              delay={16000}
              restartDelay={6500}
            />
          </View>

          <SafeAreaView style={{ flex: 1 }}>
            {/* Add top padding for floating header */}
            <View style={{ height: 80 }} />

            {/* Zoomable Philippines Map Container */}
            <PanGestureHandler
              onGestureEvent={onPanGestureEvent}
              onHandlerStateChange={onPanHandlerStateChange}
            >
              <Animated.View style={{ flex: 1 }}>
                <PinchGestureHandler
                  onGestureEvent={onPinchGestureEvent}
                  onHandlerStateChange={onPinchHandlerStateChange}
                >
                  <Animated.View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      transform: [{ scale }, { translateX }, { translateY }],
                    }}
                  >
                    {/* Philippines Map Background */}
                    <Image
                      source={require("@/assets/images/background_places/philippines_map.png")}
                      style={{
                        width: screenWidth * 1.2,
                        height: screenHeight * 0.9,
                      }}
                      resizeMode="contain"
                    />

                    {/* Stage Places positioned on the map */}
                    <View
                      style={{
                        position: "absolute",
                        width: screenWidth * 1.2,
                        height: screenHeight * 0.9,
                      }}
                    >
                      {stageData.map((stage) => {
                        const locked = isStageLocked(stage.id);
                        const position = stagePositions[stage.id];
                        const stageImage = locked ? stageImages[stage.id] : stageUnlockedImages[stage.id];

                        const isSelected = selectedStage === stage.id;

                        return (
                          <TouchableOpacity
                            key={stage.id}
                            onPress={() => handleStagePress(stage.id)}
                            activeOpacity={0.8}
                            style={{
                              position: "absolute",
                              left: position.left,
                              top: position.top,
                              alignItems: "center",
                              opacity: selectedStage && !isSelected ? 0 : 1, // Hide non-selected stages completely
                              zIndex: isSelected ? 20 : 10,
                            }}
                          >
                            {/* Stage Number Badge - Dynamic size based on zoom */}
                            <View
                              style={{
                                position: "absolute",
                                top: -8,
                                right: -8,
                                zIndex: 10,
                                width: getDynamicFontSize(32, stage.id),
                                height: getDynamicFontSize(32, stage.id),
                                borderRadius: getDynamicFontSize(16, stage.id),
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: locked
                                  ? "#9CA3AF"
                                  : isSelected
                                  ? "#FBBC05" // Yellow when selected
                                  : "#FBBC05",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 3,
                                elevation: 3,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: getDynamicFontSize(14, stage.id),
                                  fontWeight: "bold",
                                  color: locked ? "#4B5563" : "white",
                                }}
                              >
                                {stage.stage}
                              </Text>
                            </View>

                            {/* Stage Place Image - Dynamic size based on zoom */}
                            <View
                              style={{
                                borderRadius: 12,
                                overflow: "hidden",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 5,
                                elevation: 5,
                                borderWidth: isSelected ? 3 : 0,
                                borderColor: isSelected
                                  ? "#FBBC05"
                                  : "transparent",
                              }}
                            >
                              <Image
                                source={stageImage}
                                style={{
                                  width: getDynamicStageSize(stage.id),
                                  height: getDynamicStageSize(stage.id),
                                }}
                                resizeMode="cover"
                              />
                            </View>

                            {/* Stage Title - Dynamic font size based on zoom */}
                            <View
                              style={{
                                marginTop: 6,
                                paddingVertical: 4,
                                paddingHorizontal: 8,
                                borderRadius: 8,
                                backgroundColor: locked
                                  ? "rgba(209, 213, 219, 0.9)"
                                  : isSelected
                                  ? "rgba(251, 188, 5, 0.9)" // Yellow when selected
                                  : "rgba(255, 255, 255, 0.9)",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: getDynamicFontSize(12, stage.id),
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  color: locked
                                    ? "#6B7280"
                                    : isSelected
                                    ? "white"
                                    : "#FBBC05",
                                }}
                                numberOfLines={1}
                              >
                                {stage.title}
                              </Text>
                            </View>

                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </Animated.View>
                </PinchGestureHandler>
              </Animated.View>
            </PanGestureHandler>

            {/* Zoom Control Buttons */}
            <View
              style={{
                position: "absolute",
                bottom: 30,
                right: 20,
                zIndex: 60,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: 16,
                padding: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 8,
              }}
            >
              {/* Zoom In Button */}
              <TouchableOpacity
                onPress={zoomIn}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "#01D3C1",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 3,
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  +
                </Text>
              </TouchableOpacity>

              {/* Zoom Level Indicator */}
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginVertical: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  backgroundColor: "#F3F4F6",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    color: "#6B7280",
                    textAlign: "center",
                  }}
                >
                  {Math.round(currentScale * 100)}%
                </Text>
              </View>

              {/* Zoom Out Button */}
              <TouchableOpacity
                onPress={zoomOut}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "#01D3C1",
                  alignItems: "center",
                  justifyContent: "center",
                  marginVertical: 4,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 3,
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  -
                </Text>
              </TouchableOpacity>

              {/* Reset Zoom Button */}
              <TouchableOpacity
                onPress={resetZoom}
                style={{
                  width: 44,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#F97316",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 3,
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  Reset
                </Text>
              </TouchableOpacity>
            </View>

            {/* Stage Info Popup */}
            {showStageInfo && selectedStage && (
              <View
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: screenWidth * 0.075,
                  width: screenWidth * 0.85,
                  maxHeight: screenHeight * 0.4,
                  zIndex: 70,
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  borderRadius: 20,
                  padding: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 15,
                  elevation: 15,
                }}
              >
                {/* Bee Icon */}
                <View
                  style={{
                    position: "absolute",
                    top: -85,
                    left: 0,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={require("@/assets/images/Bee/bee_home.png")}
                    style={{
                      width: 120,
                      height: 120,
                    }}
                    resizeMode="contain"
                  />
                </View>

                {/* Stage Info Content */}
                <View style={{ marginTop: 15 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#1F2937",
                      marginBottom: 8,
                    }}
                  >
                    {stageDescriptions[selectedStage]?.title}
                  </Text>

                  <View
                    style={{
                      backgroundColor: "#FEF3C7",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: "#92400E",
                        textAlign: "center",
                      }}
                    >
                      {stageDescriptions[selectedStage]?.theme}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: 14,
                      color: "#4B5563",
                      lineHeight: 20,
                      marginBottom: 16,
                    }}
                  >
                    {stageDescriptions[selectedStage]?.description}
                  </Text>

                  {/* Action Buttons */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setShowStageInfo(false);
                        setSelectedStage(null);
                      }}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: "#F3F4F6",
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#6B7280",
                        }}
                      >
                        Close
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        if (!isStageLocked(selectedStage)) {
                          setShowStageInfo(false);
                          navigateToStage(selectedStage);
                        }
                      }}
                      style={{
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: isStageLocked(selectedStage)
                          ? "#9CA3AF"
                          : "#FBBC05",
                        flexDirection: "row",
                        alignItems: "center",
                        shadowColor: isStageLocked(selectedStage)
                          ? "#01D3C1"
                          : "#FBBC05",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                      }}
                      activeOpacity={isStageLocked(selectedStage) ? 0.5 : 0.9}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "white",
                        }}
                      >
                        {isStageLocked(selectedStage) ? "LOCKED" : "START"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </SafeAreaView>
        </LinearGradient>
      </View>
    </GestureHandlerRootView>
  );
}
