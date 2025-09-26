import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { FallingLettersConfig, MinigameResult } from '@/types/minigame';

interface FallingLetter {
  id: string;
  letter: string;
  position: Animated.ValueXY;
  isCorrect: boolean;
  isCaught: boolean;
}

interface FallingLettersGameProps {
  config: FallingLettersConfig;
  targetWord: string;
  onComplete: (result: MinigameResult) => void;
  onGameEnd: () => void;
}

const FallingLettersGame: React.FC<FallingLettersGameProps> = ({
  config,
  targetWord,
  onComplete,
  onGameEnd,
}) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const [letters, setLetters] = useState<FallingLetter[]>([]);
  const [caughtLetters, setCaughtLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit ? config.timeLimit / 1000 : 45);
  const [gameOver, setGameOver] = useState(false);

  const gameAreaHeight = screenHeight * 0.7;
  const letterSize = 50;
  const basketWidth = 80;
  const basketHeight = 60;

  const basketPosition = useRef(new Animated.Value(screenWidth / 2 - basketWidth / 2)).current;
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const spawnIntervalRef = useRef<NodeJS.Timeout>();

  // Initialize game
  useEffect(() => {
    if (gameStarted && !gameOver) {
      startGameLoop();
      startLetterSpawning();

      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      };
    }
  }, [gameStarted, gameOver]);

  // Check win condition
  useEffect(() => {
    if (caughtLetters.length > 0 && caughtLetters.join('') === targetWord) {
      endGame(true);
    }
  }, [caughtLetters, targetWord]);

  const startGameLoop = () => {
    gameLoopRef.current = setInterval(() => {
      updateLetterPositions();
    }, 16); // ~60 FPS
  };

  const startLetterSpawning = () => {
    const spawnLetter = () => {
      if (gameOver) return;

      const allLetters = [...config.correctLetters, ...config.distractorLetters];
      const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
      const isCorrect = config.correctLetters.includes(randomLetter);

      const newLetter: FallingLetter = {
        id: `letter-${Date.now()}-${Math.random()}`,
        letter: randomLetter,
        position: new Animated.ValueXY({
          x: Math.random() * (screenWidth - letterSize),
          y: -letterSize,
        }),
        isCorrect,
        isCaught: false,
      };

      setLetters(prev => [...prev, newLetter]);

      // Animate letter falling
      Animated.timing(newLetter.position, {
        toValue: { x: newLetter.position.x._value, y: gameAreaHeight },
        duration: (gameAreaHeight / config.fallSpeed) * 16,
        useNativeDriver: false,
      }).start();
    };

    spawnLetter(); // Spawn first letter immediately
    spawnIntervalRef.current = setInterval(spawnLetter, config.spawnRate);
  };

  const updateLetterPositions = () => {
    setLetters(prev => prev.filter(letter => {
      const currentY = letter.position.y._value;
      return currentY < gameAreaHeight && !letter.isCaught;
    }));
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const newX = Math.max(0, Math.min(screenWidth - basketWidth, gestureState.moveX - basketWidth / 2));
      basketPosition.setValue(newX);
      checkCollisions(newX);
    },
  });

  const checkCollisions = (basketX: number) => {
    const basketRect = {
      x: basketX,
      y: gameAreaHeight - basketHeight,
      width: basketWidth,
      height: basketHeight,
    };

    setLetters(prev => prev.map(letter => {
      if (letter.isCaught) return letter;

      const letterRect = {
        x: letter.position.x._value,
        y: letter.position.y._value,
        width: letterSize,
        height: letterSize,
      };

      // Check collision
      if (
        letterRect.x < basketRect.x + basketRect.width &&
        letterRect.x + letterRect.width > basketRect.x &&
        letterRect.y < basketRect.y + basketRect.height &&
        letterRect.y + letterRect.height > basketRect.y
      ) {
        // Collision detected
        if (letter.isCorrect) {
          const nextNeededLetter = targetWord[caughtLetters.length];
          if (letter.letter === nextNeededLetter) {
            setCaughtLetters(prev => [...prev, letter.letter]);
            setScore(prev => prev + 10);
          }
        } else {
          setScore(prev => Math.max(0, prev - 5));
        }

        return { ...letter, isCaught: true };
      }

      return letter;
    }));
  };

  const endGame = (won: boolean = false) => {
    setGameOver(true);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);

    const result: MinigameResult = {
      success: won,
      score,
      timeSpent: (config.timeLimit! / 1000) - timeLeft,
      attempts: 1,
      perfectScore: won && score >= config.pointsReward,
    };

    setTimeout(() => onComplete(result), 1000);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  if (!gameStarted) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-100 p-6">
        <Text className="text-3xl font-poppins-bold text-center mb-4 text-blue-800">
          {config.title}
        </Text>
        <Text className="text-lg font-poppins text-center mb-6 text-blue-600">
          Catch the letters to spell: <Text className="font-poppins-bold">{targetWord}</Text>
        </Text>
        <Text className="text-base font-poppins text-center mb-8 text-gray-600">
          {config.instructions}
        </Text>
        <TouchableOpacity
          onPress={startGame}
          className="bg-blue-500 px-8 py-4 rounded-xl"
        >
          <Text className="text-white font-poppins-bold text-lg">Start Game</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue-100">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 bg-blue-500">
        <Text className="text-white font-poppins-bold text-lg">
          Score: {score}
        </Text>
        <Text className="text-white font-poppins-bold text-lg">
          Time: {timeLeft}s
        </Text>
      </View>

      {/* Target Word Progress */}
      <View className="bg-white p-4 mx-4 mt-2 rounded-lg">
        <Text className="text-center font-poppins text-gray-600 mb-2">Spell the word:</Text>
        <View className="flex-row justify-center">
          {targetWord.split('').map((letter, index) => (
            <View
              key={index}
              className={`w-8 h-8 border-2 border-blue-300 rounded mx-1 justify-center items-center ${
                index < caughtLetters.length ? 'bg-green-200' : 'bg-gray-100'
              }`}
            >
              <Text className="font-poppins-bold text-lg">
                {index < caughtLetters.length ? caughtLetters[index] : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Game Area */}
      <View className="flex-1 relative" {...panResponder.panHandlers}>
        {/* Falling Letters */}
        {letters.map(letter => (
          <Animated.View
            key={letter.id}
            style={{
              position: 'absolute',
              left: letter.position.x,
              top: letter.position.y,
              width: letterSize,
              height: letterSize,
            }}
            className={`justify-center items-center rounded-lg ${
              letter.isCorrect ? 'bg-green-400' : 'bg-red-400'
            }`}
          >
            <Text className="text-white font-poppins-bold text-xl">
              {letter.letter}
            </Text>
          </Animated.View>
        ))}

        {/* Basket */}
        <Animated.View
          style={{
            position: 'absolute',
            left: basketPosition,
            bottom: 0,
            width: basketWidth,
            height: basketHeight,
          }}
          className="bg-yellow-500 rounded-t-xl justify-center items-center border-2 border-yellow-600"
        >
          <Text className="text-yellow-800 font-poppins-bold">🗑️</Text>
        </Animated.View>
      </View>

      {/* Game Over Modal */}
      {gameOver && (
        <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-white p-6 rounded-xl mx-4">
            <Text className="text-2xl font-poppins-bold text-center mb-4">
              {caughtLetters.join('') === targetWord ? 'Congratulations!' : 'Game Over'}
            </Text>
            <Text className="text-lg font-poppins text-center mb-4">
              Final Score: {score}
            </Text>
            {caughtLetters.join('') === targetWord && (
              <Text className="text-green-600 font-poppins text-center mb-4">
                You spelled &quot;{targetWord}&quot; correctly!
              </Text>
            )}
            <TouchableOpacity
              onPress={onGameEnd}
              className="bg-blue-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-poppins-bold text-center">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default FallingLettersGame;