import { describe, expect, it } from 'vitest';
import { DIFFICULTY_RULES } from '../../constants';

describe('DIFFICULTY_RULES', () => {
  it('defines valid ranges for each difficulty', () => {
    Object.values(DIFFICULTY_RULES).forEach((rule) => {
      expect(rule.range.min).toBeGreaterThan(0);
      expect(rule.range.max).toBeGreaterThanOrEqual(rule.range.min);
      expect(rule.timeLimit).toBeGreaterThan(0);
    });
  });

  it('enforces operation availability per difficulty', () => {
    expect(DIFFICULTY_RULES.Beginner.operations.div).toBe(0);
    expect(DIFFICULTY_RULES.Intermediate.operations.div).toBe(0);
    expect(DIFFICULTY_RULES.Advanced.operations.div).toBeGreaterThan(0);
    expect(DIFFICULTY_RULES.Expert.operations.div).toBeGreaterThan(0);
  });

  it('provides user-facing labels for each difficulty', () => {
    Object.values(DIFFICULTY_RULES).forEach((rule) => {
      expect(rule.label.length).toBeGreaterThan(0);
    });
  });
});
