import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Gift } from 'lucide-react';

const AUDIO_URL = 'https://storage.googleapis.com/therapy_welcome_message_audio/welcome_message.wav';

interface WelcomeMessageProps {
  userName: string;
  onComplete: () => void;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ userName, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(AUDIO_URL);
    const currentAudio = audioRef.current;
    
    const handleAudioEnd = () => setIsPlaying(false);
    currentAudio.addEventListener('ended', handleAudioEnd);

    return () => {
      if (currentAudio) {
        currentAudio.removeEventListener('ended', handleAudioEnd);
        currentAudio.pause();
      }
    };
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Audio play failed:", error);
        setIsPlaying(false);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="glass-card rounded-2xl shadow-lg p-6 sm:p-8 my-8 text-center animate-pop-in">
        <div className="w-16 h-16 bg-primary-light text-primary-dark rounded-full mx-auto flex items-center justify-center mb-4">
            <Gift size={32} />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Welcome, {userName}!</h2>
        <p className="text-lg text-gray-600 mb-6 max-w-xl mx-auto">
            Listen to a short welcome message, or start your practice right away.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
                onClick={togglePlayback}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 bg-sky-500 text-white hover:bg-sky-600 shadow-md hover:shadow-sky-400/40"
                aria-label={isPlaying ? 'Pause welcome message' : 'Play welcome message'}
            >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                {isPlaying ? 'Pause' : 'Play Welcome'}
            </button>
            
            <button
                onClick={onComplete}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 bg-green-500 text-white hover:bg-green-600 shadow-md transform hover:scale-105 hover:shadow-green-400/40"
            >
                Start Practice
            </button>
        </div>
    </div>
  );
};

export default WelcomeMessage;