import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { MatchingGameConfig, MinigameResult } from '@/types/minigame';

interface MatchingPair {
  id: string;
  word: string;
  videoPath: string;
  imagePath?: string;
  isMatched: boolean;
}

interface MatchingCard {
  id: string;
  pairId: string;
  type: 'video' | 'text';
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MatchingGameProps {
  config: MatchingGameConfig;
  onComplete: (result: MinigameResult) => void;
  onGameEnd: () => void;
}

const MatchingGame: React.FC<MatchingGameProps> = ({
  config,
  onComplete,
  onGameEnd,
}) => {
  const { width: screenWidth } = Dimensions.get('window');
  const [cards, setCards] = useState<MatchingCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MatchingCard[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit ? config.timeLimit / 1000 : 60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const cardWidth = (screenWidth - 60) / config.gridSize;
  const cardHeight = cardWidth * 0.8;

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (matchedPairs.size === config.pairs.length && gameStarted) {
      endGame(true);
    }
  }, [matchedPairs, config.pairs.length, gameStarted]);

  useEffect(() => {
    if (selectedCards.length === 2) {
      setTimeout(() => {
        checkForMatch();
      }, 1000);
    }
  }, [selectedCards]);

  const initializeGame = () => {
    const gameCards: MatchingCard[] = [];

    config.pairs.forEach(pair => {
      // Video card
      gameCards.push({
        id: `video-${pair.id}`,
        pairId: pair.id,
        type: 'video',
        content: pair.videoPath,
        isFlipped: false,
        isMatched: false,
      });

      // Text card
      gameCards.push({
        id: `text-${pair.id}`,
        pairId: pair.id,
        type: 'text',
        content: pair.word,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  };

  const handleCardPress = (card: MatchingCard) => {
    if (
      gameOver ||
      card.isMatched ||
      card.isFlipped ||
      selectedCards.length >= 2
    ) {
      return;
    }

    const updatedCards = cards.map(c =>
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);
    setSelectedCards(prev => [...prev, { ...card, isFlipped: true }]);
  };

  const checkForMatch = () => {
    if (selectedCards.length !== 2) return;

    const [first, second] = selectedCards;
    const isMatch = first.pairId === second.pairId && first.type !== second.type;

    setAttempts(prev => prev + 1);

    if (isMatch) {
      // Match found
      setMatchedPairs(prev => new Set([...prev, first.pairId]));
      setCards(prev =>
        prev.map(card =>
          card.pairId === first.pairId
            ? { ...card, isMatched: true, isFlipped: true }
            : card
        )
      );
      setScore(prev => prev + config.pointsReward / config.pairs.length);
    } else {
      // No match - flip cards back
      setTimeout(() => {
        setCards(prev =>
          prev.map(card =>
            (card.id === first.id || card.id === second.id) && !card.isMatched
              ? { ...card, isFlipped: false }
              : card
          )
        );
      }, 500);
      setScore(prev => Math.max(0, prev - 2));
    }

    setSelectedCards([]);
  };

  const endGame = (won: boolean = false) => {
    setGameOver(true);

    const result: MinigameResult = {
      success: won,
      score: Math.round(score),
      timeSpent: (config.timeLimit! / 1000) - timeLeft,
      attempts,
      perfectScore: won && attempts <= config.pairs.length * 1.5,
    };

    setTimeout(() => onComplete(result), 1000);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const renderCard = (card: MatchingCard) => {
    const isSelected = selectedCards.some(selected => selected.id === card.id);

    return (
      <TouchableOpacity
        key={card.id}
        style={{
          width: cardWidth,
          height: cardHeight,
          margin: 2,
        }}
        onPress={() => handleCardPress(card)}
        disabled={gameOver || card.isMatched || card.isFlipped}
        className={`rounded-lg border-2 overflow-hidden ${
          card.isMatched
            ? 'border-green-500 bg-green-100'
            : isSelected
            ? 'border-blue-500 bg-blue-100'
            : card.isFlipped
            ? 'border-gray-300 bg-white'
            : 'border-gray-400 bg-gray-200'
        }`}
      >
        {card.isFlipped || card.isMatched ? (
          <View className="flex-1 justify-center items-center p-2">
            {card.type === 'video' ? (
              <Video
                source={{ uri: card.content }}
                style={{
                  width: '100%',
                  height: '70%',
                }}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={card.isFlipped && !card.isMatched}
                isLooping
                isMuted
              />
            ) : (
              <Text
                className="font-poppins-bold text-center text-gray-800"
                style={{ fontSize: Math.min(cardWidth / 6, 18) }}
                numberOfLines={2}
              >
                {card.content}
              </Text>
            )}
          </View>
        ) : (
          <View className="flex-1 justify-center items-center bg-primary">
            <Text className="text-white font-poppins-bold text-2xl">?</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!gameStarted) {
    return (
      <View className="flex-1 justify-center items-center bg-purple-100 p-6">
        <Text className="text-3xl font-poppins-bold text-center mb-4 text-purple-800">
          {config.title}
        </Text>
        <Text className="text-lg font-poppins text-center mb-6 text-purple-600">
          Match sign language videos with their corresponding words
        </Text>
        <Text className="text-base font-poppins text-center mb-8 text-gray-600">
          {config.instructions}
        </Text>
        <TouchableOpacity
          onPress={startGame}
          className="bg-purple-500 px-8 py-4 rounded-xl"
        >
          <Text className="text-white font-poppins-bold text-lg">Start Game</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-purple-100">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 bg-purple-500">
        <Text className="text-white font-poppins-bold text-lg">
          Score: {Math.round(score)}
        </Text>
        <Text className="text-white font-poppins-bold text-lg">
          Matches: {matchedPairs.size}/{config.pairs.length}
        </Text>
        <Text className="text-white font-poppins-bold text-lg">
          Time: {timeLeft}s
        </Text>
      </View>

      {/* Game Grid */}
      <ScrollView className="flex-1 p-4">
        <View className="flex-row flex-wrap justify-center">
          {cards.map(renderCard)}
        </View>
      </ScrollView>

      {/* Game Over Modal */}
      {gameOver && (
        <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-white p-6 rounded-xl mx-4">
            <Text className="text-2xl font-poppins-bold text-center mb-4">
              {matchedPairs.size === config.pairs.length ? 'Excellent!' : 'Time\'s Up!'}
            </Text>
            <Text className="text-lg font-poppins text-center mb-2">
              Final Score: {Math.round(score)}
            </Text>
            <Text className="text-lg font-poppins text-center mb-4">
              Matches: {matchedPairs.size}/{config.pairs.length}
            </Text>
            {matchedPairs.size === config.pairs.length && (
              <Text className="text-green-600 font-poppins text-center mb-4">
                Perfect! You matched all pairs! 🎉
              </Text>
            )}
            <TouchableOpacity
              onPress={onGameEnd}
              className="bg-purple-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-poppins-bold text-center">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default MatchingGame;