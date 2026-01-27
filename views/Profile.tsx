import React from 'react';
import { useGame } from '../context/GameContext';
import { ACHIEVEMENTS, THEMES } from '../constants';
import { Button } from '../components/Components';
import { ArrowLeft, Trash2, Lock, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Profile: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, dispatch } = useGame();
  const { user } = state;

  const masteryData = Object.keys(user.mastery).map(key => ({
    name: key,
    score: user.mastery[parseInt(key)],
  })).sort((a,b) => parseInt(a.name) - parseInt(b.name));

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      dispatch({ type: 'RESET_PROGRESS' });
    }
  };

  const setTheme = (themeId: string) => {
    dispatch({ type: 'SET_THEME', payload: themeId });
  };

  return (
    <div className="h-full overflow-y-auto p-4 max-w-lg mx-auto w-full pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">My Profile</h1>
      </div>

      {/* Hero Stats */}
      <div className="bg-slate-800 text-white rounded-3xl p-6 mb-8 relative overflow-hidden">
        <div className="relative z-10">
           <div className="text-sm font-medium opacity-70">Current Level</div>
           <div className="text-4xl font-black mb-4">Level {user.level}</div>
           
           <div className="w-full bg-slate-700 h-2 rounded-full mb-1">
             <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(user.xp % 500) / 5}%` }}></div>
           </div>
           <div className="flex justify-between text-xs opacity-50">
             <span>{user.xp} XP</span>
             <span>Next Lvl: {(Math.floor(user.xp/500)+1)*500} XP</span>
           </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="mb-8">
        <h3 className="font-bold text-lg mb-4 text-slate-700">Themes</h3>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {Object.values(THEMES).map((theme) => {
             const isUnlocked = user.unlockedThemes.includes(theme.id);
             const isActive = user.theme === theme.id;
             return (
               <button 
                 key={theme.id}
                 onClick={() => isUnlocked && setTheme(theme.id)}
                 className={`flex-shrink-0 w-32 p-3 rounded-2xl border-2 transition-all text-left relative ${
                   isActive ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-100 bg-white'
                 }`}
               >
                 <div className={`h-12 w-full rounded-lg mb-2 ${theme.colors.bg} border border-slate-100 relative overflow-hidden`}>
                   <div className={`absolute top-0 left-0 w-1/2 h-full ${theme.colors.primary}`}></div>
                 </div>
                 <div className="font-bold text-sm text-slate-800">{theme.name}</div>
                 {!isUnlocked && (
                   <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                     <Lock size={10} /> {theme.unlockDescription}
                   </div>
                 )}
                 {isActive && (
                   <div className="absolute top-2 right-2 bg-indigo-500 text-white p-1 rounded-full">
                     <Check size={12} />
                   </div>
                 )}
               </button>
             )
          })}
        </div>
      </div>

      {/* Mastery Chart */}
      <div className="mb-8">
        <h3 className="font-bold text-lg mb-4 text-slate-700">Table Mastery</h3>
        <div className="h-40 bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
           {masteryData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={masteryData}>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} />
                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 <Bar dataKey="score" radius={[4, 4, 4, 4]}>
                   {masteryData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.score >= 100 ? '#f59e0b' : '#6366f1'} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-full flex items-center justify-center text-slate-400 text-sm">Play games to track mastery!</div>
           )}
        </div>
      </div>

      {/* Badges */}
      <div className="mb-8">
        <h3 className="font-bold text-lg mb-4 text-slate-700">Achievements</h3>
        <div className="grid grid-cols-4 gap-2">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = user.badges.includes(ach.id);
            return (
              <div key={ach.id} className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center border-2 ${isUnlocked ? 'bg-white border-yellow-200 shadow-sm' : 'bg-slate-50 border-transparent opacity-50 grayscale'}`}>
                <div className="text-2xl mb-1">{ach.icon}</div>
                <div className="text-[10px] font-bold leading-tight hidden sm:block">{ach.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings Area */}
      <div className="mt-8 border-t pt-8">
        <Button variant="ghost" className="text-red-500 w-full" onClick={handleReset}>
          <Trash2 size={16} /> Reset Progress
        </Button>
      </div>

    </div>
  );
};