import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'secondary' | 'choice';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = 'font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'px-4 py-2 rounded-full bg-sky-500 text-white hover:bg-sky-600 shadow-md hover:scale-105 disabled:bg-gray-300 disabled:text-gray-500 disabled:scale-100 disabled:cursor-not-allowed',
    ghost: 'px-4 py-2 rounded-full bg-transparent text-gray-600 hover:bg-gray-100/50',
    secondary: 'px-3 py-1.5 rounded-full text-sm',
    choice: 'p-6 rounded-2xl border-2 text-left w-full h-full'
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
