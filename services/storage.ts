import { UserStats } from '../types';

const STORAGE_KEY = 'mathquest_user_v1';

const INITIAL_STATS: UserStats = {
  xp: 0,
  level: 1,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  streakRecord: 0,
  mastery: {},
  badges: [],
  theme: 'jungle',
  unlockedThemes: ['jungle'],
  dailyStreak: 0,
};

export const loadUserStats = (): UserStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Merge with initial stats to ensure new fields (like unlockedThemes) are present if loading old save
      return { ...INITIAL_STATS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load save", e);
  }
  return INITIAL_STATS;
};

export const saveUserStats = (stats: UserStats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save progress", e);
  }
};