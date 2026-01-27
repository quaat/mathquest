import React, { useEffect } from 'react';
import { GameSession } from '../types';
import { Button, Card } from '../components/Components';
import { useGame } from '../context/GameContext';
import { ArrowRight, RotateCcw, Home as HomeIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface ResultsProps {
  session: GameSession;
  onRestart: () => void;
  onHome: () => void;
}

export const Results: React.FC<ResultsProps> = ({ session, onRestart, onHome }) => {
  const { state, dispatch } = useGame();

  useEffect(() => {
    // Commit stats to global context on mount
    dispatch({ 
      type: 'COMPLETE_GAME', 
      payload: { 
        correct: session.correctCount, 
        total: session.questionsAnswered,
        bestStreak: session.currentStreak, // Note: ideally we track max streak, using current as proxy for simplicity
        mode: session.mode
      } 
    });
    
    dispatch({ type: 'ADD_XP', payload: session.score });

    // Update mastery for each question
    session.history.forEach(item => {
      // Logic assumes Standard type mostly for mastery tracking
      if (item.question.type === 'standard') {
        dispatch({ 
          type: 'UPDATE_MASTERY', 
          payload: { table: item.question.factorA, correct: item.isCorrect } 
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once

  const accuracy = session.questionsAnswered > 0 
    ? Math.round((session.correctCount / session.questionsAnswered) * 100) 
    : 0;

  // Prepare data for chart
  const data = [
    { name: 'Correct', value: session.correctCount, color: '#22c55e' },
    { name: 'Wrong', value: session.questionsAnswered - session.correctCount, color: '#ef4444' },
  ];

  const earnedBadges = state.achievedThisSession;
  const earnedThemes = state.themesUnlockedThisSession;

  return (
    <div className="h-full overflow-y-auto p-6 flex flex-col max-w-lg mx-auto w-full animate-in slide-in-from-bottom-4 fade-in duration-500">
      
      <div className="text-center mb-8">
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Session Complete</div>
        <h1 className="text-5xl font-black text-indigo-600 mb-2">{session.score}</h1>
        <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm font-bold">
          +{session.score} XP Earned
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="flex flex-col items-center justify-center py-4">
          <div className="text-3xl font-bold text-slate-800">{accuracy}%</div>
          <div className="text-xs text-slate-400 font-bold uppercase">Accuracy</div>
        </Card>
        <Card className="flex flex-col items-center justify-center py-4">
          <div className="text-3xl font-bold text-slate-800">{session.questionsAnswered}</div>
          <div className="text-xs text-slate-400 font-bold uppercase">Solved</div>
        </Card>
      </div>

      {/* Chart */}
      <Card className="mb-6 h-48 flex items-center justify-center">
         <ResponsiveContainer width="100%" height="100%">
           <BarChart data={data} layout="vertical">
             <XAxis type="number" hide />
             <YAxis dataKey="name" type="category" width={50} tick={{fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
             <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
             </Bar>
           </BarChart>
         </ResponsiveContainer>
      </Card>

      {/* Unlocked Themes */}
      {earnedThemes.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-slate-700 mb-2">New Theme Unlocked!</h3>
           <div className="flex gap-2 flex-wrap">
             {earnedThemes.map(themeId => (
               <div key={themeId} className="bg-purple-100 text-purple-800 p-3 rounded-xl flex items-center gap-2 text-sm font-bold border border-purple-200 w-full justify-center animate-bounce-short">
                 <span>🎨</span> {themeId.toUpperCase()} Theme Available
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Unlocked Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-6">
           <h3 className="font-bold text-slate-700 mb-2">Unlocked Badges!</h3>
           <div className="flex gap-2 flex-wrap">
             {earnedBadges.map(b => (
               <div key={b.id} className="bg-yellow-100 text-yellow-800 p-2 rounded-xl flex items-center gap-2 text-sm font-bold border border-yellow-200">
                 <span>{b.icon}</span> {b.title}
               </div>
             ))}
           </div>
        </div>
      )}

      <div className="mt-auto space-y-3 pb-8">
        {session.mode !== 'daily' && (
          <Button onClick={onRestart} fullWidth>
            <RotateCcw size={20} /> Play Again
          </Button>
        )}
        <Button onClick={onHome} variant="secondary" fullWidth>
          <HomeIcon size={20} /> Back to Home
        </Button>
      </div>

    </div>
  );
};