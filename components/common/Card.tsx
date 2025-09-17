import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`bg-white/60 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-sm p-4 ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
