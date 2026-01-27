import React, { useState } from 'react';
import { Trophy, Clock, Zap, Star, Brain, CheckCircle } from 'lucide-react';
import { Difficulty, GameModeId } from '../types';
import { useGame } from '../context/GameContext';

interface HomeProps {
  onStartGame: (mode: GameModeId, diff: Difficulty) => void;
  onNavigate: (page: 'home' | 'game' | 'results' | 'profile') => void;
}

export const Home: React.FC<HomeProps> = ({ onStartGame, onNavigate }) => {
  const { state } = useGame();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Intermediate');

  const modes = [
    { id: 'journey', name: 'Journey', icon: <Star className="text-yellow-500" />, desc: 'Progressive levels' },
    { id: 'sprint', name: 'Sprint', icon: <Clock className="text-blue-500" />, desc: '60s Time Attack' },
    { id: 'boss', name: 'Boss Run', icon: <Zap className="text-red-500" />, desc: 'Hard tables only' },
    { id: 'chill', name: 'Chill', icon: <Brain className="text-emerald-500" />, desc: 'No timer practice' },
  ];

  const difficultyColors: Record<Difficulty, string> = {
    Beginner: 'bg-green-100 text-green-700 border-green-200',
    Intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
    Advanced: 'bg-purple-100 text-purple-700 border-purple-200',
    Expert: 'bg-red-100 text-red-700 border-red-200',
  };

  const today = new Date().toISOString().split('T')[0];
  const isDailyDone = state.user.lastDailyChallenge === today;

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20 p-4 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 mt-2">
        <div>
          <h1 className="text-3xl font-black text-slate-800">MathQuest</h1>
          <p className="text-slate-500 font-medium">Level {state.user.level} • {state.user.xp} XP</p>
        </div>
        <button onClick={() => onNavigate('profile')} className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 transition-transform active:scale-95">
           <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
             👤
           </div>
        </button>
      </div>

      {/* Daily Challenge Card */}
      <div className="mb-8">
        <button 
          onClick={() => !isDailyDone && onStartGame('daily', 'Advanced')}
          disabled={isDailyDone}
          className={`w-full text-left group relative overflow-hidden rounded-3xl p-6 text-white shadow-lg transition-transform ${isDailyDone ? 'bg-slate-400 cursor-default' : 'bg-gradient-to-br from-indigo-500 to-purple-600 active:scale-95'}`}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1 opacity-90 text-sm uppercase tracking-wide font-bold">
              <Trophy size={16} /> Daily Challenge
            </div>
            {isDailyDone ? (
              <>
                <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">Completed! <CheckCircle size={24} /></h3>
                <p className="opacity-90 text-sm">Come back tomorrow.</p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-1">Double XP Today!</h3>
                <p className="opacity-90 text-sm">Beat the daily deck (20 Questions).</p>
              </>
            )}
            <div className="mt-3 inline-flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full text-xs font-bold">
              🔥 Streak: {state.user.dailyStreak} Days
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
            <Trophy size={120} />
          </div>
        </button>
      </div>

      {/* Difficulty Selector */}
      <div className="mb-6">
        <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 block">Difficulty</label>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                selectedDifficulty === diff 
                ? difficultyColors[diff] + ' border-transparent shadow-sm' 
                : 'bg-white text-slate-400 border-transparent hover:bg-slate-50'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Game Modes */}
      <div className="grid grid-cols-2 gap-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onStartGame(mode.id as GameModeId, selectedDifficulty)}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border-b-4 border-slate-100 active:border-b-0 active:translate-y-1 transition-all h-40"
          >
            <div className="mb-3 p-3 bg-slate-50 rounded-2xl">
              {React.cloneElement(mode.icon as React.ReactElement<any>, { size: 32 })}
            </div>
            <span className="font-bold text-slate-700">{mode.name}</span>
            <span className="text-xs text-slate-400 mt-1">{mode.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
};