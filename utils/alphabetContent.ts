// Utility for generating randomized alphabet content for Stage 1 (Vigan)

export interface AlphabetLesson {
  letter: string;
  videoPath: string;
  viganSpellingWords: string[];
  multipleChoiceOptions: string[];
}

export const ALPHABET_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

// Vigan-themed words for spelling exercises
export const VIGAN_THEMED_WORDS = {
  A: ['ANTIQUE', 'ABUELA', 'ADOBE', 'ARCO', 'ARTS'],
  B: ['BAHAY', 'BAKERY', 'BRIDGE', 'BELL', 'BRICK'],
  C: ['CHURCH', 'COBBLE', 'CART', 'CASA', 'CROSS'],
  D: ['DOOR', 'DANCE', 'DOME', 'DAWN', 'DRAW'],
  E: ['ESTATE', 'ELDER', 'ECHO', 'EVOKE', 'EPIC'],
  F: ['FOUNTAIN', 'FAITH', 'FACADE', 'FOLK', 'FLAG'],
  G: ['GARDEN', 'GATE', 'GOLD', 'GRACE', 'GRAND'],
  H: ['HOUSE', 'HERITAGE', 'HORSE', 'HALL', 'HILL'],
  I: ['ILOCOS', 'ICON', 'IVORY', 'IRON', 'ISLE'],
  J: ['JOURNEY', 'JOY', 'JADE', 'JUMP', 'JUST'],
  K: ['KALESA', 'KEEP', 'KIND', 'KING', 'KISS'],
  L: ['LAMP', 'LOVE', 'LANE', 'LIGHT', 'LIVE'],
  M: ['MUSEUM', 'MOON', 'MARKET', 'MUSIC', 'MURAL'],
  N: ['NIGHT', 'NATIVE', 'NORTH', 'NOBLE', 'NEST'],
  O: ['OLD', 'ORNATE', 'OPEN', 'OLIVE', 'OCEAN'],
  P: ['PLAZA', 'PILLAR', 'PEACE', 'PRAYER', 'PRIDE'],
  Q: ['QUIET', 'QUEST', 'QUEEN', 'QUAINT', 'QUICK'],
  R: ['ROOF', 'ROAD', 'RIVER', 'RELIC', 'ROSE'],
  S: ['STREET', 'STONE', 'SAINT', 'SPIRIT', 'SMILE'],
  T: ['TOWER', 'TILE', 'TOWN', 'TEMPLE', 'TRADE'],
  U: ['UNIQUE', 'UNITY', 'UNDER', 'URBAN', 'UPPER'],
  V: ['VIGAN', 'VILLA', 'VIEW', 'VIRTUE', 'VOICE'],
  W: ['WINDOW', 'WALL', 'WATER', 'WOOD', 'WARM'],
  X: ['XYLEM', 'XERUS', 'EXTRA', 'EXIST', 'EXACT'],
  Y: ['YARD', 'YEAR', 'YOUTH', 'YELLOW', 'YONDER'],
  Z: ['ZONE', 'ZEAL', 'ZERO', 'ZENITH', 'ZEST']
};

// Generate random alphabet lesson sequence
export function generateRandomAlphabetSequence(count: number = 3): string[] {
  const shuffled = [...ALPHABET_LETTERS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Generate random word for spelling exercise
export function getRandomSpellingWord(letter: string): string {
  const words = VIGAN_THEMED_WORDS[letter as keyof typeof VIGAN_THEMED_WORDS] || ['WORD'];
  return words[Math.floor(Math.random() * words.length)];
}

// Generate multiple choice options
export function generateMultipleChoiceOptions(correctLetter: string): string[] {
  const options = [correctLetter];
  const availableLetters = ALPHABET_LETTERS.filter(l => l !== correctLetter);

  // Add 3 random incorrect options
  for (let i = 0; i < 3; i++) {
    const randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    if (!options.includes(randomLetter)) {
      options.push(randomLetter);
    }
  }

  // Shuffle the options
  return options.sort(() => 0.5 - Math.random());
}

// Generate a random spelling puzzle (with some letters missing)
export function generateSpellingPuzzle(word: string): { correctWord: string[], questionWord: string[] } {
  const wordArray = word.split('');
  const questionArray = [...wordArray];

  // Randomly hide 1-2 letters (but not all)
  const lettersToHide = Math.min(2, Math.max(1, Math.floor(wordArray.length / 3)));
  const hiddenIndices: number[] = [];

  for (let i = 0; i < lettersToHide; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * wordArray.length);
    } while (hiddenIndices.includes(randomIndex));

    hiddenIndices.push(randomIndex);
    questionArray[randomIndex] = '_';
  }

  return {
    correctWord: wordArray,
    questionWord: questionArray
  };
}

