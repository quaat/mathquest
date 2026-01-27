import { describe, expect, it, vi, afterEach } from 'vitest';
import { calculateScore, generateQuestion } from '../services/gameLogic';

describe('gameLogic', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('calculateScore', () => {
    it('returns 0 for incorrect answers', () => {
      expect(calculateScore(false, 50, 3, 'Beginner')).toBe(0);
    });

    it('scales by difficulty, time bonus, and streak multiplier', () => {
      const score = calculateScore(true, 5, 10, 'Advanced');
      // Base 200 + time bonus (10) = 210, streak 10 => 3x
      expect(score).toBe(630);
    });

    it('caps the streak multiplier at 5x', () => {
      const score = calculateScore(true, 0, 30, 'Expert');
      // Base 300 + time bonus (0) = 300, streak 30 => 5x
      expect(score).toBe(1500);
    });
  });

  describe('generateQuestion', () => {
    it('uses boss tables and tougher factor ranges', () => {
      const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => 0.1);
      randomSpy
        .mockReturnValueOnce(0) // factorA -> first table
        .mockReturnValueOnce(0) // factorB -> min
        .mockReturnValueOnce(0.1); // roll -> standard

      const question = generateQuestion('Beginner', 'boss');

      expect([7, 8, 9, 11, 12, 13, 14, 15]).toContain(question.factorA);
      expect(question.factorB).toBeGreaterThanOrEqual(6);
      expect(question.factorB).toBeLessThanOrEqual(15);
      expect(question.type).toBe('standard');
      expect(question.answer).toBe(question.factorA * question.factorB);
      expect(question.textDisplay).toBe(`${question.factorA} × ${question.factorB} = ?`);
      expect(question.hint).toBe(`Add ${question.factorA} to itself ${question.factorB} times.`);
    });

    it('generates a reverse question when RNG exceeds the threshold', () => {
      const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => 0.1);
      randomSpy
        .mockReturnValueOnce(0) // factorA -> first table
        .mockReturnValueOnce(0) // factorB -> 1
        .mockReturnValueOnce(0.9); // reverse type

      const question = generateQuestion('Advanced', 'journey');

      expect(question.type).toBe('reverse');
      expect(question.textDisplay).toBe('1 ÷ 1 = ?');
      expect(question.answer).toBe(1);
      expect(question.hint).toBe('Think: 1 x ? = 1');
    });

    it('generates a missing-factor question when RNG is in range', () => {
      const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => 0.1);
      randomSpy
        .mockReturnValueOnce(0) // factorA -> first table
        .mockReturnValueOnce(0) // factorB -> 1
        .mockReturnValueOnce(0.5) // reverse check => false
        .mockReturnValueOnce(0.65) // missing type
        .mockReturnValueOnce(0.6); // missingFactorA => true

      const question = generateQuestion('Advanced', 'journey');

      expect(question.type).toBe('missing');
      expect(question.textDisplay).toBe('? × 1 = 1');
      expect(question.answer).toBe(1);
      expect(question.hint).toBe('Count by 1s until you reach 1');
    });
  });
});
