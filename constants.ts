import { Achievement, Theme, Difficulty } from './types';
import { Trophy, Zap, Clock, Star, Flame, Target, Smile, Brain } from 'lucide-react';

export const LEVEL_XP_BASE = 500;
export const XP_PER_CORRECT = 10;

export const THEMES: Record<string, Theme> = {
  jungle: {
    id: 'jungle',
    name: 'Wild Jungle',
    description: 'A fresh, green start for your journey.',
    unlockDescription: 'Unlocked by default',
    colors: {
      bg: 'bg-green-50',
      primary: 'bg-emerald-600',
      secondary: 'bg-lime-200',
      accent: 'bg-orange-400',
      text: 'text-emerald-900',
    },
    unlockCondition: () => true,
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Depth',
    description: 'Dive deep into knowledge.',
    unlockDescription: 'Reach Level 3',
    colors: {
      bg: 'bg-cyan-50',
      primary: 'bg-cyan-600',
      secondary: 'bg-sky-200',
      accent: 'bg-amber-400',
      text: 'text-cyan-900',
    },
    unlockCondition: (stats) => stats.level >= 3,
  },
  space: {
    id: 'space',
    name: 'Cosmic Explorer',
    description: 'Reach for the stars.',
    unlockDescription: 'Answer 100 questions total',
    colors: {
      bg: 'bg-slate-900',
      primary: 'bg-indigo-600',
      secondary: 'bg-slate-700',
      accent: 'bg-pink-500',
      text: 'text-slate-100',
    },
    unlockCondition: (stats) => stats.totalQuestionsAnswered >= 100,
  },
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first round',
    icon: '🏁',
    condition: (stats) => stats.totalQuestionsAnswered > 0,
  },
  {
    id: 'streak_starter',
    title: 'Hot Streak',
    description: 'Get a streak of 10',
    icon: '🔥',
    condition: (stats) => stats.streakRecord >= 10,
  },
  {
    id: 'table_tamer_7',
    title: 'Lucky 7s',
    description: 'Master the 7 times table',
    icon: '🍀',
    condition: (stats) => (stats.mastery[7] || 0) >= 100,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Answer 500 questions correctly total',
    icon: '⚡',
    condition: (stats) => stats.totalCorrect >= 500,
  },
  {
    id: 'daily_devotee',
    title: 'Daily Devotee',
    description: 'Complete a 3-day streak',
    icon: '📅',
    condition: (stats) => stats.dailyStreak >= 3,
  },
];

export const DIFFICULTY_RULES: Record<
  Difficulty,
  {
    range: { min: number; max: number };
    timeLimit: number;
    operations: { mul: number; div: number };
    missingRate: number;
    label: string;
  }
> = {
  Beginner: {
    range: { min: 1, max: 5 },
    timeLimit: 90,
    operations: { mul: 1, div: 0 },
    missingRate: 0,
    label: '1-5 multiplication',
  },
  Intermediate: {
    range: { min: 2, max: 10 },
    timeLimit: 60,
    operations: { mul: 1, div: 0 },
    missingRate: 0.35,
    label: '2-10 multiplication',
  },
  Advanced: {
    range: { min: 1, max: 12 },
    timeLimit: 45,
    operations: { mul: 0.6, div: 0.4 },
    missingRate: 0.25,
    label: 'Up to 12, multiplication + division',
  },
  Expert: {
    range: { min: 1, max: 20 },
    timeLimit: 30,
    operations: { mul: 0.3, div: 0.7 },
    missingRate: 0.2,
    label: 'Up to 20, division-focused',
  },
};
