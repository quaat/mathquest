import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { UserStats, Achievement, GameModeId } from '../types';
import { loadUserStats, saveUserStats } from '../services/storage';
import { ACHIEVEMENTS, THEMES, LEVEL_XP_BASE } from '../constants';

type Action = 
  | { type: 'ADD_XP'; payload: number }
  | { type: 'UPDATE_MASTERY'; payload: { table: number; correct: boolean } }
  | { type: 'COMPLETE_GAME'; payload: { correct: number; total: number; bestStreak: number; mode: GameModeId } }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'RESET_PROGRESS' };

interface GameState {
  user: UserStats;
  achievedThisSession: Achievement[];
  themesUnlockedThisSession: string[];
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// Helper to check for new unlocks (badges or themes)
const checkUnlocks = (user: UserStats): { user: UserStats; newBadges: Achievement[]; newThemes: string[] } => {
  const newUser = { ...user };
  const newBadges: Achievement[] = [];
  const newThemes: string[] = [];

  // Check Achievements
  ACHIEVEMENTS.forEach(ach => {
    if (!newUser.badges.includes(ach.id) && ach.condition(newUser)) {
      newUser.badges = [...newUser.badges, ach.id];
      newBadges.push(ach);
    }
  });

  // Check Themes
  Object.values(THEMES).forEach(theme => {
    if (!newUser.unlockedThemes.includes(theme.id) && theme.unlockCondition(newUser)) {
      newUser.unlockedThemes = [...newUser.unlockedThemes, theme.id];
      newThemes.push(theme.id);
    }
  });

  return { user: newUser, newBadges, newThemes };
};

export const gameReducer = (state: GameState, action: Action): GameState => {
  let newState = { ...state, achievedThisSession: [], themesUnlockedThisSession: [] };

  switch (action.type) {
    case 'ADD_XP': {
      const newXp = state.user.xp + action.payload;
      const newLevel = Math.floor(newXp / LEVEL_XP_BASE) + 1;
      newState.user = { ...state.user, xp: newXp, level: newLevel };
      break;
    }
    case 'UPDATE_MASTERY': {
      const { table, correct } = action.payload;
      const current = state.user.mastery[table] || 0;
      // Increment 5% for correct, decrement 2% for wrong, clamp 0-100
      const change = correct ? 5 : -2;
      const newMastery = Math.min(100, Math.max(0, current + change));
      newState.user = {
        ...state.user,
        mastery: { ...state.user.mastery, [table]: newMastery },
      };
      break;
    }
    case 'COMPLETE_GAME': {
      const { correct, total, bestStreak, mode } = action.payload;
      
      let updatedUser = {
        ...state.user,
        totalCorrect: state.user.totalCorrect + correct,
        totalQuestionsAnswered: state.user.totalQuestionsAnswered + total,
        streakRecord: Math.max(state.user.streakRecord, bestStreak),
      };

      // Handle Daily Challenge Logic
      if (mode === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        if (updatedUser.lastDailyChallenge !== today) {
          updatedUser.lastDailyChallenge = today;
          updatedUser.dailyStreak = (updatedUser.dailyStreak || 0) + 1;
        }
      }

      newState.user = updatedUser;
      break;
    }
    case 'SET_THEME':
      if (state.user.unlockedThemes.includes(action.payload)) {
        newState.user = { ...state.user, theme: action.payload };
      }
      break;
    case 'RESET_PROGRESS':
      newState.user = loadUserStats(); // Reload default/empty
      newState.user.xp = 0; // Force reset
      newState.user.mastery = {};
      break;
    default:
      return state;
  }
  
  // Run global unlock checks after any state update
  const { user, newBadges, newThemes } = checkUnlocks(newState.user);
  newState.user = user;
  newState.achievedThisSession = newBadges;
  newState.themesUnlockedThisSession = newThemes;

  saveUserStats(newState.user);
  return newState;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, {
    user: loadUserStats(),
    achievedThisSession: [],
    themesUnlockedThisSession: [],
  });

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};
