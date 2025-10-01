import { useLevel } from "@/context/LevelContext";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Image } from "react-native";
import { WebView } from "react-native-webview";
import SuccessModal from "@/components/modals/SuccessModal";
import { useAuth } from "@/context/AuthContext";
import React from "react";

// Static image mapping for all alphabet words from CSV
const getImageForWord = (word?: string) => {
  if (!word) {
    return require("@/assets/images/Bee/bee4.png");
  }

  const wordLower = word.toLowerCase();

  // Complete mapping for all CSV words
  const imageMap: { [key: string]: any } = {
    // A words
    'apple': require("@/assets/images/alphabet-images/apple.png"),
    'ant': require("@/assets/images/alphabet-images/ant.png"),
    'camera': require("@/assets/images/alphabet-images/camera.png"),
    'plate': require("@/assets/images/alphabet-images/plate.png"),
    'grape': require("@/assets/images/alphabet-images/grape.png"),
    'avocado': require("@/assets/images/alphabet-images/avocado.png"),

    // B words
    'book': require("@/assets/images/alphabet-images/book.png"),
    'table': require("@/assets/images/alphabet-images/table.png"),
    'bat': require("@/assets/images/alphabet-images/bat.png"),
    'rabbit': require("@/assets/images/alphabet-images/rabbit.png"),
    'banana': require("@/assets/images/alphabet-images/banana.png"),
    'bulb': require("@/assets/images/alphabet-images/bulb.png"),

    // C words
    'circle': require("@/assets/images/alphabet-images/circle.png"),
    'car': require("@/assets/images/alphabet-images/car.png"),
    'cat': require("@/assets/images/alphabet-images/cat.png"),
    'doctor': require("@/assets/images/alphabet-images/doctor.png"),
    'school': require("@/assets/images/alphabet-images/school.png"),
    'cactus': require("@/assets/images/alphabet-images/cactus.png"),

    // D words
    'dog': require("@/assets/images/alphabet-images/dog.png"),
    'candle': require("@/assets/images/alphabet-images/candle.png"),
    'diamond': require("@/assets/images/alphabet-images/diamond.png"),
    'donut': require("@/assets/images/alphabet-images/donut.png"),
    'ladder': require("@/assets/images/alphabet-images/ladder.png"),
    'door': require("@/assets/images/alphabet-images/door.png"),

    // E words
    'egg': require("@/assets/images/alphabet-images/egg.png"),
    'cheese': require("@/assets/images/alphabet-images/cheese.png"),
    'bee': require("@/assets/images/alphabet-images/bee.png"),
    'letter': require("@/assets/images/alphabet-images/letter.png"),
    'tree': require("@/assets/images/alphabet-images/tree.png"),
    'envelope': require("@/assets/images/alphabet-images/envelope.png"),

    // F words
    'fish': require("@/assets/images/alphabet-images/fish.png"),
    'fan': require("@/assets/images/alphabet-images/fan.png"),
    'leaf': require("@/assets/images/alphabet-images/leaf.png"),
    'fork': require("@/assets/images/alphabet-images/fork.png"),
    'coffee': require("@/assets/images/alphabet-images/coffee.png"),
    'roof': require("@/assets/images/alphabet-images/roof.png"),

    // G words
    'gold': require("@/assets/images/alphabet-images/gold.png"),
    'guitar': require("@/assets/images/alphabet-images/guitar.png"),
    'gift': require("@/assets/images/alphabet-images/gift.png"),
    'flag': require("@/assets/images/alphabet-images/flag.png"),
    'goat': require("@/assets/images/alphabet-images/goat.png"),

    // H words
    'house': require("@/assets/images/alphabet-images/house.png"),
    'earth': require("@/assets/images/alphabet-images/earth.png"),
    'whale': require("@/assets/images/alphabet-images/whale.png"),
    'chair': require("@/assets/images/alphabet-images/chair.png"),
    'hammer': require("@/assets/images/alphabet-images/hammer.png"),
    'honey': require("@/assets/images/alphabet-images/honey.png"),

    // I words
    'ice': require("@/assets/images/alphabet-images/ice.png"),
    'milk': require("@/assets/images/alphabet-images/milk.png"),
    'ring': require("@/assets/images/alphabet-images/ring.png"),
    'kite': require("@/assets/images/alphabet-images/kite.png"),
    'iron': require("@/assets/images/alphabet-images/iron.png"),
    'ship': require("@/assets/images/alphabet-images/ship.png"),

    // J words
    'jar': require("@/assets/images/alphabet-images/jar.png"),
    'jeep': require("@/assets/images/alphabet-images/jeep.png"),
    'jacket': require("@/assets/images/alphabet-images/jacket.png"),
    'ninja': require("@/assets/images/alphabet-images/ninja.png"),
    'jollibee': require("@/assets/images/alphabet-images/jollibee.png"),
    'juice': require("@/assets/images/alphabet-images/juice.png"),

    // K words
    'key': require("@/assets/images/alphabet-images/key.png"),
    'monkey': require("@/assets/images/alphabet-images/monkey.png"),
    'basket': require("@/assets/images/alphabet-images/basket.png"),
    'cake': require("@/assets/images/alphabet-images/cake.png"),
    'kalesa': require("@/assets/images/alphabet-images/kalesa.png"),

    // L words
    'lamp': require("@/assets/images/alphabet-images/lamp.png"),
    'lion': require("@/assets/images/alphabet-images/lion.png"),
    'leg': require("@/assets/images/alphabet-images/leg.png"),
    'lock': require("@/assets/images/alphabet-images/lock.png"),
    'balut': require("@/assets/images/alphabet-images/balut.png"),

    // M words
    'lemon': require("@/assets/images/alphabet-images/lemon.png"),
    'moon': require("@/assets/images/alphabet-images/moon.png"),
    'camel': require("@/assets/images/alphabet-images/camel.png"),
    'drum': require("@/assets/images/alphabet-images/drum.png"),
    'mirror': require("@/assets/images/alphabet-images/mirror.png"),

    // N words
    'nipa': require("@/assets/images/alphabet-images/nipa.png"),
    'nose': require("@/assets/images/alphabet-images/nose.png"),
    'nest': require("@/assets/images/alphabet-images/nest.png"),
    'pen': require("@/assets/images/alphabet-images/pen.png"),
    'rain': require("@/assets/images/alphabet-images/rain.png"),

    // O words
    'owl': require("@/assets/images/alphabet-images/owl.png"),
    'octopus': require("@/assets/images/alphabet-images/octopus.png"),
    'tomato': require("@/assets/images/alphabet-images/tomato.png"),
    'robot': require("@/assets/images/alphabet-images/robot.png"),

    // P words
    'pig': require("@/assets/images/alphabet-images/pig.png"),
    'map': require("@/assets/images/alphabet-images/map.png"),
    'paper': require("@/assets/images/alphabet-images/paper.png"),
    'pencil': require("@/assets/images/alphabet-images/pencil.png"),
    'pizza': require("@/assets/images/alphabet-images/pizza.png"),

    // Q words
    'quartz': require("@/assets/images/alphabet-images/quartz.png"),
    'quill': require("@/assets/images/alphabet-images/quill.png"),
    'liquid': require("@/assets/images/alphabet-images/liquid.png"),
    'quiz': require("@/assets/images/alphabet-images/quiz.png"),
    'quail': require("@/assets/images/alphabet-images/quail.png"),
    'question': require("@/assets/images/alphabet-images/question.png"),

    // R words
    'rose': require("@/assets/images/alphabet-images/rose.png"),
    'rat': require("@/assets/images/alphabet-images/rat.png"),
    'rainbow': require("@/assets/images/alphabet-images/rainbow.png"),
    'rice': require("@/assets/images/alphabet-images/rice.png"),
    'star': require("@/assets/images/alphabet-images/star.png"),

    // S words
    'sock': require("@/assets/images/alphabet-images/sock.png"),
    'spoon': require("@/assets/images/alphabet-images/spoon.png"),
    'bus': require("@/assets/images/alphabet-images/bus.png"),
    'dress': require("@/assets/images/alphabet-images/dress.png"),

    // T words
    'toy': require("@/assets/images/alphabet-images/toy.png"),
    'tiger': require("@/assets/images/alphabet-images/tiger.png"),
    'ticket': require("@/assets/images/alphabet-images/ticket.png"),

    // U words
    'umbrella': require("@/assets/images/alphabet-images/umbrella.png"),
    'utensils': require("@/assets/images/alphabet-images/utensils.png"),
    'fruit': require("@/assets/images/alphabet-images/fruit.png"),
    'unicorn': require("@/assets/images/alphabet-images/unicorn.png"),
    'glue': require("@/assets/images/alphabet-images/glue.png"),
    'ukulele': require("@/assets/images/alphabet-images/ukulele.png"),

    // V words
    'vest': require("@/assets/images/alphabet-images/vest.png"),
    'volleyball': require("@/assets/images/alphabet-images/volleyball.png"),
    'cave': require("@/assets/images/alphabet-images/cave.png"),
    'vase': require("@/assets/images/alphabet-images/vase.png"),
    'oven': require("@/assets/images/alphabet-images/oven.png"),
    'violin': require("@/assets/images/alphabet-images/violin.png"),

    // W words
    'window': require("@/assets/images/alphabet-images/window.png"),
    'web': require("@/assets/images/alphabet-images/web.png"),
    'towel': require("@/assets/images/alphabet-images/towel.png"),
    'water': require("@/assets/images/alphabet-images/water.png"),
    'wolf': require("@/assets/images/alphabet-images/wolf.png"),
    'snow': require("@/assets/images/alphabet-images/snow.png"),

    // X words
    'x-ray': require("@/assets/images/alphabet-images/x-ray.png"),
    'box': require("@/assets/images/alphabet-images/box.png"),
    'fox': require("@/assets/images/alphabet-images/fox.png"),
    'xylophone': require("@/assets/images/alphabet-images/xylophone.png"),
    'taxi': require("@/assets/images/alphabet-images/taxi.png"),
    'xmas': require("@/assets/images/alphabet-images/xmas.png"),

    // Y words
    'yarn': require("@/assets/images/alphabet-images/yarn.png"),
    'yacht': require("@/assets/images/alphabet-images/yacht.png"),
    'candy': require("@/assets/images/alphabet-images/candy.png"),
    'jelly': require("@/assets/images/alphabet-images/jelly.png"),
    'yo-yo': require("@/assets/images/alphabet-images/yo-yo.png"),

    // Z words
    'zebra': require("@/assets/images/alphabet-images/zebra.png"),
    'zero': require("@/assets/images/alphabet-images/zero.png"),
    'zoo': require("@/assets/images/alphabet-images/zoo.png"),
    'zip': require("@/assets/images/alphabet-images/zip.png"),
    'zigzag': require("@/assets/images/alphabet-images/zigzag.png"),
  };

  return imageMap[wordLower] || require("@/assets/images/Bee/bee4.png");
};

