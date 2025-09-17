import React from 'react';
import { Lock } from 'lucide-react';

interface LevelInfo {
  level: number;
  title: string;
  icon: React.ReactElement;
  isUnlocked: boolean;
  isComplete: boolean;
}

interface LevelJourneyProps {
  levels: LevelInfo[];
  currentLevelIndex: number;
  setCurrentLevelIndex: (index: number) => void;
}

const LevelStep: React.FC<{
  levelInfo: LevelInfo;
  isCurrent: boolean;
  onClick: () => void;
}> = ({ levelInfo, isCurrent, onClick }) => {
  const { icon, title, isUnlocked, isComplete } = levelInfo;

  let iconClasses = '';
  let textClasses = '';
  let content;

  if (isComplete) {
    iconClasses = 'bg-green-500 text-white';
    textClasses = 'text-green-700 font-semibold';
    // FIX: Add type assertion to allow passing 'size' prop to the cloned icon element.
    content = React.cloneElement(icon as React.ReactElement<any>, { size: 16 });
  } else if (isCurrent) {
    iconClasses = 'bg-sky-500 text-white shadow-lg animate-pulsing-glow ring-2 ring-sky-300 ring-offset-2 ring-offset-sky-50';
    textClasses = 'text-sky-600 font-bold';
    // FIX: Add type assertion to allow passing 'size' prop to the cloned icon element.
    content = React.cloneElement(icon as React.ReactElement<any>, { size: 16 });
  } else if (isUnlocked) {
    iconClasses = 'bg-white hover:bg-sky-100/50 border-2 border-gray-300 text-gray-400';
    textClasses = 'text-gray-500';
    // FIX: Add type assertion to allow passing 'size' prop to the cloned icon element.
    content = React.cloneElement(icon as React.ReactElement<any>, { size: 16 });
  } else {
    iconClasses = 'bg-gray-200 text-gray-400 cursor-not-allowed';
    textClasses = 'text-gray-400';
    content = <Lock size={16} />;
  }
  
  return (
    <div className="flex flex-col items-center gap-1 text-center w-20 flex-shrink-0">
      <button
        onClick={onClick}
        disabled={!isUnlocked}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${iconClasses}`}
        aria-label={`Level ${levelInfo.level}: ${title}`}
      >
        <div className="animate-pop-in">
          {content}
        </div>
      </button>
      <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${textClasses}`}>
        {title}
      </p>
    </div>
  );
};

const Connector: React.FC<{ isComplete: boolean }> = ({ isComplete }) => {
  const lineClasses = isComplete ? 'bg-gradient-to-r from-green-400 to-sky-500' : 'bg-gray-200';
  return (
    <div className="flex-1 flex items-center justify-center h-8">
        <div className={`h-1 w-full ${lineClasses}`}></div>
    </div>
  );
};


const LevelJourney: React.FC<LevelJourneyProps> = ({ levels, currentLevelIndex, setCurrentLevelIndex }) => {
  return (
    <div className="glass-card rounded-2xl shadow-md p-4 mb-4 overflow-x-auto">
      <div className="flex items-start justify-between min-w-[600px] md:min-w-0">
        {levels.map((level, index) => (
          <React.Fragment key={level.level}>
            <LevelStep
              levelInfo={level}
              isCurrent={index === currentLevelIndex}
              onClick={() => setCurrentLevelIndex(index)}
            />
            {index < levels.length - 1 && (
              <Connector isComplete={level.isComplete} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default LevelJourney;