// Progressive letter combination system
export interface ProgressiveLetterSystem {
  getAvailableLettersForLevel(levelId: number): string[];
  generateCombinationWords(availableLetters: string[]): string[];
  canFormWord(word: string, availableLetters: string[]): boolean;
}

// Common English words that can be formed with limited alphabet progression
const PROGRESSIVE_WORD_BANK = {
  2: ['AM', 'AN', 'AT', 'BE', 'DO', 'GO', 'HE', 'IF', 'IN', 'IS', 'IT', 'ME', 'NO', 'OF', 'ON', 'OR', 'SO', 'TO', 'UP', 'WE'],
  3: ['AND', 'ARE', 'BUT', 'CAN', 'CAR', 'CAT', 'DAY', 'DOG', 'EAR', 'EAT', 'END', 'EYE', 'FAR', 'FUN', 'GET', 'GOT', 'HAD', 'HAS', 'HER', 'HIM', 'HIS', 'HOW', 'ITS', 'LET', 'MAN', 'MAY', 'NEW', 'NOT', 'NOW', 'OLD', 'ONE', 'OUR', 'OUT', 'PUT', 'RUN', 'SAY', 'SEE', 'SHE', 'THE', 'TOO', 'TOP', 'TRY', 'TWO', 'USE', 'WAY', 'WHO', 'WHY', 'WIN', 'YES', 'YOU'],
  4: ['BACK', 'BALL', 'BEST', 'BLUE', 'BOOK', 'CALL', 'CAME', 'COME', 'DAYS', 'EACH', 'FACE', 'FACT', 'FIND', 'FIRE', 'FISH', 'FOUR', 'FROM', 'GAME', 'GAVE', 'GOOD', 'HAND', 'HAVE', 'HEAD', 'HELP', 'HERE', 'HIGH', 'HOME', 'HOPE', 'JUST', 'KEEP', 'KIND', 'KNOW', 'LAND', 'LAST', 'LEFT', 'LIFE', 'LIKE', 'LIVE', 'LOOK', 'MADE', 'MAKE', 'MANY', 'NAME', 'NEED', 'NEXT', 'OPEN', 'OVER', 'PART', 'PLAY', 'READ', 'REAL', 'ROOM', 'SAME', 'SHOW', 'SIDE', 'SOME', 'TAKE', 'TELL', 'THAT', 'THEM', 'THEY', 'THIS', 'TIME', 'TURN', 'VERY', 'WANT', 'WAYS', 'WEEK', 'WELL', 'WENT', 'WERE', 'WHAT', 'WHEN', 'WILL', 'WITH', 'WORD', 'WORK', 'YEAR'],
  5: ['ABOUT', 'AGAIN', 'AFTER', 'BASIC', 'BLACK', 'BRING', 'BUILD', 'CHILD', 'CLEAN', 'CLEAR', 'CLOSE', 'COLOR', 'COULD', 'DOING', 'EVERY', 'FIELD', 'FIRST', 'FOUND', 'GREAT', 'GREEN', 'GROUP', 'HEARD', 'HOUSE', 'LEARN', 'LEAVE', 'LIGHT', 'MIGHT', 'NEVER', 'NIGHT', 'OTHER', 'PAPER', 'PLACE', 'PLANT', 'POINT', 'RIGHT', 'SHALL', 'SMALL', 'SOUND', 'SPELL', 'START', 'STILL', 'STUDY', 'THEIR', 'THERE', 'THESE', 'THING', 'THINK', 'THREE', 'TODAY', 'UNDER', 'WATER', 'WHERE', 'WHICH', 'WHITE', 'WORLD', 'WOULD', 'WRITE', 'YOUNG']
};

// Level to letter mapping for Stage 1 (Alphabets)
const LEVEL_LETTERS = {
  1: ['A', 'B', 'C'],
  2: ['D', 'E', 'F'],
  3: ['G', 'H', 'I'],
  4: ['J', 'K', 'L'],
  5: ['M', 'N', 'O'],
  6: ['P', 'Q', 'R'],
  7: ['S', 'T', 'U'],
  8: ['V', 'W', 'X'],
  9: ['Y', 'Z']
};

export class ProgressiveCombinationSystem implements ProgressiveLetterSystem {
  /**
   * Get all available letters up to the current level
   * If you're at level 3 (G-I), you can use A, B, C, D, E, F, G, H, I
   */
  getAvailableLettersForLevel(levelId: number): string[] {
    let availableLetters: string[] = [];

    for (let i = 1; i <= levelId; i++) {
      const levelLetters = LEVEL_LETTERS[i as keyof typeof LEVEL_LETTERS] || [];
      availableLetters.push(...levelLetters);
    }

    return availableLetters;
  }

