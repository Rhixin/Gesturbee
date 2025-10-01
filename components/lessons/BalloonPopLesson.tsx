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

interface FloatingItem {
  id: string;
  content: string; // Can be letter, number, word, etc.
  x: number;
  y: number;
  speed: number;
  popped: boolean;
  itemType: number; // For different item variations
}

// Static Item Component
const StaticItem = React.memo(
  ({
    item,
    x,
    y,
    itemId,
    poppedItems,
    isSiargaoTheme = false,
    isManilaTheme = false,
    isViganTheme = false,
    isBoracayTheme = false,
    isPalawanTheme = false,
    isCebuTheme = false,
    isBoholTheme = false,
  }: {
    item: FloatingItem;
    x: number;
    y: number;
    itemId: string;
    poppedItems: { [key: string]: boolean };
    isSiargaoTheme?: boolean;
    isManilaTheme?: boolean;
    isViganTheme?: boolean;
    isBoracayTheme?: boolean;
    isPalawanTheme?: boolean;
    isCebuTheme?: boolean;
    isBoholTheme?: boolean;
  }) => {
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        left: x,
        top: y,
        opacity: poppedItems[itemId] ? 0 : opacity.value,
      };
    });

    // No movement animation - items stay static

    // Theme-based item selection: Vigan uses lanterns, Siargao uses coconuts, Manila/default uses balloons, Boracay uses shells
    const itemImages = isViganTheme
      ? {
          1: require("@/assets/images/Lantern/lantern_dark.png"),
          2: require("@/assets/images/Lantern/lantern_light.png"),
          3: require("@/assets/images/Lantern/lantern_dark.png"),
        }
      : isSiargaoTheme
      ? {
          1: require("@/assets/images/Coconut/coconut.png"),
          2: require("@/assets/images/Coconut/coconut.png"),
          3: require("@/assets/images/Coconut/coconut.png"),
        }
      : isBoracayTheme
      ? {
          1: require("@/assets/images/Shells/shell_1.png"),
          2: require("@/assets/images/Shells/shell_2.png"),
          3: require("@/assets/images/Shells/shell_1.png"),
        }
      : isPalawanTheme
      ? {
          1: require("@/assets/images/Boat/boat.png"),
          2: require("@/assets/images/Boat/boat.png"),
          3: require("@/assets/images/Boat/boat.png"),
        }
      : isCebuTheme
      ? {
          1: require("@/assets/images/Mango/mango.png"),
          2: require("@/assets/images/Mango/mango.png"),
          3: require("@/assets/images/Mango/mango.png"),
        }
      : isBoholTheme
      ? {
          1: require("@/assets/images/Tarsier/tarsier.png"),
          2: require("@/assets/images/Tarsier/tarsier.png"),
          3: require("@/assets/images/Tarsier/tarsier.png"),
        }
      : {
          1: require("@/assets/images/Balloon/balloon1.png"),
          2: require("@/assets/images/Balloon/balloon2.png"),
          3: require("@/assets/images/Balloon/balloon3.png"),
        };

    return (
      <Animated.View style={[styles.staticItem, animatedStyle]}>
        <Image
          source={itemImages[item.itemType]}
          style={
            isViganTheme
              ? styles.lanternImage
              : isSiargaoTheme
              ? styles.coconutImage
              : isBoracayTheme
              ? styles.shellImage
              : isPalawanTheme
              ? styles.boatImage
              : isCebuTheme
              ? styles.mangoImage
              : isBoholTheme
              ? styles.tarsierImage
              : styles.balloonImage
          }
          resizeMode="contain"
        />
        <Text
          style={[
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
            },
          ]}
        >
          {item.content}
        </Text>
      </Animated.View>
    );
  }
);

