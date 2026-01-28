import { describe, expect, it, vi } from 'vitest';
import { gameReducer } from '../../context/GameContext';
import { LEVEL_XP_BASE } from '../../constants';
import { UserStats } from '../../types';

vi.mock('../../services/storage', () => ({
  loadUserStats: vi.fn(() => ({
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
  })),
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

const createState = (overrides: Partial<UserStats> = {}) => ({
  user: createUser(overrides),
  achievedThisSession: [],
  themesUnlockedThisSession: [],
});

describe('progression and leveling', () => {
  it('increments XP and levels up across multiple thresholds', () => {
    const state = createState({ xp: LEVEL_XP_BASE - 10, level: 1 });
    const nextState = gameReducer(state, { type: 'ADD_XP', payload: LEVEL_XP_BASE * 2 });

    expect(nextState.user.xp).toBe(LEVEL_XP_BASE * 2 + LEVEL_XP_BASE - 10);
    expect(nextState.user.level).toBe(3);
  });

  it('updates mastery on correct and incorrect answers with clamping', () => {
    const start = createState({ mastery: { 7: 98 } });
    const correctState = gameReducer(start, {
      type: 'UPDATE_MASTERY',
      payload: { table: 7, correct: true },
    });
    expect(correctState.user.mastery[7]).toBe(100);

    const wrongState = gameReducer(
      { ...correctState, achievedThisSession: [], themesUnlockedThisSession: [] },
      { type: 'UPDATE_MASTERY', payload: { table: 7, correct: false } }
    );
    expect(wrongState.user.mastery[7]).toBe(98);

    const floorState = gameReducer(createState({ mastery: { 5: 1 } }), {
      type: 'UPDATE_MASTERY',
      payload: { table: 5, correct: false },
    });
    expect(floorState.user.mastery[5]).toBe(0);
  });

  it('unlocks themes based on level and total questions', () => {
    const levelState = gameReducer(createState({ xp: LEVEL_XP_BASE * 2 - 1, level: 2 }), {
      type: 'ADD_XP',
      payload: 1,
    });
    expect(levelState.user.unlockedThemes).toContain('ocean');
    expect(levelState.themesUnlockedThisSession).toContain('ocean');

    const spaceState = gameReducer(createState({ totalQuestionsAnswered: 99 }), {
      type: 'COMPLETE_GAME',
      payload: { correct: 1, total: 1, bestStreak: 1, mode: 'journey' },
    });
    expect(spaceState.user.unlockedThemes).toContain('space');
    expect(spaceState.themesUnlockedThisSession).toContain('space');
  });

  it('only allows setting a theme once unlocked', () => {
    const state = createState({ theme: 'jungle', unlockedThemes: ['jungle'] });
    const unchanged = gameReducer(state, { type: 'SET_THEME', payload: 'space' });
    expect(unchanged.user.theme).toBe('jungle');

    const unlocked = gameReducer(
      createState({ theme: 'jungle', unlockedThemes: ['jungle', 'space'] }),
      { type: 'SET_THEME', payload: 'space' }
    );
    expect(unlocked.user.theme).toBe('space');
  });

  it('resets progress while keeping defaults from storage', () => {
    const state = createState({ xp: 250, mastery: { 7: 80 }, badges: ['first_steps'] });
    const nextState = gameReducer(state, { type: 'RESET_PROGRESS' });

    expect(nextState.user.xp).toBe(0);
    expect(nextState.user.mastery).toEqual({});
    expect(nextState.user.badges).toEqual([]);
    expect(nextState.user.theme).toBe('jungle');
  });
});
