export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type GameModeId = 'sprint' | 'journey' | 'chill' | 'boss' | 'daily';
export type Operation = 'mul' | 'div';

export interface UserStats {
  xp: number;
  level: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  streakRecord: number;
  mastery: Record<number, number>; // Table number (1-12) -> Mastery Score (0-100)
  badges: string[];
  lastDailyChallenge?: string; // ISO Date string (YYYY-MM-DD)
  dailyStreak: number;
  theme: string;
  unlockedThemes: string[];
}

export interface Question {
  id: string;
  type: 'standard' | 'missing' | 'reverse';
  operation: Operation;
  a: number;
  b: number;
  prompt: string;
  factorA: number;
  factorB: number;
  answer: number;
  options?: number[]; // For multiple choice if we used it, currently typed
  textDisplay: string; // "7 x 8 = ?"
  hint: string;
}

export interface GameSession {
  isActive: boolean;
  mode: GameModeId;
  difficulty: Difficulty;
  score: number;
  currentStreak: number;
  multiplier: number;
  questionsAnswered: number;
  correctCount: number;
  startTime: number;
  timeLeft: number; // in seconds
  history: { question: Question; userAnswer: number; isCorrect: boolean; timeTaken: number }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: UserStats, session?: GameSession) => boolean;
}

export interface Theme {
  id: string;
  name: string;
  description: string; // Description for UI
  unlockDescription: string; // How to unlock
  colors: {
    bg: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  unlockCondition: (stats: UserStats) => boolean;
}
