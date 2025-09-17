import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Play, Pause, RotateCw, Check } from 'lucide-react';

interface Level2ContentProps {
  isComplete: boolean;
  onToggleComplete: () => void;
}

const Level2Content: React.FC<Level2ContentProps> = ({ isComplete, onToggleComplete }) => {
  const [timer, setTimer] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
      if(intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if(intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timer]);

  const startTimer = () => {
    setTimer(10);
    setIsActive(true);
  };

  const stopTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimer(10);
  };

  return (
    <div className="space-y-3">
      <div className="bg-amber-100/50 border-l-4 border-amber-400 p-3">
        <div className="flex items-center">
          <AlertCircle className="text-amber-500 mr-2 flex-shrink-0" size={20}/>
          <p className="text-lg text-amber-800">Don't perform within 2 hours of meals.</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-gray-100/60">
            <h3 className="font-semibold text-lg mb-1 text-gray-700">Step 1:</h3>
            <p className="text-lg text-gray-600">Take a deep breath through nose, hold 10s, exhale slowly through nose (repeat 2x)</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-100/60">
            <h3 className="font-semibold text-lg mb-1 text-gray-700">Step 2:</h3>
            <p className="text-lg text-gray-600">Take a deep breath through nose, hold 10s, exhale slowly through mouth with "ha..." sound (repeat 2x)</p>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-7xl font-bold text-sky-600 mb-2">{timer}s</div>
        <div className="flex justify-center gap-3">
            {!isActive ? (
                <button onClick={startTimer} className="px-7 py-2.5 bg-sky-500 text-white text-lg rounded-full hover:bg-sky-600 transition-all duration-300 flex items-center gap-2 transform hover:scale-105 shadow-md">
                    <Play size={18} /> Start
                </button>
            ) : (
                <button onClick={stopTimer} className="px-7 py-2.5 bg-red-500 text-white text-lg rounded-full hover:bg-red-600 transition-all duration-300 flex items-center gap-2 transform hover:scale-105 shadow-md">
                    <Pause size={18} /> Stop
                </button>
            )}
            <button onClick={resetTimer} className="px-7 py-2.5 bg-gray-400 text-white text-lg rounded-full hover:bg-gray-500 transition-all duration-300 flex items-center gap-2 transform hover:scale-105 shadow-md">
                <RotateCw size={18} /> Reset
            </button>
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="level2-complete" className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100/50">
            <div className="relative flex items-center h-5">
                <input type="checkbox" checked={isComplete} onChange={onToggleComplete} id="level2-complete" className="sr-only peer"/>
                <div className="w-5 h-5 bg-white border-2 rounded-full border-gray-300 peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-colors"></div>
                <Check className="absolute left-0.5 top-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <span className="text-lg text-gray-700 select-none">Mark as completed</span>
        </label>
      </div>
    </div>
  );
};

export default Level2Content;