export default function SpellingLesson({
  title,
  correctWord,
  questionWord,
  currentLessonIndex,
  isViganTheme = false,
  blankPositions,
  learnedLetters,
  wordForImage,
}: {
  title: string;
  correctWord: string[]; // Array of correct letters: ['A','P','P','L','E']
  questionWord: string[]; // Array with blanks: ['_','P','_','L','E']
  currentLessonIndex: number;
  isViganTheme?: boolean;
  blankPositions: { index: number; letter: string }[]; // Positions and letters of blanks
  learnedLetters: string[]; // Available learned letters
  wordForImage?: string; // The actual word to show image for
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
  const [prediction, setPrediction] = useState("");
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Track the current word state with filled in letters
  const [currentWordState, setCurrentWordState] = useState([...questionWord]);
  // Track remaining blank positions that need to be filled
  const [remainingBlanks, setRemainingBlanks] = useState([...blankPositions]);

  // Initialize remaining blanks when component mounts or props change
  useEffect(() => {
    setCurrentWordState([...questionWord]);
    setRemainingBlanks([...blankPositions]);
  }, [questionWord, blankPositions]);

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

  // Check if all blanks are filled correctly
  const isWordComplete = () => {
    return remainingBlanks.length === 0;
  };

  // Get available letters that can fill any remaining blank
  const getAvailableLetters = () => {
    return [...new Set(remainingBlanks.map((blank) => blank.letter))];
  };

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data?.type === "prediction") {
        const predictedLetter = data.data.prediction.prediction.toUpperCase();
        setPrediction(predictedLetter);

        // Find the next blank in order (leftmost remaining blank) that matches the predicted letter
        const sortedBlanks = remainingBlanks.sort((a, b) => a.index - b.index);
        const nextBlank = sortedBlanks[0]; // Get the leftmost remaining blank

        // Only fill if the predicted letter matches the next expected blank
        if (nextBlank && nextBlank.letter === predictedLetter) {
          const blankToFill = nextBlank;
          const newWordState = [...currentWordState];
          newWordState[blankToFill.index] = correctWord[blankToFill.index];
          setCurrentWordState(newWordState);

          // Remove this blank from remaining blanks
          const newRemainingBlanks = remainingBlanks.filter(
            (blank) => blank.index !== blankToFill.index
          );
          setRemainingBlanks(newRemainingBlanks);

          // Check if all blanks are filled
          if (newRemainingBlanks.length === 0) {
            console.log("Spelling lesson completed!");
            const lessonAlreadyDone = isThisLessonAlreadyDone();
            console.log("Is lesson already done?", lessonAlreadyDone);
            console.log("Current lesson index:", currentLessonIndex);
            console.log("User saved lesson:", userSavedLesson);
            console.log(
              "User saved stage:",
              userSavedStage,
              "Stage ID:",
              Number(stageId)
            );
            console.log(
              "User saved level:",
              userSavedLevel,
              "Level ID:",
              Number(levelId)
            );

            if (!lessonAlreadyDone) {
              // Update Database
              if (userSavedLesson === userSavedTotalLesson) {
                console.log("Level complete! Updating to next level");
                updateLevel(
                  currentUser.id,
                  userSavedStage,
                  userSavedLevel + 1,
                  1,
                  userSavedTotalLesson, // Use the same total lessons for next level
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
          }
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  const handleContinueAndReset = () => {
    setShowSuccessModal(false);
    // Don't reset - let the parent component handle navigation to next lesson
  };

  return (
    <View style={styles.container}>
      {/* Display the current word state */}
      <View style={styles.wordContainer}>
        {currentWordState.map((letter, index) => {
          const isBlank = remainingBlanks.some(
            (blank) => blank.index === index
          );
          return (
            <View
              key={index}
              style={[
                styles.letterBox,
                {
                  borderColor: isBlank
                    ? isViganTheme
                      ? "#F59E0B"
                      : "#01D3C1"
                    : "#dddddd",
                  backgroundColor: isBlank
                    ? isViganTheme
                      ? "#FEF3C7"
                      : "#E0F7FA"
                    : "#ffffff",
                },
              ]}
            >
              <Text
                style={[
                  styles.letter,
                  {
                    color: isViganTheme ? "#875C35" : "#374151",
                  },
                ]}
              >
                {letter}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Word Picture */}
      <View style={styles.pictureContainer}>
        <Image
          source={getImageForWord(wordForImage)}
          style={styles.wordPicture}
          resizeMode="contain"
        />
      </View>

      <View style={styles.webViewContainer}>
        {!isWebViewLoaded && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={isViganTheme ? "#875C35" : "#01D3C1"}
            />
            <Text
              style={[
                styles.loadingText,
                {
                  color: isViganTheme ? "#875C35" : "#01D3C1",
                },
              ]}
            >
              Loading...
            </Text>
          </View>
        )}
        <WebView
          source={{ uri: "https://gesturbee-app-model.vercel.app/" }}
          style={{
            width: "100%",
            height: "100%",
            opacity: isWebViewLoaded ? 1 : 0,
          }}
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
        onContinue={handleContinueAndReset}
        message={"You completed the word successfully!"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    height: "55%",
  },
  title: {
    color: "black",
    fontSize: 24,
    fontFamily: "poppins-medium",
    marginLeft: 8,
    marginTop: 24,
    marginBottom: 16,
  },
  wordContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    marginTop: 20,
  },
  letterBox: {
    width: 40,
    height: 50,
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  letter: {
    fontSize: 30,
    fontFamily: "poppins-bold",
    color: "black",
  },
  instructionContainer: {
    marginBottom: 10,
    marginTop: 10,
  },
  pictureContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  wordPicture: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  instruction: {
    fontSize: 18,
    fontFamily: "poppins-regular",
    color: "black",
  },
  highlightLetter: {
    fontSize: 20,
    fontFamily: "poppins-bold",
    color: "#FBBC05",
  },
  webViewContainer: {
    width: "80%",
    height: 240,
    backgroundColor: "black",
    position: "relative",
    marginBottom: 20,
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
  },
  loadingText: {
    marginTop: 10,
    color: "black",
  },
  webView: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  prediction: {
    color: "black",
    fontSize: 24,
    fontFamily: "poppins-medium",
    marginLeft: 8,
    marginTop: 12,
    marginBottom: 16,
  },
});
