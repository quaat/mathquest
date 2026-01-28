import { describe, expect, it } from 'vitest';
import { calculateScore } from '../../services/gameLogic';

describe('scoring', () => {
  it('returns 0 for incorrect answers regardless of inputs', () => {
    expect(calculateScore(false, 99, 10, 'Beginner')).toBe(0);
    expect(calculateScore(false, 0, 0, 'Expert')).toBe(0);
  });

  it('uses the correct base points per difficulty', () => {
    expect(calculateScore(true, 0, 0, 'Beginner')).toBe(100);
    expect(calculateScore(true, 0, 0, 'Intermediate')).toBe(150);
    expect(calculateScore(true, 0, 0, 'Advanced')).toBe(200);
    expect(calculateScore(true, 0, 0, 'Expert')).toBe(300);
  });

  it('adds a time bonus based on remaining time', () => {
    const score = calculateScore(true, 1, 0, 'Beginner');
    expect(score).toBe(102);
  });

  it('scales the multiplier every 5 streaks and caps at 5x', () => {
    expect(calculateScore(true, 0, 0, 'Beginner')).toBe(100);
    expect(calculateScore(true, 0, 4, 'Beginner')).toBe(100);
    expect(calculateScore(true, 0, 5, 'Beginner')).toBe(200);
    expect(calculateScore(true, 0, 9, 'Beginner')).toBe(200);
    expect(calculateScore(true, 0, 10, 'Beginner')).toBe(300);
    expect(calculateScore(true, 0, 20, 'Beginner')).toBe(500);
    expect(calculateScore(true, 0, 30, 'Beginner')).toBe(500);
  });

  it('returns NaN when timeLeft is not a number', () => {
    const score = calculateScore(true, Number.NaN, 0, 'Beginner');
    expect(Number.isNaN(score)).toBe(true);
  });

  it('allows negative time bonuses when timeLeft is negative', () => {
    const score = calculateScore(true, -1, 0, 'Beginner');
    expect(score).toBe(98);
  });
});
