import React, { useState } from 'react';
import { Sparkles, User, ChevronRight } from 'lucide-react';

interface UserSetupProps {
  onNameSet: (name: string) => void;
}

const UserSetup: React.FC<UserSetupProps> = ({ onNameSet }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSet(name.trim());
    }
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl shadow-lg p-6 sm:p-8 my-8 text-center animate-pop-in overflow-hidden">
        <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-500 text-white rounded-full mx-auto flex items-center justify-center mb-5 shadow-lg transform -rotate-12">
            <Sparkles size={40} />
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Let's Get Started!</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Personalize your experience by telling us your name.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <div className="relative w-full">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-12 pr-5 py-4 rounded-full text-lg bg-white/70 border-2 border-transparent focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all duration-300 shadow-inner"
                    aria-label="Your Name"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={!name.trim()}
                className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg transform hover:scale-105 hover:shadow-sky-400/40 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed"
            >
                <span>Continue</span>
                <ChevronRight size={22} />
            </button>
        </form>
    </div>
  );
};

export default UserSetup;