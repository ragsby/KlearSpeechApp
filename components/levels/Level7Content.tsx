import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCw, Check, Trash2, Target, ClipboardCheck, Sigma } from 'lucide-react';
import { PHONATION_VOWELS } from '../../constants';

interface Level7ContentProps {
  isComplete: boolean;
  onToggleComplete: () => void;
  records: Record<string, number>;
  onRecordsChange: (records: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
}

const Level7Content: React.FC<Level7ContentProps> = ({ isComplete, onToggleComplete, records: phonationRecords, onRecordsChange: setPhonationRecords }) => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedVowel, setSelectedVowel] = useState<string | null>(PHONATION_VOWELS[0]); // Auto-select first vowel
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getGaugePercentage = () => Math.min((time / 32) * 100, 100);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => setTime(prev => prev + 0.1), 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);
  
  const handleVowelSelect = (vowel: string) => {
    if (isActive) return;
    setSelectedVowel(vowel);
    resetTimer();
  };

  const toggleTimer = () => {
    if (!selectedVowel) return;

    if (isActive) {
        // ==> Stopping the timer
        setIsActive(false);

        setPhonationRecords(prev => ({
            ...prev,
            [selectedVowel]: Math.max(prev[selectedVowel] || 0, Math.floor(time))
        }));

        const currentIndex = PHONATION_VOWELS.indexOf(selectedVowel);
        const nextIndex = currentIndex + 1;

        if (nextIndex < PHONATION_VOWELS.length) {
            setSelectedVowel(PHONATION_VOWELS[nextIndex]);
            setTime(0);
        }
    } else {
        // ==> Starting the timer
        setTime(0);
        setIsActive(true);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  
  const clearAllRecords = () => {
    if (isActive) return;
    setPhonationRecords({});
    setSelectedVowel(PHONATION_VOWELS[0]);
    resetTimer();
  }

  const allVowelsRecorded = PHONATION_VOWELS.every(v => phonationRecords[v] > 0);
  let averageTime = 0;
  if (allVowelsRecorded) {
    const total = PHONATION_VOWELS.reduce((sum, vowel) => sum + (phonationRecords[vowel] || 0), 0);
    averageTime = Math.round(total / PHONATION_VOWELS.length);
  }

  return (
    <div className="space-y-3">
      <div className="p-3 bg-teal-500/10 rounded-lg border border-teal-500/20 text-teal-800 text-base">
        <p>Inhale deeply. Start the timer and sustain the selected vowel's sound. The next vowel will be auto-selected after you stop.</p>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
          {PHONATION_VOWELS.map(v => (
              <button
                  key={v}
                  onClick={() => handleVowelSelect(v)}
                  disabled={isActive}
                  className={`py-2 border rounded-lg text-center font-mono text-xl transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${
                      selectedVowel === v
                      ? 'bg-teal-500 text-white border-teal-600 shadow-md'
                      : 'bg-white border-gray-300 hover:bg-gray-100/50 text-gray-700'
                  }`}
              >
                  {v}
              </button>
          ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        <div className="md:col-span-2 flex flex-col items-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
              <circle
                cx="60" cy="60" r="54" fill="none" stroke="url(#g7)" strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={`${2 * Math.PI * 54 * (1 - getGaugePercentage() / 100)}`}
                strokeLinecap="round" className="transition-all duration-100"
              />
              <defs><linearGradient id="g7" gradientTransform="rotate(90)"><stop offset="0%" stopColor="#2dd4bf" /><stop offset="100%" stopColor="#38bdf8" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-gray-800">{Math.floor(time)}<span className="text-3xl">s</span></div>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <button 
                onClick={toggleTimer} 
                disabled={!selectedVowel}
                className={`w-28 py-2.5 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-1.5 transform hover:scale-105 shadow ${isActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100`}>
              {isActive ? <Pause size={18} /> : <Play size={18} />} {isActive ? 'Stop' : 'Start'}
            </button>
            <button onClick={resetTimer} disabled={isActive} className="w-28 py-2.5 bg-gray-400 text-white rounded-full hover:bg-gray-500 text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 transform hover:scale-105 shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
              <RotateCw size={18} /> Reset
            </button>
          </div>
        </div>

        <div className="md:col-span-3 bg-gray-100/60 p-3 rounded-lg self-stretch">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-lg text-gray-600 flex items-center gap-1.5"><ClipboardCheck size={18}/> Records</h4>
                <button onClick={clearAllRecords} disabled={isActive} className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center gap-1">
                    <Trash2 size={12} /> Clear
                </button>
            </div>
            
            <ul className="space-y-1.5">
                {PHONATION_VOWELS.map((vowel) => (
                    <li key={vowel} className={`flex justify-between items-center bg-white/70 p-1.5 pl-3 rounded-md shadow-sm`}>
                        <span className="font-mono text-xl text-teal-600 font-bold">{vowel}</span>
                        <span className="text-xl font-semibold text-gray-700 w-16 text-right">
                          {phonationRecords.hasOwnProperty(vowel) ? `${phonationRecords[vowel]}s` : '-'}
                        </span>
                    </li>
                ))}
            </ul>
            {allVowelsRecorded && (
                <div className="mt-2 text-center bg-green-100 p-2 rounded-lg border border-green-200">
                    <p className="font-semibold text-base text-green-800 flex items-center justify-center gap-1"><Sigma size={16}/> Average Time</p>
                    <p className="text-2xl font-bold text-green-700">{averageTime}s</p>
                </div>
            )}
        </div>
      </div>

      {!allVowelsRecorded && (
        <div className="p-3 bg-amber-100/50 rounded-lg border border-amber-200/80 text-center text-base text-amber-800 font-medium animate-fade-in">
          You must record a time greater than 10 sec for all five vowels to complete this level.
        </div>
      )}

      <div className="mt-2">
        <label htmlFor="level7-complete" className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100/50">
            <div className="relative flex items-center h-5">
                <input type="checkbox" checked={isComplete} onChange={onToggleComplete} id="level7-complete" className="sr-only peer"/>
                <div className="w-5 h-5 bg-white border-2 rounded-full border-gray-300 peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-colors"></div>
                <Check className="absolute left-0.5 top-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <span className="text-lg text-gray-700 select-none">Mark as completed</span>
        </label>
      </div>
    </div>
  );
};

export default Level7Content;