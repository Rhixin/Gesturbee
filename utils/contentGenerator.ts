import {
  MinigameContent,
  MinigameCategory,
  MinigameType,
  MinigameConfig,
  MinigameSession,
  FallingLettersConfig,
  MatchingGameConfig,
  MemoryCardsConfig,
  BalloonPopConfig,
} from "../types/minigame";
import { CONTENT_DATABASE, SPELLING_WORDS } from "./contentDatabase";
import { stageData, getStageById } from "./stageData";
import {
  progressiveCombination,
  generateProgressiveSpellingWords,
  generateProgressiveMultipleChoice,
} from "./alphabetContent";

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
      randomIndex = Math.floor(
        seededRandom(seed + currentIndex) * currentIndex
      );
      currentIndex -= 1;

      temporaryValue = shuffled[currentIndex];
      shuffled[currentIndex] = shuffled[randomIndex];
      shuffled[randomIndex] = temporaryValue;
    }

    return shuffled;
  }

  static getCategoryForStage(stageId: number): MinigameCategory {
    const categoryMap: Record<number, MinigameCategory> = {
      1: "alphabets",
      2: "numbers",
      3: "greetings",
      4: "colors",
      5: "questions",
      6: "days",
      7: "months",
    };
    return categoryMap[stageId] || "alphabets";
  }

  static getContentForLevel(
    stageId: number,
    levelId: number
  ): MinigameContent[] {
    const category = this.getCategoryForStage(stageId);
    const allContent = CONTENT_DATABASE[category];

    // Get stage configuration
    const stage = getStageById(stageId);
    if (!stage) return [];

    const level = stage.levels.find((l) => l.levelid === levelId);
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
    const availableLetters =
      progressiveCombination.getAvailableLettersForLevel(levelId);
    const combinationWords =
      progressiveCombination.generateCombinationWords(availableLetters);

    // Generate content for combination words
    const progressiveContent: MinigameContent[] = combinationWords
      .slice(0, 8)
      .map((word, index) => ({
        id: `progressive_${word.toLowerCase()}_${levelId}`,
        word: word,
        videoPath: `combination/${word.toLowerCase()}.mp4`,
        category: "alphabets" as MinigameCategory,
        difficulty:
          word.length <= 3 ? "easy" : word.length <= 5 ? "medium" : "hard",
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
    const content = this.generateRandomizedContent(
      stageId,
      levelId,
      4,
      undefined,
      includeProgressive
    );
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

  static getMinigameConfig(
    type: MinigameType,
    stageId: number,
    levelId?: number
  ): MinigameConfig {
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
        instructions:
          "Use the camera to show the correct sign language gesture.",
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
        instructions:
          "Match the sign language videos with their corresponding words.",
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
      balloon_pop: {
        title: "Pop the Balloons",
        instructions:
          "Use sign language to pop all the balloons before time runs out.",
        pointsReward: 45,
        experienceReward: 22,
        timeLimit: 30000,
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
        instructions:
          "Arrange the signs in the correct order to form a sentence.",
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
      pointsReward: Math.floor(
        (baseConfig.pointsReward || 10) * difficultyMultiplier
      ),
      experienceReward: Math.floor(
        (baseConfig.experienceReward || 5) * difficultyMultiplier
      ),
    };
  }

  static generateFallingLettersConfig(
    stageId: number,
    levelId: number
  ): FallingLettersConfig {
    const baseConfig = this.getMinigameConfig(
      "falling_letters",
      stageId,
      levelId
    );
    const category = this.getCategoryForStage(stageId);
    const randomSeed = this.getRandomSeed();

    let targetWords: string[];
    let correctLetters: string[];
    let distractorLetters: string[];

    if (stageId === 1) {
      // Use progressive spelling words for alphabet stage
      targetWords = generateProgressiveSpellingWords(levelId, 10);
      const shuffledWords = this.shuffleArray(targetWords, randomSeed);
      const targetWord = shuffledWords[0] || "CAB";

      correctLetters = [...new Set(targetWord.split(""))];
      const availableLetters =
        progressiveCombination.getAvailableLettersForLevel(levelId);
      distractorLetters = availableLetters
        .filter((letter) => !correctLetters.includes(letter))
        .slice(0, 4);
    } else {
      // Use regular content for other stages
      const targetWordsFromDB = SPELLING_WORDS[category];
      const shuffledWords = this.shuffleArray(targetWordsFromDB, randomSeed);
      const targetWord = shuffledWords[0];

      correctLetters = [...new Set(targetWord.split(""))];
      const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
      distractorLetters = allLetters
        .filter((letter) => !correctLetters.includes(letter))
        .slice(0, 6);
    }

    return {
      ...baseConfig,
      type: "falling_letters",
      fallSpeed: Math.max(2, 5 - stageId * 0.5),
      spawnRate: Math.max(1000, 2000 - stageId * 200),
      correctLetters,
      distractorLetters,
    } as FallingLettersConfig;
  }

  static generateMatchingGameConfig(
    stageId: number,
    levelId: number
  ): MatchingGameConfig {
    const baseConfig = this.getMinigameConfig("matching", stageId, levelId);
    const content = this.generateRandomizedContent(
      stageId,
      levelId,
      6,
      undefined,
      stageId === 1
    );

    const pairs = content.map((item) => ({
      id: item.id,
      word: item.word,
      videoPath: item.videoPath || "",
      imagePath: item.imagePath,
    }));

    return {
      ...baseConfig,
      type: "matching",
      pairs,
      gridSize: Math.min(4, Math.ceil(Math.sqrt(pairs.length * 2))),
    } as MatchingGameConfig;
  }

  static generateMemoryCardsConfig(
    stageId: number,
    levelId: number
  ): MemoryCardsConfig {
    const baseConfig = this.getMinigameConfig("memory_cards", stageId, levelId);
    const content = this.generateRandomizedContent(
      stageId,
      levelId,
      8,
      undefined,
      stageId === 1
    );

    const cards = content.map((item) => ({
      id: item.id,
      word: item.word,
      videoPath: item.videoPath || "",
      imagePath: item.imagePath,
    }));

    const totalCards = cards.length * 2; // Each card has a pair
    const gridRows = Math.ceil(Math.sqrt(totalCards));
    const gridCols = Math.ceil(totalCards / gridRows);

    return {
      ...baseConfig,
      type: "memory_cards",
      cards,
      gridRows,
      gridCols,
      revealTime: Math.max(1000, 3000 - stageId * 200),
    } as MemoryCardsConfig;
  }

  static generateBalloonPopConfig(
    stageId: number,
    levelId: number
  ): BalloonPopConfig {
    const baseConfig = this.getMinigameConfig("balloon_pop", stageId, levelId);

    // Generate learned letters based on current stage and level
    let learnedLetters: string[];
    if (stageId === 1) {
      // For alphabet stage, use progressive letters up to current level
      learnedLetters =
        progressiveCombination.getAvailableLettersForLevel(levelId);
    } else {
      // For other stages, generate letters from content
      const levelContent = this.getContentForLevel(stageId, levelId);
      learnedLetters = [
        ...new Set(levelContent.flatMap((content) => content.word.split(""))),
      ];
    }

    const balloonImages = ["balloon1.png", "balloon2.png", "balloon3.png"];

    return {
      ...baseConfig,
      type: "balloon_pop",
      totalBalloons: 12,
      timeLimit: 60000,
      learnedLetters,
      balloonImages,
    } as BalloonPopConfig;
  }

  // Generate randomized lesson progression for a level
  static generateLessonProgression(
    stageId: number,
    levelId: number
  ): MinigameType[] {
    // For stage 1 (alphabets), check if we have enough letters for matching game
    let matchingEnabled = true;
    if (stageId === 1) {
      const { progressiveCombination } = require("./alphabetContent");
      const availableLetters = progressiveCombination.getAvailableLettersForLevel(levelId);
      matchingEnabled = availableLetters.length >= 3;
    }

    const baseProgressions: Record<number, MinigameType[]> = {
      1: [
        "video_learning",
        "multiple_choice",
        "gesture_recognition",
        "spelling",
        "falling_letters",
        "balloon_pop",
        ...(matchingEnabled ? ["matching"] : []),
      ],
      2: [
        "video_learning",
        "multiple_choice",
        "gesture_recognition",
        "balloon_pop",
        "matching",
        "memory_cards",
      ],
      3: [
        "video_learning",
        "gesture_recognition",
        "falling_letters",
        "balloon_pop",
        "memory_cards",
        "spelling",
      ],
      4: [
        "video_learning",
        "multiple_choice",
        "sequence_builder",
        "balloon_pop",
        "gesture_recognition",
        "matching",
      ],
      5: [
        "video_learning",
        "matching",
        "gesture_recognition",
        "balloon_pop",
        "spelling",
        "memory_cards",
      ],
      6: [
        "video_learning",
        "memory_cards",
        "falling_letters",
        "balloon_pop",
        "gesture_recognition",
        "matching",
      ],
      7: [
        "video_learning",
        "sequence_builder",
        "matching",
        "balloon_pop",
        "gesture_recognition",
        "spelling",
      ],
    };

    const baseProgression = baseProgressions[stageId] || baseProgressions[1];
    const randomSeed = this.getRandomSeed();

    // Always start with video learning
    const progression = ["video_learning"];

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
      1: ["A", "B", "C"],
      2: ["D", "E", "F"],
      3: ["G", "H", "I"],
      4: ["J", "K", "L"],
      5: ["M", "N", "O"],
      6: ["P", "Q", "R"],
      7: ["S", "T", "U"],
      8: ["V", "W", "X"],
      9: ["Y", "Z"],
    };
    return levelLetterMapping[levelId] || ["A", "B", "C"];
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
      content: [
        {
          id: `intro_level_${levelId}`,
          word: currentLevelLetters.join(", "),
          videoPath: "level_intro.mp4", // Generic intro video or can be level-specific
          category: "alphabets" as any,
          difficulty: "easy" as any,
        },
      ],
      config: {
        type: "level_introduction",
        title: `Welcome to Level ${levelId}`,
        instructions: `Get ready to learn letters ${currentLevelLetters.join(
          ", "
        )}!`,
        pointsReward: 5,
        experienceReward: 3,
      },
      randomSeed: this.getRandomSeed(),
      isCompleted: false,
      score: 0,
      attempts: 0,
      startTime: new Date(),
      title: `Introduction`,
      type: "level_introduction",
      isProgressive: true,
      isIntroduction: true,
      isLevelIntro: true,
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
      "Challenge your knowledge",
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
        content: [
          {
            id: `${letter.toLowerCase()}1`,
            word: letter,
            videoPath: `${letter.toLowerCase()}.mp4`,
            category: "alphabets" as any,
            difficulty: "easy" as any,
          },
        ],
        config: {
          type: "video_learning",
          title: `This is letter '${letter}'`,
          instructions: `Watch and learn how to sign the letter ${letter}`,
          pointsReward: 10,
          experienceReward: 5,
        },
        randomSeed: this.getRandomSeed(),
        isCompleted: false,
        score: 0,
        attempts: 0,
        startTime: new Date(),
        title: viganTitles[titleIndex % viganTitles.length],
        type: "video_learning",
        isProgressive: true,
        isIntroduction: true,
      };
      letterLessons.push(videoLesson);
      titleIndex++; // Increment after video lesson

      // Create execution lesson for this letter
      const executionSession = this.generateMinigameSession(
        1,
        levelId,
        lessons.length + letterLessons.length + 1,
        "gesture_recognition",
        true
      );
      const executionLesson = {
        ...executionSession,
        title: viganTitles[titleIndex % viganTitles.length],
        type: "gesture_recognition",
        isProgressive: true,
        isIntroduction: false,
        // Override content to use the specific letter
        content: [
          {
            id: `execute_${letter.toLowerCase()}`,
            word: letter,
            videoPath: `${letter.toLowerCase()}.mp4`,
            category: "alphabets" as any,
            difficulty: "easy" as any,
          },
        ],
      };
      titleIndex++; // Increment after execute lesson

      // Create 2 additional minigames for this letter
      const additionalMinigames: any[] = [];
      const minigamesToAdd = 2;
      for (
        let i = 0;
        i < minigamesToAdd && titleIndex < nonVideoProgression.length;
        i++
      ) {
        const type = nonVideoProgression[titleIndex];
        // Skip gesture_recognition since we have the execution lesson
        if (type === "gesture_recognition") {
          titleIndex++;
          i--; // Don't count this iteration
          continue;
        }

        const session = this.generateMinigameSession(
          1,
          levelId,
          lessons.length +
            letterLessons.length +
            additionalMinigames.length +
            1,
          type,
          true
        );
        const lesson = {
          ...session,
          title:
            viganTitles[titleIndex] || `Heritage Challenge ${titleIndex + 1}`,
          type,
          isProgressive: true,
          isIntroduction: false,
        };
        additionalMinigames.push(lesson);
        titleIndex++;
      }

      // Randomly place execution lesson among the minigames (positions 1, 2, or 3 after video)
      const executionPosition =
        Math.floor(Math.random() * (additionalMinigames.length + 1)) + 1; // 1, 2, or 3

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
  private static generateNonVideoProgression(
    stageId: number,
    levelId: number
  ): MinigameType[] {
    // For stage 1 (alphabets), check if we have enough letters for matching game
    let matchingEnabled = true;
    if (stageId === 1) {
      const { progressiveCombination } = require("./alphabetContent");
      const availableLetters = progressiveCombination.getAvailableLettersForLevel(levelId);
      matchingEnabled = availableLetters.length >= 3;
    }

    const baseProgressions: Record<number, MinigameType[]> = {
      1: [
        "multiple_choice",
        "gesture_recognition",
        "spelling",
        "falling_letters",
        "balloon_pop",
        ...(matchingEnabled ? ["matching"] : []),
      ], // Added balloon_pop
      2: [
        "multiple_choice",
        "gesture_recognition",
        "balloon_pop",
        "matching",
        "memory_cards",
        "spelling",
      ],
      3: [
        "gesture_recognition",
        "falling_letters",
        "balloon_pop",
        "memory_cards",
        "spelling",
        "matching",
      ],
      4: [
        "multiple_choice",
        "sequence_builder",
        "balloon_pop",
        "gesture_recognition",
        "matching",
        "spelling",
      ],
      5: [
        "matching",
        "gesture_recognition",
        "balloon_pop",
        "spelling",
        "memory_cards",
        "falling_letters",
      ],
      6: [
        "memory_cards",
        "falling_letters",
        "balloon_pop",
        "gesture_recognition",
        "matching",
        "spelling",
      ],
      7: [
        "sequence_builder",
        "matching",
        "balloon_pop",
        "gesture_recognition",
        "spelling",
        "memory_cards",
      ],
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

  // Generate dynamic lesson content for Stage 2 (Numbers) similar to generateDynamicAlphabetLessons
  static generateDynamicNumberLessons(
    levelId: number,
    currentLevelNumbers: string[],
    getVideoPathForNumber: (number: string) => any,
    getAITestLetter: (number: string) => string
  ): any[] {
    const lessons: any[] = [];

    // Start with level introduction (MANDATORY FIRST LESSON)
    const levelIntroduction = {
      id: `level_intro_${levelId}`,
      stageId: 2,
      levelId: levelId,
      lessonIndex: 1,
      content: [
        {
          id: `intro_level_${levelId}`,
          word: currentLevelNumbers.join(", "),
          videoPath: getVideoPathForNumber(currentLevelNumbers[0]),
          category: "numbers" as any,
          difficulty: "easy" as any,
        },
      ],
      config: {
        type: "level_introduction",
        title: `Welcome to Manila Numbers Level ${levelId}`,
        instructions: `Get ready to learn numbers ${currentLevelNumbers.join(", ")} with vibrant Manila energy!`,
        pointsReward: 5,
        experienceReward: 3,
      },
      randomSeed: parseInt(`${levelId}000`, 10), // Deterministic seed for level intro
      isCompleted: false,
      score: 0,
      attempts: 0,
      startTime: new Date(),
      title: `Numbers ${currentLevelNumbers.join(", ")}`,
      type: "level_introduction",
      isProgressive: true,
      isIntroduction: true,
      isLevelIntro: true,
    };
    lessons.push(levelIntroduction);

    // Manila-themed lesson titles for variety
    const manilaTitles = [
      "City number challenge",
      "Navigate through the signs",
      "Urban counting practice",
      "Capital number quest",
      "Metro sign challenge",
      "Count through the streets",
      "Balloon counting game",
      "City breeze practice",
      "Downtown number test",
      "Skyscraper challenge",
      "Rush hour counting",
      "Traffic light practice",
      "Metropolitan test",
    ];

    // Get randomized progression for numbers (exclude video_learning since we handle it separately)
    const nonVideoProgression = this.generateNumberProgression(2, levelId);
    let titleIndex = 0;

    // For each number, add video lesson and randomized minigames with random execution placement
    currentLevelNumbers.forEach((number, numberIndex) => {
      const numberLessons: any[] = [];

      // Add video lesson for this number
      const videoLesson = {
        id: `video_intro_${number}_${levelId}`,
        stageId: 2,
        levelId: levelId,
        lessonIndex: lessons.length + 1,
        content: [
          {
            id: `${number}_1`,
            word: number,
            videoPath: getVideoPathForNumber(number),
            category: "numbers" as any,
            difficulty: "easy" as any,
          },
        ],
        config: {
          type: "video_learning",
          title: `This is number '${number}'`,
          instructions: `Watch and learn how to sign the number ${number}`,
          pointsReward: 10,
          experienceReward: 5,
        },
        randomSeed: this.getRandomSeed(),
        isCompleted: false,
        score: 0,
        attempts: 0,
        startTime: new Date(),
        title: manilaTitles[titleIndex % manilaTitles.length],
        type: "video_learning",
        isProgressive: true,
        isIntroduction: true,
      };
      numberLessons.push(videoLesson);
      titleIndex++; // Increment after video lesson

      // Create execution lesson for this number
      const executionLesson = {
        id: `execute_${number}_${levelId}`,
        stageId: 2,
        levelId: levelId,
        lessonIndex: lessons.length + numberLessons.length + 1,
        content: [
          {
            id: `execute_${number}`,
            word: number,
            videoPath: getVideoPathForNumber(number),
            category: "numbers" as any,
            difficulty: "easy" as any,
          },
        ],
        config: {
          type: "execute",
          title: `Execute Number ${number}`,
          instructions: `Show the sign for number ${number}`,
          pointsReward: 30,
          experienceReward: 15,
        },
        randomSeed: this.getRandomSeed(),
        isCompleted: false,
        score: 0,
        attempts: 0,
        startTime: new Date(),
        title: manilaTitles[titleIndex % manilaTitles.length],
        type: "execute",
        isProgressive: true,
        isIntroduction: false,
        correctAnswer: getAITestLetter(number), // Map to letter for AI
      };
      titleIndex++; // Increment after execute lesson

      // Create 2 additional minigames for this number
      const additionalMinigames: any[] = [];
      const minigamesToAdd = 2;
      for (
        let i = 0;
        i < minigamesToAdd && titleIndex < nonVideoProgression.length;
        i++
      ) {
        const type = nonVideoProgression[titleIndex];
        // Skip execute since we have the execution lesson
        if (type === "execute") {
          titleIndex++;
          i--; // Don't count this iteration
          continue;
        }

        let lesson: any;
        if (type === "multiple_choice") {
          // Generate stable choices using lesson's seed for consistency
          const lessonSeed = this.getRandomSeed();
          const choices = this.generateStableChoicesForNumber(number, levelId, lessonSeed);

          lesson = {
            id: `practice_mc_${number}_${levelId}_${i}`,
            stageId: 2,
            levelId: levelId,
            lessonIndex: lessons.length + numberLessons.length + additionalMinigames.length + 1,
            content: [
              {
                id: `practice_${number}_${i}`,
                word: number,
                videoPath: getVideoPathForNumber(number),
                category: "numbers" as any,
                difficulty: "easy" as any,
              },
            ],
            config: {
              type: "multiple_choice",
              title: `Practice Number ${number}`,
              instructions: `Which number is being signed?`,
              pointsReward: 20,
              experienceReward: 10,
            },
            randomSeed: lessonSeed,
            isCompleted: false,
            score: 0,
            attempts: 0,
            startTime: new Date(),
            title: manilaTitles[titleIndex] || `Metro Challenge ${titleIndex + 1}`,
            type: "multiple_choice",
            isProgressive: true,
            isIntroduction: false,
            choices: choices,
            correctAnswer: number,
          };
        } else {
          // Generic lesson for other types
          lesson = {
            id: `${type}_${number}_${levelId}_${i}`,
            stageId: 2,
            levelId: levelId,
            lessonIndex: lessons.length + numberLessons.length + additionalMinigames.length + 1,
            content: [
              {
                id: `${type}_${number}_${i}`,
                word: number,
                videoPath: getVideoPathForNumber(number),
                category: "numbers" as any,
                difficulty: "easy" as any,
              },
            ],
            config: {
              type: type,
              title: `${type} Number ${number}`,
              instructions: `Practice the number ${number}`,
              pointsReward: 25,
              experienceReward: 12,
            },
            randomSeed: this.getRandomSeed(),
            isCompleted: false,
            score: 0,
            attempts: 0,
            startTime: new Date(),
            title: manilaTitles[titleIndex] || `Metro Challenge ${titleIndex + 1}`,
            type: type,
            isProgressive: true,
            isIntroduction: false,
          };
        }

        additionalMinigames.push(lesson);
        titleIndex++;
      }

      // Randomly place execution lesson among the minigames (positions 1, 2, or 3 after video)
      const executionPosition =
        Math.floor(Math.random() * (additionalMinigames.length + 1)) + 1; // 1, 2, or 3

      // Insert execution lesson at random position
      if (executionPosition === 1) {
        numberLessons.push(executionLesson);
        numberLessons.push(...additionalMinigames);
      } else if (executionPosition === 2) {
        numberLessons.push(additionalMinigames[0]);
        numberLessons.push(executionLesson);
        if (additionalMinigames[1]) numberLessons.push(additionalMinigames[1]);
      } else {
        numberLessons.push(...additionalMinigames);
        numberLessons.push(executionLesson);
      }

      // Add all lessons for this number to main lessons array
      lessons.push(...numberLessons);
    });

    // Add final matching game if we have enough numbers
    if (currentLevelNumbers.length >= 3) {
      const matchingLesson = {
        id: `matching_${levelId}`,
        stageId: 2,
        levelId: levelId,
        lessonIndex: lessons.length + 1,
        content: currentLevelNumbers.map(number => ({
          id: `matching_${number}`,
          word: number,
          videoPath: getVideoPathForNumber(number),
          category: "numbers" as any,
          difficulty: "easy" as any,
        })),
        config: {
          type: "matching",
          title: "Match the Numbers!",
          instructions: "Match the sign language videos with their corresponding numbers.",
          pointsReward: 35,
          experienceReward: 18,
        },
        randomSeed: this.getRandomSeed(),
        isCompleted: false,
        score: 0,
        attempts: 0,
        startTime: new Date(),
        title: "Manila Number Matching!",
        type: "matching",
        isProgressive: true,
        isIntroduction: false,
      };
      lessons.push(matchingLesson);
    }

    // Update lesson indices to be sequential after all numbers are processed
    lessons.forEach((lesson, index) => {
      lesson.lessonIndex = index + 1;
    });

    return lessons;
  }

  // Generate progression for numbers (similar to generateNonVideoProgression but for Stage 2)
  private static generateNumberProgression(stageId: number, levelId: number): string[] {
    // Get learned numbers up to current level
    const learnedNumbers = this.getLearnedNumbersUpToLevel(levelId);
    const matchingEnabled = learnedNumbers.length >= 3;

    const baseProgression = [
      "multiple_choice",
      "execute",
      "falling_letters",
      "balloon_pop",
      ...(matchingEnabled ? ["matching"] : []),
    ];

    const randomSeed = this.getRandomSeed();

    // Generate 4-6 random lessons per number
    const lessonCount = 4 + Math.floor(Math.random() * 3); // 4-6 lessons
    const progression: string[] = [];

    // Fill lessons by cycling through shuffled types
    const shuffled = this.shuffleArray(baseProgression, randomSeed);
    for (let i = 0; i < lessonCount; i++) {
      const typeIndex = i % shuffled.length;
      progression.push(shuffled[typeIndex]);
    }

    return progression;
  }

  // Get all numbers learned up to current level (progressive learning)
  private static getLearnedNumbersUpToLevel(levelId: number): string[] {
    const levelNumberMapping: { [key: number]: string[] } = {
      1: ['1', '2', '3', '4'],
      2: ['5', '6', '7', '8'],
      3: ['9', '10']
    };

    const learnedNumbers: string[] = [];

    // Add all numbers from levels 1 up to current level
    for (let level = 1; level <= levelId; level++) {
      const levelNumbers = levelNumberMapping[level] || [];
      learnedNumbers.push(...levelNumbers);
    }

    return learnedNumbers;
  }

  // Generate stable multiple choice options for numbers (prevents choices from changing on re-render)
  private static generateStableChoicesForNumber(targetNumber: string, levelId: number, seed: number): string[] {
    const choices = [targetNumber];

    // Use all numbers from current level for wrong answer choices to maintain difficulty
    const levelNumberMapping: { [key: number]: string[] } = {
      1: ['1', '2', '3', '4'],
      2: ['5', '6', '7', '8'],
      3: ['9', '10']
    };

    const currentLevelNumbers = levelNumberMapping[levelId] || ['1', '2', '3', '4'];
    const availableChoices = currentLevelNumbers.filter(num => num !== targetNumber);

    // If we need more choices and don't have enough from current level, use numbers from other levels
    const allPossibleNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const additionalChoices = allPossibleNumbers.filter(num =>
      num !== targetNumber && !availableChoices.includes(num)
    );

    // Add up to 3 random incorrect choices using seeded randomization
    const combinedChoices = [...availableChoices, ...additionalChoices];

    while (choices.length < 4 && combinedChoices.length > 0) {
      const randomIndex = Math.floor(this.seededRandom(seed + choices.length) * combinedChoices.length);
      const randomNumber = combinedChoices.splice(randomIndex, 1)[0];
      choices.push(randomNumber);
    }

    // If we still don't have enough choices, add some duplicates (edge case)
    while (choices.length < 4) {
      const fallbackChoices = ['1', '2', '3', '4'].filter(num => num !== targetNumber);
      if (fallbackChoices.length > 0) {
        const randomIndex = Math.floor(this.seededRandom(seed + choices.length + 100) * fallbackChoices.length);
        choices.push(fallbackChoices[randomIndex]);
      } else {
        choices.push(targetNumber); // Last resort
      }
    }

    // Shuffle the choices using seeded randomization
    return this.shuffleArray(choices, seed + 500);
  }

  // Seeded random number generator (same as used in shuffleArray)
  private static seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Generate dynamic lesson content for Stage 3 (Greetings) similar to generateDynamicNumberLessons
  static generateDynamicGreetingLessons(
    levelId: number,
    currentLevelGreetings: string[],
    getVideoPathForGreeting: (greeting: string) => any,
    getAITestLetter: (greeting: string) => string
  ): any[] {
    const lessons: any[] = [];

    // Start with level introduction (MANDATORY FIRST LESSON)
    const levelIntroduction = {
      id: `level_intro_${levelId}`,
      stageId: 3,
      levelId: levelId,
      lessonIndex: 1,
      content: [
        {
          id: `intro_level_${levelId}`,
          word: currentLevelGreetings.join(", "),
          videoPath: getVideoPathForGreeting(currentLevelGreetings[0]),
          category: "greetings" as any,
          difficulty: "easy" as any,
        },
      ],
      config: {
        type: "level_introduction",
        title: `Welcome to Boracay Greetings Level ${levelId}`,
        instructions: `Get ready to learn greetings: ${currentLevelGreetings.join(", ")} with tropical Boracay vibes!`,
        pointsReward: 5,
        experienceReward: 3,
      },
      randomSeed: parseInt(`${levelId}000`, 10), // Deterministic seed for level intro
      isCompleted: false,
      score: 0,
      attempts: 0,
      startTime: new Date(),
      title: `Greetings: ${currentLevelGreetings.join(", ")}`,
      type: "level_introduction",
      isProgressive: true,
      isIntroduction: true,
      isLevelIntro: true,
    };
    lessons.push(levelIntroduction);

    // Boracay-themed lesson titles for variety
    const boracayTitles = [
      "Beach greeting challenge",
      "Island conversation practice",
      "Tropical greeting quest",
      "Sunset greeting game",
      "Seaside politeness test",
      "Ocean breeze practice",
      "Sandy beach challenge",
      "Coastal greeting game",
      "Beachfront conversation",
      "Island hospitality test",
      "Tropical social skills",
      "Paradise greeting practice",
      "Coral reef challenge",
    ];

    // Get randomized progression for greetings (exclude video_learning since we handle it separately)
    const nonVideoProgression = this.generateGreetingProgression(3, levelId);
    let titleIndex = 0;

    // For each greeting, add video lesson and randomized minigames with random execution placement
    currentLevelGreetings.forEach((greeting, greetingIndex) => {
      const greetingLessons: any[] = [];

      // Add video lesson for this greeting
      const videoLesson = {
        id: `video_intro_${greeting}_${levelId}`,
        stageId: 3,
        levelId: levelId,
        lessonIndex: lessons.length + 1,
        content: [
          {
            id: `${greeting.toLowerCase().replace(/\s+/g, '_')}_1`,
            word: greeting,
            videoPath: getVideoPathForGreeting(greeting),
            category: "greetings" as any,
            difficulty: "easy" as any,
          },
        ],
        config: {
          type: "video_learning",
          title: `This is "${greeting}"`,
          instructions: `Watch and learn how to sign the greeting: ${greeting}`,
          pointsReward: 10,
          experienceReward: 5,
        },
        randomSeed: this.getRandomSeed(),
        isCompleted: false,
        score: 0,
        attempts: 0,
        startTime: new Date(),
        title: boracayTitles[titleIndex % boracayTitles.length],
        type: "video_learning",
        isProgressive: true,
        isIntroduction: true,
      };
      greetingLessons.push(videoLesson);
      titleIndex++; // Increment after video lesson

      // Create execution lesson for this greeting
      const executionLesson = {
        id: `execute_${greeting}_${levelId}`,
        stageId: 3,
        levelId: levelId,
        lessonIndex: lessons.length + greetingLessons.length + 1,
        content: [
          {
            id: `execute_${greeting.toLowerCase().replace(/\s+/g, '_')}`,
            word: greeting,
            videoPath: getVideoPathForGreeting(greeting),
            category: "greetings" as any,
            difficulty: "easy" as any,
          },
        ],
        config: {
          type: "execute",
          title: `Execute "${greeting}"`,
          instructions: `Show the sign for greeting: ${greeting}`,
          pointsReward: 30,
          experienceReward: 15,
        },
        randomSeed: this.getRandomSeed(),
        isCompleted: false,
        score: 0,
        attempts: 0,
        startTime: new Date(),
        title: boracayTitles[titleIndex % boracayTitles.length],
        type: "execute",
        isProgressive: true,
        isIntroduction: false,
        correctAnswer: getAITestLetter(greeting), // Map to letter for AI
      };
      titleIndex++; // Increment after execute lesson

      // Create 2 additional minigames for this greeting
      const additionalMinigames: any[] = [];
      const minigamesToAdd = 2;
      for (
        let i = 0;
        i < minigamesToAdd && titleIndex < nonVideoProgression.length;
        i++
      ) {
        const type = nonVideoProgression[titleIndex];
        // Skip execute since we have the execution lesson
        if (type === "execute") {
          titleIndex++;
          i--; // Don't count this iteration
          continue;
        }

        let lesson: any;
        if (type === "multiple_choice") {
          // Generate stable choices using lesson's seed for consistency
          const lessonSeed = this.getRandomSeed();
          const choices = this.generateStableChoicesForGreeting(greeting, levelId, lessonSeed);

          lesson = {
            id: `practice_mc_${greeting}_${levelId}_${i}`,
            stageId: 3,
            levelId: levelId,
            lessonIndex: lessons.length + greetingLessons.length + additionalMinigames.length + 1,
            content: [
              {
                id: `practice_${greeting.toLowerCase().replace(/\s+/g, '_')}_${i}`,
                word: greeting,
                videoPath: getVideoPathForGreeting(greeting),
                category: "greetings" as any,
                difficulty: "easy" as any,
              },
            ],
            config: {
              type: "multiple_choice",
              title: `Practice "${greeting}"`,
              instructions: `Which greeting is being signed?`,
              pointsReward: 20,
              experienceReward: 10,
            },
            randomSeed: lessonSeed,
            isCompleted: false,
            score: 0,
            attempts: 0,
            startTime: new Date(),
            title: boracayTitles[titleIndex] || `Beach Challenge ${titleIndex + 1}`,
            type: "multiple_choice",
            isProgressive: true,
            isIntroduction: false,
            choices: choices,
            correctAnswer: greeting,
          };
        } else {
          // Generic lesson for other types
          lesson = {
            id: `${type}_${greeting}_${levelId}_${i}`,
            stageId: 3,
            levelId: levelId,
            lessonIndex: lessons.length + greetingLessons.length + additionalMinigames.length + 1,
            content: [
              {
                id: `${type}_${greeting.toLowerCase().replace(/\s+/g, '_')}_${i}`,
                word: greeting,
                videoPath: getVideoPathForGreeting(greeting),
                category: "greetings" as any,
                difficulty: "easy" as any,
              },
            ],
            config: {
              type: type,
              title: `${type} "${greeting}"`,
              instructions: `Practice the greeting: ${greeting}`,
              pointsReward: 25,
              experienceReward: 12,
            },
            randomSeed: this.getRandomSeed(),
            isCompleted: false,
            score: 0,
            attempts: 0,
            startTime: new Date(),
            title: boracayTitles[titleIndex] || `Beach Challenge ${titleIndex + 1}`,
            type: type,
            isProgressive: true,
            isIntroduction: false,
          };
        }

        additionalMinigames.push(lesson);
        titleIndex++;
      }

      // Randomly place execution lesson among the minigames (positions 1, 2, or 3 after video)
      const executionPosition =
        Math.floor(Math.random() * (additionalMinigames.length + 1)) + 1; // 1, 2, or 3

      // Insert execution lesson at random position
      if (executionPosition === 1) {
        greetingLessons.push(executionLesson);
        greetingLessons.push(...additionalMinigames);
      } else if (executionPosition === 2) {
        greetingLessons.push(additionalMinigames[0]);
        greetingLessons.push(executionLesson);
        if (additionalMinigames[1]) greetingLessons.push(additionalMinigames[1]);
      } else {
        greetingLessons.push(...additionalMinigames);
        greetingLessons.push(executionLesson);
      }

      // Add all lessons for this greeting to main lessons array
      lessons.push(...greetingLessons);
    });

    // Add final matching game if we have enough greetings
    if (currentLevelGreetings.length >= 3) {
      const matchingLesson = {
        id: `matching_${levelId}`,
        stageId: 3,
        levelId: levelId,
        lessonIndex: lessons.length + 1,
        content: currentLevelGreetings.map(greeting => ({
          id: `matching_${greeting.toLowerCase().replace(/\s+/g, '_')}`,
          word: greeting,
          videoPath: getVideoPathForGreeting(greeting),
          category: "greetings" as any,
          difficulty: "easy" as any,
        })),
        config: {
          type: "matching",
          title: "Match the Greetings!",
          instructions: "Match the sign language videos with their corresponding greetings.",
          pointsReward: 35,
          experienceReward: 18,
        },
        randomSeed: this.getRandomSeed(),
        isCompleted: false,
        score: 0,
        attempts: 0,
        startTime: new Date(),
        title: "Boracay Greeting Matching!",
        type: "matching",
        isProgressive: true,
        isIntroduction: false,
      };
      lessons.push(matchingLesson);
    }

    // Update lesson indices to be sequential after all greetings are processed
    lessons.forEach((lesson, index) => {
      lesson.lessonIndex = index + 1;
    });

    return lessons;
  }

  // Generate progression for greetings (similar to generateNumberProgression but for Stage 3)
  private static generateGreetingProgression(stageId: number, levelId: number): string[] {
    // Get learned greetings up to current level
    const learnedGreetings = this.getLearnedGreetingsUpToLevel(levelId);
    const matchingEnabled = learnedGreetings.length >= 3;

    const baseProgression = [
      "multiple_choice",
      "execute",
      "falling_letters",
      "balloon_pop",
      ...(matchingEnabled ? ["matching"] : []),
    ];

    const randomSeed = this.getRandomSeed();

    // Generate 4-6 random lessons per greeting
    const lessonCount = 4 + Math.floor(Math.random() * 3); // 4-6 lessons
    const progression: string[] = [];

    // Fill lessons by cycling through shuffled types
    const shuffled = this.shuffleArray(baseProgression, randomSeed);
    for (let i = 0; i < lessonCount; i++) {
      const typeIndex = i % shuffled.length;
      progression.push(shuffled[typeIndex]);
    }

    return progression;
  }

  // Get all greetings learned up to current level (progressive learning)
  private static getLearnedGreetingsUpToLevel(levelId: number): string[] {
    const levelGreetingMapping: { [key: number]: string[] } = {
      1: ['GOOD MORNING', 'GOOD AFTERNOON', 'GOOD EVENING', 'HELLO', 'HOW ARE YOU'],
      2: ['IM FINE', 'NICE TO MEET YOU', 'THANK YOU', 'YOURE WELCOME', 'SEE YOU TOMORROW']
    };

    const learnedGreetings: string[] = [];

    // Add all greetings from levels 1 up to current level
    for (let level = 1; level <= levelId; level++) {
      const levelGreetings = levelGreetingMapping[level] || [];
      learnedGreetings.push(...levelGreetings);
    }

    return learnedGreetings;
  }

  // Generate stable multiple choice options for greetings (prevents choices from changing on re-render)
  private static generateStableChoicesForGreeting(targetGreeting: string, levelId: number, seed: number): string[] {
    const choices = [targetGreeting];

    // Use all greetings from current level for wrong answer choices to maintain difficulty
    const levelGreetingMapping: { [key: number]: string[] } = {
      1: ['GOOD MORNING', 'GOOD AFTERNOON', 'GOOD EVENING', 'HELLO', 'HOW ARE YOU'],
      2: ['IM FINE', 'NICE TO MEET YOU', 'THANK YOU', 'YOURE WELCOME', 'SEE YOU TOMORROW']
    };

    const currentLevelGreetings = levelGreetingMapping[levelId] || ['HELLO', 'GOOD MORNING', 'GOOD AFTERNOON', 'GOOD EVENING'];
    const availableChoices = currentLevelGreetings.filter(greeting => greeting !== targetGreeting);

    // If we need more choices and don't have enough from current level, use greetings from other levels
    const allPossibleGreetings = ['GOOD MORNING', 'GOOD AFTERNOON', 'GOOD EVENING', 'HELLO', 'HOW ARE YOU', 'IM FINE', 'NICE TO MEET YOU', 'THANK YOU', 'YOURE WELCOME', 'SEE YOU TOMORROW'];
    const additionalChoices = allPossibleGreetings.filter(greeting =>
      greeting !== targetGreeting && !availableChoices.includes(greeting)
    );

    // Add up to 3 random incorrect choices using seeded randomization
    const combinedChoices = [...availableChoices, ...additionalChoices];

    while (choices.length < 4 && combinedChoices.length > 0) {
      const randomIndex = Math.floor(this.seededRandom(seed + choices.length) * combinedChoices.length);
      const randomGreeting = combinedChoices.splice(randomIndex, 1)[0];
      choices.push(randomGreeting);
    }

    // If we still don't have enough choices, add some duplicates (edge case)
    while (choices.length < 4) {
      const fallbackChoices = ['HELLO', 'GOOD MORNING', 'GOOD AFTERNOON', 'HOW ARE YOU'].filter(greeting => greeting !== targetGreeting);
      if (fallbackChoices.length > 0) {
        const randomIndex = Math.floor(this.seededRandom(seed + choices.length + 100) * fallbackChoices.length);
        choices.push(fallbackChoices[randomIndex]);
      } else {
        choices.push(targetGreeting); // Last resort
      }
    }

    // Shuffle the choices using seeded randomization
    return this.shuffleArray(choices, seed + 500);
  }

  // Generate dynamic lesson content for Stage 4 (Colors) similar to generateDynamicGreetingLessons
  static generateDynamicColorLessons(
    levelId: number,
    currentLevelColors: string[],
    getVideoPathForColor: (color: string) => any,
    getAITestLetter: (color: string) => string
  ): any[] {
    const lessons: any[] = [];

    // Start with level introduction (MANDATORY FIRST LESSON)
    const levelIntroduction = {
      id: `level_intro_${levelId}`,
      stageId: 4,
      levelId: levelId,
      lessonIndex: 1,
      content: [
        {
          id: `intro_level_${levelId}`,
          word: currentLevelColors.join(", "),
          videoPath: getVideoPathForColor(currentLevelColors[0]),
          category: "colors" as any,
          difficulty: "easy" as any,
        },
      ],
      config: {
        type: "level_introduction",
        title: `Welcome to Siargao Colors Level ${levelId}`,
        instructions: `Get ready to learn colors: ${currentLevelColors.join(", ")} with tropical Siargao vibes!`,
        pointsReward: 5,
        experienceReward: 3,
      },
      randomSeed: parseInt(`${levelId}000`, 10), // Deterministic seed for level intro
      isCompleted: false,
      score: 0,
      attempts: 0,
      startTime: new Date(),
      title: `Colors: ${currentLevelColors.join(", ")}`,
      type: "level_introduction",
      isProgressive: true,
      isIntroduction: true,
      isLevelIntro: true,
    };
    lessons.push(levelIntroduction);

    // Siargao-themed lesson titles for variety
    const siargaoTitles = [
      "Surf's colorful challenge",
      "Island color practice",
      "Tropical color quest",
      "Sunset color game",
      "Ocean color test",
      "Beach color practice",
      "Paradise color challenge",
      "Coconut grove test",
      "Wave color practice",
      "Island color adventure",
      "Tropical art session",
      "Color reef challenge",
    ];

    // Get randomized progression for colors (exclude video_learning since we handle it separately)
    const nonVideoProgression = this.generateColorProgression(4, levelId);
    let titleIndex = 0;
    let progressionIndex = 0; // Separate index for the minigame progression

    // For each color, add video lesson and randomized minigames with random execution placement
    currentLevelColors.forEach((color, colorIndex) => {
      const colorLessons: any[] = [];

      // Add video lesson for this color
      const videoLesson = {
        id: `video_intro_${color}_${levelId}`,
        stageId: 4,
        levelId: levelId,
        lessonIndex: lessons.length + 1,
        content: [
          {
            id: `${color.toLowerCase().replace(/\s+/g, '_')}_1`,
            word: color,
            videoPath: getVideoPathForColor(color),
            category: "colors" as any,
            difficulty: "easy" as any,
          },
        ],
        config: {
          type: "video_learning",
          title: `This is "${color}"`,
          instructions: `Watch and learn how to sign the color: ${color}`,
          pointsReward: 10,
          experienceReward: 5,
        },
        randomSeed: this.getRandomSeed(),
        isCompleted: false,
        score: 0,
        attempts: 0,
        startTime: new Date(),
        title: siargaoTitles[titleIndex % siargaoTitles.length],
        type: "video_learning",
        isProgressive: true,
        isIntroduction: true,
      };
      colorLessons.push(videoLesson);
      titleIndex++; // Increment after video lesson

      // Create execution lesson for this color (IMMEDIATELY after video)
      const executionLesson = {
        id: `execute_${color}_${levelId}`,
        stageId: 4,
        levelId: levelId,
        lessonIndex: lessons.length + colorLessons.length + 1,
        content: [
          {
            id: `execute_${color.toLowerCase().replace(/\s+/g, '_')}`,
            word: color,
            videoPath: getVideoPathForColor(color),
            category: "colors" as any,
            difficulty: "easy" as any,
          },
        ],
        config: {
          type: "execute",
          title: `Execute "${color}"`,
          instructions: `Show the sign for color: ${color}`,
          pointsReward: 30,
          experienceReward: 15,
        },
        randomSeed: this.getRandomSeed(),
        isCompleted: false,
        score: 0,
        attempts: 0,
        startTime: new Date(),
        title: siargaoTitles[titleIndex % siargaoTitles.length],
        type: "execute",
        isProgressive: true,
        isIntroduction: false,
        correctAnswer: getAITestLetter(color), // Map to letter for AI
      };
      colorLessons.push(executionLesson);
      titleIndex++; // Increment after execute lesson

      // Create EXACTLY 2 additional minigames for this color
      const additionalMinigames: any[] = [];
      const minigamesToAdd = 2;

      console.log(`[DEBUG] Generating minigames for ${color} (colorIndex: ${colorIndex})`);
      console.log(`[DEBUG] nonVideoProgression:`, nonVideoProgression);
      console.log(`[DEBUG] progressionIndex: ${progressionIndex}, length: ${nonVideoProgression.length}`);

      let attempts = 0;
      const maxAttempts = nonVideoProgression.length * 2; // Prevent infinite loops

      for (let i = 0; i < minigamesToAdd && attempts < maxAttempts; attempts++) {
        // Cycle through progression if we reach the end
        const currentProgressionIndex = progressionIndex % nonVideoProgression.length;
        const type = nonVideoProgression[currentProgressionIndex];
        const learnedColors = this.getLearnedColorsUpToLevel(4, levelId, colorIndex + 1);

        console.log(`[DEBUG] Trying type: ${type} (attempt ${attempts}), learnedColors:`, learnedColors);

        progressionIndex++; // Always increment to avoid getting stuck

        // Skip execute since we already have the execution lesson
        if (type === "execute") {
          console.log(`[DEBUG] Skipping execute for ${color}`);
          continue; // Don't increment i, try next type
        }

        // For the first color in a level, allow falling_letters and balloon_pop with fewer learned colors
        const isFirstColor = colorIndex === 0;
        const minLearnedColorsNeeded = isFirstColor ? 1 : 2;

        // Skip falling_letters and balloon_pop if not enough learned colors
        if ((type === "falling_letters" || type === "balloon_pop") && learnedColors.length < minLearnedColorsNeeded) {
          console.log(`[DEBUG] Skipping ${type} for ${color} - not enough learned colors (${learnedColors.length} < ${minLearnedColorsNeeded})`);
          continue; // Don't increment i, try next type
        }

        // If we get here, we're generating a valid minigame
        i++; // Increment the minigame counter

        let lesson: any;
        if (type === "multiple_choice") {
          // Generate stable choices using lesson's seed for consistency
          const lessonSeed = this.getRandomSeed();
          const choices = this.generateStableChoicesForColor(color, learnedColors, lessonSeed);

          lesson = {
            id: `practice_mc_${color}_${levelId}_${i}`,
            stageId: 4,
            levelId: levelId,
            lessonIndex: lessons.length + colorLessons.length + additionalMinigames.length + 1,
            content: [
              {
                id: `practice_${color.toLowerCase().replace(/\s+/g, '_')}_${i}`,
                word: color,
                videoPath: getVideoPathForColor(color),
                category: "colors" as any,
                difficulty: "easy" as any,
              },
            ],
            config: {
              type: "multiple_choice",
              title: `Practice "${color}"`,
              instructions: `Which color is being signed?`,
              pointsReward: 20,
              experienceReward: 10,
            },
            randomSeed: lessonSeed,
            isCompleted: false,
            score: 0,
            attempts: 0,
            startTime: new Date(),
            title: siargaoTitles[titleIndex % siargaoTitles.length],
            type: "multiple_choice",
            isProgressive: true,
            isIntroduction: false,
            choices: choices,
            correctAnswer: color,
          };
        } else if (type === "falling_letters" || type === "balloon_pop") {
          // Generate falling letters or balloon pop with learned colors
          lesson = {
            id: `practice_${type}_${color}_${levelId}_${i}`,
            stageId: 4,
            levelId: levelId,
            lessonIndex: lessons.length + colorLessons.length + additionalMinigames.length + 1,
            content: [
              {
                id: `practice_${color.toLowerCase().replace(/\s+/g, '_')}_${type}_${i}`,
                word: color,
                videoPath: getVideoPathForColor(color),
                category: "colors" as any,
                difficulty: "easy" as any,
              },
            ],
            config: {
              type: type,
              title: type === "falling_letters"
                ? `Catch the Coconut with "${color}"`
                : `Pop the Coconut with "${color}"`,
              instructions: type === "falling_letters"
                ? `Use the "${color}" sign to catch the falling coconuts!`
                : `Use the "${color}" sign to pop the coconuts!`,
              pointsReward: type === "falling_letters" ? 40 : 45,
              experienceReward: type === "falling_letters" ? 20 : 22,
            },
            randomSeed: this.getRandomSeed(),
            isCompleted: false,
            score: 0,
            attempts: 0,
            startTime: new Date(),
            title: siargaoTitles[titleIndex % siargaoTitles.length],
            type: type,
            isProgressive: true,
            isIntroduction: false,
            correctAnswer: getAITestLetter(color), // AI mapped letter for checking
            learnedContent: [...learnedColors], // Add learned colors for the games
          };
        } else {
          // Generate other minigame types (matching, etc.)
          lesson = {
            id: `practice_${type}_${color}_${levelId}_${i}`,
            stageId: 4,
            levelId: levelId,
            lessonIndex: lessons.length + colorLessons.length + additionalMinigames.length + 1,
            content: [
              {
                id: `practice_${color.toLowerCase().replace(/\s+/g, '_')}_${type}_${i}`,
                word: color,
                videoPath: getVideoPathForColor(color),
                category: "colors" as any,
                difficulty: "easy" as any,
              },
            ],
            config: {
              type: type,
              title: siargaoTitles[titleIndex % siargaoTitles.length],
              instructions: `Practice the color: ${color}`,
              pointsReward: 25,
              experienceReward: 12,
            },
            randomSeed: this.getRandomSeed(),
            isCompleted: false,
            score: 0,
            attempts: 0,
            startTime: new Date(),
            title: siargaoTitles[titleIndex % siargaoTitles.length],
            type: type,
            isProgressive: true,
            isIntroduction: false,
            correctAnswer: getAITestLetter(color), // AI mapped letter for checking
          };
        }

        console.log(`[DEBUG] Generated ${type} lesson for ${color}`);
        additionalMinigames.push(lesson);
      }

      console.log(`[DEBUG] Generated ${additionalMinigames.length} minigames for ${color}`);

      // Add the 2 minigames directly after execute lesson (no randomization)
      colorLessons.push(...additionalMinigames);

      // Add all lessons for this color to main lessons array
      lessons.push(...colorLessons);
    });


    // Update lesson indices to be sequential after all colors are processed
    lessons.forEach((lesson, index) => {
      lesson.lessonIndex = index + 1;
    });

    console.log(`[DEBUG] Final lessons count: ${lessons.length}`);
    console.log(`[DEBUG] Lesson types:`, lessons.map(l => `${l.type} (${l.content?.[0]?.word || 'N/A'})`));

    return lessons;
  }

  // Generate progression for colors - simplified for Video → Execute → 2 minigames pattern
  private static generateColorProgression(stageId: number, levelId: number): string[] {
    // Get learned colors up to current level
    const learnedColors = this.getLearnedColorsUpToLevel(stageId, levelId);
    const matchingEnabled = learnedColors.length >= 3;

    const baseProgression = [
      "multiple_choice",
      "execute",
      "falling_letters",
      "balloon_pop",
      ...(matchingEnabled ? ["matching"] : []),
    ];

    const randomSeed = this.getRandomSeed();

    // Generate enough options for all colors in level (each color needs 2 minigames)
    const currentLevelColors = this.getColorsForLevel(levelId);
    const totalMinigamesNeeded = currentLevelColors.length * 2; // 2 minigames per color
    const progression: string[] = [];

    // Fill progression by cycling through shuffled types
    const shuffled = this.shuffleArray(baseProgression, randomSeed);
    for (let i = 0; i < totalMinigamesNeeded; i++) {
      const typeIndex = i % shuffled.length;
      progression.push(shuffled[typeIndex]);
    }

    return progression;
  }

  // Helper to get colors for a specific level
  private static getColorsForLevel(levelId: number): string[] {
    const LEVEL_COLORS_MAP: { [key: number]: string[] } = {
      1: ['BLUE', 'GREEN', 'RED'],
      2: ['BROWN', 'BLACK', 'WHITE', 'YELLOW'],
      3: ['ORANGE', 'GRAY', 'PINK'],
      4: ['VIOLET', 'LIGHT', 'DARK']
    };
    return LEVEL_COLORS_MAP[levelId] || [];
  }

  // Get colors learned up to a specific level for Stage 4
  private static getLearnedColorsUpToLevel(stageId: number, levelId: number, currentColorIndex: number = 0): string[] {
    const learnedColors: string[] = [];

    // Color mapping for Stage 4 - updated to 4 levels for better pacing
    const LEVEL_COLORS_MAP: { [key: number]: string[] } = {
      1: ['BLUE', 'GREEN', 'RED'],                          // Level 1: Primary Colors (3 colors)
      2: ['BROWN', 'BLACK', 'WHITE', 'YELLOW'],             // Level 2: Basic Colors (4 colors)
      3: ['ORANGE', 'GRAY', 'PINK'],                        // Level 3: Secondary Colors (3 colors)
      4: ['VIOLET', 'LIGHT', 'DARK']                        // Level 4: Advanced Colors (3 colors)
    };

    // Add all colors from previous levels
    for (let level = 1; level < levelId; level++) {
      const levelColors = LEVEL_COLORS_MAP[level] || [];
      learnedColors.push(...levelColors);
    }

    // Add colors from current level up to current color index
    const currentLevelColors = LEVEL_COLORS_MAP[levelId] || [];
    for (let i = 0; i < Math.min(currentColorIndex, currentLevelColors.length); i++) {
      learnedColors.push(currentLevelColors[i]);
    }

    return learnedColors;
  }

  // Generate stable multiple choice options for colors
  private static generateStableChoicesForColor(targetColor: string, learnedColors: string[], seed: number): string[] {
    const choices = [targetColor];

    // All available colors
    const allColors = ['BLUE', 'GREEN', 'RED', 'BROWN', 'BLACK', 'WHITE', 'YELLOW', 'ORANGE', 'GRAY', 'PINK', 'VIOLET', 'LIGHT', 'DARK'];

    // Prefer learned colors as distractors, then use any color
    let availableDistractors = learnedColors.filter(color => color !== targetColor);

    // If not enough learned colors, add from all colors
    if (availableDistractors.length < 3) {
      const remainingColors = allColors.filter(color =>
        color !== targetColor && !availableDistractors.includes(color)
      );
      availableDistractors.push(...remainingColors);
    }

    // Shuffle distractors with seed
    availableDistractors = this.shuffleArray(availableDistractors, seed);

    // Add 3 distractors
    for (let i = 0; i < 3 && i < availableDistractors.length; i++) {
      choices.push(availableDistractors[i]);
    }

    // Ensure we have exactly 4 choices
    while (choices.length < 4) {
      const fallbackColors = allColors.filter(color => !choices.includes(color));
      if (fallbackColors.length > 0) {
        choices.push(fallbackColors[0]);
      } else {
        break;
      }
    }

    // Shuffle the choices using seeded randomization
    return this.shuffleArray(choices, seed + 500);
  }

  // Generate dynamic lesson content for Stage 5 (Family) similar to generateDynamicColorLessons
  static generateDynamicFamilyLessons(
    levelId: number,
    currentLevelFamily: string[],
    getVideoPathForFamily: (familyWord: string) => any,
    getAITestLetter: (familyWord: string) => string
  ): any[] {
    const lessons: any[] = [];

    // Start with level introduction (MANDATORY FIRST LESSON)
    const levelIntroduction = {
      id: `level_intro_${levelId}`,
      stageId: 5,
      levelId: levelId,
      lessonIndex: 1,
      content: [
        {
          id: `intro_level_${levelId}`,
          word: currentLevelFamily.join(", "),
          videoPath: getVideoPathForFamily(currentLevelFamily[0]),
          category: "family" as any,
          difficulty: "easy" as any,
        },
      ],
      config: {
        type: "level_introduction",
        title: `Welcome to Palawan Family Level ${levelId}`,
        instructions: `Get ready to learn family words: ${currentLevelFamily.join(", ")} with tropical Palawan vibes!`,
        pointsReward: 5,
        experienceReward: 3,
      },
      randomSeed: parseInt(`${levelId}000`, 10), // Deterministic seed for level intro
      isCompleted: false,
      score: 0,
      attempts: 0,
      startTime: new Date(),
      title: `Palawan Family Level ${levelId}`,
      type: "level_introduction",
      isProgressive: true,
      isIntroduction: true,
    };
    lessons.push(levelIntroduction);

    // Palawan-themed lesson titles
    const palawanTitles = [
      "Island family time",
      "Beach family gathering",
      "Underwater family photos",
      "Lagoon family picnic",
      "Cliff family adventure",
      "Cave family exploration",
      "Boat family trip",
      "Sunset family bonding",
      "Family island hopping",
      "Tropical family fun",
      "Paradise family moment",
      "Coral family diving",
      "Island family celebration",
      "Beach family stories",
      "Family lagoon discovery",
    ];

    // Get randomized progression for family words (exclude video_learning since we handle it separately)
    const nonVideoProgression = this.generateFamilyProgression(5, levelId);
    let titleIndex = 0;
    let progressionIndex = 0; // Separate index for the minigame progression

    // For each family word, add video lesson and randomized minigames
    currentLevelFamily.forEach((familyWord, familyIndex) => {
      const familyLessons: any[] = [];

      // Add video lesson for this family word
      const videoLesson = {
        id: `video_intro_${familyWord}_${levelId}`,
        stageId: 5,
        levelId: levelId,
        lessonIndex: lessons.length + 1,
        content: [
          {
            id: `${familyWord.toLowerCase().replace(/\s+/g, '_')}_1`,
            word: familyWord,
            videoPath: getVideoPathForFamily(familyWord),
            category: "family" as any,
            difficulty: "easy" as any,
          },
        ],
        config: {
          type: "video_learning",
          title: `This is "${familyWord}"`,
          instructions: `Watch and learn how to sign the family member: ${familyWord}`,
          pointsReward: 10,
          experienceReward: 5,
        },
        randomSeed: this.getRandomSeed(),
        isCompleted: false,
        score: 0,
        attempts: 0,
        startTime: new Date(),
        title: palawanTitles[titleIndex % palawanTitles.length],
        type: "video_learning",
        isProgressive: true,
        isIntroduction: true,
      };
      familyLessons.push(videoLesson);
      titleIndex++; // Increment after video lesson

      // Create execution lesson for this family word (IMMEDIATELY after video)
      const executionLesson = {
        id: `execute_${familyWord}_${levelId}`,
        stageId: 5,
        levelId: levelId,
        lessonIndex: lessons.length + familyLessons.length + 1,
        content: [
          {
            id: `execute_${familyWord.toLowerCase().replace(/\s+/g, '_')}`,
            word: familyWord,
            videoPath: getVideoPathForFamily(familyWord),
            category: "family" as any,
            difficulty: "easy" as any,
          },
        ],
        config: {
          type: "execute",
          title: `Execute "${familyWord}"`,
          instructions: `Show the sign for family member: ${familyWord}`,
          pointsReward: 30,
          experienceReward: 15,
        },
        randomSeed: this.getRandomSeed(),
        isCompleted: false,
        score: 0,
        attempts: 0,
        startTime: new Date(),
        title: palawanTitles[titleIndex % palawanTitles.length],
        type: "execute",
        isProgressive: true,
        isIntroduction: false,
        correctAnswer: getAITestLetter(familyWord), // Map to letter for AI
      };
      familyLessons.push(executionLesson);
      titleIndex++; // Increment after execute lesson

      // Create EXACTLY 2 additional minigames for this family word
      const additionalMinigames: any[] = [];
      const minigamesToAdd = 2;

      console.log(`[DEBUG] Generating minigames for ${familyWord} (familyIndex: ${familyIndex})`);
      console.log(`[DEBUG] nonVideoProgression:`, nonVideoProgression);
      console.log(`[DEBUG] progressionIndex: ${progressionIndex}, length: ${nonVideoProgression.length}`);

      let attempts = 0;
      const maxAttempts = nonVideoProgression.length * 2; // Prevent infinite loops

      for (let i = 0; i < minigamesToAdd && attempts < maxAttempts; attempts++) {
        // Cycle through progression if we reach the end
        const currentProgressionIndex = progressionIndex % nonVideoProgression.length;
        const type = nonVideoProgression[currentProgressionIndex];
        const learnedFamily = this.getLearnedFamilyUpToLevel(5, levelId, familyIndex + 1);

        console.log(`[DEBUG] Trying type: ${type} (attempt ${attempts}), learnedFamily:`, learnedFamily);

        progressionIndex++; // Always increment to avoid getting stuck

        // Skip execute since we already have the execution lesson
        if (type === "execute") {
          console.log(`[DEBUG] Skipping execute for ${familyWord}`);
          continue; // Don't increment i, try next type
        }

        // For the first family word in a level, allow falling_letters and balloon_pop with fewer learned family words
        const isFirstFamily = familyIndex === 0;
        const minLearnedFamilyNeeded = isFirstFamily ? 1 : 2;

        // Skip falling_letters and balloon_pop if not enough learned family words
        if ((type === "falling_letters" || type === "balloon_pop") && learnedFamily.length < minLearnedFamilyNeeded) {
          console.log(`[DEBUG] Skipping ${type} for ${familyWord} - not enough learned family words (${learnedFamily.length} < ${minLearnedFamilyNeeded})`);
          continue; // Don't increment i, try next type
        }

        // If we get here, we're generating a valid minigame
        i++; // Increment the minigame counter

        let lesson: any;
        if (type === "multiple_choice") {
          // Generate stable choices using lesson's seed for consistency
          const lessonSeed = this.getRandomSeed();
          const choices = this.generateStableChoicesForFamily(familyWord, learnedFamily, lessonSeed);

          lesson = {
            id: `practice_mc_${familyWord}_${levelId}_${i}`,
            stageId: 5,
            levelId: levelId,
            lessonIndex: lessons.length + familyLessons.length + additionalMinigames.length + 1,
            content: [
              {
                id: `practice_${familyWord.toLowerCase().replace(/\s+/g, '_')}_${i}`,
                word: familyWord,
                videoPath: getVideoPathForFamily(familyWord),
                category: "family" as any,
                difficulty: "easy" as any,
              },
            ],
            config: {
              type: "multiple_choice",
              title: `Practice "${familyWord}"`,
              instructions: `Which family member is being signed?`,
              pointsReward: 20,
              experienceReward: 10,
            },
            randomSeed: lessonSeed,
            isCompleted: false,
            score: 0,
            attempts: 0,
            startTime: new Date(),
            title: palawanTitles[titleIndex % palawanTitles.length],
            type: "multiple_choice",
            isProgressive: true,
            isIntroduction: false,
            choices: choices,
            correctAnswer: familyWord,
          };
        } else if (type === "falling_letters" || type === "balloon_pop") {
          // Generate falling letters or balloon pop with learned family words
          lesson = {
            id: `practice_${type}_${familyWord}_${levelId}_${i}`,
            stageId: 5,
            levelId: levelId,
            lessonIndex: lessons.length + familyLessons.length + additionalMinigames.length + 1,
            content: [
              {
                id: `practice_${familyWord.toLowerCase().replace(/\s+/g, '_')}_${type}_${i}`,
                word: familyWord,
                videoPath: getVideoPathForFamily(familyWord),
                category: "family" as any,
                difficulty: "easy" as any,
              },
            ],
            config: {
              type: type,
              title: type === "falling_letters"
                ? `Catch the Boat with "${familyWord}"`
                : `Pop the Boat with "${familyWord}"`,
              instructions: type === "falling_letters"
                ? `Use the "${familyWord}" sign to catch the falling boats!`
                : `Use the "${familyWord}" sign to pop the boats!`,
              pointsReward: type === "falling_letters" ? 40 : 45,
              experienceReward: type === "falling_letters" ? 20 : 22,
            },
            randomSeed: this.getRandomSeed(),
            isCompleted: false,
            score: 0,
            attempts: 0,
            startTime: new Date(),
            title: palawanTitles[titleIndex % palawanTitles.length],
            type: type,
            isProgressive: true,
            isIntroduction: false,
            correctAnswer: getAITestLetter(familyWord), // AI mapped letter for checking
            learnedContent: [...learnedFamily], // Add learned family words for the games
          };
        } else {
          // Generate other minigame types (matching, etc.)
          lesson = {
            id: `practice_${type}_${familyWord}_${levelId}_${i}`,
            stageId: 5,
            levelId: levelId,
            lessonIndex: lessons.length + familyLessons.length + additionalMinigames.length + 1,
            content: [
              {
                id: `practice_${familyWord.toLowerCase().replace(/\s+/g, '_')}_${type}_${i}`,
                word: familyWord,
                videoPath: getVideoPathForFamily(familyWord),
                category: "family" as any,
                difficulty: "easy" as any,
              },
            ],
            config: {
              type: type,
              title: palawanTitles[titleIndex % palawanTitles.length],
              instructions: `Practice the family member: ${familyWord}`,
              pointsReward: 25,
              experienceReward: 12,
            },
            randomSeed: this.getRandomSeed(),
            isCompleted: false,
            score: 0,
            attempts: 0,
            startTime: new Date(),
            title: palawanTitles[titleIndex % palawanTitles.length],
            type: type,
            isProgressive: true,
            isIntroduction: false,
            correctAnswer: getAITestLetter(familyWord), // AI mapped letter for checking
          };
        }

        console.log(`[DEBUG] Generated ${type} lesson for ${familyWord}`);
        additionalMinigames.push(lesson);
      }

      console.log(`[DEBUG] Generated ${additionalMinigames.length} minigames for ${familyWord}`);

      // Add the 2 minigames directly after execute lesson (no randomization)
      familyLessons.push(...additionalMinigames);

      // Add all lessons for this family word to main lessons array
      lessons.push(...familyLessons);
    });

    // Update lesson indices to be sequential after all family words are processed
    lessons.forEach((lesson, index) => {
      lesson.lessonIndex = index + 1;
    });

    console.log(`[DEBUG] Final lessons count: ${lessons.length}`);
    console.log(`[DEBUG] Lesson types:`, lessons.map(l => `${l.type} (${l.content?.[0]?.word || 'N/A'})`));

    return lessons;
  }

  // Generate progression for family words - simplified for Video → Execute → 2 minigames pattern
  private static generateFamilyProgression(stageId: number, levelId: number): string[] {
    // Get learned family words up to current level
    const learnedFamily = this.getLearnedFamilyUpToLevel(stageId, levelId);
    const matchingEnabled = learnedFamily.length >= 3;

    const baseProgression = [
      "multiple_choice",
      "execute",
      "falling_letters",
      "balloon_pop",
      ...(matchingEnabled ? ["matching"] : []),
    ];

    const randomSeed = this.getRandomSeed();

    // Generate enough options for all family words in level (each family word needs 2 minigames)
    const currentLevelFamily = this.getFamilyForLevel(levelId);
    const totalMinigamesNeeded = currentLevelFamily.length * 2; // 2 minigames per family word
    const progression: string[] = [];

    // Fill progression by cycling through shuffled types
    const shuffled = this.shuffleArray(baseProgression, randomSeed);
    for (let i = 0; i < totalMinigamesNeeded; i++) {
      const typeIndex = i % shuffled.length;
      progression.push(shuffled[typeIndex]);
    }

    return progression;
  }

  // Helper to get family words for a specific level
  private static getFamilyForLevel(levelId: number): string[] {
    const LEVEL_FAMILY_MAP: { [key: number]: string[] } = {
      1: ['FATHER', 'MOTHER', 'SON', 'DAUGHTER'],
      2: ['GRANDFATHER', 'GRANDMOTHER', 'UNCLE', 'AUNTIE'],
      3: ['COUSIN', 'PARENTS']
    };
    return LEVEL_FAMILY_MAP[levelId] || [];
  }

  // Get family words learned up to a specific level for Stage 5
  private static getLearnedFamilyUpToLevel(stageId: number, levelId: number, currentFamilyIndex: number = 0): string[] {
    const learnedFamily: string[] = [];

    // Family mapping for Stage 5
    const LEVEL_FAMILY_MAP: { [key: number]: string[] } = {
      1: ['FATHER', 'MOTHER', 'SON', 'DAUGHTER'],
      2: ['GRANDFATHER', 'GRANDMOTHER', 'UNCLE', 'AUNTIE'],
      3: ['COUSIN', 'PARENTS']
    };

    // Add all family words from previous levels
    for (let level = 1; level < levelId; level++) {
      const levelFamily = LEVEL_FAMILY_MAP[level] || [];
      learnedFamily.push(...levelFamily);
    }

    // Add family words from current level up to current family word index
    const currentLevelFamily = LEVEL_FAMILY_MAP[levelId] || [];
    for (let i = 0; i < Math.min(currentFamilyIndex, currentLevelFamily.length); i++) {
      learnedFamily.push(currentLevelFamily[i]);
    }

    return learnedFamily;
  }

  // Generate stable multiple choice options for family words
  private static generateStableChoicesForFamily(targetFamily: string, learnedFamily: string[], seed: number): string[] {
    const choices = [targetFamily];

    // All available family words
    const allFamily = ['FATHER', 'MOTHER', 'SON', 'DAUGHTER', 'GRANDFATHER', 'GRANDMOTHER', 'UNCLE', 'AUNTIE', 'COUSIN', 'PARENTS'];

    // Prefer learned family words as distractors, then use any family word
    const availableDistractors = this.shuffleArray(
      learnedFamily.filter(word => word !== targetFamily).concat(
        allFamily.filter(word => word !== targetFamily && !learnedFamily.includes(word))
      ),
      seed
    );

    // Add 3 distractors
    for (let i = 0; i < 3 && i < availableDistractors.length; i++) {
      choices.push(availableDistractors[i]);
    }

    // Ensure we have exactly 4 choices
    while (choices.length < 4) {
      const fallbackFamily = allFamily.filter(word => !choices.includes(word));
      if (fallbackFamily.length > 0) {
        choices.push(fallbackFamily[0]);
      } else {
        break;
      }
    }

    // Shuffle the choices using seeded randomization
    return this.shuffleArray(choices, seed + 500);
  }

  // ============================================
  // STAGE 6: CEBU DAYS LESSON GENERATION
  // ============================================

  /**
   * Generate dynamic lessons for Stage 6 (Cebu - Days)
   * @param levelId - The current level (1, 2, or 3)
   * @param currentLevelDays - Days words for this level
   * @param getVideoPathForDays - Function to get video path for a days word
   * @param getAITestLetter - Function to map days word to letter for AI testing
   * @returns Array of lesson configurations
   */
  static generateDynamicDaysLessons(
    levelId: number,
    currentLevelDays: string[],
    getVideoPathForDays: (daysWord: string) => any,
    getAITestLetter: (daysWord: string) => string
  ): any[] {
    console.log(`[ContentGenerator] Generating days lessons for level ${levelId}`);
    console.log(`[ContentGenerator] Days for this level:`, currentLevelDays);

    const lessons: any[] = [];

    // 1. Level Introduction
    lessons.push({
      title: this.getCebuDaysLevelTitle(levelId),
      config: {
        type: 'level_introduction',
        content: {
          levelId,
          days: currentLevelDays,
        }
      }
    });

    // 2. Progressive learning: Video → Execute → 2 random minigames for each days word
    const daysProgression = this.generateDaysProgression(
      currentLevelDays,
      getVideoPathForDays,
      getAITestLetter
    );
    lessons.push(...daysProgression);

    console.log(`[ContentGenerator] Generated ${lessons.length} total lessons for Cebu Days level ${levelId}`);
    return lessons;
  }

  /**
   * Get Cebu-themed title for each level
   */
  static getCebuDaysLevelTitle(levelId: number): string {
    const titles = [
      "Welcome to Cebu's Weekdays!",           // Level 1
      "More Days in Beautiful Cebu!",          // Level 2
      "Time References in Cebu!",              // Level 3
    ];
    return titles[levelId - 1] || `Cebu Days Level ${levelId}`;
  }

  /**
   * Generate progressive learning sequence for days words
   * For each days word: Video → Execute → 2 random minigames
   */
  static generateDaysProgression(
    daysWords: string[],
    getVideoPathForDays: (daysWord: string) => any,
    getAITestLetter: (daysWord: string) => string
  ): any[] {
    const lessons: any[] = [];
    const allDays: string[] = [];

    daysWords.forEach((daysWord, index) => {
      console.log(`[ContentGenerator] Creating lessons for days word: ${daysWord}`);

      // Add this days word to the learned list
      allDays.push(daysWord);
      const learnedDaysSoFar = [...allDays];

      // 1. Video Learning Lesson
      lessons.push({
        title: `Learn: ${daysWord}`,
        config: {
          type: 'video_learning',
          content: {
            word: daysWord,
            videoSource: getVideoPathForDays(daysWord),
          }
        }
      });

      // 2. Execute Test (AI gesture recognition)
      const aiLetter = getAITestLetter(daysWord);
      lessons.push({
        title: `Practice: ${daysWord}`,
        config: {
          type: 'execute_test',
          content: {
            word: daysWord,
          }
        },
        correctAnswer: aiLetter,
      });

      // 3. Two random minigames
      const minigames = this.getDaysRandomMinigames(
        daysWord,
        learnedDaysSoFar,
        getVideoPathForDays,
        getAITestLetter,
        index
      );
      lessons.push(...minigames);
    });

    return lessons;
  }

  /**
   * Get 2 random minigames for a days word (seeded for consistency)
   */
  static getDaysRandomMinigames(
    daysWord: string,
    learnedDays: string[],
    getVideoPathForDays: (daysWord: string) => any,
    getAITestLetter: (daysWord: string) => string,
    seed: number
  ): any[] {
    // Available minigame types
    const minigameTypes = [
      'falling_letters',
      'balloon_pop',
      'multiple_choice',
      'matching',
      'spelling',
    ];

    // Use seeded shuffle to get consistent random selection
    const shuffled = this.shuffleArray([...minigameTypes], seed);
    const selectedGames = shuffled.slice(0, 2); // Take first 2 after shuffle

    console.log(`[ContentGenerator] Selected minigames for ${daysWord}:`, selectedGames);

    return selectedGames.map((gameType, idx) => {
      const aiLetter = getAITestLetter(daysWord);

      switch (gameType) {
        case 'falling_letters':
          return {
            title: `Catch the Days: ${daysWord}`,
            config: {
              type: 'falling_letters',
              content: {
                word: daysWord,
              }
            },
            correctAnswer: aiLetter,
            learnedContent: learnedDays,
          };

        case 'balloon_pop':
          return {
            title: `Pop the Days: ${daysWord}`,
            config: {
              type: 'balloon_pop',
              content: {
                word: daysWord,
              }
            },
            correctAnswer: aiLetter,
            learnedContent: learnedDays,
          };

        case 'multiple_choice':
          const choices = this.generateDaysChoices(daysWord, learnedDays, seed + idx);
          return {
            title: `Quiz: ${daysWord}`,
            config: {
              type: 'multiple_choice',
              content: {
                word: daysWord,
                videoSource: getVideoPathForDays(daysWord),
              }
            },
            choices,
            correctAnswer: daysWord,
          };

        case 'matching':
          return {
            title: `Match the Days: ${daysWord}`,
            config: {
              type: 'matching',
              content: {
                word: daysWord,
              }
            },
            learnedContent: learnedDays,
          };

        case 'spelling':
          return {
            title: `Spell: ${daysWord}`,
            config: {
              type: 'spelling',
              content: {
                word: daysWord,
              }
            },
            correctAnswer: daysWord,
          };

        default:
          console.warn(`[ContentGenerator] Unknown minigame type: ${gameType}`);
          return null;
      }
    }).filter(Boolean);
  }

  /**
   * Generate 4 multiple choice options for days word quiz
   */
  static generateDaysChoices(
    correctDays: string,
    availableDays: string[],
    seed: number
  ): string[] {
    const choices = [correctDays];

    // All possible days words across all levels
    const allDaysWords = [
      'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY',
      'SATURDAY', 'SUNDAY', 'TODAY', 'TOMORROW', 'YESTERDAY'
    ];

    // Get wrong choices from learned days first
    const learnedWrong = availableDays.filter(d => d !== correctDays);
    const shuffledLearned = this.shuffleArray([...learnedWrong], seed);

    // Add from learned days
    for (let i = 0; i < shuffledLearned.length && choices.length < 4; i++) {
      choices.push(shuffledLearned[i]);
    }

    // If we need more choices, add from all days words
    const fallbackDays = allDaysWords.filter(d => !choices.includes(d));
    const shuffledFallback = this.shuffleArray([...fallbackDays], seed + 100);

    for (let i = 0; i < shuffledFallback.length && choices.length < 4; i++) {
      choices.push(shuffledFallback[i]);
    }

    // If still not enough (edge case), duplicate the correct answer
    while (choices.length < 4) {
      if (fallbackDays.length > 0) {
        choices.push(fallbackDays[0]);
      } else {
        break;
      }
    }

    // Shuffle the choices using seeded randomization
    return this.shuffleArray(choices, seed + 500);
  }

  // ============================================
  // STAGE 7: BOHOL MONTHS LESSON GENERATION
  // ============================================

  /**
   * Generate dynamic lessons for Stage 7 (Bohol - Months)
   * @param levelId - The current level (1, 2, 3, or 4)
   * @param currentLevelMonths - Months words for this level
   * @param getVideoPathForMonths - Function to get video path for a months word
   * @param getAITestLetter - Function to map months word to letter for AI testing
   * @returns Array of lesson configurations
   */
  static generateDynamicMonthsLessons(
    levelId: number,
    currentLevelMonths: string[],
    getVideoPathForMonths: (monthsWord: string) => any,
    getAITestLetter: (monthsWord: string) => string
  ): any[] {
    console.log(`[ContentGenerator] Generating months lessons for level ${levelId}`);
    console.log(`[ContentGenerator] Months for this level:`, currentLevelMonths);

    const lessons: any[] = [];

    // 1. Level Introduction
    lessons.push({
      title: this.getBoholMonthsLevelTitle(levelId),
      config: {
        type: 'level_introduction',
        content: {
          levelId,
          months: currentLevelMonths,
        }
      }
    });

    // 2. Progressive learning: Video → Execute → 2 random minigames for each months word
    const monthsProgression = this.generateMonthsProgression(
      currentLevelMonths,
      getVideoPathForMonths,
      getAITestLetter
    );
    lessons.push(...monthsProgression);

    console.log(`[ContentGenerator] Generated ${lessons.length} total lessons for Bohol Months level ${levelId}`);
    return lessons;
  }

  /**
   * Get Bohol-themed title for each level
   */
  static getBoholMonthsLevelTitle(levelId: number): string {
    const titles = [
      "Welcome to Bohol's First Quarter!",      // Level 1: Jan-Mar
      "Bohol's Second Quarter Journey!",        // Level 2: Apr-Jun
      "Explore Bohol's Third Quarter!",         // Level 3: Jul-Sep
      "Complete the Year in Bohol!",            // Level 4: Oct-Dec
    ];
    return titles[levelId - 1] || `Bohol Months Level ${levelId}`;
  }

  /**
   * Generate progressive learning sequence for months words
   * For each months word: Video → Execute → 2 random minigames
   */
  static generateMonthsProgression(
    monthsWords: string[],
    getVideoPathForMonths: (monthsWord: string) => any,
    getAITestLetter: (monthsWord: string) => string
  ): any[] {
    const lessons: any[] = [];
    const allMonths: string[] = [];

    monthsWords.forEach((monthsWord, index) => {
      console.log(`[ContentGenerator] Creating lessons for months word: ${monthsWord}`);

      // Add this months word to the learned list
      allMonths.push(monthsWord);
      const learnedMonthsSoFar = [...allMonths];

      // 1. Video Learning Lesson
      lessons.push({
        title: `Learn: ${monthsWord}`,
        config: {
          type: 'video_learning',
          content: {
            word: monthsWord,
            videoSource: getVideoPathForMonths(monthsWord),
          }
        }
      });

      // 2. Execute Test (AI gesture recognition)
      const aiLetter = getAITestLetter(monthsWord);
      lessons.push({
        title: `Practice: ${monthsWord}`,
        config: {
          type: 'execute_test',
          content: {
            word: monthsWord,
          }
        },
        correctAnswer: aiLetter,
      });

      // 3. Two random minigames
      const minigames = this.getMonthsRandomMinigames(
        monthsWord,
        learnedMonthsSoFar,
        getVideoPathForMonths,
        getAITestLetter,
        index
      );
      lessons.push(...minigames);
    });

    return lessons;
  }

  /**
   * Get 2 random minigames for a months word (seeded for consistency)
   */
  static getMonthsRandomMinigames(
    monthsWord: string,
    learnedMonths: string[],
    getVideoPathForMonths: (monthsWord: string) => any,
    getAITestLetter: (monthsWord: string) => string,
    seed: number
  ): any[] {
    // Available minigame types
    const minigameTypes = [
      'falling_letters',
      'balloon_pop',
      'multiple_choice',
      'matching',
      'spelling',
    ];

    // Use seeded shuffle to get consistent random selection
    const shuffled = this.shuffleArray([...minigameTypes], seed);
    const selectedGames = shuffled.slice(0, 2); // Take first 2 after shuffle

    console.log(`[ContentGenerator] Selected minigames for ${monthsWord}:`, selectedGames);

    return selectedGames.map((gameType, idx) => {
      const aiLetter = getAITestLetter(monthsWord);

      switch (gameType) {
        case 'falling_letters':
          return {
            title: `Catch the Months: ${monthsWord}`,
            config: {
              type: 'falling_letters',
              content: {
                word: monthsWord,
              }
            },
            correctAnswer: aiLetter,
            learnedContent: learnedMonths,
          };

        case 'balloon_pop':
          return {
            title: `Pop the Months: ${monthsWord}`,
            config: {
              type: 'balloon_pop',
              content: {
                word: monthsWord,
              }
            },
            correctAnswer: aiLetter,
            learnedContent: learnedMonths,
          };

        case 'multiple_choice':
          const choices = this.generateMonthsChoices(monthsWord, learnedMonths, seed + idx);
          return {
            title: `Quiz: ${monthsWord}`,
            config: {
              type: 'multiple_choice',
              content: {
                word: monthsWord,
                videoSource: getVideoPathForMonths(monthsWord),
              }
            },
            choices,
            correctAnswer: monthsWord,
          };

        case 'matching':
          return {
            title: `Match the Months: ${monthsWord}`,
            config: {
              type: 'matching',
              content: {
                word: monthsWord,
              }
            },
            learnedContent: learnedMonths,
          };

        case 'spelling':
          return {
            title: `Spell: ${monthsWord}`,
            config: {
              type: 'spelling',
              content: {
                word: monthsWord,
              }
            },
            correctAnswer: monthsWord,
          };

        default:
          console.warn(`[ContentGenerator] Unknown minigame type: ${gameType}`);
          return null;
      }
    }).filter(Boolean);
  }

  /**
   * Generate 4 multiple choice options for months word quiz
   */
  static generateMonthsChoices(
    correctMonths: string,
    availableMonths: string[],
    seed: number
  ): string[] {
    const choices = [correctMonths];

    // All possible months words across all levels
    const allMonthsWords = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];

    // Get wrong choices from learned months first
    const learnedWrong = availableMonths.filter(m => m !== correctMonths);
    const shuffledLearned = this.shuffleArray([...learnedWrong], seed);

    // Add from learned months
    for (let i = 0; i < shuffledLearned.length && choices.length < 4; i++) {
      choices.push(shuffledLearned[i]);
    }

    // If we need more choices, add from all months words
    const fallbackMonths = allMonthsWords.filter(m => !choices.includes(m));
    const shuffledFallback = this.shuffleArray([...fallbackMonths], seed + 100);

    for (let i = 0; i < shuffledFallback.length && choices.length < 4; i++) {
      choices.push(shuffledFallback[i]);
    }

    // If still not enough (edge case), duplicate the correct answer
    while (choices.length < 4) {
      if (fallbackMonths.length > 0) {
        choices.push(fallbackMonths[0]);
      } else {
        break;
      }
    }

    // Shuffle the choices using seeded randomization
    return this.shuffleArray(choices, seed + 500);
  }
}
