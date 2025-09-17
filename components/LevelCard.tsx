import React, { useState, useEffect } from 'react';
import { Lock, Unlock, CheckCircle } from 'lucide-react';

interface LevelCardProps {
  level: number;
  title: string;
  icon: React.ReactElement;
  isUnlocked: boolean;
  isComplete: boolean;
  onComplete: () => void;
  isLevelTaskComplete: boolean;
  children: React.ReactNode;
  className?: string;
}

const LevelCard: React.FC<LevelCardProps> = ({ level, title, icon, isUnlocked, isComplete, onComplete, isLevelTaskComplete, children, className }) => {
  const [wasJustUnlocked, setWasJustUnlocked] = useState(false);
  
  const prevIsUnlocked = React.useRef(isUnlocked);
  useEffect(() => {
    if (prevIsUnlocked.current === false && isUnlocked === true) {
      setWasJustUnlocked(true);
      const timer = setTimeout(() => setWasJustUnlocked(false), 1500);
      return () => clearTimeout(timer);
    }
    prevIsUnlocked.current = isUnlocked;
  }, [isUnlocked]);
  
  const handleCompleteClick = () => {
    onComplete();
  };

  const shimmerClass = wasJustUnlocked ? `
    relative overflow-hidden
    after:content-[''] after:absolute after:inset-0 after:z-10
    after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent
    after:animate-shimmer after:[background-size:200%_100%]
  ` : '';

  return (
    <div className={`glass-card rounded-2xl shadow-lg p-4 transition-all duration-500 w-full relative ${!isUnlocked ? 'opacity-60 bg-gray-50/80 saturate-50' : ''} ${className} ${shimmerClass}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className="bg-primary-light text-primary-dark p-3 rounded-xl shadow-inner">
            {React.cloneElement(icon as React.ReactElement<any>, { size: 28 })}
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Level {level}: {title}
            </h2>
            <div className={`flex items-center gap-1.5 text-lg font-semibold transition-colors duration-300 ${isUnlocked ? 'text-green-600' : 'text-gray-500'}`}>
               {isUnlocked ? <><Unlock size={16} /> Unlocked</> : <><Lock size={16} /> Locked</>}
            </div>
          </div>
        </div>
        {isComplete && <div className="animate-pop-in"><CheckCircle className="text-green-500" size={32} /></div>}
      </div>
      
      <div className={`transition-all duration-300 ${!isUnlocked ? 'pointer-events-none' : ''}`}>
        <div className="bg-white/50 rounded-lg p-3">
         {children}
        </div>

        <button
            onClick={handleCompleteClick}
            disabled={isComplete || !isLevelTaskComplete}
            className={`relative mt-3 w-full py-3.5 rounded-full text-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105
              ${
              isComplete
                ? 'bg-green-500 cursor-default'
                : isLevelTaskComplete
                ? 'bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 shadow-xl hover:shadow-green-500/40 animate-subtle-breathing'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed scale-100'
            }`}
          >
            {isComplete ? (
              <>
                Level {level} Completed <CheckCircle size={22} />
              </>
            ) : (
              `Complete Level ${level}`
            )}
          </button>
      </div>
    </div>
  );
};

export default LevelCard;