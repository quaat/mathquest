import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Pause, Play, Lightbulb, Clock } from 'lucide-react';
import { Button, Modal } from '../components/Components';
import { Keypad } from '../components/Keypad';
import { Difficulty, GameModeId, Question, GameSession } from '../types';
import { generateQuestion, calculateScore } from '../services/gameLogic';
import { useGame } from '../context/GameContext';
import { DIFFICULTY_CONFIG, THEMES } from '../constants';

interface GameProps {
  mode: GameModeId;
  difficulty: Difficulty;
  onEndGame: (session: GameSession) => void;
  onExit: () => void;
}

export const Game: React.FC<GameProps> = ({ mode, difficulty, onEndGame, onExit }) => {
  const { state } = useGame();
  const theme = THEMES[state.user.theme] || THEMES.jungle;
  
  // Game State
  const [session, setSession] = useState<GameSession>({
    isActive: true,
    mode,
    difficulty,
    score: 0,
    currentStreak: 0,
    multiplier: 1,
    questionsAnswered: 0,
    correctCount: 0,
    startTime: Date.now(),
    timeLeft: mode === 'boss'
      ? Math.min(DIFFICULTY_CONFIG[difficulty].timeLimit || 60, 30)
      : (DIFFICULTY_CONFIG[difficulty].timeLimit || 60),
    history: []
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [isPaused, setIsPaused] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const feedbackOverlayClass = feedback === 'correct'
    ? 'bg-green-50/70'
    : feedback === 'wrong'
      ? 'bg-red-50/70'
      : 'bg-transparent';
  
  const timerRef = useRef<number | null>(null);

  // --- Initialization ---
  useEffect(() => {
    nextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Timer Logic ---
  useEffect(() => {
    if (mode === 'chill' || isPaused || feedback !== 'none') return;

    timerRef.current = window.setInterval(() => {
      setSession(prev => {
        if (prev.timeLeft <= 1) {
          endGame({ ...prev, timeLeft: 0 });
          return prev;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, feedback, mode]);

  const nextQuestion = () => {
    // Determine seed: Daily uses Date + Index
    const seed = mode === 'daily' 
      ? new Date().toISOString().split('T')[0] + '-' + session.questionsAnswered 
      : undefined;

    const q = generateQuestion(difficulty, mode, seed);
    setCurrentQuestion(q);
    setInputValue('');
    setFeedback('none');
    setShowHint(false);
  };

  const handleInput = (num: number) => {
    if (inputValue.length < 5) {
      setInputValue(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setInputValue(prev => prev.slice(0, -1));
  };

  const submitAnswer = useCallback(() => {
    if (!currentQuestion || feedback !== 'none') return;

    const numAns = parseInt(inputValue);
    const isCorrect = numAns === currentQuestion.answer;
    
    // Calculate new stats
    // Daily Challenge gives 2x points
    let points = calculateScore(isCorrect, session.timeLeft, session.currentStreak, difficulty);
    if (mode === 'daily') points *= 2;

    const newStreak = isCorrect ? session.currentStreak + 1 : 0;
    const newMultiplier = Math.min(1 + Math.floor(newStreak / 5), 5);

    setSession(prev => ({
      ...prev,
      score: prev.score + points,
      currentStreak: newStreak,
      multiplier: newMultiplier,
      questionsAnswered: prev.questionsAnswered + 1,
      correctCount: prev.correctCount + (isCorrect ? 1 : 0),
      history: [...prev.history, {
        question: currentQuestion,
        userAnswer: numAns,
        isCorrect,
        timeTaken: 0 // Simplification
      }]
    }));

    setFeedback(isCorrect ? 'correct' : 'wrong');

    // Auto advance
    setTimeout(() => {
      // Check endgame conditions
      const journeyLimit = 20;
      const dailyLimit = 20;
      const currentCount = session.questionsAnswered + 1; // +1 because state update is async/batched but we know we just answered

      if (mode === 'journey' && currentCount >= journeyLimit) {
        endGame({ ...session, questionsAnswered: currentCount, score: session.score + points });
      } else if (mode === 'daily' && currentCount >= dailyLimit) {
        endGame({ ...session, questionsAnswered: currentCount, score: session.score + points });
      } else {
        nextQuestion();
      }
    }, isCorrect ? 800 : 2000); // Longer delay on wrong to see correct answer/hint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, inputValue, feedback, session]);

  const endGame = (finalSession: GameSession) => {
    if (timerRef.current) clearInterval(timerRef.current);
    onEndGame(finalSession);
  };

  if (!currentQuestion) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div
      data-testid="game-screen"
      className={`h-full flex flex-col relative ${theme.colors.bg} ${theme.colors.text}`}
    >
      <div
        aria-hidden
        className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${feedbackOverlayClass}`}
      />
      <div className="relative h-full flex flex-col">
        {/* Top Bar */}
        <div className="flex justify-between items-center p-4">
        <button onClick={() => setIsPaused(true)} className="p-2 rounded-full bg-white shadow-sm">
          <Pause size={20} className="text-slate-400" />
        </button>
        
        {mode !== 'chill' && (
          <div className={`flex items-center gap-2 font-mono text-xl font-bold ${session.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
            <Clock size={20} />
            {session.timeLeft}s
          </div>
        )}

        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-400 font-bold uppercase">Score</span>
          <span className="text-xl font-black text-indigo-600">{session.score}</span>
        </div>
      </div>
      {mode === 'boss' && (
        <div className="px-4 pb-2">
          <div className="rounded-2xl bg-red-100 text-red-800 text-xs font-bold px-3 py-2 text-center">
            Boss Run: tables 7–15, factors 6–15, faster timer
          </div>
        </div>
      )}

      {/* Progress Bar (Journey & Daily Mode) */}
      {(mode === 'journey' || mode === 'daily') && (
        <div className="w-full h-1.5 bg-slate-200 mt-2">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${(session.questionsAnswered / 20) * 100}%` }}
          />
        </div>
      )}

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        
        {/* Multiplier Badge */}
        {session.multiplier > 1 && (
          <div className="mb-4 bg-amber-400 text-white px-3 py-1 rounded-full text-sm font-black animate-bounce-short shadow-sm">
            {session.multiplier}x COMBO!
          </div>
        )}

        {/* Question Card */}
        <div className={`bg-white rounded-[2rem] shadow-xl p-8 w-full max-w-sm text-center mb-8 border-2 transition-all duration-300 ${feedback === 'wrong' ? 'border-red-200 shake' : feedback === 'correct' ? 'border-green-200 scale-105' : 'border-transparent'}`}>
          <div className="text-5xl font-black text-slate-800 mb-2 font-mono tracking-tight">
            {currentQuestion.textDisplay.replace('?', inputValue || '?')}
          </div>
          
          {feedback === 'wrong' && (
            <div className="text-red-500 font-medium animate-in fade-in slide-in-from-top-2">
              Answer: {currentQuestion.answer}
              <div className="text-xs text-slate-400 mt-1">{currentQuestion.hint}</div>
            </div>
          )}
           
           {/* Hint Toggle */}
           {feedback === 'none' && !showHint && (
             <button onClick={() => setShowHint(true)} className="text-xs text-indigo-400 font-bold mt-2 flex items-center justify-center gap-1 mx-auto hover:text-indigo-600">
               <Lightbulb size={12} /> Hint?
             </button>
           )}
           {showHint && feedback === 'none' && (
             <div className="text-sm text-indigo-500 mt-2 bg-indigo-50 p-2 rounded-lg">
               {currentQuestion.hint}
             </div>
           )}
        </div>

        {/* Input Area */}
        <Keypad 
          onInput={handleInput} 
          onDelete={handleDelete} 
          onSubmit={submitAnswer}
          disabled={feedback !== 'none' || isPaused}
        />
        
      </div>

        {/* Pause Modal */}
        <Modal isOpen={isPaused} onClose={() => setIsPaused(false)} title="Game Paused">
          <div className="flex flex-col gap-3">
            <Button onClick={() => setIsPaused(false)}>Resume</Button>
            <Button variant="danger" onClick={onExit}>Quit Game</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};
