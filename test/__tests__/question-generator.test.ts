import { describe, expect, it, vi } from 'vitest';
import { generateQuestion } from '../../services/gameLogic';
import { DIFFICULTY_RULES } from '../../constants';
import { createSeededRandom, mockRngSequence } from '../utils/testUtils';

describe('question generator', () => {
  const assertFactorRange = (question: ReturnType<typeof generateQuestion>, min: number, max: number) => {
    expect(question.factorA).toBeGreaterThanOrEqual(min);
    expect(question.factorA).toBeLessThanOrEqual(max);
    expect(question.factorB).toBeGreaterThanOrEqual(min);
    expect(question.factorB).toBeLessThanOrEqual(max);
  };

  it('enforces beginner constraints across 1000 questions', () => {
    const rng = createSeededRandom(123);
    vi.spyOn(Math, 'random').mockImplementation(rng);

    const { range } = DIFFICULTY_RULES.Beginner;
    let divisionCount = 0;

    for (let i = 0; i < 1000; i += 1) {
      const question = generateQuestion('Beginner', 'journey');
      assertFactorRange(question, range.min, range.max);
      expect(question.operation).toBe('mul');
      expect(question.a).toBeGreaterThanOrEqual(range.min);
      expect(question.a).toBeLessThanOrEqual(range.max);
      expect(question.b).toBeGreaterThanOrEqual(range.min);
      expect(question.b).toBeLessThanOrEqual(range.max);
      if (question.operation === 'div') divisionCount += 1;
    }

    expect(divisionCount).toBe(0);
  });

  it('enforces intermediate constraints across 1000 questions', () => {
    const rng = createSeededRandom(456);
    vi.spyOn(Math, 'random').mockImplementation(rng);

    const { range } = DIFFICULTY_RULES.Intermediate;
    let divisionCount = 0;

    for (let i = 0; i < 1000; i += 1) {
      const question = generateQuestion('Intermediate', 'journey');
      assertFactorRange(question, range.min, range.max);
      expect(question.operation).toBe('mul');
      expect(question.a).toBeGreaterThanOrEqual(range.min);
      expect(question.a).toBeLessThanOrEqual(range.max);
      expect(question.b).toBeGreaterThanOrEqual(range.min);
      expect(question.b).toBeLessThanOrEqual(range.max);
      if (question.operation === 'div') divisionCount += 1;
    }

    expect(divisionCount).toBe(0);
  });

  it('includes division for advanced and keeps values within bounds', () => {
    const rng = createSeededRandom(789);
    vi.spyOn(Math, 'random').mockImplementation(rng);

    const { range } = DIFFICULTY_RULES.Advanced;
    let divisionCount = 0;
    let multiplicationCount = 0;

    for (let i = 0; i < 1000; i += 1) {
      const question = generateQuestion('Advanced', 'journey');
      assertFactorRange(question, range.min, range.max);

      if (question.operation === 'div') {
        divisionCount += 1;
        expect(question.a).toBeLessThanOrEqual(range.max * range.max);
        expect(question.b).toBeGreaterThanOrEqual(range.min);
        expect(question.b).toBeLessThanOrEqual(range.max);
        expect(question.b).not.toBe(0);
        expect(question.a % question.b).toBe(0);
        expect(question.answer).toBe(question.a / question.b);
      } else {
        multiplicationCount += 1;
        expect(question.a).toBeGreaterThanOrEqual(range.min);
        expect(question.a).toBeLessThanOrEqual(range.max);
        expect(question.b).toBeGreaterThanOrEqual(range.min);
        expect(question.b).toBeLessThanOrEqual(range.max);
      }
    }

    expect(divisionCount).toBeGreaterThan(300);
    expect(divisionCount).toBeLessThan(600);
    expect(multiplicationCount).toBeGreaterThan(0);
  });

  it('makes expert division-heavy with valid operands', () => {
    const rng = createSeededRandom(1011);
    vi.spyOn(Math, 'random').mockImplementation(rng);

    const { range } = DIFFICULTY_RULES.Expert;
    let divisionCount = 0;
    let multiplicationCount = 0;

    for (let i = 0; i < 1000; i += 1) {
      const question = generateQuestion('Expert', 'journey');
      assertFactorRange(question, range.min, range.max);

      if (question.operation === 'div') {
        divisionCount += 1;
        expect(question.a).toBeLessThanOrEqual(range.max * range.max);
        expect(question.b).toBeGreaterThanOrEqual(range.min);
        expect(question.b).toBeLessThanOrEqual(range.max);
        expect(question.b).not.toBe(0);
        expect(question.a % question.b).toBe(0);
        expect(question.answer).toBe(question.a / question.b);
      } else {
        multiplicationCount += 1;
      }
    }

    expect(divisionCount).toBeGreaterThan(600);
    expect(divisionCount).toBeGreaterThan(multiplicationCount);
  });

  it('uses upper-range values in boss mode', () => {
    const randomSpy = mockRngSequence([0, 0, 0.8, 0.8, 0.1, 0.9]);
    const { range } = DIFFICULTY_RULES.Beginner;
    const midpoint = Math.floor((range.min + range.max) / 2);
    const question = generateQuestion('Beginner', 'boss');

    expect(question.factorA).toBeGreaterThanOrEqual(midpoint);
    expect(question.factorB).toBeGreaterThanOrEqual(midpoint);
    expect(question.factorA).toBeLessThanOrEqual(range.max);
    expect(question.factorB).toBeLessThanOrEqual(range.max);
    randomSpy.mockRestore();
  });

  it('can generate minimum and maximum operands for multiplication', () => {
    const minSpy = mockRngSequence([0.9, 0, 0, 0, 0.9]);
    const minQuestion = generateQuestion('Beginner', 'journey');
    expect(minQuestion.factorA).toBe(DIFFICULTY_RULES.Beginner.range.min);
    expect(minQuestion.factorB).toBe(DIFFICULTY_RULES.Beginner.range.min);
    minSpy.mockRestore();

    const maxSpy = mockRngSequence([0.9, 0, 0.9999, 0.9999, 0.9]);
    const maxQuestion = generateQuestion('Beginner', 'journey');
    expect(maxQuestion.factorA).toBe(DIFFICULTY_RULES.Beginner.range.max);
    expect(maxQuestion.factorB).toBe(DIFFICULTY_RULES.Beginner.range.max);
    maxSpy.mockRestore();
  });

  it('creates missing-factor multiplication when missing rate triggers', () => {
    const randomSpy = mockRngSequence([0.9, 0.1, 0, 0, 0.8]);
    const question = generateQuestion('Intermediate', 'journey');

    expect(question.type).toBe('missing');
    expect(question.operation).toBe('mul');
    expect(question.textDisplay).toBe(`? × ${question.factorB} = ${question.factorA * question.factorB}`);
    expect(question.answer).toBe(question.factorA);
    randomSpy.mockRestore();
  });

  it('creates division prompts when division is selected', () => {
    const randomSpy = mockRngSequence([0.1, 0.9, 0, 0, 0.7]);
    const question = generateQuestion('Advanced', 'journey');

    expect(question.operation).toBe('div');
    expect(question.type).toBe('reverse');
    expect(question.textDisplay).toContain('÷');
    expect(Number.isInteger(question.answer)).toBe(true);
    randomSpy.mockRestore();
  });

  it('generates exact division at the upper bounds', () => {
    const randomSpy = mockRngSequence([0.1, 0.9999, 0.9999, 0.6, 0.2]);
    const question = generateQuestion('Expert', 'journey');

    expect(question.operation).toBe('div');
    expect(question.a).toBe(400);
    expect(question.b).toBe(20);
    expect(question.answer).toBe(20);
    randomSpy.mockRestore();
  });

  it('generates deterministic daily challenges for the same seed', () => {
    const first = generateQuestion('Advanced', 'daily', '2026-01-28-0');
    const second = generateQuestion('Advanced', 'daily', '2026-01-28-0');

    expect(first.textDisplay).toBe(second.textDisplay);
    expect(first.answer).toBe(second.answer);
    expect(first.operation).toBe(second.operation);
  });

  it('throws when given an unknown difficulty', () => {
    expect(() => generateQuestion('Unknown' as never, 'journey')).toThrow();
  });
});
