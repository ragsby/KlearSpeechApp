import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Star, BrainCircuit, Activity, Wind, Waves, MessageCircle, Combine, Sparkles, BarChart2, TrendingUp, BookOpen, Gauge } from 'lucide-react';
import { ExercisesState, CompletedDays } from './types';
import { useSpeechTherapyProgress } from './hooks/useSpeechTherapyProgress';
import { neckExercises, TOTAL_LEVELS, motivationalQuotes, PHONATION_VOWELS } from './constants';

import LevelProgressBar from './components/LevelProgressBar';
import Sidebar from './components/Sidebar';
import UserSetup from './components/UserSetup';
import WelcomeMessage from './components/WelcomeMessage';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import VocalPaceAnalyzer from './components/word-count/VocalPaceAnalyzer';
import LevelJourney from './components/LevelJourney';
import LevelCard from './components/LevelCard';

import Level1Content from './components/levels/Level1Content';
import Level2Content from './components/levels/Level2Content';
import Level3Content from './components/levels/Level3Content';
import Level4Content from './components/levels/Level4Content';
import Level5Content from './components/levels/Level5Content';
import Level6Content from './components/levels/Level6Content';
import Level7Content from './components/levels/Level7Content';
import Level8Content from './components/levels/Level8Content';
import Feedback from './components/Feedback';

// Let TypeScript know mixpanel is a global variable
declare var mixpanel: any;

type AppMode = 'exercise' | 'progress' | 'wordCount';

const levelData = [
    { level: 1, title: "Neck & Jaw", icon: <Activity /> },
    { level: 2, title: "Thoracic Breathing", icon: <Wind /> },
    { level: 3, title: "Abdominal Breathing", icon: <Waves /> },
    { level: 4, title: "CV Articulation", icon: <MessageCircle /> },
    { level: 5, title: "BV Articulation", icon: <Combine /> },
    { level: 6, title: "Vowel Articulation", icon: <Sparkles /> },
    { level: 7, title: "Phonation", icon: <BarChart2 /> },
    { level: 8, title: "Phonation Endurance", icon: <TrendingUp /> },
];

const AppBar = () => (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-40 mt-4">
        <div className="glass-card rounded-full shadow-lg px-6 py-3 flex items-center justify-center gap-2">
            <BrainCircuit className="text-sky-500" size={24}/>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Speech Companion</h1>
        </div>
    </header>
);

