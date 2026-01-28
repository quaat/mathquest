import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Game } from '../../views/Game';
import { GameProvider } from '../../context/GameContext';

describe('game timer behavior', () => {
  it('counts down once per second when active', async () => {
    vi.useFakeTimers();

    render(
      <GameProvider>
        <Game
          mode="sprint"
          difficulty="Expert"
          onEndGame={() => {}}
          onExit={() => {}}
        />
      </GameProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('30s')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('29s')).toBeInTheDocument();
  });

  it('stops the timer when paused', async () => {
    vi.useFakeTimers();

    render(
      <GameProvider>
        <Game
          mode="sprint"
          difficulty="Expert"
          onEndGame={() => {}}
          onExit={() => {}}
        />
      </GameProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('30s')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText('30s')).toBeInTheDocument();
  });

  it('ends the game when the timer reaches zero', async () => {
    vi.useFakeTimers();
    const onEndGame = vi.fn();

    render(
      <GameProvider>
        <Game
          mode="sprint"
          difficulty="Expert"
          onEndGame={onEndGame}
          onExit={() => {}}
        />
      </GameProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('30s')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(onEndGame).toHaveBeenCalledTimes(1);
    expect(onEndGame.mock.calls[0][0].timeLeft).toBe(0);
  });
});
