import {
  MinigameContent,
  MinigameCategory,
  MinigameType,
  MinigameConfig,
  MinigameSession,
  FallingLettersConfig,
  MatchingGameConfig,
  MemoryCardsConfig
} from '../types/minigame';
import { CONTENT_DATABASE, SPELLING_WORDS } from './contentDatabase';
import { stageData, getStageById } from './stageData';
import {
  progressiveCombination,
  generateProgressiveSpellingWords,
  generateProgressiveMultipleChoice
} from './alphabetContent';

export class ContentGenerator {
  private static getRandomSeed(): number {
    return Math.floor(Math.random() * 1000000);
  }

  private static shuffleArray<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    let temporaryValue: T;
    let randomIndex: number;

    // Seeded random number generator
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    while (currentIndex !== 0) {
      randomIndex = Math.floor(seededRandom(seed + currentIndex) * currentIndex);
      currentIndex -= 1;

      temporaryValue = shuffled[currentIndex];
      shuffled[currentIndex] = shuffled[randomIndex];
      shuffled[randomIndex] = temporaryValue;
    }

    return shuffled;
  }

  static getCategoryForStage(stageId: number): MinigameCategory {
    const categoryMap: Record<number, MinigameCategory> = {
      1: 'alphabets',
      2: 'numbers',
      3: 'greetings',
      4: 'colors',
      5: 'questions',
      6: 'days',
      7: 'months'
    };
    return categoryMap[stageId] || 'alphabets';
  }

  static getContentForLevel(stageId: number, levelId: number): MinigameContent[] {
    const category = this.getCategoryForStage(stageId);
    const allContent = CONTENT_DATABASE[category];

    // Get stage configuration
    const stage = getStageById(stageId);
    if (!stage) return [];

    const level = stage.levels.find(l => l.levelid === levelId);
    if (!level) return [];

    // Filter content based on level (each level contains specific subset)
    const itemsPerLevel = Math.ceil(allContent.length / stage.levels.length);
    const startIndex = (levelId - 1) * itemsPerLevel;
    const endIndex = Math.min(startIndex + itemsPerLevel, allContent.length);

    return allContent.slice(startIndex, endIndex);
  }

  static generateRandomizedContent(
    stageId: number,
    levelId: number,
    count: number = 4,
    seed?: number,
    includeProgressive: boolean = false
  ): MinigameContent[] {
    let levelContent = this.getContentForLevel(stageId, levelId);
    const randomSeed = seed || this.getRandomSeed();

    // For alphabet stage, add progressive content
    if (stageId === 1 && includeProgressive) {
      const progressiveContent = this.generateProgressiveContent(levelId);
      levelContent = [...levelContent, ...progressiveContent];
    }

    if (levelContent.length <= count) {
      return this.shuffleArray(levelContent, randomSeed);
    }

    const shuffled = this.shuffleArray(levelContent, randomSeed);
    return shuffled.slice(0, count);
  }

  static generateProgressiveContent(levelId: number): MinigameContent[] {
    const availableLetters = progressiveCombination.getAvailableLettersForLevel(levelId);
    const combinationWords = progressiveCombination.generateCombinationWords(availableLetters);

    // Generate content for combination words
    const progressiveContent: MinigameContent[] = combinationWords.slice(0, 8).map((word, index) => ({
      id: `progressive_${word.toLowerCase()}_${levelId}`,
      word: word,
      videoPath: `combination/${word.toLowerCase()}.mp4`,
      category: 'alphabets' as MinigameCategory,
      difficulty: word.length <= 3 ? 'easy' : word.length <= 5 ? 'medium' : 'hard'
    }));

    return progressiveContent;
  }

  static generateMinigameSession(
    stageId: number,
    levelId: number,
    lessonIndex: number,
    minigameType: MinigameType,
    includeProgressive: boolean = false
  ): MinigameSession {
    const config = this.getMinigameConfig(minigameType, stageId, levelId);
    const content = this.generateRandomizedContent(stageId, levelId, 4, undefined, includeProgressive);
    const randomSeed = this.getRandomSeed();

    return {
      id: `${stageId}-${levelId}-${lessonIndex}-${Date.now()}`,
      stageId,
      levelId,
      lessonIndex,
      content,
      config,
      randomSeed,
      isCompleted: false,
      score: 0,
      attempts: 0,
      startTime: new Date(),
    };
  }

  static getMinigameConfig(type: MinigameType, stageId: number, levelId?: number): MinigameConfig {
    const baseConfigs: Record<MinigameType, Partial<MinigameConfig>> = {
      level_introduction: {
        title: "Welcome to the Level",
        instructions: "Get ready to learn new letters!",
        pointsReward: 5,
        experienceReward: 3,
      },
      video_learning: {
        title: "Learn the Sign",
        instructions: "Watch the video and learn how to sign this word.",
        pointsReward: 10,
        experienceReward: 5,
      },
      multiple_choice: {
        title: "What sign is this?",
        instructions: "Watch the video and select the correct answer.",
        pointsReward: 20,
        experienceReward: 10,
        maxAttempts: 3,
      },
      gesture_recognition: {
        title: "Show the Sign",
        instructions: "Use the camera to show the correct sign language gesture.",
        pointsReward: 30,
        experienceReward: 15,
        timeLimit: 30000,
        maxAttempts: 3,
      },
      spelling: {
        title: "Complete the Word",
        instructions: "Fill in the missing letters to complete the word.",
        pointsReward: 25,
        experienceReward: 12,
        maxAttempts: 3,
      },
      matching: {
        title: "Match the Signs",
        instructions: "Match the sign language videos with their corresponding words.",
        pointsReward: 35,
        experienceReward: 18,
        timeLimit: 60000,
        maxAttempts: 3,
      },
      falling_letters: {
        title: "Catch the Letters",
        instructions: "Tap the falling letters to spell the word being signed.",
        pointsReward: 40,
        experienceReward: 20,
        timeLimit: 45000,
        maxAttempts: 3,
      },
      memory_cards: {
        title: "Memory Match",
        instructions: "Find matching pairs of sign language cards.",
        pointsReward: 35,
        experienceReward: 18,
        timeLimit: 90000,
        maxAttempts: 3,
      },
      sequence_builder: {
        title: "Build the Sequence",
        instructions: "Arrange the signs in the correct order to form a sentence.",
        pointsReward: 45,
        experienceReward: 22,
        timeLimit: 60000,
        maxAttempts: 3,
      },
    };

    const baseConfig = baseConfigs[type];
    const difficultyMultiplier = Math.min(1 + (stageId - 1) * 0.2, 2);

    return {
      type,
      title: baseConfig.title || "Minigame",
      instructions: baseConfig.instructions || "Complete the challenge",
      timeLimit: baseConfig.timeLimit,
      maxAttempts: baseConfig.maxAttempts || 1,
      pointsReward: Math.floor((baseConfig.pointsReward || 10) * difficultyMultiplier),
      experienceReward: Math.floor((baseConfig.experienceReward || 5) * difficultyMultiplier),
    };
  }

  static generateFallingLettersConfig(stageId: number, levelId: number): FallingLettersConfig {
    const baseConfig = this.getMinigameConfig('falling_letters', stageId, levelId);
    const category = this.getCategoryForStage(stageId);
    const randomSeed = this.getRandomSeed();

    let targetWords: string[];
    let correctLetters: string[];
    let distractorLetters: string[];

    if (stageId === 1) {
      // Use progressive spelling words for alphabet stage
      targetWords = generateProgressiveSpellingWords(levelId, 10);
      const shuffledWords = this.shuffleArray(targetWords, randomSeed);
      const targetWord = shuffledWords[0] || 'CAB';

      correctLetters = [...new Set(targetWord.split(''))];
      const availableLetters = progressiveCombination.getAvailableLettersForLevel(levelId);
      distractorLetters = availableLetters
        .filter(letter => !correctLetters.includes(letter))
        .slice(0, 4);
    } else {
      // Use regular content for other stages
      const targetWordsFromDB = SPELLING_WORDS[category];
      const shuffledWords = this.shuffleArray(targetWordsFromDB, randomSeed);
      const targetWord = shuffledWords[0];

      correctLetters = [...new Set(targetWord.split(''))];
      const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      distractorLetters = allLetters
        .filter(letter => !correctLetters.includes(letter))
        .slice(0, 6);
    }

    return {
      ...baseConfig,
      type: 'falling_letters',
      fallSpeed: Math.max(2, 5 - stageId * 0.5),
      spawnRate: Math.max(1000, 2000 - stageId * 200),
      correctLetters,
      distractorLetters,
    } as FallingLettersConfig;
  }

  static generateMatchingGameConfig(stageId: number, levelId: number): MatchingGameConfig {
    const baseConfig = this.getMinigameConfig('matching', stageId, levelId);
    const content = this.generateRandomizedContent(stageId, levelId, 6, undefined, stageId === 1);

    const pairs = content.map(item => ({
      id: item.id,
      word: item.word,
      videoPath: item.videoPath || '',
      imagePath: item.imagePath,
    }));

    return {
      ...baseConfig,
      type: 'matching',
      pairs,
      gridSize: Math.min(4, Math.ceil(Math.sqrt(pairs.length * 2))),
    } as MatchingGameConfig;
  }

  static generateMemoryCardsConfig(stageId: number, levelId: number): MemoryCardsConfig {
    const baseConfig = this.getMinigameConfig('memory_cards', stageId, levelId);
    const content = this.generateRandomizedContent(stageId, levelId, 8, undefined, stageId === 1);

    const cards = content.map(item => ({
      id: item.id,
      word: item.word,
      videoPath: item.videoPath || '',
      imagePath: item.imagePath,
    }));

    const totalCards = cards.length * 2; // Each card has a pair
    const gridRows = Math.ceil(Math.sqrt(totalCards));
    const gridCols = Math.ceil(totalCards / gridRows);

    return {
      ...baseConfig,
      type: 'memory_cards',
      cards,
      gridRows,
      gridCols,
      revealTime: Math.max(1000, 3000 - stageId * 200),
    } as MemoryCardsConfig;
  }

  // Generate randomized lesson progression for a level
  static generateLessonProgression(stageId: number, levelId: number): MinigameType[] {
    const baseProgressions: Record<number, MinigameType[]> = {
      1: ['video_learning', 'multiple_choice', 'gesture_recognition', 'spelling', 'falling_letters', 'matching'],
      2: ['video_learning', 'multiple_choice', 'gesture_recognition', 'matching', 'memory_cards'],
      3: ['video_learning', 'gesture_recognition', 'falling_letters', 'memory_cards', 'spelling'],
      4: ['video_learning', 'multiple_choice', 'sequence_builder', 'gesture_recognition', 'matching'],
      5: ['video_learning', 'matching', 'gesture_recognition', 'spelling', 'memory_cards'],
      6: ['video_learning', 'memory_cards', 'falling_letters', 'gesture_recognition', 'matching'],
      7: ['video_learning', 'sequence_builder', 'matching', 'gesture_recognition', 'spelling'],
    };

    const baseProgression = baseProgressions[stageId] || baseProgressions[1];
    const randomSeed = this.getRandomSeed();

    // Always start with video learning
    const progression = ['video_learning'];

    // Add 8-12 random lessons from the remaining pool
    const remainingTypes = baseProgression.slice(1);
    const shuffled = this.shuffleArray(remainingTypes, randomSeed);
    const lessonCount = Math.min(8 + Math.floor(Math.random() * 4), 12);

    // Fill remaining lessons by cycling through shuffled types
    for (let i = 1; i < lessonCount; i++) {
      const typeIndex = (i - 1) % shuffled.length;
      progression.push(shuffled[typeIndex]);
    }

    return progression;
  }

  // Get letters for a specific level
  private static getLettersForLevel(levelId: number): string[] {
    const levelLetterMapping: { [key: number]: string[] } = {
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
    return levelLetterMapping[levelId] || ['A', 'B', 'C'];
  }

  // Generate dynamic lesson content for Stage 1 Level 1 component integration
  static generateDynamicAlphabetLessons(levelId: number): any[] {
    const currentLevelLetters = this.getLettersForLevel(levelId);
    const lessons: any[] = [];

    // Start with level introduction (MANDATORY FIRST LESSON)
    const levelIntroduction = {
      id: `level_intro_${levelId}`,
      stageId: 1,
      levelId: levelId,
      lessonIndex: 1,
      content: [{
        id: `intro_level_${levelId}`,
        word: currentLevelLetters.join(', '),
        videoPath: 'level_intro.mp4', // Generic intro video or can be level-specific
        category: 'alphabets' as any,
        difficulty: 'easy' as any
      }],
      config: {
        type: 'level_introduction',
        title: `Welcome to Level ${levelId}`,
        instructions: `Get ready to learn letters ${currentLevelLetters.join(', ')}!`,
        pointsReward: 5,
        experienceReward: 3
      },
      randomSeed: this.getRandomSeed(),
      isCompleted: false,
      score: 0,
      attempts: 0,
      startTime: new Date(),
      title: `Introduction`,
      type: 'level_introduction',
      isProgressive: true,
      isIntroduction: true,
      isLevelIntro: true
    };
    lessons.push(levelIntroduction);

    // Alternate between video lessons and minigames for progressive learning
    const nonVideoProgression = this.generateNonVideoProgression(1, levelId);
    const viganTitles = [
      "Test your memory, young scholar",
      "Practice in the cobblestone streets",
      "What heritage letter is this?",
      "Journey through Vigan's alphabet",
      "Remember the colonial lessons?",
      "Sign like a Vigan local",
      "Master the heritage signs",
      "Explore the ancient plaza",
      "Decode the historical markers",
      "Heritage word challenge",
      "Colonial spelling practice",
      "Practice makes perfect",
      "Challenge your knowledge"
    ];

    let titleIndex = 0;

    // For each letter, add video lesson and minigames with random execution placement
    currentLevelLetters.forEach((letter, letterIndex) => {
      const letterLessons: any[] = [];

      // Add video lesson for this letter
      const videoLesson = {
        id: `video_intro_${letter}_${levelId}`,
        stageId: 1,
        levelId: levelId,
        lessonIndex: lessons.length + 1,
        content: [{
          id: `${letter.toLowerCase()}1`,
          word: letter,
          videoPath: `${letter.toLowerCase()}.mp4`,
          category: 'alphabets' as any,
          difficulty: 'easy' as any
        }],
        config: {
          type: 'video_learning',
          title: `This is letter '${letter}'`,
          instructions: `Watch and learn how to sign the letter ${letter}`,
          pointsReward: 10,
          experienceReward: 5
        },
        randomSeed: this.getRandomSeed(),
        isCompleted: false,
        score: 0,
        attempts: 0,
        startTime: new Date(),
        title: `This is letter '${letter}'`,
        type: 'video_learning',
        isProgressive: true,
        isIntroduction: true
      };
      letterLessons.push(videoLesson);

      // Create execution lesson for this letter
      const executionSession = this.generateMinigameSession(1, levelId, lessons.length + letterLessons.length + 1, 'gesture_recognition', true);
      const executionLesson = {
        ...executionSession,
        title: `Execute Letter '${letter}'`,
        type: 'gesture_recognition',
        isProgressive: true,
        isIntroduction: false,
        // Override content to use the specific letter
        content: [{
          id: `execute_${letter.toLowerCase()}`,
          word: letter,
          videoPath: `${letter.toLowerCase()}.mp4`,
          category: 'alphabets' as any,
          difficulty: 'easy' as any
        }]
      };

      // Create 2 additional minigames for this letter
      const additionalMinigames: any[] = [];
      const minigamesToAdd = 2;
      for (let i = 0; i < minigamesToAdd && titleIndex < nonVideoProgression.length; i++) {
        const type = nonVideoProgression[titleIndex];
        // Skip gesture_recognition since we have the execution lesson
        if (type === 'gesture_recognition') {
          titleIndex++;
          i--; // Don't count this iteration
          continue;
        }

        const session = this.generateMinigameSession(1, levelId, lessons.length + letterLessons.length + additionalMinigames.length + 1, type, true);
        const lesson = {
          ...session,
          title: viganTitles[titleIndex] || `Heritage Challenge ${titleIndex + 1}`,
          type,
          isProgressive: true,
          isIntroduction: false
        };
        additionalMinigames.push(lesson);
        titleIndex++;
      }

      // Randomly place execution lesson among the minigames (positions 1, 2, or 3 after video)
      const executionPosition = Math.floor(Math.random() * (additionalMinigames.length + 1)) + 1; // 1, 2, or 3

      // Insert execution lesson at random position
      if (executionPosition === 1) {
        letterLessons.push(executionLesson);
        letterLessons.push(...additionalMinigames);
      } else if (executionPosition === 2) {
        letterLessons.push(additionalMinigames[0]);
        letterLessons.push(executionLesson);
        if (additionalMinigames[1]) letterLessons.push(additionalMinigames[1]);
      } else {
        letterLessons.push(...additionalMinigames);
        letterLessons.push(executionLesson);
      }

      // Add all lessons for this letter to main lessons array
      lessons.push(...letterLessons);
    });

    // Update lesson indices to be sequential after all letters are processed
    lessons.forEach((lesson, index) => {
      lesson.lessonIndex = index + 1;
    });

    return lessons;
  }

  // Generate progression WITHOUT video lessons
  private static generateNonVideoProgression(stageId: number, levelId: number): MinigameType[] {
    const baseProgressions: Record<number, MinigameType[]> = {
      1: ['multiple_choice', 'gesture_recognition', 'spelling', 'falling_letters'], // Added falling_letters back
      2: ['multiple_choice', 'gesture_recognition', 'matching', 'memory_cards', 'spelling'],
      3: ['gesture_recognition', 'falling_letters', 'memory_cards', 'spelling', 'matching'],
      4: ['multiple_choice', 'sequence_builder', 'gesture_recognition', 'matching', 'spelling'],
      5: ['matching', 'gesture_recognition', 'spelling', 'memory_cards', 'falling_letters'],
      6: ['memory_cards', 'falling_letters', 'gesture_recognition', 'matching', 'spelling'],
      7: ['sequence_builder', 'matching', 'gesture_recognition', 'spelling', 'memory_cards'],
    };

    const baseProgression = baseProgressions[stageId] || baseProgressions[1];
    const randomSeed = this.getRandomSeed();

    // Generate 6-9 random lessons (after video introductions)
    const lessonCount = 6 + Math.floor(Math.random() * 4); // 6-9 lessons
    const progression: MinigameType[] = [];

    // Fill lessons by cycling through shuffled types
    const shuffled = this.shuffleArray(baseProgression, randomSeed);
    for (let i = 0; i < lessonCount; i++) {
      const typeIndex = i % shuffled.length;
      progression.push(shuffled[typeIndex]);
    }

    return progression;
  }
}