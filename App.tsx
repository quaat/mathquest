import React, { useState } from 'react';
import { THEMES } from './constants';
import { GameProvider, useGame } from './context/GameContext';
import { Home } from './views/Home';
import { Game } from './views/Game';
import { Results } from './views/Results';
import { Profile } from './views/Profile';
import { Difficulty, GameModeId, GameSession } from './types';
import { Home as HomeIcon, Award, Settings as SettingsIcon } from 'lucide-react';

const AppContent: React.FC = () => {
  const { state } = useGame();
  const theme = THEMES[state.user.theme] || THEMES.jungle;

  // Simple Router State
  const [view, setView] = useState<'home' | 'game' | 'results' | 'profile'>('home');
  
  // Active Game Configuration
  const [gameConfig, setGameConfig] = useState<{ mode: GameModeId; diff: Difficulty } | null>(null);
  const [lastSession, setLastSession] = useState<GameSession | null>(null);

  const startGame = (mode: GameModeId, diff: Difficulty) => {
    setGameConfig({ mode, diff });
    setView('game');
  };

  const handleGameEnd = (session: GameSession) => {
    setLastSession(session);
    setView('results');
  };

  const NavButton = ({ icon: Icon, label, viewName }: any) => (
    <button 
      onClick={() => setView(viewName)}
      className={`flex flex-col items-center justify-center w-full py-3 transition-colors ${view === viewName ? theme.colors.text : 'text-slate-400'}`}
    >
      <Icon size={24} strokeWidth={view === viewName ? 3 : 2} />
      <span className="text-[10px] font-bold mt-1">{label}</span>
    </button>
  );

  return (
    <div className={`h-full w-full ${theme.colors.bg} transition-colors duration-500 flex flex-col`}>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {view === 'home' && <Home onStartGame={startGame} onNavigate={setView} />}
        
        {view === 'game' && gameConfig && (
          <Game 
            mode={gameConfig.mode} 
            difficulty={gameConfig.diff} 
            onEndGame={handleGameEnd}
            onExit={() => setView('home')} 
          />
        )}
        
        {view === 'results' && lastSession && (
          <Results 
            session={lastSession} 
            onRestart={() => startGame(gameConfig!.mode, gameConfig!.diff)}
            onHome={() => setView('home')}
          />
        )}

        {view === 'profile' && <Profile onBack={() => setView('home')} />}
      </main>

      {/* Bottom Tab Bar (Only visible on non-game screens) */}
      {view !== 'game' && (
        <nav className="bg-white border-t border-slate-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <div className="flex justify-around max-w-lg mx-auto">
            <NavButton icon={HomeIcon} label="Play" viewName="home" />
            <NavButton icon={Award} label="Profile" viewName="profile" />
          </div>
        </nav>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;