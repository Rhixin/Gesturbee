import { useLevel } from "@/context/LevelContext";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import { WebView } from "react-native-webview";
import SuccessModal from "@/components/modals/SuccessModal";
import WrongAnswerModal from "@/components/modals/WrongAnswerModal";
import { useAuth } from "@/context/AuthContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  runOnJS,
  cancelAnimation,
} from "react-native-reanimated";
import React from "react";

const { width, height } = Dimensions.get("window");

interface FallingLetter {
  id: string;
  letter: string;
  x: number;
  y: number;
  speed: number;
  collected: boolean;
}

// Reanimated Letter Component
const AnimatedFallingLetter = React.memo(
  ({
    letter,
    x,
    initialY,
    letterId,
    litLanterns,
    onReachBottom,
  }: {
    letter: FallingLetter;
    x: number;
    initialY: number;
    letterId: string;
    litLanterns: { [key: string]: boolean };
    onReachBottom: (id: string) => void;
  }) => {
    const y = useSharedValue(initialY);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: y.value }],
        left: x, // Use absolute left positioning instead of translateX
      };
    });

    useEffect(() => {
      // Start falling animation with slower speed for better gameplay
      y.value = withTiming(
        height - 120, // Fall to bottom, leaving space for hearts/score
        {
          duration: 5000 + Math.random() * 2000, // 5-7 seconds for slower, more playable speed
          easing: Easing.linear,
        },
        (finished) => {
          "worklet";
          if (finished && !letter.collected) {
            runOnJS(onReachBottom)(letterId);
          }
        }
      );
    }, []);

    return (
      <Animated.View style={[styles.fallingLetter, animatedStyle]}>
        <Image
          source={
            litLanterns[letterId]
              ? require("@/assets/images/Lantern/lantern_light.png")
              : require("@/assets/images/Lantern/lantern_dark.png")
          }
          style={styles.lanternImage}
          resizeMode="contain"
        />
        <Text style={styles.letterText}>{letter.letter}</Text>
      </Animated.View>
    );
  }
);

