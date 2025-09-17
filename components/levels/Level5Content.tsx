import React, { useState } from 'react';
import { bvClusters, bvSentences } from '../../constants';
import { Check, Shuffle, MousePointerClick, BookOpen } from 'lucide-react';

interface Level5ContentProps {
  isComplete: boolean;
  onToggleComplete: () => void;
}

const Level5Content: React.FC<Level5ContentProps> = ({ isComplete, onToggleComplete }) => {
  const [selected, setSelected] = useState('');
  const [story, setStory] = useState('');

  const generateRandomStory = () => {
    const shuffled = [...bvClusters].sort(() => 0.5 - Math.random());
    const randomSelection = shuffled.slice(0, 15);
    const newStory = randomSelection.map(bv => bvSentences[bv] || `${bv} का वाक्य उपलब्ध नहीं है`).join('. ') + '.';
    setStory(newStory);
  };
  
  const handleSelect = (cluster: string) => {
    setSelected(cluster === selected ? '' : cluster);
  };

  return (
     <div className="space-y-3">
      <div>
        <label className="block text-lg font-medium text-gray-600 mb-2">Select BV Cluster:</label>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {bvClusters.map(bv => (
                <button
                    key={bv}
                    onClick={() => handleSelect(bv)}
                    className={`p-2 border rounded-lg text-center font-mono text-xl transition-all duration-200 transform hover:scale-110
                        ${
                        selected === bv 
                        ? 'bg-indigo-500 text-white border-indigo-600 shadow-md' 
                        : 'bg-white border-gray-300 hover:bg-gray-100/50 text-gray-700'
                    }`}
                >
                    {bv}
                </button>
            ))}
        </div>
      </div>

      <div className={`p-3 rounded-lg text-lg transition-all duration-300 flex items-start gap-2 min-h-[4rem] ${
        selected ? 'bg-sky-50 text-gray-700' : 'bg-gray-100 text-gray-500 italic items-center'
      }`}>
        <MousePointerClick size={18} className={`flex-shrink-0 mt-1 ${selected ? 'text-sky-500' : ''}`} />
        <span>{selected ? bvSentences[selected] : 'Choose a BV cluster to see the practice sentence.'}</span>
      </div>

      <button onClick={generateRandomStory} className="w-full py-3 bg-indigo-500 text-white rounded-full text-lg font-semibold hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 shadow-md">
        <Shuffle size={18} />
        Random BV Story (15 sentences)
      </button>
      
      {story && 
        <div className="mt-2 p-4 bg-white border border-gray-200/80 rounded-lg text-gray-700 animate-fade-in">
            <h4 className="font-semibold text-xl text-indigo-700 mb-2 flex items-center gap-2"><BookOpen size={20}/> Story Time</h4>
            <p className="text-lg leading-relaxed">{story}</p>
        </div>
      }

      <div className="mt-2">
        <label htmlFor="level5-complete" className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100/50">
            <div className="relative flex items-center h-5">
                <input type="checkbox" checked={isComplete} onChange={onToggleComplete} id="level5-complete" className="sr-only peer"/>
                <div className="w-5 h-5 bg-white border-2 rounded-full border-gray-300 peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-colors"></div>
                <Check className="absolute left-0.5 top-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <span className="text-lg text-gray-700 select-none">Mark as completed</span>
        </label>
      </div>
    </div>
  );
};

export default Level5Content;