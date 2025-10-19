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

interface FallingItem {
  id: string;
  content: string; // Can be letter, number, word, etc.
  x: number;
  y: number;
  speed: number;
  collected: boolean;
}

// Reanimated Item Component
const AnimatedFallingItem = React.memo(
  ({
    item,
    x,
    initialY,
    itemId,
    litItems,
    onReachBottom,
    isSiargaoTheme = false,
    isManilaTheme = false,
    isViganTheme = false,
    isBoracayTheme = false,
    isPalawanTheme = false,
    isCebuTheme = false,
    isBoholTheme = false,
  }: {
    item: FallingItem;
    x: number;
    initialY: number;
    itemId: string;
    litItems: { [key: string]: boolean };
    onReachBottom: (id: string) => void;
    isSiargaoTheme?: boolean;
    isManilaTheme?: boolean;
    isViganTheme?: boolean;
    isBoracayTheme?: boolean;
    isPalawanTheme?: boolean;
    isCebuTheme?: boolean;
    isBoholTheme?: boolean;
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
          if (finished && !item.collected) {
            runOnJS(onReachBottom)(itemId);
          }
        }
      );
    }, []);

    return (
      <Animated.View style={[styles.fallingItem, animatedStyle]}>
        <Image
          source={
            isViganTheme
              ? litItems[itemId]
                ? require("@/assets/images/Lantern/lantern_light.png")
                : require("@/assets/images/Lantern/lantern_dark.png")
              : isSiargaoTheme
              ? require("@/assets/images/Coconut/coconut.png")
              : isManilaTheme
              ? litItems[itemId]
                ? require("@/assets/images/Balloon/balloon2.png")
                : require("@/assets/images/Balloon/balloon1.png")
              : isBoracayTheme
              ? litItems[itemId]
                ? require("@/assets/images/Shells/shell_2.png")
                : require("@/assets/images/Shells/shell_1.png")
              : isPalawanTheme
              ? require("@/assets/images/Boat/boat.png")
              : isCebuTheme
              ? require("@/assets/images/Mango/mango.png")
              : isBoholTheme
              ? require("@/assets/images/Tarsier/tarsier.png")
              : litItems[itemId]
                ? require("@/assets/images/Lantern/lantern_light.png")
                : require("@/assets/images/Lantern/lantern_dark.png")
          }
          style={
            isViganTheme
              ? styles.lanternImage
              : isSiargaoTheme
              ? styles.coconutImage
              : isManilaTheme
              ? styles.balloonImage
              : isBoracayTheme
              ? styles.shellImage
              : isPalawanTheme
              ? styles.boatImage
              : isCebuTheme
              ? styles.mangoImage
              : isBoholTheme
              ? styles.tarsierImage
              : styles.lanternImage
          }
          resizeMode="contain"
        />
        <Text style={[
          styles.contentText,
          {
            color: isViganTheme
              ? "#8B4513"
              : isSiargaoTheme
              ? "#9D7C00"
              : isManilaTheme
              ? "#87A248"
              : isBoracayTheme
              ? "#488DA2"
              : isPalawanTheme
              ? "#6A645C"
              : isCebuTheme
              ? "#B65828"
              : isBoholTheme
              ? "#6D825A"
              : "#875C35",
          }
        ]}>{item.content}</Text>
      </Animated.View>
    );
  }
);

