import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  fullWidth = false,
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    // Red button, black text (as requested technically, but white is better for contrast on red-600. 
    // User asked "Bouton rouge texte noir". I will honor it, but maybe a lighter red or just bold black.)
    // Let's stick to the prompt: Red bg, Black text.
    primary: "bg-red-600 text-black hover:bg-red-500 shadow-md",
    outline: "border-2 border-red-600 text-red-900 hover:bg-red-50",
    ghost: "bg-transparent text-stone-800 hover:bg-stone-200"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
