import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCw, Check, Info, Timer } from 'lucide-react';
import { PHONATION_VOWELS } from '../../constants';

interface Level8ContentProps {
  isComplete: boolean;
  onToggleComplete: () => void;
  averageTime: number;
}

const Level8Content: React.FC<Level8ContentProps> = ({ isComplete, onToggleComplete, averageTime }) => {
  const targetTime = Math.round(averageTime / 5) * 5;
  const stepDuration = targetTime > 0 ? targetTime / PHONATION_VOWELS.length : 0;

  const [isActive, setIsActive] = useState(false);
  const [currentVowelIndex, setCurrentVowelIndex] = useState(0);
  const [countdown, setCountdown] = useState(stepDuration);
  const [isSequenceFinished, setIsSequenceFinished] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
      // Reset state if averageTime changes (e.g., user goes back to level 7 and changes it)
      setIsActive(false);
      setCurrentVowelIndex(0);
      setCountdown(stepDuration);
      setIsSequenceFinished(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
  }, [averageTime, stepDuration]);

  useEffect(() => {
    if (isActive && countdown > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
    } else if (isActive && countdown === 0) {
      if (currentVowelIndex < PHONATION_VOWELS.length - 1) {
        // Move to next vowel
        setCurrentVowelIndex(prev => prev + 1);
        setCountdown(stepDuration);
      } else {
        // Sequence finished
        setIsActive(false);
        setIsSequenceFinished(true);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, countdown, currentVowelIndex, stepDuration]);

  const handleStart = () => {
    if (stepDuration <= 0 || isSequenceFinished) return;
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsSequenceFinished(false);
    setCurrentVowelIndex(0);
    setCountdown(stepDuration);
    if(intervalRef.current) clearInterval(intervalRef.current);
  };
  
  if (stepDuration <= 0) {
    return (
      <div className="p-4 bg-yellow-50/80 rounded-lg border border-yellow-200/80 text-center">
        <h3 className="font-semibold text-xl text-yellow-800 flex items-center justify-center gap-2 mb-2"><Info size={20}/> Level Locked</h3>
        <p className="text-lg text-yellow-700">Please complete Level 7 and record times for all vowels to unlock this exercise.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
        <div className="p-3 bg-indigo-100/50 rounded-lg border border-indigo-200/80">
            <h3 className="font-semibold text-lg text-indigo-800 flex items-center gap-2 mb-1"><Info size={18}/> Instructions:</h3>
            <p className="text-lg text-indigo-700">
                Based on your average phonation time of <strong>{averageTime}s</strong> from Level 7, the target is <strong>{targetTime}s</strong> total.
                You will practice sustaining each vowel for <strong>{stepDuration}s</strong>. Press start to begin the sequence.
            </p>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {PHONATION_VOWELS.map((v, index) => (
            <div key={v} className={`py-3 border-2 rounded-lg text-center font-mono text-2xl font-bold transition-all duration-300
              ${isActive && currentVowelIndex === index ? 'bg-indigo-500 text-white border-indigo-600 shadow-lg scale-110' : 'bg-white border-gray-300 text-gray-800'}
              ${!isActive && index < currentVowelIndex ? 'bg-green-100 border-green-300' : ''}
              ${isSequenceFinished ? 'bg-green-200 border-green-400' : ''}
            `}>
              {v}
            </div>
          ))}
        </div>

        <div className="text-center p-3 bg-gray-100/60 rounded-lg">
            <div className="min-h-20 flex flex-col justify-center items-center">
                {isSequenceFinished ? (
                    <div className="text-center animate-pop-in">
                        <h4 className="text-2xl font-bold text-green-600 flex items-center justify-center gap-2"><Check size={28}/> Sequence Complete!</h4>
                        <p className="text-lg text-gray-600 mt-1">Great job! You can now complete this level.</p>
                    </div>
                ) : (
                    <>
                        <p className="font-semibold text-lg text-gray-700 mb-1 flex items-center justify-center gap-2"><Timer size={18}/> Countdown</p>
                        <div className="text-5xl font-bold text-gray-800">{Math.round(countdown)}s</div>
                    </>
                )}
            </div>
            <div className="flex gap-3 justify-center mt-4">
                {!isActive ? (
                     <button onClick={handleStart} disabled={isSequenceFinished} className={`w-28 py-2.5 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 bg-green-500 hover:bg-green-600 text-white shadow disabled:bg-gray-300 disabled:scale-100 disabled:cursor-not-allowed`}>
                        <Play size={18} /> Start
                    </button>
                ) : (
                    <button onClick={handlePause} className={`w-28 py-2.5 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 bg-red-500 hover:bg-red-600 text-white shadow`}>
                        <Pause size={18} /> Pause
                    </button>
                )}
                <button onClick={handleReset} className="w-28 py-2.5 bg-gray-400 text-white rounded-full hover:bg-gray-500 transition-all duration-300 flex items-center justify-center text-lg gap-2 transform hover:scale-105 shadow">
                    <RotateCw size={18} /> Reset
                </button>
            </div>
        </div>

        <div className="mt-2">
            <label htmlFor="level8-complete" className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100/50">
                <div className="relative flex items-center h-5">
                    <input type="checkbox" checked={isComplete} onChange={onToggleComplete} id="level8-complete" className="sr-only peer" disabled={!isSequenceFinished && !isComplete}/>
                    <div className="w-5 h-5 bg-white border-2 rounded-full border-gray-300 peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-colors peer-disabled:bg-gray-200 peer-disabled:cursor-not-allowed"></div>
                    <Check className="absolute left-0.5 top-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className={`text-lg select-none ${!isSequenceFinished && !isComplete ? 'text-gray-400' : 'text-gray-700'}`}>Mark as completed</span>
            </label>
        </div>
    </div>
  );
};

export default Level8Content;