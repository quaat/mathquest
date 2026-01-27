import { Difficulty, GameModeId, Question } from '../types';
import { DIFFICULTY_CONFIG } from '../constants';

// Pseudo-random number generator for daily challenge
const seededRandom = (seed: number) => {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

const BOSS_TABLES = [7, 8, 9, 11, 12, 13, 14, 15];
const BOSS_FACTOR_MIN = 6;
const BOSS_FACTOR_MAX = 15;

export const generateQuestion = (
  difficulty: Difficulty,
  mode: GameModeId,
  seed?: string
): Question => {
  const config = DIFFICULTY_CONFIG[difficulty];
  const isBoss = mode === 'boss';
  const tables = isBoss ? BOSS_TABLES : config.tables; // Boss rounds focus on the hardest tables.
  
  let rng = Math.random;
  if (seed) {
      // Simple hash of date string for seeding
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
      }
      rng = () => seededRandom(hash++);
  }

  const factorA = tables[Math.floor(rng() * tables.length)];
  const factorBRange = isBoss ? BOSS_FACTOR_MAX - BOSS_FACTOR_MIN + 1 : 12;
  const factorBBase = isBoss ? BOSS_FACTOR_MIN : 1;
  const factorB = Math.floor(rng() * factorBRange) + factorBBase;
  const product = factorA * factorB;

  // Determine question type based on difficulty/mode logic
  let type: Question['type'] = 'standard';
  if (isBoss) {
    const roll = rng();
    if (roll > 0.6) {
      type = 'reverse';
    } else if (roll > 0.2) {
      type = 'missing';
    }
  } else if (config.types.includes('reverse') && rng() > 0.7) {
    type = 'reverse';
  } else if (config.types.includes('missing') && rng() > 0.6) {
    type = 'missing';
  }

  // Create text representation
  let textDisplay = '';
  let hint = '';
  let expectedAnswer = product;

  switch (type) {
    case 'reverse':
      textDisplay = `${product} ÷ ${factorA} = ?`;
      hint = `Think: ${factorA} x ? = ${product}`;
      expectedAnswer = factorB;
      break;
    case 'missing':
      const missingFactorA = rng() > 0.5;
      if (missingFactorA) {
        textDisplay = `? × ${factorB} = ${product}`;
        expectedAnswer = factorA;
        hint = `Count by ${factorB}s until you reach ${product}`;
      } else {
        textDisplay = `${factorA} × ? = ${product}`;
        expectedAnswer = factorB;
        hint = `Count by ${factorA}s until you reach ${product}`;
      }
      break;
    default:
      textDisplay = `${factorA} × ${factorB} = ?`;
      hint = `Add ${factorA} to itself ${factorB} times.`;
      expectedAnswer = product;
      break;
  }

  return {
    id: Date.now().toString() + Math.random().toString(),
    type,
    factorA,
    factorB,
    answer: expectedAnswer, // The user must match this
    textDisplay,
    hint
  };
};

export const calculateScore = (
  isCorrect: boolean,
  timeLeft: number,
  streak: number,
  difficulty: Difficulty
): number => {
  if (!isCorrect) return 0;
  
  let basePoints = 100;
  if (difficulty === 'Intermediate') basePoints = 150;
  if (difficulty === 'Advanced') basePoints = 200;
  if (difficulty === 'Expert') basePoints = 300;

  // Time bonus: more points if answered quickly (simulated by having more time left)
  const timeBonus = Math.floor(timeLeft * 2); 
  
  // Streak multiplier cap at 5x
  const multiplier = Math.min(1 + Math.floor(streak / 5), 5);

  return (basePoints + timeBonus) * multiplier;
};
