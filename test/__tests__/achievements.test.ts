import { describe, expect, it, vi } from 'vitest';
import { gameReducer } from '../../context/GameContext';
import { UserStats } from '../../types';
import { mockDate } from '../utils/testUtils';

vi.mock('../../services/storage', () => ({
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

const createState = (overrides: Partial<UserStats> = {}) => ({
  user: createUser(overrides),
  achievedThisSession: [],
  themesUnlockedThisSession: [],
});

describe('achievements', () => {
  it('awards first_steps on the first completed game', () => {
    const nextState = gameReducer(createState(), {
      type: 'COMPLETE_GAME',
      payload: { correct: 1, total: 2, bestStreak: 3, mode: 'journey' },
    });

    expect(nextState.user.badges).toContain('first_steps');
    expect(nextState.achievedThisSession.map((ach) => ach.id)).toEqual(['first_steps']);
  });

  it('awards streak_starter when streak record reaches 10', () => {
    const nextState = gameReducer(createState(), {
      type: 'COMPLETE_GAME',
      payload: { correct: 10, total: 10, bestStreak: 10, mode: 'journey' },
    });

    expect(nextState.user.streakRecord).toBe(10);
    expect(nextState.user.badges).toContain('streak_starter');
  });

  it('awards table_tamer_7 when mastery for 7 reaches 100', () => {
    const nextState = gameReducer(createState({ mastery: { 7: 95 } }), {
      type: 'UPDATE_MASTERY',
      payload: { table: 7, correct: true },
    });

    expect(nextState.user.mastery[7]).toBe(100);
    expect(nextState.user.badges).toContain('table_tamer_7');
  });

  it('awards speed_demon when total correct reaches 500', () => {
    const nextState = gameReducer(createState({ totalCorrect: 499 }), {
      type: 'COMPLETE_GAME',
      payload: { correct: 1, total: 1, bestStreak: 1, mode: 'journey' },
    });

    expect(nextState.user.totalCorrect).toBe(500);
    expect(nextState.user.badges).toContain('speed_demon');
  });

  it('awards daily_devotee after a 3-day daily streak', () => {
    mockDate('2026-01-01T10:00:00Z');
    const state = createState({ dailyStreak: 2, lastDailyChallenge: '2025-12-31' });
    const nextState = gameReducer(state, {
      type: 'COMPLETE_GAME',
      payload: { correct: 5, total: 5, bestStreak: 3, mode: 'daily' },
    });

    expect(nextState.user.dailyStreak).toBe(3);
    expect(nextState.user.badges).toContain('daily_devotee');
    expect(nextState.achievedThisSession.map((ach) => ach.id)).toContain('daily_devotee');
  });

  it('does not re-award achievements already unlocked', () => {
    const state = createState({ badges: ['first_steps'] });
    const nextState = gameReducer(state, {
      type: 'COMPLETE_GAME',
      payload: { correct: 2, total: 2, bestStreak: 2, mode: 'journey' },
    });

    expect(nextState.achievedThisSession).toEqual([]);
    expect(nextState.user.badges.filter((id) => id === 'first_steps')).toHaveLength(1);
  });

  it('does not increment daily streak on the same day', () => {
    mockDate('2026-01-02T10:00:00Z');
    const state = createState({ dailyStreak: 2, lastDailyChallenge: '2026-01-02' });
    const nextState = gameReducer(state, {
      type: 'COMPLETE_GAME',
      payload: { correct: 5, total: 5, bestStreak: 3, mode: 'daily' },
    });

    expect(nextState.user.dailyStreak).toBe(2);
    expect(nextState.user.badges).not.toContain('daily_devotee');
  });
});
