import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCw, Check, ArrowRight, Trash2, Info, BarChartHorizontal } from 'lucide-react';

interface Level3ContentProps {
  isComplete: boolean;
  onToggleComplete: () => void;
  records: Array<Array<number | null>>;
  onRecordsChange: (records: Array<Array<number | null>>) => void;
}

const SOUND_TYPES = ['CE', 'CH', 'CA'] as const;
type SoundType = typeof SOUND_TYPES[number];
const SETS = 3;

const Level3Content: React.FC<Level3ContentProps> = ({ isComplete, onToggleComplete, records, onRecordsChange }) => {
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentSet, setCurrentSet] = useState(0);
  const [activeSound, setActiveSound] = useState<SoundType | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const handleSelectSound = (sound: SoundType) => {
    if (isActive) return;
    setActiveSound(sound);
    setTimer(0);
  };

  const toggleTimer = () => {
    if (!activeSound) return;
    
    if (isActive) {
        // Stopping the timer
        setIsActive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);

        const soundIndex = SOUND_TYPES.indexOf(activeSound);
        if (soundIndex > -1) {
            const newRecords = records.map(row => [...row]);
            newRecords[currentSet][soundIndex] = timer;
            onRecordsChange(newRecords);
            
            // Auto-advance logic
            const nextSoundIndex = soundIndex + 1;
            if (nextSoundIndex < SOUND_TYPES.length) {
                // More sounds in the current set
                setActiveSound(SOUND_TYPES[nextSoundIndex]);
                setTimer(0);
            } else {
                // This was the last sound in the set
                if (currentSet < SETS - 1) {
                    // Advance to the next set
                    setCurrentSet(prev => prev + 1);
                    setActiveSound(SOUND_TYPES[0]); // Auto-select 'CE'
                    setTimer(0);
                } else {
                    // Finished all sets
                    setActiveSound(null);
                }
            }
        }
    } else {
        // Starting the timer
        setTimer(0); // Reset timer on start
        setIsActive(true);
    }
  };
  
  const handleResetSet = () => {
    if (isActive) return;
    const newRecords = records.map(row => [...row]);
    newRecords[currentSet].fill(null);
    onRecordsChange(newRecords);
    setActiveSound(SOUND_TYPES[0]);
    setTimer(0);
  };

  const handleClearAll = () => {
    setIsActive(false);
    setTimer(0);
    setActiveSound(null);
    setCurrentSet(0);
    onRecordsChange(Array(SETS).fill(null).map(() => Array(SOUND_TYPES.length).fill(null)));
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <>
      <div className="p-3 bg-secondary-light/40 rounded-lg mb-3 border border-secondary-light">
        <h3 className="font-semibold text-lg text-secondary-dark flex items-center gap-2"><Info size={18}/> Instructions</h3>
        <ol className="list-decimal list-inside space-y-1 text-base text-secondary-dark/80 pl-2 mt-2">
            <li>Take a deep breath from nose and start counting the numbers.
                <ul className="list-none list-inside pl-5 mt-1 space-y-0.5">
                    <li><strong>CE:</strong> Counting in English - 1,2,3...</li>
                    <li><strong>CH:</strong> Counting in Hindi - एक, दो, तीन...</li>
                    <li><strong>CA:</strong> Speak the alphabets - A, B, C...</li>
                </ul>
            </li>
            <li>Select a sound (CE, CH, CA) if not already selected.</li>
            <li>Start the timer and speak until your breath finishes.</li>
            <li>Stop the timer; the time will be recorded.</li>
            <li>The next sound or set will be auto-selected.</li>
        </ol>
      </div>
      
      <div className="space-y-3">
        <div className="bg-white/60 rounded-lg p-3 border border-gray-200/50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-lg text-gray-700 flex items-center gap-2"><BarChartHorizontal size={18}/> Performance</h4>
            <button onClick={handleClearAll} className="bg-red-400 text-white py-2 px-4 rounded-full hover:bg-red-500 flex items-center gap-1 transition-colors text-base transform hover:scale-105">
                <Trash2 size={16} /> Clear All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="p-2 font-semibold text-base text-gray-500 text-left w-1/4">Set</th>
                  {SOUND_TYPES.map(sound => (
                    <th key={sound} className="p-1 font-normal">
                      <button
                        onClick={() => handleSelectSound(sound)}
                        disabled={isActive}
                        className={`w-full py-1.5 px-2 rounded-md font-semibold text-lg transition-all duration-200 transform hover:scale-105
                          ${activeSound === sound ? 'bg-sky-500 text-white shadow' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
                        `}
                      >
                        {sound}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: SETS }).map((_, setIndex) => (
                  <tr key={setIndex} className={`transition-colors text-gray-800
                     ${setIndex === currentSet ? 'bg-sky-50' : ''}
                     ${setIndex > currentSet ? 'opacity-40' : ''}
                  `}>
                    <td className="p-2 font-semibold text-lg border-b border-gray-200 text-left">Set {setIndex + 1}</td>
                    {SOUND_TYPES.map((_, soundIndex) => (
                      <td key={soundIndex} className="p-2 font-mono text-xl font-semibold border-b border-gray-200">
                        {records[setIndex]?.[soundIndex] !== null ? <span className="animate-pop-in">{`${records[setIndex][soundIndex]}s`}</span> : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center p-3 bg-gray-100/60 rounded-lg">
          <div className="h-20 flex flex-col justify-center items-center">
            {activeSound ? (
              <>
                <p className="font-semibold text-lg text-gray-600 mb-1">Timing: Set {currentSet + 1} - {activeSound}</p>
                <div className="text-6xl font-bold text-gray-800">{timer}s</div>
              </>
            ) : (
              <p className="text-gray-500 italic text-lg">Select a sound to begin or continue.</p>
            )}
          </div>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={toggleTimer} disabled={!activeSound} className={`w-32 py-2.5 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-1.5 transform hover:scale-105 shadow ${isActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} disabled:bg-gray-300 disabled:scale-100`}>
              {isActive ? <Pause size={18} /> : <Play size={18} />} {isActive ? 'Stop' : 'Start'}
            </button>
            <button onClick={handleResetSet} disabled={isActive} className="w-32 py-2.5 bg-gray-400 text-white rounded-full hover:bg-gray-500 transition-all duration-300 flex items-center justify-center text-lg gap-1.5 transform hover:scale-105 shadow disabled:bg-gray-300 disabled:scale-100">
              <RotateCw size={18} /> Reset Set
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <label htmlFor="level3-complete" className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100/50">
            <div className="relative flex items-center h-5">
                <input type="checkbox" checked={isComplete} onChange={onToggleComplete} id="level3-complete" className="sr-only peer"/>
                <div className="w-5 h-5 bg-white border-2 rounded-full border-gray-300 peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-colors"></div>
                <Check className="absolute left-0.5 top-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <span className="text-lg text-gray-700 select-none">Mark as completed (all 3 sets)</span>
        </label>
      </div>
    </>
  );
};

export default Level3Content;