export default function FallingLettersLesson({
  title,
  currentLessonIndex,
  learnedContent,
  correctAnswer,
  isViganTheme = false,
  isSiargaoTheme = false,
  isManilaTheme = false,
  isBoracayTheme = false,
  isPalawanTheme = false,
  isCebuTheme = false,
  isBoholTheme = false,
}: {
  title: string;
  currentLessonIndex: number;
  learnedContent: string[]; // Can be letters, numbers, words, etc.
  correctAnswer: string; // The AI answer for checking (mapped letter for Stage 2)
  isViganTheme?: boolean;
  isSiargaoTheme?: boolean;
  isManilaTheme?: boolean;
  isBoracayTheme?: boolean;
  isPalawanTheme?: boolean;
  isCebuTheme?: boolean;
  isBoholTheme?: boolean;
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

  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTryAgainModal, setShowTryAgainModal] = useState(false);
  const [litItems, setLitItems] = useState<{ [key: string]: boolean }>(
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

  // Generate random content from learned content
  const getRandomContent = () => {
    if (learnedContent.length === 0) return "1";
    return learnedContent[Math.floor(Math.random() * learnedContent.length)];
  };

  // Handle item reaching bottom
  const handleItemReachBottom = useCallback(
    (itemId: string) => {
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
        setFallingItems((prev) => prev.filter((item) => item.id !== itemId));
      }, 0);
    },
    [gameActive]
  );

  // Spawn falling item with Reanimated 3
  const spawnItem = useCallback(() => {
    if (!gameActive) return;

    const content = getRandomContent();
    const newItem: FallingItem = {
      id: `${Date.now()}_${Math.random()}`,
      content,
      x: Math.random() * (width - 100), // Full width game area minus item width
      y: -100,
      speed: 2 + Math.random() * 2, // Speed between 2-4
      collected: false,
    };

    setFallingItems((prev) => [...prev, newItem]);
  }, [gameActive, getRandomContent]);

  // Start game
  const startGame = () => {
    setFallingItems([]);
    setHearts(3);
    setScore(0);
    setGameActive(true);
    setShowTryAgainModal(false);
    setLitItems({});

    // Spawn items every 2 seconds for more manageable gameplay
    spawnTimerRef.current = setInterval(spawnItem, 2000);
  };

  // Stop game
  const stopGame = () => {
    setGameActive(false);
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
    }
    // Clear all falling items
    setFallingItems([]);
  };

  // Removed dummy mapLetterToNumber - now using actual AI predictions

  // Handle WebView prediction
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data?.type === "prediction") {
        // Handle different possible data structures
        // For /words endpoint: data.data.prediction.top_prediction
        // For /alphabets endpoint: data.data.prediction.prediction or data.data.prediction
        let predictedLetter;

        if (data.data?.prediction?.top_prediction) {
          // Words endpoint - extract top_prediction
          predictedLetter = data.data.prediction.top_prediction.toUpperCase();
        } else if (data.data?.prediction?.prediction) {
          // Alphabets endpoint - nested prediction
          predictedLetter = data.data.prediction.prediction.toUpperCase();
        } else if (typeof data.data?.prediction === 'string') {
          // Direct string prediction
          predictedLetter = data.data.prediction.toUpperCase();
        } else if (typeof data.prediction === 'string') {
          // Fallback
          predictedLetter = data.prediction.toUpperCase();
        }

        setPrediction(predictedLetter);

        // Use AI prediction directly - no mapping needed with proper endpoints
        const targetContent = predictedLetter;

        console.log(`[AI Prediction] Predicted: ${predictedLetter}`);

        // Check if any falling item matches the target content
        const matchingItem = fallingItems.find(
          (item) => item.content === targetContent && !item.collected
        );

        if (matchingItem && gameActive) {
          // Immediately update falling items to mark as collected and prevent multiple matches
          setFallingItems((prev) =>
            prev.map((item) =>
              item.id === matchingItem.id ? { ...item, collected: true } : item
            )
          );

          // Light up animation
          setLitItems((prev) => ({ ...prev, [matchingItem.id]: true }));

          // Remove item after short delay
          setTimeout(() => {
            setFallingItems((prev) =>
              prev.filter((item) => item.id !== matchingItem.id)
            );
            setLitItems((prev) => {
              const newLit = { ...prev };
              delete newLit[matchingItem.id];
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
      <View style={[
        styles.heartsContainer,
        {
          borderColor: isSiargaoTheme
            ? "rgba(157, 124, 0, 0.3)"
            : "rgba(135, 92, 53, 0.3)"
        }
      ]}>
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
        {fallingItems.map((item) => (
          <AnimatedFallingItem
            key={item.id}
            item={item}
            x={item.x}
            initialY={item.y}
            itemId={item.id}
            litItems={litItems}
            onReachBottom={handleItemReachBottom}
            isSiargaoTheme={isSiargaoTheme}
            isManilaTheme={isManilaTheme}
            isViganTheme={isViganTheme}
            isBoracayTheme={isBoracayTheme}
            isPalawanTheme={isPalawanTheme}
            isCebuTheme={isCebuTheme}
            isBoholTheme={isBoholTheme}
          />
        ))}
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        {!isWebViewLoaded && (
          <View style={styles.loadingContainer}>
            <Text style={[
              styles.loadingText,
              { color: isSiargaoTheme ? "#9D7C00" : "#875C35" }
            ]}>Loading Camera...</Text>
          </View>
        )}
        <WebView
          source={{
            uri: Number(stageId) === 1
              ? "https://gesturbee-app-model.vercel.app/alphabets"
              : "https://gesturbee-app-model.vercel.app/words"
          }}
          style={styles.webView}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          cameraAccessibilityLabel="Allow Camera Access"
          geolocationEnabled={true}
          useWebKit={true}
          originWhitelist={["*"]}
          androidHardwareAccelerationDisabled={false}
          onLoad={() => setIsWebViewLoaded(true)}
          onMessage={onMessage}
        />
      </View>

      <SuccessModal
        isVisible={showSuccessModal}
        onContinue={handleSuccess}
        message="Congratulations! You collected all 10 items!"
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
  fallingItem: {
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
  surfboardImage: {
    width: 70,
    height: 80,
    position: "absolute",
    top: 0,
  },
  coconutImage: {
    width: 60,
    height: 60,
    position: "absolute",
    top: 0,
  },
  balloonImage: {
    width: 70,
    height: 80,
    position: "absolute",
    top: 0,
  },
  shellImage: {
    width: 70,
    height: 80,
    position: "absolute",
    top: 0,
  },
  boatImage: {
    width: 70,
    height: 80,
    position: "absolute",
    top: 0,
  },
  mangoImage: {
    width: 70,
    height: 80,
    position: "absolute",
    top: 0,
  },
  tarsierImage: {
    width: 70,
    height: 80,
    position: "absolute",
    top: 0,
  },
  contentText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#875C35", // Default theme color
    textAlign: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -14 }, { translateY: -14 }], // Half of font size for perfect center
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
