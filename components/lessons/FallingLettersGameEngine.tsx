import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import { WebView } from 'react-native-webview';
import { useLevel } from '@/context/LevelContext';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import SuccessModal from '@/components/modals/SuccessModal';
import WrongAnswerModal from '@/components/modals/WrongAnswerModal';

const { width, height } = Dimensions.get('window');

// Falling Letter Entity Component
const FallingLetter = ({ body, ...props }) => {
  const { letter, x, y, collected, lit } = body;

  return (
    <View
      style={[
        styles.fallingLetter,
        {
          position: 'absolute',
          left: x,
          top: y,
        },
      ]}
    >
      <Image
        source={
          lit
            ? require('@/assets/images/Lantern/lantern_light.png')
            : require('@/assets/images/Lantern/lantern_dark.png')
        }
        style={styles.lanternImage}
        resizeMode="contain"
      />
      <Text style={styles.letterText}>{letter}</Text>
    </View>
  );
};

// Physics System - handles falling and collision
const Physics = (entities, { touches, time }) => {
  const gameState = entities.gameState;
  if (!gameState || !gameState.active) return entities;

  // Update falling letters
  Object.keys(entities).forEach(key => {
    if (key.startsWith('letter_')) {
      const letter = entities[key];

      // Move letter down
      letter.y += gameState.fallSpeed;

      // Check if letter reached bottom
      if (letter.y > height - 300 && !letter.collected) {
        // Remove letter and lose heart
        letter.reachedBottom = true;
        delete entities[key];

        gameState.hearts -= 1;
        if (gameState.hearts <= 0) {
          gameState.active = false;
          gameState.gameOver = true;
        }
      }
    }
  });

  return entities;
};

// Letter Spawner System
const LetterSpawner = (entities, { time }) => {
  const gameState = entities.gameState;
  if (!gameState || !gameState.active) return entities;

  const now = time.current;
  if (now - gameState.lastSpawn > gameState.spawnRate) {
    // Spawn new letter
    const letterId = `letter_${now}_${Math.random()}`;
    const randomLetter = gameState.learnedLetters[
      Math.floor(Math.random() * gameState.learnedLetters.length)
    ];

    entities[letterId] = {
      letter: randomLetter,
      x: Math.random() * (width - 80),
      y: -100,
      collected: false,
      lit: false,
      renderer: FallingLetter,
    };

    gameState.lastSpawn = now;
  }

  return entities;
};

// Game State Manager
const GameStateManager = (entities, { touches, time }) => {
  const gameState = entities.gameState;

  // Handle letter collection from WebView predictions
  if (gameState.predictedLetter) {
    // Find matching letter
    const matchingLetterId = Object.keys(entities).find(key => {
      if (key.startsWith('letter_')) {
        const letter = entities[key];
        return letter.letter === gameState.predictedLetter && !letter.collected;
      }
      return false;
    });

    if (matchingLetterId) {
      const letter = entities[matchingLetterId];
      letter.collected = true;
      letter.lit = true;

      // Remove letter after animation
      setTimeout(() => {
        delete entities[matchingLetterId];
      }, 500);

      gameState.score += 1;

      // Check win condition
      if (gameState.score >= 10) {
        gameState.active = false;
        gameState.won = true;
      }
    }

    // Clear prediction
    gameState.predictedLetter = null;
  }

  return entities;
};

export default function FallingLettersGameEngine({
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

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTryAgainModal, setShowTryAgainModal] = useState(false);
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);
  const gameEngineRef = useRef(null);

  // Initial game entities
  const [entities, setEntities] = useState({
    gameState: {
      active: true,
      hearts: 3,
      score: 0,
      fallSpeed: 2,
      spawnRate: 1500, // milliseconds
      lastSpawn: 0,
      learnedLetters: learnedLetters.length > 0 ? learnedLetters : ['A'],
      predictedLetter: null,
      gameOver: false,
      won: false,
    },
  });

  // Handle lesson completion logic
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

  // WebView message handler
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data?.type === "prediction") {
        const predictedLetter = data.data.prediction.prediction.toUpperCase();

        // Update game state with prediction
        setEntities(prevEntities => ({
          ...prevEntities,
          gameState: {
            ...prevEntities.gameState,
            predictedLetter: predictedLetter,
          },
        }));
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  // Handle game events
  const onEvent = (e) => {
    const gameState = entities.gameState;

    if (gameState.won && !showSuccessModal) {
      // Handle win
      const lessonAlreadyDone = isThisLessonAlreadyDone();

      if (!lessonAlreadyDone) {
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
    }

    if (gameState.gameOver && !showTryAgainModal) {
      // Handle game over
      setShowTryAgainModal(true);
    }
  };

  // Restart game
  const handleTryAgain = () => {
    setShowTryAgainModal(false);
    setEntities({
      gameState: {
        active: true,
        hearts: 3,
        score: 0,
        fallSpeed: 2,
        spawnRate: 1500,
        lastSpawn: 0,
        learnedLetters: learnedLetters.length > 0 ? learnedLetters : ['A'],
        predictedLetter: null,
        gameOver: false,
        won: false,
      },
    });
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
            style={[
              styles.heart,
              { opacity: i < entities.gameState.hearts ? 1 : 0.3 }
            ]}
          >
            ❤️
          </Text>
        ))}
      </View>

      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>
          Score: {entities.gameState.score}/10
        </Text>
      </View>

      {/* Game Engine */}
      <View style={styles.gameArea}>
        <GameEngine
          ref={gameEngineRef}
          systems={[Physics, LetterSpawner, GameStateManager]}
          entities={entities}
          onEvent={onEvent}
          style={styles.gameEngine}
        />
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
          style={[styles.webView, { opacity: isWebViewLoaded ? 1 : 0 }]}
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
    backgroundColor: '#FFE9C3', // Vigan theme background
  },
  heartsContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 8,
  },
  heart: {
    fontSize: 24,
    marginRight: 5,
  },
  scoreContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 8,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#875C35',
  },
  gameArea: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    bottom: 250,
  },
  gameEngine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  fallingLetter: {
    width: 80,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lanternImage: {
    width: 70,
    height: 80,
    position: 'absolute',
    top: 0,
  },
  letterText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#875C35',
    textAlign: 'center',
    marginTop: 25,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  webViewContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 220,
    backgroundColor: '#000000',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#D97706',
    zIndex: 10,
  },
  webView: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    zIndex: 1,
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#875C35',
    fontWeight: 'bold',
  },
});