const TopNav: React.FC<{ appMode: AppMode, setAppMode: (mode: AppMode) => void }> = ({ appMode, setAppMode }) => {
    const navItems = [
        { id: 'exercise', label: 'Exercises', icon: <BookOpen size={20} /> },
        { id: 'progress', label: 'Progress', icon: <TrendingUp size={20} /> },
        { id: 'wordCount', label: 'Vocal Pace', icon: <Gauge size={20} /> },
    ];
    return (
        <div className="flex justify-center mb-3 animate-fade-in">
            <div className="glass-card p-1 rounded-full flex gap-1 shadow-md">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setAppMode(item.id as AppMode)}
                        className={`px-3 sm:px-5 py-2 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 ${
                            appMode === item.id ? 'bg-white text-sky-600 shadow' : 'text-gray-600 hover:text-gray-800 hover:bg-white/50 transform hover:scale-110'
                        }`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const ExerciseContent: React.FC<{
  completedLevels: number[];
  showAnalytics: boolean;
  setShowAnalytics: (show: boolean) => void;
  analyticsRef: React.RefObject<HTMLDivElement>;
  levelCards: any[];
  allLevelsComplete: boolean;
  phonationAverageTime: number;
  abdominalBreathingRecords: Array<Array<number | null>>;
  currentLevelIndex: number;
  setCurrentLevelIndex: (index: number) => void;
  levelCardRef: React.RefObject<HTMLDivElement>;
  currentStreak: number;
  longestStreak: number;
  levelCardAnimation: string;
}> = ({
  completedLevels,
  showAnalytics,
  setShowAnalytics,
  analyticsRef,
  levelCards,
  allLevelsComplete,
  phonationAverageTime,
  abdominalBreathingRecords,
  currentLevelIndex,
  setCurrentLevelIndex,
  levelCardRef,
  currentStreak,
  longestStreak,
  levelCardAnimation,
}) => {
  return (
    <main className="max-w-3xl mx-auto">
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <LevelProgressBar completedLevels={completedLevels} />
        </div>
        
        {allLevelsComplete && !showAnalytics && (
          <div className="text-center my-8 animate-fade-in">
            <button
                onClick={() => setShowAnalytics(true)}
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-sky-500/40 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto text-lg"
            >
                <BarChart2 size={20} />
                View Your Daily Report
            </button>
          </div>
        )}
        
        {(!allLevelsComplete || !showAnalytics) && (
          <div>
             <div className="animate-fade-in mt-4" style={{ animationDelay: '200ms' }}>
                <LevelJourney 
                    levels={levelData.map(ld => ({
                        ...ld,
                        isUnlocked: isLevelUnlocked(ld.level, completedLevels),
                        isComplete: completedLevels.includes(ld.level)
                    }))}
                    currentLevelIndex={currentLevelIndex}
                    setCurrentLevelIndex={setCurrentLevelIndex}
                />
            </div>
            
            <div ref={levelCardRef} className={`mt-4 ${levelCardAnimation}`}>
              <LevelCard {...levelCards[currentLevelIndex]} />
            </div>
          </div>
        )}

        {allLevelsComplete && showAnalytics && (
           <div ref={analyticsRef}>
               <AnalyticsDashboard
                    completedLevels={completedLevels}
                    currentStreak={currentStreak}
                    longestStreak={longestStreak}
                    phonationAverageTime={phonationAverageTime}
                    abdominalBreathingRecords={abdominalBreathingRecords}
                    onGoBack={() => setShowAnalytics(false)}
               />
           </div>
        )}
    </main>
  );
};

const isLevelUnlocked = (level: number, completedLevels: number[]) => {
    if (level === 1) return true;
    return completedLevels.includes(level - 1);
};


const App: React.FC = () => {
  const { completedDays, currentStreak, longestStreak, markTodayCompleted } = useSpeechTherapyProgress();
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem('speechTherapyUser'));
  const [welcomeDismissed, setWelcomeDismissed] = useState<boolean>(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>('exercise');
  const analyticsRef = useRef<HTMLDivElement>(null);
  const levelCardRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  
  const initialLevelIndex = completedLevels.length < TOTAL_LEVELS ? completedLevels.length : TOTAL_LEVELS - 1;
  const [currentLevelIndex, setCurrentLevelIndex] = useState(initialLevelIndex);
  const [levelCardAnimation, setLevelCardAnimation] = useState('animate-fade-in');

  const [phonationRecords, setPhonationRecords] = useState<Record<string, number>>({});
  const [abdominalBreathingRecords, setAbdominalBreathingRecords] = useState<Array<Array<number | null>>>(
    () => Array(3).fill(null).map(() => Array(3).fill(null))
  );
  
  const [exercises, setExercises] = useState<ExercisesState>({
    neck: Array(neckExercises.length).fill(false),
    breathing: false,
    abdominal: false,
    cv: false,
    bv: false,
    vowel: false,
    phonation: false,
    stepPhonation: false,
  });

  // User identification for Mixpanel
  useEffect(() => {
    if (userName) {
      mixpanel.identify(userName);
      mixpanel.people.set({
        '$name': userName,
        'last_login': new Date()
      });
      mixpanel.register({ 'User Name': userName });
    }
  }, [userName]);

  useEffect(() => {
    if (showAnalytics && analyticsRef.current) {
      analyticsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showAnalytics]);

  useEffect(() => {
    if (isAutoScrolling && levelCardRef.current) {
        const headerHeight = 80; // For fixed AppBar and some breathing room
        const elementPosition = levelCardRef.current.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerHeight;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        setIsAutoScrolling(false);
    }
  }, [isAutoScrolling]);

  const allLevelsComplete = completedLevels.length === TOTAL_LEVELS;

  const allVowelsRecorded = PHONATION_VOWELS.every(v => phonationRecords.hasOwnProperty(v));
  const phonationAverageTime = allVowelsRecorded
    ? Math.round(PHONATION_VOWELS.reduce((sum, vowel) => sum + (phonationRecords[vowel] || 0), 0) / PHONATION_VOWELS.length)
    : 0;

  const handleNameSet = (name: string) => {
    const trimmedName = name.trim();
    localStorage.setItem('speechTherapyUser', trimmedName);
    setUserName(trimmedName);

    // Mixpanel: Track sign up and set user properties
    mixpanel.track('User Signed Up', { 'User Name': trimmedName });
    mixpanel.people.set({
        '$name': trimmedName,
        '$created': new Date(),
    });
  };

  const handleWelcomeComplete = () => {
    setWelcomeDismissed(true);
  };
  
  const changeLevelWithAnimation = useCallback((newIndex: number, autoScroll = false) => {
    if (newIndex === currentLevelIndex) return;
    setLevelCardAnimation('animate-fade-out');
    setTimeout(() => {
        setCurrentLevelIndex(newIndex);
        if (autoScroll) {
            setIsAutoScrolling(true);
        }
        setLevelCardAnimation('animate-fade-in');
    }, 300);
  }, [currentLevelIndex]);

  const handleCompleteLevel = useCallback((level: number) => {
    if (completedLevels.includes(level)) return;

    const newCompletedLevels = [...completedLevels, level].sort((a, b) => a - b);
    setCompletedLevels(newCompletedLevels);
    markTodayCompleted();

    if (newCompletedLevels.length === TOTAL_LEVELS) {
      setShowAnalytics(true);
    } else {
        const nextLevelIndex = currentLevelIndex + 1;
        if (nextLevelIndex < TOTAL_LEVELS) {
            changeLevelWithAnimation(nextLevelIndex, true);
        }
    }
  }, [completedLevels, markTodayCompleted, currentLevelIndex, changeLevelWithAnimation]);

  const levelTasks = useMemo(() => [
    { 
      isComplete: exercises.neck.every(ex => ex), 
      onToggle: () => {
        const index = exercises.neck.findIndex(c => !c);
        if (index !== -1) {
          const newExercises = [...exercises.neck];
          newExercises[index] = true;
          setExercises(prev => ({ ...prev, neck: newExercises }));
        }
      },
      onToggleCheckbox: (index: number) => {
        const newExercises = [...exercises.neck];
        newExercises[index] = !newExercises[index];
        setExercises(prev => ({...prev, neck: newExercises}));
      }
    },
    { isComplete: exercises.breathing, onToggle: () => setExercises(p => ({...p, breathing: !p.breathing})) },
    { isComplete: exercises.abdominal, onToggle: () => setExercises(p => ({...p, abdominal: !p.abdominal})) },
    { isComplete: exercises.cv, onToggle: () => setExercises(p => ({...p, cv: !p.cv})) },
    { isComplete: exercises.bv, onToggle: () => setExercises(p => ({...p, bv: !p.bv})) },
    { isComplete: exercises.vowel, onToggle: () => setExercises(p => ({...p, vowel: !p.vowel})) },
    { isComplete: PHONATION_VOWELS.every(v => phonationRecords[v] > 0), onToggle: () => setExercises(p => ({...p, phonation: !p.phonation})) },
    { isComplete: exercises.stepPhonation, onToggle: () => setExercises(p => ({...p, stepPhonation: !p.stepPhonation})) },
  ], [exercises, phonationRecords]);

  const dailyQuote = motivationalQuotes[new Date().getDate()] || motivationalQuotes[1];
  
  const levelCards = useMemo(() => {
        const childrenMap = [
            <Level1Content completedExercises={exercises.neck} onToggle={levelTasks[0].onToggleCheckbox} />,
            <Level2Content isComplete={exercises.breathing} onToggleComplete={levelTasks[1].onToggle} />,
            <Level3Content isComplete={exercises.abdominal} onToggleComplete={levelTasks[2].onToggle} records={abdominalBreathingRecords} onRecordsChange={setAbdominalBreathingRecords} />,
            <Level4Content isComplete={exercises.cv} onToggleComplete={levelTasks[3].onToggle} />,
            <Level5Content isComplete={exercises.bv} onToggleComplete={levelTasks[4].onToggle} />,
            <Level6Content isComplete={exercises.vowel} onToggleComplete={levelTasks[5].onToggle} />,
            <Level7Content isComplete={exercises.phonation} onToggleComplete={levelTasks[6].onToggle} records={phonationRecords} onRecordsChange={setPhonationRecords} />,
            <Level8Content isComplete={exercises.stepPhonation} onToggleComplete={levelTasks[7].onToggle} averageTime={phonationAverageTime} />
        ];

        return levelData.map((ld, index) => ({
            ...ld,
            isUnlocked: isLevelUnlocked(ld.level, completedLevels),
            isComplete: completedLevels.includes(ld.level),
            onComplete: () => handleCompleteLevel(ld.level),
            isLevelTaskComplete: levelTasks[index].isComplete,
            children: childrenMap[index]
        }));
  }, [completedLevels, handleCompleteLevel, levelTasks, exercises, abdominalBreathingRecords, phonationRecords, phonationAverageTime]);

  return (
    <div className="min-h-screen font-sans">
        <AppBar />
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
            {!userName ? (
                <div className="max-w-4xl mx-auto">
                    <UserSetup onNameSet={handleNameSet} />
                </div>
            ) : !welcomeDismissed ? (
                <div className="max-w-4xl mx-auto">
                    <WelcomeMessage userName={userName} onComplete={handleWelcomeComplete} />
                </div>
            ) : (
                <>
                    <div className="glass-card rounded-2xl shadow-md p-4 mb-3 animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Hello, {userName}! 👋</h2>
                        <div className="flex items-start gap-3">
                            <div className="bg-yellow-100 p-1.5 rounded-lg text-yellow-500 flex-shrink-0 mt-1">
                                <Star size={20} />
                            </div>
                            <p className="text-base text-gray-600 italic">"{dailyQuote}"</p>
                        </div>
                    </div>

                    <TopNav appMode={appMode} setAppMode={setAppMode} />

                    {appMode === 'exercise' && (
                        <ExerciseContent
                            completedLevels={completedLevels}
                            showAnalytics={showAnalytics}
                            setShowAnalytics={setShowAnalytics}
                            analyticsRef={analyticsRef}
                            levelCards={levelCards}
                            allLevelsComplete={allLevelsComplete}
                            phonationAverageTime={phonationAverageTime}
                            abdominalBreathingRecords={abdominalBreathingRecords}
                            currentLevelIndex={currentLevelIndex}
                            setCurrentLevelIndex={changeLevelWithAnimation}
                            levelCardRef={levelCardRef}
                            currentStreak={currentStreak}
                            longestStreak={longestStreak}
                            levelCardAnimation={levelCardAnimation}
                        />
                    )}
                    
                    {appMode === 'progress' && (
                        <div className="max-w-sm mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
                            <Sidebar 
                                completedDays={completedDays} 
                                currentStreak={currentStreak}
                                longestStreak={longestStreak}
                                completedLevels={completedLevels}
                            />
                        </div>
                    )}
                    
                    {appMode === 'wordCount' && <VocalPaceAnalyzer />}
                    <Feedback />
                </>
            )}
        </div>
    </div>
  );
};

export default App;