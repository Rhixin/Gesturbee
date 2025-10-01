export interface MinigameContent {
  id: string;
  word: string;
  videoPath?: string;
  imagePath?: string;
  category: MinigameCategory;
  difficulty: MinigameDifficulty;
}

export type MinigameCategory =
  | 'alphabets'
  | 'numbers'
  | 'greetings'
  | 'colors'
  | 'questions'
  | 'days'
  | 'months';

export type MinigameDifficulty = 'easy' | 'medium' | 'hard';

export type MinigameType =
  | 'video_learning'
  | 'multiple_choice'
  | 'gesture_recognition'
  | 'spelling'
  | 'matching'
  | 'falling_letters'
  | 'balloon_pop'
  | 'memory_cards'
  | 'sequence_builder'
  | 'level_introduction';

export interface MinigameConfig {
  type: MinigameType;
  title: string;
  instructions: string;
  timeLimit?: number;
  maxAttempts?: number;
  pointsReward: number;
  experienceReward: number;
}

export interface MinigameSession {
  id: string;
  stageId: number;
  levelId: number;
  lessonIndex: number;
  content: MinigameContent[];
  config: MinigameConfig;
  randomSeed: number;
  isCompleted: boolean;
  score: number;
  attempts: number;
  startTime: Date;
  completionTime?: Date;
}

export interface MinigameResult {
  success: boolean;
  score: number;
  timeSpent: number;
  attempts: number;
  perfectScore: boolean;
}

export interface FallingLettersConfig extends MinigameConfig {
  fallSpeed: number;
  spawnRate: number;
  correctLetters: string[];
  distractorLetters: string[];
}

export interface MatchingGameConfig extends MinigameConfig {
  pairs: Array<{
    id: string;
    word: string;
    videoPath: string;
    imagePath?: string;
  }>;
  gridSize: number;
}

export interface MemoryCardsConfig extends MinigameConfig {
  cards: Array<{
    id: string;
    word: string;
    videoPath: string;
    imagePath?: string;
  }>;
  gridRows: number;
  gridCols: number;
  revealTime: number;
}

export interface BalloonPopConfig extends MinigameConfig {
  totalBalloons: number;
  timeLimit: number;
  learnedLetters: string[];
  balloonImages: string[];
}