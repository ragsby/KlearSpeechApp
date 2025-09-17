import React, { useState } from 'react';
import { vowels, vowelSentences } from '../../constants';
import { Check, Sparkles, MousePointerClick, BookOpen } from 'lucide-react';

interface Level6ContentProps {
  isComplete: boolean;
  onToggleComplete: () => void;
}

const Level6Content: React.FC<Level6ContentProps> = ({ isComplete, onToggleComplete }) => {
  const [selected, setSelected] = useState('');
  const [story, setStory] = useState('');

  const generateFullStory = () => {
    const newStory = Object.values(vowelSentences).join('. ') + '.';
    setStory(newStory);
  };

  const handleSelect = (vowel: string) => {
    setSelected(vowel === selected ? '' : vowel);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-lg font-medium text-gray-600 mb-2">Select Hindi Vowel:</label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {vowels.map(v => (
                <button
                    key={v}
                    onClick={() => handleSelect(v)}
                    className={`p-2 border rounded-lg text-center font-mono text-xl transition-all duration-200 transform hover:scale-110
                        ${
                        selected === v
                        ? 'bg-orange-500 text-white border-orange-600 shadow-md'
                        : 'bg-white border-gray-300 hover:bg-gray-100/50 text-gray-700'
                    }`}
                >
                    {v}
                </button>
            ))}
        </div>
      </div>
      
      <div className={`p-3 rounded-lg text-lg transition-all duration-300 flex items-start gap-2 min-h-[4rem] ${
        selected ? 'bg-sky-50 text-gray-700' : 'bg-gray-100 text-gray-500 italic items-center'
      }`}>
        <MousePointerClick size={18} className={`flex-shrink-0 mt-1 ${selected ? 'text-sky-500' : ''}`} />
        <span>{selected ? vowelSentences[selected] : 'Choose a vowel to see the practice sentence.'}</span>
      </div>

      <button onClick={generateFullStory} className="w-full py-3 bg-orange-500 text-white text-lg font-semibold rounded-full hover:bg-orange-600 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 shadow-md">
        <Sparkles size={18} />
        Vowel Story (All Vowels)
      </button>
      
      {story && 
        <div className="mt-2 p-4 bg-white border border-gray-200/80 rounded-lg text-gray-700 animate-fade-in">
            <h4 className="font-semibold text-xl text-orange-700 mb-2 flex items-center gap-2"><BookOpen size={20}/> Story Time</h4>
            <p className="text-lg leading-relaxed">{story}</p>
        </div>
      }

      <div className="mt-2">
        <label htmlFor="level6-complete" className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100/50">
            <div className="relative flex items-center h-5">
                <input type="checkbox" checked={isComplete} onChange={onToggleComplete} id="level6-complete" className="sr-only peer"/>
                <div className="w-5 h-5 bg-white border-2 rounded-full border-gray-300 peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-colors"></div>
                <Check className="absolute left-0.5 top-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <span className="text-lg text-gray-700 select-none">Mark as completed</span>
        </label>
      </div>
    </div>
  );
};

export default Level6Content;