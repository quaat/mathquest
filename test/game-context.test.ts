import { describe, expect, it, vi } from 'vitest';
import { gameReducer } from '../context/GameContext';
import { LEVEL_XP_BASE } from '../constants';
import { UserStats } from '../types';

vi.mock('../services/storage', () => ({
  loadUserStats: vi.fn(),
  saveUserStats: vi.fn(),
}));

const createUser = (overrides: Partial<UserStats> = {}): UserStats => ({
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
  ...overrides,
});

describe('gameReducer', () => {
  it('unlocks the ocean theme when reaching level 3', () => {
    const state = {
      user: createUser({ xp: LEVEL_XP_BASE * 2 - 100, level: 2 }),
      achievedThisSession: [],
      themesUnlockedThisSession: [],
    };

    const nextState = gameReducer(state, { type: 'ADD_XP', payload: 200 });

    expect(nextState.user.level).toBe(3);
    expect(nextState.user.unlockedThemes).toContain('ocean');
    expect(nextState.themesUnlockedThisSession).toEqual(['ocean']);
  });

  it('awards the first_steps achievement on the first completed game', () => {
    const state = {
      user: createUser(),
      achievedThisSession: [],
      themesUnlockedThisSession: [],
    };

    const nextState = gameReducer(state, {
      type: 'COMPLETE_GAME',
      payload: { correct: 1, total: 2, bestStreak: 3, mode: 'journey' },
    });

    expect(nextState.user.totalQuestionsAnswered).toBe(2);
    expect(nextState.user.badges).toContain('first_steps');
    expect(nextState.achievedThisSession.map((ach) => ach.id)).toEqual(['first_steps']);
  });
});
