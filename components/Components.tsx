import React from 'react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', fullWidth, className = '', ...props 
}) => {
  const baseStyle = "font-bold rounded-2xl transition-all active:scale-95 shadow-sm border-b-4 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white border-blue-700",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border-gray-200",
    danger: "bg-red-500 hover:bg-red-600 text-white border-red-700",
    ghost: "bg-transparent hover:bg-black/5 text-current border-transparent shadow-none",
  };
  
  const sizes = {
    sm: "text-sm py-2 px-3",
    md: "text-base py-3 px-6",
    lg: "text-lg py-4 px-8",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-3xl shadow-sm border border-slate-100 p-6 ${className}`}>
    {children}
  </div>
);

// --- Modal ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title?: string }> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {title && <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>}
        {children}
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" onClick={onClose} size="sm">Close</Button>
        </div>
      </div>
    </div>
  );
};