  /**
   * Generate words that can be formed using only the available letters
   * Based on alphabetical progression (if at G, can use A-G)
   */
  generateCombinationWords(availableLetters: string[]): string[] {
    const possibleWords: string[] = [];
    const letterSet = new Set(availableLetters);

    // Check all words in our progressive word bank
    Object.values(PROGRESSIVE_WORD_BANK).flat().forEach(word => {
      if (this.canFormWord(word, availableLetters)) {
        possibleWords.push(word);
      }
    });

    // Add Vigan-themed words that can be formed
    Object.entries(VIGAN_THEMED_WORDS).forEach(([letter, words]) => {
      if (letterSet.has(letter)) {
        words.forEach(word => {
          if (this.canFormWord(word, availableLetters)) {
            possibleWords.push(word);
          }
        });
      }
    });

    // Remove duplicates and sort by length then alphabetically
    const uniqueWords = [...new Set(possibleWords)];
    return uniqueWords.sort((a, b) => {
      if (a.length !== b.length) {
        return a.length - b.length;
      }
      return a.localeCompare(b);
    });
  }

  /**
   * Check if a word can be formed using only the available letters
   */
  canFormWord(word: string, availableLetters: string[]): boolean {
    const letterSet = new Set(availableLetters);
    return word.split('').every(letter => letterSet.has(letter.toUpperCase()));
  }
}

// Singleton instance for progressive combination system
export const progressiveCombination = new ProgressiveCombinationSystem();

// Enhanced multiple choice generation with progressive system
export function generateProgressiveMultipleChoice(correctLetter: string, levelId: number): string[] {
  const availableLetters = progressiveCombination.getAvailableLettersForLevel(levelId);
  const options = [correctLetter];

  // Prioritize letters from available pool (learned letters)
  const learnedLetters = availableLetters.filter(l => l !== correctLetter);

  while (options.length < 4 && learnedLetters.length > 0) {
    const randomIndex = Math.floor(Math.random() * learnedLetters.length);
    const selectedLetter = learnedLetters.splice(randomIndex, 1)[0];
    options.push(selectedLetter);
  }

  // Fill remaining slots with any letters if needed
  while (options.length < 4) {
    const remainingLetters = ALPHABET_LETTERS.filter(l => !options.includes(l));
    if (remainingLetters.length === 0) break;

    const randomLetter = remainingLetters[Math.floor(Math.random() * remainingLetters.length)];
    options.push(randomLetter);
  }

  // Shuffle options
  return options.sort(() => 0.5 - Math.random());
}

