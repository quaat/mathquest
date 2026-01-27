import React from 'react';
import { Delete, Check } from 'lucide-react';

interface KeypadProps {
  onInput: (val: number) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({ onInput, onDelete, onSubmit, disabled }) => {
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-md mx-auto pb-safe">
      {keys.map((num) => (
        <button
          key={num}
          onClick={() => onInput(num)}
          disabled={disabled}
          className="h-16 bg-white rounded-2xl shadow-sm border-b-4 border-slate-200 text-2xl font-bold text-slate-700 active:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all"
        >
          {num}
        </button>
      ))}
      <button
        onClick={onDelete}
        disabled={disabled}
        className="h-16 bg-red-100 rounded-2xl shadow-sm border-b-4 border-red-200 flex items-center justify-center text-red-600 active:bg-red-200 active:border-b-0 active:translate-y-1 transition-all"
        aria-label="Backspace"
      >
        <Delete size={28} />
      </button>
      <button
        onClick={() => onInput(0)}
        disabled={disabled}
        className="h-16 bg-white rounded-2xl shadow-sm border-b-4 border-slate-200 text-2xl font-bold text-slate-700 active:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all"
      >
        0
      </button>
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="h-16 bg-green-500 rounded-2xl shadow-sm border-b-4 border-green-700 flex items-center justify-center text-white active:bg-green-600 active:border-b-0 active:translate-y-1 transition-all"
        aria-label="Submit"
      >
        <Check size={32} />
      </button>
    </div>
  );
};