export default function FallingLettersLesson({
  title,
  currentLessonIndex,
  learnedLetters,
  isViganTheme = false,
}: {
  title: string;
  currentLessonIndex: number;
  learnedLetters: string[];
  isViganTheme?: boolean;
}) {
  const {
    userSavedStage,
    userSavedLevel,
    userSavedLesson,
    userSavedTotalLesson,
    updateLevel,
    setShowLevelCompleteModal,
  } = useLevel();
  const { stageId, levelId } = useLocalSearchParams();
  const { currentUser } = useAuth();

  const [fallingLetters, setFallingLetters] = useState<FallingLetter[]>([]);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTryAgainModal, setShowTryAgainModal] = useState(false);
  const [litLanterns, setLitLanterns] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [prediction, setPrediction] = useState("");
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);

  const spawnTimerRef = useRef<NodeJS.Timeout>();

  // Handle mo next cya bisag humana ani nga level
  const isThisLessonAlreadyDone = () => {
    const currentStageId = Number(stageId);
    const currentLevelId = Number(levelId);

    // If we're on a higher stage or level, this is new content
    if (currentStageId > userSavedStage || currentLevelId > userSavedLevel) {
      return false;
    }

    // If we're on the same stage and level, check lesson progress
    if (currentStageId == userSavedStage && currentLevelId == userSavedLevel) {
      // If current lesson is beyond saved progress, it's not done yet
      return currentLessonIndex <= userSavedLesson;
    }

    // If we're on a lower stage/level, it's already done
    return true;
  };

  // Generate random letter from learned letters
  const getRandomLetter = () => {
    if (learnedLetters.length === 0) return "A";
    return learnedLetters[Math.floor(Math.random() * learnedLetters.length)];
  };

  // Handle letter reaching bottom
  const handleLetterReachBottom = useCallback(
    (letterId: string) => {
      if (!gameActive) return;

      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        setHearts((prev) => {
          const newHearts = prev - 1;
          if (newHearts <= 0) {
            setGameActive(false);
            setShowTryAgainModal(true);
          }
          return Math.max(0, newHearts);
        });
        setFallingLetters((prev) => prev.filter((l) => l.id !== letterId));
      }, 0);
    },
    [gameActive]
  );

  // Spawn falling letter with Reanimated 3
  const spawnLetter = useCallback(() => {
    if (!gameActive) return;

    const letter = getRandomLetter();
    const newLetter: FallingLetter = {
      id: `${Date.now()}_${Math.random()}`,
      letter,
      x: Math.random() * (width - 100), // Full width game area minus letter width
      y: -100,
      speed: 2 + Math.random() * 2, // Speed between 2-4
      collected: false,
    };

    setFallingLetters((prev) => [...prev, newLetter]);
  }, [gameActive, getRandomLetter]);

  // Start game
  const startGame = () => {
    setFallingLetters([]);
    setHearts(3);
    setScore(0);
    setGameActive(true);
    setShowTryAgainModal(false);
    setLitLanterns({});

    // Spawn letters every 2 seconds for more manageable gameplay
    spawnTimerRef.current = setInterval(spawnLetter, 2000);
  };

  // Stop game
  const stopGame = () => {
    setGameActive(false);
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
    }
    // Clear all falling letters
    setFallingLetters([]);
  };

  // Handle WebView prediction
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data?.type === "prediction") {
        const predictedLetter = data.data.prediction.prediction.toUpperCase();
        setPrediction(predictedLetter);

        // Check if any falling letter matches
        const matchingLetter = fallingLetters.find(
          (letter) => letter.letter === predictedLetter && !letter.collected
        );

        if (matchingLetter && gameActive) {
          // Immediately update falling letters to mark as collected and prevent multiple matches
          setFallingLetters((prev) =>
            prev.map((l) =>
              l.id === matchingLetter.id ? { ...l, collected: true } : l
            )
          );

          // Light up animation
          setLitLanterns((prev) => ({ ...prev, [matchingLetter.id]: true }));

          // Remove letter after short delay
          setTimeout(() => {
            setFallingLetters((prev) =>
              prev.filter((l) => l.id !== matchingLetter.id)
            );
            setLitLanterns((prev) => {
              const newLit = { ...prev };
              delete newLit[matchingLetter.id];
              return newLit;
            });
          }, 500);

          // Increase score
          setScore((prev) => {
            const newScore = prev + 1;
            if (newScore >= 10) {
              // Game won! Handle level completion outside of setState
              setTimeout(() => {
                stopGame();
                const lessonAlreadyDone = isThisLessonAlreadyDone();

                if (!lessonAlreadyDone) {
                  // Update Database
                  if (userSavedLesson === userSavedTotalLesson) {
                    console.log("Level complete! Updating to next level");
                    updateLevel(
                      currentUser.id,
                      userSavedStage,
                      userSavedLevel + 1,
                      1,
                      userSavedTotalLesson,
                      true
                    );
                    setShowLevelCompleteModal(true);
                  } else {
                    console.log("Moving to next lesson:", userSavedLesson + 1);
                    updateLevel(
                      currentUser.id,
                      userSavedStage,
                      userSavedLevel,
                      userSavedLesson + 1,
                      userSavedTotalLesson,
                      false
                    );
                  }
                }
                setShowSuccessModal(true);
              }, 0);
            }
            return newScore;
          });
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  // Initialize game on mount
  useEffect(() => {
    startGame();
    return () => stopGame();
  }, []);

  const handleTryAgain = () => {
    startGame();
  };

  const handleSuccess = () => {
    setShowSuccessModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Hearts */}
      <View style={styles.heartsContainer}>
        {Array.from({ length: 3 }, (_, i) => (
          <Text
            key={i}
            style={[styles.heart, { opacity: i < hearts ? 1 : 0.3 }]}
          >
            ❤️
          </Text>
        ))}
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {fallingLetters.map((letter) => (
          <AnimatedFallingLetter
            key={letter.id}
            letter={letter}
            x={letter.x}
            initialY={letter.y}
            letterId={letter.id}
            litLanterns={litLanterns}
            onReachBottom={handleLetterReachBottom}
          />
        ))}
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        {!isWebViewLoaded && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Camera...</Text>
          </View>
        )}
        <WebView
          source={{ uri: "https://gesturbee-app-model.vercel.app/" }}
          style={styles.webView}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          cameraAccessibilityLabel="Allow Camera Access"
          geolocationEnabled={true}
          useWebKit={true}
          originWhitelist={[""]}
          androidHardwareAccelerationDisabled={false}
          onLoad={() => setIsWebViewLoaded(true)}
          onMessage={onMessage}
        />
      </View>

      <SuccessModal
        isVisible={showSuccessModal}
        onContinue={handleSuccess}
        message="Congratulations! You collected all 10 letters!"
      />

      <WrongAnswerModal
        isVisible={showTryAgainModal}
        onContinue={handleTryAgain}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%", // Take full width to override parent centering
    alignSelf: "stretch", // Stretch to full width
    backgroundColor: "transparent", // Transparent to show parent background
  },
  heartsContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    flexDirection: "row",
    zIndex: 200, // Higher z-index
    backgroundColor: "rgba(255, 255, 255, 0.9)", // More opaque background
    borderRadius: 10,
    padding: 8, // More padding
    borderWidth: 1,
    borderColor: "rgba(135, 92, 53, 0.3)", // Subtle border
  },
  heart: {
    fontSize: 24, // Larger heart size
    marginRight: 5,
  },
  gameArea: {
    position: "absolute",
    top: 140, // Below the WebView
    left: 0, // Reduce left margin
    right: 0, // Reduce right margin
    bottom: 80, // Above the hearts/score
    backgroundColor: "transparent", // Transparent background
  },
  fallingLetter: {
    position: "absolute",
    width: 80,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  lanternImage: {
    width: 70,
    height: 80,
    position: "absolute",
    top: 0,
  },
  letterText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#875C35", // Vigan theme color
    textAlign: "center",
    marginTop: 25,
    textShadowColor: "#FFFFFF",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    zIndex: 10,
  },
  webViewContainer: {
    position: "absolute",
    top: 20,
    left: 20, // Proper left margin
    width: 160, // Smaller width as requested
    height: 160, // Smaller height as requested
    backgroundColor: "#000000",
    zIndex: 1,
  },
  webView: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    zIndex: 1,
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#875C35",
    fontWeight: "bold",
  },
});