// Generate spelling words based on progressive system
export function generateProgressiveSpellingWords(levelId: number, count: number = 5): string[] {
  const availableLetters = progressiveCombination.getAvailableLettersForLevel(levelId);
  const possibleWords = progressiveCombination.generateCombinationWords(availableLetters);

  // Add level-specific guaranteed words for better spelling practice
  const levelSpecificWords: { [key: number]: string[] } = {
    1: ['CAB', 'BAC', 'ABC'], // Level 1: A, B, C
    2: ['CAB', 'BAD', 'BED', 'FED', 'DEF'], // Level 2: A, B, C, D, E, F
    3: ['BAG', 'GAB', 'BIG', 'FIG', 'GIG'], // Level 3: A, B, C, D, E, F, G, H, I
    4: ['JAB', 'JIG', 'JOB', 'LAB', 'LAG'], // Level 4: J, K, L
    // Add more as needed
  };

  // Combine possible words with level-specific words
  const combinedWords = [...possibleWords, ...(levelSpecificWords[levelId] || [])];

  // Remove duplicates and prioritize longer words
  const uniqueWords = [...new Set(combinedWords)].sort((a, b) => b.length - a.length);

  // Shuffle and return requested count
  const shuffled = uniqueWords.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Words that contain each letter for spelling lessons - Updated from CSV
const LETTER_WORDS: { [key: string]: string[] } = {
  'A': ['APPLE', 'ANT', 'CAMERA', 'PLATE', 'GRAPE', 'AVOCADO'],
  'B': ['BOOK', 'TABLE', 'BAT', 'RABBIT', 'BANANA', 'BULB'],
  'C': ['CIRCLE', 'CAR', 'CAT', 'DOCTOR', 'SCHOOL', 'CACTUS'],
  'D': ['DOG', 'CANDLE', 'DIAMOND', 'DONUT', 'LADDER', 'DOOR'],
  'E': ['EGG', 'CHEESE', 'BEE', 'LETTER', 'TREE', 'ENVELOPE'],
  'F': ['FISH', 'FAN', 'LEAF', 'FORK', 'COFFEE', 'ROOF'],
  'G': ['GOLD', 'GUITAR', 'GIFT', 'EGG', 'FLAG', 'GOAT'],
  'H': ['HOUSE', 'EARTH', 'WHALE', 'CHAIR', 'HAMMER', 'HONEY'],
  'I': ['ICE', 'MILK', 'RING', 'KITE', 'IRON', 'SHIP'],
  'J': ['JAR', 'JEEP', 'JACKET', 'NINJA', 'JOLLIBEE', 'JUICE'],
  'K': ['KEY', 'MONKEY', 'BOOK', 'BASKET', 'CAKE', 'KALESA'],
  'L': ['LAMP', 'LION', 'LEG', 'LOCK', 'TABLE', 'BALUT'],
  'M': ['MILK', 'LEMON', 'MOON', 'CAMEL', 'DRUM', 'MIRROR'],
  'N': ['NIPA', 'NOSE', 'NEST', 'BANANA', 'PEN', 'RAIN'],
  'O': ['OWL', 'DOOR', 'SCHOOL', 'OCTOPUS', 'TOMATO', 'ROBOT'],
  'P': ['PEN', 'PIG', 'MAP', 'PAPER', 'PENCIL', 'PIZZA'],
  'Q': ['QUARTZ', 'QUILL', 'LIQUID', 'QUIZ', 'QUAIL', 'QUESTION'],
  'R': ['ROSE', 'RAT', 'RABBIT', 'RAINBOW', 'RICE', 'STAR'],
  'S': ['SOCK', 'HOUSE', 'STAR', 'SPOON', 'BUS', 'DRESS'],
  'T': ['TABLE', 'TOY', 'BALUT', 'TIGER', 'CAT', 'TICKET'],
  'U': ['UMBRELLA', 'UTENSILS', 'FRUIT', 'UNICORN', 'GLUE', 'UKULELE'],
  'V': ['VEST', 'VOLLEYBALL', 'CAVE', 'VASE', 'OVEN', 'VIOLIN'],
  'W': ['WINDOW', 'WEB', 'TOWEL', 'WATER', 'WOLF', 'SNOW'],
  'X': ['X-RAY', 'BOX', 'FOX', 'XYLOPHONE', 'TAXI', 'XMAS'],
  'Y': ['YARN', 'YACHT', 'TOY', 'CANDY', 'JELLY', 'YO-YO'],
  'Z': ['ZEBRA', 'ZERO', 'PIZZA', 'ZOO', 'ZIP', 'ZIGZAG']
};

// Get words that contain a specific letter
export function getWordsForLetter(letter: string): string[] {
  const upperLetter = letter?.toUpperCase();
  return LETTER_WORDS[upperLetter] || ['WORD'];
}

// Get image path for a word
export function getImagePathForWord(word: string): string {
  // Convert word to lowercase and replace spaces/special characters for filename
  const fileName = word.toLowerCase().replace(/\s+/g, '-');
  return `@/assets/images/alphabet-images/${fileName}.png`;
}

// Get word with image data
export function getWordWithImage(word: string): { word: string; imagePath: string } {
  return {
    word,
    imagePath: getImagePathForWord(word)
  };
}

// Generate alphabet content from CSV word bank for content database
export function generateAlphabetContentFromCSV() {
  const content: any[] = [];

  // Add all letters first (A-Z)
  ALPHABET_LETTERS.forEach((letter, index) => {
    content.push({
      id: `${letter.toLowerCase()}1`,
      word: letter,
      videoPath: `${letter.toLowerCase()}.mp4`,
      category: "alphabets",
      difficulty: "easy",
    });
  });

  // Add all words from CSV with images
  Object.entries(LETTER_WORDS).forEach(([letter, words]) => {
    words.forEach((word, wordIndex) => {
      content.push({
        id: `${letter.toLowerCase()}_word_${wordIndex + 1}`,
        word: word,
        videoPath: `combination/${word.toLowerCase().replace(/\s+/g, '_')}.mp4`, // For combination videos
        imagePath: getImagePathForWord(word),
        category: "alphabets",
        difficulty: word.length <= 3 ? "easy" : word.length <= 6 ? "medium" : "hard",
      });
    });
  });

  return content;
}

// Generate progressive spelling puzzle with multiple blanks
export function generateProgressiveSpellingPuzzle(word: string, targetLetter: string, learnedLetters: string[]): {
  correctWord: string[],
  questionWord: string[],
  blankPositions: { index: number, letter: string }[],
  learnedLetters: string[]
} {
  const wordArray = word.split('');
  const questionArray = [...wordArray];
  const learnedSet = new Set(learnedLetters.map(l => l.toUpperCase()));

  // Find positions of letters in the word that were actually introduced (learned)
  const learnedPositions = wordArray
    .map((letter, index) => ({
      letter: letter.toUpperCase(),
      index,
      isLearned: learnedSet.has(letter.toUpperCase())
    }))
    .filter(item => item.isLearned && learnedLetters.includes(item.letter));

  if (learnedPositions.length === 0) {
    // Fallback: if no learned letters in word, hide first letter
    questionArray[0] = '_';
    return {
      correctWord: wordArray,
      questionWord: questionArray,
      blankPositions: [{ index: 0, letter: wordArray[0].toUpperCase() }],
      learnedLetters: []
    };
  }

  // For short words (3 letters or less), blank all learned letters for better challenge
  // For longer words, blank most learned letters (at least 70%)
  const isShortWord = wordArray.length <= 3;
  const minBlanksRatio = isShortWord ? 1.0 : 0.7; // 100% for short words, 70% for longer
  const minBlanks = Math.ceil(learnedPositions.length * minBlanksRatio);
  const maxBlanks = learnedPositions.length; // Can blank all learned letters

  // Determine number of blanks (favor more blanks for better challenge)
  const numBlanks = Math.max(minBlanks, Math.min(maxBlanks, learnedPositions.length));

  // Shuffle and select positions to hide
  const shuffledPositions = [...learnedPositions].sort(() => Math.random() - 0.5);
  const positionsToHide = shuffledPositions.slice(0, numBlanks);

  // Create blank positions info and hide letters
  const blankPositions = positionsToHide.map(pos => {
    questionArray[pos.index] = '_';
    return { index: pos.index, letter: pos.letter };
  });

  return {
    correctWord: wordArray,
    questionWord: questionArray,
    blankPositions: blankPositions,
    learnedLetters: learnedLetters
  };
}

// Generate spelling puzzle for a specific letter (hide the target letter anywhere in word) - kept for compatibility
export function generateLetterSpellingPuzzle(word: string, targetLetter: string): {
  correctWord: string[],
  questionWord: string[]
} {
  const wordArray = word.split('');
  const questionArray = [...wordArray];

  // Find all positions where the target letter appears
  const targetPositions = wordArray
    .map((letter, index) => letter.toUpperCase() === targetLetter.toUpperCase() ? index : -1)
    .filter(index => index !== -1);

  // Hide one random occurrence of the target letter
  if (targetPositions.length > 0) {
    const randomPosition = targetPositions[Math.floor(Math.random() * targetPositions.length)];
    questionArray[randomPosition] = '_';
  }

  return {
    correctWord: wordArray,
    questionWord: questionArray
  };
}

// Get video path for letter (all alphabet videos included)
export function getVideoPathForLetter(letter: string): any {
  const letterLower = letter.toLowerCase();

  const videoMap: { [key: string]: any } = {
    'a': require("@/assets/videos/a.mp4"),
    'b': require("@/assets/videos/b.mp4"),
    'c': require("@/assets/videos/c.mp4"),
    'd': require("@/assets/videos/d.mp4"),
    'e': require("@/assets/videos/e.mp4"),
    'f': require("@/assets/videos/f.mp4"),
    'g': require("@/assets/videos/g.mp4"),
    'h': require("@/assets/videos/h.mp4"),
    'i': require("@/assets/videos/i.mp4"),
    'j': require("@/assets/videos/j.mp4"),
    'k': require("@/assets/videos/k.mp4"),
    'l': require("@/assets/videos/l.mp4"),
    'm': require("@/assets/videos/m.mp4"),
    'n': require("@/assets/videos/n.mp4"),
    'o': require("@/assets/videos/o.mp4"),
    'p': require("@/assets/videos/p.mp4"),
    'q': require("@/assets/videos/q.mp4"),
    'r': require("@/assets/videos/r.mp4"),
    's': require("@/assets/videos/s.mp4"),
    't': require("@/assets/videos/t.mp4"),
    'u': require("@/assets/videos/u.mp4"),
    'v': require("@/assets/videos/v.mp4"),
    'w': require("@/assets/videos/w.mp4"),
    'x': require("@/assets/videos/x.mp4"),
    'y': require("@/assets/videos/y.mp4"),
    'z': require("@/assets/videos/z.mp4")
  };

  return videoMap[letterLower] || require("@/assets/videos/a.mp4"); // fallback
}