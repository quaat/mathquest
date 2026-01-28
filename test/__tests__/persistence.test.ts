import { describe, expect, it, vi } from 'vitest';
import { loadUserStats, saveUserStats } from '../../services/storage';

const STORAGE_KEY = 'mathquest_user_v1';

describe('storage persistence', () => {
  it('loads default stats when storage is empty', () => {
    const stats = loadUserStats();
    expect(stats.xp).toBe(0);
    expect(stats.level).toBe(1);
    expect(stats.theme).toBe('jungle');
    expect(stats.unlockedThemes).toContain('jungle');
  });

  it('merges stored stats with defaults', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ xp: 200, theme: 'ocean', totalCorrect: 3 })
    );
    const stats = loadUserStats();
    expect(stats.xp).toBe(200);
    expect(stats.theme).toBe('ocean');
    expect(stats.level).toBe(1);
    expect(stats.unlockedThemes).toContain('jungle');
  });

  it('handles malformed storage gracefully', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem(STORAGE_KEY, '{bad json');

    const stats = loadUserStats();

    expect(stats.xp).toBe(0);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('handles storage read errors gracefully', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const getSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('boom');
    });

    const stats = loadUserStats();

    expect(stats.xp).toBe(0);
    expect(errorSpy).toHaveBeenCalled();
    getSpy.mockRestore();
  });

  it('saves stats to localStorage', () => {
    const setSpy = vi.spyOn(Storage.prototype, 'setItem');
    saveUserStats({ xp: 5, level: 1 } as never);

    expect(setSpy).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String));
  });

  it('handles storage write errors gracefully', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const setSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('boom');
    });

    saveUserStats({ xp: 5, level: 1 } as never);

    expect(errorSpy).toHaveBeenCalled();
    setSpy.mockRestore();
  });
});
