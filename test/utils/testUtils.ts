import { vi } from 'vitest';

export const createSeededRandom = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 2 ** 32;
  return seed / 2 ** 32;
};

export const mockRngSequence = (sequence: number[]) => {
  const spy = vi.spyOn(Math, 'random');
  let index = 0;
  spy.mockImplementation(() => {
    const value = sequence[index % sequence.length];
    index += 1;
    return value;
  });
  return spy;
};

export const mockDate = (isoDate: string) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(isoDate));
};
