import { useLevel } from "@/context/LevelContext";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  useWindowDimensions,
} from "react-native";
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
  const [totalItems] = useState(7); // Total items to pop (limited to 7)
  const [gameStarted, setGameStarted] = useState(false);

  // Get window dimensions for responsive WebView sizing (smaller than balloon counting)
  const windowDimensions = useWindowDimensions();
  const isPortrait = windowDimensions.height > windowDimensions.width;
  const webViewWidth = isPortrait ? 150 : 200;
  const webViewHeight = isPortrait ? 200 : 150;

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

  // Number to word mapping for Stage 2
  const numberToWord = (num: string): string => {
    const mapping: { [key: string]: string } = {
      "1": "ONE",
      "2": "TWO",
      "3": "THREE",
      "4": "FOUR",
      "5": "FIVE",
      "6": "SIX",
      "7": "SEVEN",
      "8": "EIGHT",
      "9": "NINE",
      "10": "TEN",
    };
    return mapping[num] || num;
  };

  // Generate random content from learned content
  const getRandomContent = () => {
    if (learnedContent.length === 0) return "1";
    const content =
      learnedContent[Math.floor(Math.random() * learnedContent.length)];

    // For Stage 2+, convert numbers to words for AI matching
    if (Number(stageId) >= 2) {
      return numberToWord(content);
    }

    return content;
  };

  // No item reach top handler needed for static items

  // Spawn all items initially in static positions without overlapping
  const spawnAllItems = useCallback(() => {
    const items: FloatingItem[] = [];

    // Use dynamic window dimensions instead of static
    const screenWidth = windowDimensions.width;
    const screenHeight = windowDimensions.height;

    // Center the balloon spawn area on the screen
    const balloonWidth = 80; // Width of balloon item
    const balloonHeight = 120; // Height of balloon item
    const spawnWidth = 240; // Total spawn area width for good distribution

    // Shift spawn area to the left (offset from center)
    const centerX = screenWidth / 2;
    const leftOffset = 40; // Shift 40px to the left
    const minX = centerX - spawnWidth / 2 - leftOffset;
    const maxX = centerX + spawnWidth / 2 - leftOffset;

    const minY = 160; // Move spawn area higher - below instructions box with more margin
    // Reserve much more space for navigation buttons at bottom
    // Trim the spawn area aggressively to prevent balloons going below visible area
    const maxY = screenHeight - 520; // Much more trimming - ensure balloons stay above nav buttons

    console.log("=== BALLOON SPAWN DEBUG ===");
    console.log("Screen dimensions:", screenWidth, "x", screenHeight);
    console.log("Spawn area - X:", minX, "to", maxX, "| Width:", maxX - minX);
    console.log("Spawn area - Y:", minY, "to", maxY, "| Height:", maxY - minY);

    // Fixed grid: 4 columns x 2 rows for 7 items (more horizontal spread)
    const cols = 4;
    const rows = 2;

    const availableWidth = maxX - minX;
    const availableHeight = maxY - minY;
    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / rows;

    console.log("Cell size:", cellWidth, "x", cellHeight);
    console.log("Grid:", cols, "cols x", rows, "rows");

    for (let i = 0; i < totalItems; i++) {
      const content = getRandomContent();

      // Calculate grid position
      const col = i % cols;
      const row = Math.floor(i / cols);

      // Add some randomness within each grid cell for natural look
      const cellCenterX = minX + (col + 0.5) * cellWidth;
      const cellCenterY = minY + (row + 0.5) * cellHeight;

      // Randomize position within cell (±30% of cell size for more variation)
      const randomOffsetX = (Math.random() - 0.5) * cellWidth * 0.6;
      const randomOffsetY = (Math.random() - 0.5) * cellHeight * 0.6;

      const x = Math.max(
        minX + 30,
        Math.min(maxX - 30, cellCenterX + randomOffsetX)
      );
      const y = Math.max(
        minY + 30,
        Math.min(maxY - 30, cellCenterY + randomOffsetY)
      );

      console.log(
        `Item ${i}: col=${col}, row=${row}, x=${x.toFixed(0)}, y=${y.toFixed(
          0
        )}`
      );

      const item: FloatingItem = {
        id: `item_${i}_${Date.now()}`,
        content: content.toUpperCase(), // Normalize to uppercase for consistency
        x,
        y,
        speed: 0,
        popped: false,
        itemType: Math.floor(Math.random() * 3) + 1,
      };
      items.push(item);
    }

    setFloatingItems(items);
  }, [totalItems, getRandomContent, windowDimensions]);

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
          // Time's up! - Only end game for Stage 1, not Stage 2+
          if (Number(stageId) === 1) {
            setGameActive(false);
            setGameStarted(false);
            setShowRetryModal(true);
          }
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

  // Removed dummy mapLetterToNumber - now using actual AI predictions

  // Handle WebView prediction
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("=== BALLOON POP - WEBVIEW MESSAGE ===");
      console.log("Raw data:", JSON.stringify(data, null, 2));

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
        } else if (typeof data.data?.prediction === "string") {
          // Direct string prediction
          predictedLetter = data.data.prediction.toUpperCase();
        } else if (typeof data.prediction === "string") {
          // Fallback
          predictedLetter = data.prediction.toUpperCase();
        }

        if (!predictedLetter) return;

        setPrediction(predictedLetter);

        // Use AI prediction directly - no mapping needed with proper endpoints
        const targetContent = predictedLetter;

        console.log("=== BALLOON POP - PREDICTION DEBUG ===");
        console.log(`Predicted: "${predictedLetter}"`);
        console.log(
          "Current floating items:",
          floatingItems.map((item) => ({
            content: item.content,
            popped: item.popped,
          }))
        );
        console.log("Stage ID:", stageId);

        // Check if any floating item matches the target content (both are uppercase now)
        const matchingItem = floatingItems.find(
          (item) => item.content === targetContent && !item.popped
        );

        if (matchingItem) {
          console.log(
            `✅ Match found! Item: "${matchingItem.content}", Predicted: "${predictedLetter}"`
          );
        } else {
          console.log(`❌ No match found for prediction: "${predictedLetter}"`);
        }

        if (matchingItem && gameActive) {
          console.log("Popping balloon!");

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
      {/* Instructions Box - Upper Right */}
      <View
        style={[
          styles.instructionsContainer,
          {
            backgroundColor: isViganTheme
              ? "rgba(255, 233, 195, 0.95)"
              : isSiargaoTheme
              ? "rgba(240, 231, 201, 0.95)"
              : isManilaTheme
              ? "rgba(135, 162, 72, 0.95)"
              : isBoracayTheme
              ? "rgba(72, 141, 162, 0.95)"
              : isPalawanTheme
              ? "rgba(212, 200, 184, 0.95)"
              : isCebuTheme
              ? "rgba(244, 217, 198, 0.95)"
              : isBoholTheme
              ? "rgba(212, 229, 199, 0.95)"
              : "rgba(1, 211, 193, 0.95)",
          },
        ]}
      >
        <Text
          style={[
            styles.instructionsTitle,
            {
              color: isViganTheme
                ? "#875C35"
                : isSiargaoTheme
                ? "#9D7C00"
                : isManilaTheme
                ? "white"
                : isBoracayTheme
                ? "white"
                : isPalawanTheme
                ? "#6A645C"
                : isCebuTheme
                ? "#B65828"
                : isBoholTheme
                ? "#6D825A"
                : "white",
            },
          ]}
        >
          How to Play:
        </Text>
        <Text
          style={[
            styles.instructionsText,
            {
              color: isViganTheme
                ? "#875C35"
                : isSiargaoTheme
                ? "#9D7C00"
                : isManilaTheme
                ? "white"
                : isBoracayTheme
                ? "white"
                : isPalawanTheme
                ? "#6A645C"
                : isCebuTheme
                ? "#B65828"
                : isBoholTheme
                ? "#6D825A"
                : "white",
            },
          ]}
        >
          Sign the{" "}
          {isSiargaoTheme
            ? "coconut"
            : isViganTheme
            ? "lantern"
            : isBoracayTheme
            ? "shell"
            : isPalawanTheme
            ? "boat"
            : isCebuTheme
            ? "mango"
            : isBoholTheme
            ? "tarsier"
            : "balloon"}{" "}
          labels to pop them all!
        </Text>
        {Number(stageId) === 1 && (
          <Text
            style={[
              styles.instructionsText,
              {
                color: isViganTheme
                  ? "#875C35"
                  : isSiargaoTheme
                  ? "#9D7C00"
                  : "white",
                marginTop: 8,
                fontWeight: "bold",
              },
            ]}
          >
            Time: {timeLeft}s
          </Text>
        )}
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
      <View
        style={[
          styles.webViewContainer,
          {
            width: webViewWidth,
            height: webViewHeight,
          },
        ]}
      >
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
          source={{
            uri:
              Number(stageId) === 1
                ? "https://gesturbee-app-model.vercel.app/alphabets"
                : "https://gesturbee-app-model.vercel.app/words",
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
  instructionsContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 150,
    zIndex: 200,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  instructionsText: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
  gameArea: {
    position: "absolute",
    top: 100, // Below WebView and instructions box
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
