import React from 'react';
import { Check } from 'lucide-react';
import { TOTAL_LEVELS } from '../constants';

interface LevelProgressBarProps {
  completedLevels: number[];
}

const LevelProgressBar: React.FC<LevelProgressBarProps> = ({ completedLevels }) => {
  const progressPercentage = (completedLevels.length / TOTAL_LEVELS) * 100;

  return (
    <div className="glass-card rounded-2xl shadow-md p-3 mb-4">
      <div className="flex justify-between items-center mb-2">
        {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((level) => (
          <div key={level} className="flex flex-col items-center flex-1">
            <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-2xl transition-all duration-300
              ${completedLevels.includes(level) 
                ? 'bg-gradient-to-br from-green-400 to-teal-500 text-white shadow-lg' 
                : completedLevels.includes(level - 1) || level === 1
                ? 'bg-gradient-to-br from-primary-light to-sky-400 text-white shadow-md animate-pulsing-glow'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {completedLevels.includes(level) ? <div className="animate-pop-in"><Check size={28} /></div> : level}
            </div>
          </div>
        ))}
      </div>
      <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-gradient-to-r from-sky-400 to-green-500 transition-all duration-700 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <p className="text-center text-lg text-gray-500 mt-1">
        {completedLevels.length} of {TOTAL_LEVELS} Levels Completed
      </p>
    </div>
  );
};

export default LevelProgressBar;