export default function BalloonPopLesson({
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

  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([]);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [poppedItems, setPoppedItems] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [prediction, setPrediction] = useState("");
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds timer
  const [totalItems] = useState(12); // Total items to pop
  const [gameStarted, setGameStarted] = useState(false);

  const gameTimerRef = useRef<NodeJS.Timeout>();
  const spawnTimerRef = useRef<NodeJS.Timeout>();

  // Handle level completion logic
  const isThisLessonAlreadyDone = () => {
    const currentStageId = Number(stageId);
    const currentLevelId = Number(levelId);

    if (currentStageId > userSavedStage || currentLevelId > userSavedLevel) {
      return false;
    }

    if (currentStageId == userSavedStage && currentLevelId == userSavedLevel) {
      return currentLessonIndex <= userSavedLesson;
    }

    return true;
  };

  // Generate random content from learned content
  const getRandomContent = () => {
    if (learnedContent.length === 0) return "1";
    return learnedContent[Math.floor(Math.random() * learnedContent.length)];
  };

  // No item reach top handler needed for static items

  // Spawn all items initially in static positions without overlapping
  const spawnAllItems = useCallback(() => {
    const items: FloatingItem[] = [];

    // Better distribution across available space
    // Available area: avoid WebView (left 0-180) and timer (right width-180 to width)
    const minX = 50; // Increased left margin for better spacing
    const maxX = width - 120; // Reduced timer area avoidance to use more width
    const minY = 50; // Higher up with more margin
    const maxY = height - 600; // Adjust vertical range

    const usedPositions: { x: number; y: number }[] = [];
    const minDistance = 140; // Increased minimum distance between items for better spacing

    // Use grid-based approach for better distribution
    const availableWidth = maxX - minX;
    const availableHeight = maxY - minY;
    const cols = Math.ceil(Math.sqrt(totalItems * (availableWidth / availableHeight)));
    const rows = Math.ceil(totalItems / cols);

    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / rows;

    for (let i = 0; i < totalItems; i++) {
      const content = getRandomContent();

      // Calculate grid position
      const col = i % cols;
      const row = Math.floor(i / cols);

      // Add some randomness within each grid cell for natural look
      const cellCenterX = minX + (col + 0.5) * cellWidth;
      const cellCenterY = minY + (row + 0.5) * cellHeight;

      // Randomize position within cell (±25% of cell size)
      const randomOffsetX = (Math.random() - 0.5) * cellWidth * 0.5;
      const randomOffsetY = (Math.random() - 0.5) * cellHeight * 0.5;

      const x = Math.max(minX + 30, Math.min(maxX - 30, cellCenterX + randomOffsetX));
      const y = Math.max(minY + 30, Math.min(maxY - 30, cellCenterY + randomOffsetY));

      usedPositions.push({ x, y });

      const item: FloatingItem = {
        id: `item_${i}_${Date.now()}`,
        content,
        x,
        y,
        speed: 0,
        popped: false,
        itemType: Math.floor(Math.random() * 3) + 1,
      };
      items.push(item);
    }

    setFloatingItems(items);
  }, [totalItems, getRandomContent]);

  // Start game
  const startGame = () => {
    setFloatingItems([]);
    setScore(0);
    setGameActive(true);
    setShowRetryModal(false);
    setPoppedItems({});
    setTimeLeft(30);
    setGameStarted(true);

    // Spawn all items initially
    spawnAllItems();

    // Game timer countdown
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up!
          setGameActive(false);
          setGameStarted(false);
          setShowRetryModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Stop game
  const stopGame = () => {
    setGameActive(false);
    setGameStarted(false);
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    setFloatingItems([]);
  };

  // Development helper: Map AI letters to numbers for testing
  const mapLetterToNumber = (letter: string): string => {
    const letterToNumberMap: { [key: string]: string } = {
      A: "1",
      B: "2",
      C: "3",
      D: "4",
      E: "5",
      F: "6",
      G: "7",
      H: "8",
      I: "9",
      J: "10",
    };
    return letterToNumberMap[letter] || letter;
  };

  // Handle WebView prediction
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data?.type === "prediction") {
        const predictedLetter =
          data?.data?.prediction?.prediction?.toUpperCase?.();
        if (!predictedLetter) return;

        setPrediction(predictedLetter);

        // For Manila theme (Stage 2): map AI letter to number for display matching
        // For other themes (Stage 1): use letter directly
        const targetContent = isManilaTheme
          ? mapLetterToNumber(predictedLetter)
          : predictedLetter;

        console.log(
          `[Development] AI predicted: ${predictedLetter} -> Target: ${targetContent} (Manila: ${isManilaTheme})`
        );

        // Check if any floating item matches the target content
        const matchingItem = floatingItems.find(
          (item) => item.content === targetContent && !item.popped
        );

        if (matchingItem && gameActive) {
          // Mark item as popped
          setFloatingItems((prev) =>
            prev.map((item) =>
              item.id === matchingItem.id ? { ...item, popped: true } : item
            )
          );

          // Pop animation
          setPoppedItems((prev) => ({ ...prev, [matchingItem.id]: true }));

          // Remove item after animation
          setTimeout(() => {
            setFloatingItems((prev) =>
              prev.filter((item) => item.id !== matchingItem.id)
            );
            setPoppedItems((prev) => {
              const newPopped = { ...prev };
              delete newPopped[matchingItem.id];
              return newPopped;
            });
          }, 300);

          // Increase score
          setScore((prev) => {
            const newScore = prev + 1;
            if (newScore >= totalItems) {
              // Game won!
              setTimeout(() => {
                stopGame();
                const lessonAlreadyDone = isThisLessonAlreadyDone();

                if (!lessonAlreadyDone) {
                  if (userSavedLesson === userSavedTotalLesson) {
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
      console.error("Error parsing message:", error, event.nativeEvent.data);
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

  // Calculate progress percentage
  const progressPercentage = (timeLeft / 30) * 100;

  return (
    <View style={styles.container}>
      {/* Timer Progress Bar - Upper Right */}
      <View
        style={[
          styles.timerContainer,
          {
            backgroundColor: isSiargaoTheme
              ? "rgba(240, 231, 201, 0.95)"
              : "rgba(255, 233, 195, 0.95)",
          },
        ]}
      >
        <Text
          style={[
            styles.timerText,
            { color: isSiargaoTheme ? "#9D7C00" : "#875C35" },
          ]}
        >
          Time: {timeLeft}s
        </Text>
        <View
          style={[
            styles.progressBarContainer,
            {
              backgroundColor: isSiargaoTheme ? "#F0E7C9" : "#FFE9C3",
              borderColor: isSiargaoTheme ? "#9D7C00" : "#875C35",
            },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              {
                width: `${progressPercentage}%`,
                backgroundColor:
                  progressPercentage > 30
                    ? isSiargaoTheme
                      ? "#9D7C00"
                      : "#875C35"
                    : "#D97706",
              },
            ]}
          />
        </View>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {floatingItems.map((item) => (
          <StaticItem
            key={item.id}
            item={item}
            x={item.x}
            y={item.y}
            itemId={item.id}
            poppedItems={poppedItems}
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
            <Text
              style={[
                styles.loadingText,
                { color: isSiargaoTheme ? "#9D7C00" : "#875C35" },
              ]}
            >
              Loading Camera...
            </Text>
          </View>
        )}
        <WebView
          source={{ uri: "https://gesturbee-app-model.vercel.app/" }}
          style={styles.webView}
          allowsInlineMediaPlaybook={true}
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
        message={`Congratulations! You popped all ${totalItems} ${
          isSiargaoTheme ? "coconuts" : "balloons"
        } in time!`}
      />

      <WrongAnswerModal
        isVisible={showRetryModal}
        onContinue={handleTryAgain}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "transparent",
  },
  timerContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 160,
    zIndex: 200,
    backgroundColor: "rgba(255, 233, 195, 0.95)", // Vigan theme background
    borderRadius: 12,
    padding: 12,
  },
  timerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#875C35",
    textAlign: "center",
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: "#FFE9C3",
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#875C35",
  },
  progressBar: {
    height: "100%",
    borderRadius: 6,
  },
  gameArea: {
    position: "absolute",
    top: 200, // Below WebView and timer
    left: 0,
    right: 0,
    bottom: 80,
    backgroundColor: "transparent",
  },
  staticItem: {
    position: "absolute",
    width: 80,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  balloonImage: {
    width: 70,
    height: 90,
    position: "absolute",
    top: 0,
  },
  shellImage: {
    width: 70,
    height: 90,
    position: "absolute",
    top: 0,
  },
  boatImage: {
    width: 70,
    height: 90,
    position: "absolute",
    top: 0,
  },
  mangoImage: {
    width: 70,
    height: 90,
    position: "absolute",
    top: 0,
  },
  tarsierImage: {
    width: 70,
    height: 90,
    position: "absolute",
    top: 0,
  },
  coconutImage: {
    width: 70,
    height: 90,
    position: "absolute",
    top: 0,
  },
  lanternImage: {
    width: 70,
    height: 90,
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
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    zIndex: 10,
  },
  webViewContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 160,
    height: 160,
    backgroundColor: "#000000",
    borderRadius: 12,
    zIndex: 1,
  },
  webView: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
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
    fontSize: 14,
    color: "#875C35",
    fontWeight: "bold",
  },
});
