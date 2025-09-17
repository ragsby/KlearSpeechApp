import React from 'react';
import { Check, ArrowLeftRight, ArrowUpDown, RotateCw, Grip, MoveHorizontal, Wind, Smile, Move } from 'lucide-react';
import { neckExercises } from '../../constants';

interface Level1ContentProps {
  completedExercises: boolean[];
  onToggle: (index: number) => void;
}

const exerciseIcons = [
    <ArrowLeftRight size={18} />,
    <ArrowUpDown size={18} />,
    <RotateCw size={18} />,
    <Grip size={18} />,
    <MoveHorizontal size={18} />,
    <Wind size={18} />,
    <Smile size={18} />,
    <Move size={18} />,
];

const Level1Content: React.FC<Level1ContentProps> = ({ completedExercises, onToggle }) => {
  return (
    <div className="space-y-2">
      {neckExercises.map((exercise, index) => (
        <label key={index} htmlFor={`neck-ex-${index}`} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100/50 p-1.5 rounded-lg transition-colors">
          <div className="relative flex items-center h-5">
             <input
                type="checkbox"
                id={`neck-ex-${index}`}
                checked={completedExercises[index]}
                onChange={() => onToggle(index)}
                className="sr-only peer"
             />
             <div className="w-5 h-5 bg-white border-2 rounded-full border-gray-300 peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-colors"></div>
             <Check className="absolute left-0.5 top-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">{exerciseIcons[index]}</div>
          <span className={`text-lg text-gray-700 select-none transition-colors ${completedExercises[index] ? 'line-through text-gray-400' : ''}`}>
            {exercise}
          </span>
        </label>
      ))}
    </div>
  );
};

export default Level1Content;