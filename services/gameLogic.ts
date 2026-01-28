import { Difficulty, GameModeId, Question } from '../types';
import { DIFFICULTY_RULES } from '../constants';

// Pseudo-random number generator for daily challenge
const seededRandom = (seed: number) => {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getBossRange = (min: number, max: number) => {
  const midpoint = Math.floor((min + max) / 2);
  return {
    min: clamp(midpoint, min, max),
    max,
  };
};

export const generateQuestion = (
  difficulty: Difficulty,
  mode: GameModeId,
  seed?: string
): Question => {
  const rule = DIFFICULTY_RULES[difficulty];
  const isBoss = mode === 'boss';
  
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

  const range = isBoss ? getBossRange(rule.range.min, rule.range.max) : rule.range;

  const operationRoll = rng() * (rule.operations.mul + rule.operations.div);
  const operation: Question['operation'] = operationRoll < rule.operations.div ? 'div' : 'mul';
  const shouldUseMissing = operation === 'mul' && rng() < rule.missingRate;

  const pickOperand = () =>
    Math.floor(rng() * (range.max - range.min + 1)) + range.min;
  let factorA = pickOperand();
  let factorB = pickOperand();
  let product = factorA * factorB;

  let type: Question['type'] = 'standard';
  let textDisplay = '';
  let hint = '';
  let expectedAnswer = product;
  let operandA = factorA;
  let operandB = factorB;

  if (operation === 'div') {
    const divisor = rng() > 0.5 ? factorA : factorB;
    const dividend = product;
    const quotient = dividend / divisor;

    type = 'reverse';
    expectedAnswer = quotient;
    operandA = dividend;
    operandB = divisor;
    textDisplay = `${dividend} ÷ ${divisor} = ?`;
    hint = `Think: ${divisor} × ? = ${dividend}`;
  } else if (shouldUseMissing) {
    type = 'missing';
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
  } else {
    textDisplay = `${factorA} × ${factorB} = ?`;
    hint = `Add ${factorA} to itself ${factorB} times.`;
  }

  return {
    id: Date.now().toString() + Math.random().toString(),
    type,
    operation,
    a: operandA,
    b: operandB,
    prompt: textDisplay,
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
