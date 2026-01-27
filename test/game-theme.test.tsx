import { render, screen } from '@testing-library/react';
import { Game } from '../views/Game';
import { GameProvider } from '../context/GameContext';

const STORAGE_KEY = 'mathquest_user_v1';

describe('Game theme application', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('applies the selected theme background on the game screen', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        theme: 'ocean',
        unlockedThemes: ['jungle', 'ocean'],
      })
    );

    render(
      <GameProvider>
        <Game
          mode="chill"
          difficulty="Beginner"
          onEndGame={() => {}}
          onExit={() => {}}
        />
      </GameProvider>
    );

    const gameScreen = await screen.findByTestId('game-screen');
    expect(gameScreen).toHaveClass('bg-cyan-50');
    expect(gameScreen).toHaveClass('text-cyan-900');
  });
});
