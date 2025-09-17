import React from 'react';
import { Award, BarChart3, Clock, Flame, Percent, Target, ArrowLeft, TrendingUp } from 'lucide-react';
import { TOTAL_LEVELS } from '../constants';

interface AnalyticsDashboardProps {
  completedLevels: number[];
  currentStreak: number;
  longestStreak: number;
  phonationAverageTime: number;
  abdominalBreathingRecords: Array<Array<number | null>>;
  onGoBack: () => void;
}

const StatDisplay: React.FC<{ icon: React.ReactElement; value: string; label: string; sublabel?: string; className?: string; }> = ({ icon, value, label, sublabel, className }) => (
    <div className={`glass-card rounded-xl p-4 flex items-center gap-4 transition-transform duration-300 transform hover:scale-105 ${className}`}>
        <div className="text-sky-500 bg-sky-100/70 p-3 rounded-lg">{icon}</div>
        <div>
            <div className="text-3xl font-bold text-gray-800">{value}</div>
            <div className="text-lg font-medium text-gray-600">{label}</div>
            {sublabel && <div className="text-base text-gray-500">{sublabel}</div>}
        </div>
    </div>
);


const BarChart: React.FC<{ data: { label: string; value: number }[]; maxValue: number; unit: string; }> = ({ data, maxValue, unit }) => (
    <div className="flex justify-around items-end h-36 w-full gap-4 pt-4">
        {data.map(({ label, value }, index) => (
            <div key={label} className="flex flex-col items-center h-full w-1/4 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-lg font-bold text-gray-700">{value}{unit}</div>
                <div 
                    className="w-full bg-gradient-to-t from-green-300 to-green-400 rounded-t-md mt-1 transition-all duration-700 ease-out"
                    style={{ height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
                ></div>
                <div className="text-base font-semibold text-gray-500 mt-2">{label}</div>
            </div>
        ))}
    </div>
);

const DonutChart: React.FC<{ progress: number }> = ({ progress }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-36 h-36">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="transparent" stroke="#e5e7eb" strokeWidth="10" />
                <circle
                    cx="50" cy="50" r="45" fill="transparent" stroke="url(#g_donut)" strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                />
                 <defs><linearGradient id="g_donut" gradientTransform="rotate(90)"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-800">
                {progress.toFixed(0)}%
            </div>
        </div>
    );
};


const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  completedLevels,
  currentStreak,
  longestStreak,
  phonationAverageTime,
  abdominalBreathingRecords,
  onGoBack,
}) => {
    const completionPercentage = (completedLevels.length / TOTAL_LEVELS) * 100;

    const getBestSet = (records: Array<Array<number | null>>) => {
        let bestSet = { setIndex: -1, totalTime: 0, values: [0, 0, 0] };
        records.forEach((set, index) => {
            if (set.every(val => typeof val === 'number')) {
                const total = set.reduce((sum, val) => sum + (val || 0), 0) as number;
                if (total > bestSet.totalTime) {
                    bestSet = { setIndex: index, totalTime: total, values: set as number[] };
                }
            }
        });
        return bestSet;
    };

    const bestBreathingSet = getBestSet(abdominalBreathingRecords);
    const breathingChartData = [
        { label: 'CE', value: bestBreathingSet.values[0] },
        { label: 'CH', value: bestBreathingSet.values[1] },
        { label: 'CA', value: bestBreathingSet.values[2] },
    ];
    const maxBreathingTime = Math.max(...bestBreathingSet.values, 1);

    const peakBreathTime = (() => {
        const allTimes = abdominalBreathingRecords.flat().filter(time => time !== null) as number[];
        return allTimes.length > 0 ? Math.max(...allTimes) : 0;
    })();


  return (
    <div className="relative animate-fade-in glass-card rounded-2xl shadow-lg p-6 sm:p-8 mt-6">
        <button 
            onClick={onGoBack} 
            className="absolute top-4 left-4 flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors z-10 bg-white/50 hover:bg-white/80 rounded-full py-2 px-4 text-base font-semibold"
        >
            <ArrowLeft size={18} />
            Back
        </button>

        <div className="text-center mb-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-1">Daily Report</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Amazing work! Every session is a step towards fluency. If you practice daily, you'll be unstoppable!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2 lg:col-span-1 glass-card rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-2 flex items-center gap-2"><Award size={20}/> Program Progress</h3>
                <DonutChart progress={completionPercentage} />
                <p className="text-base text-gray-500 mt-3">You've mastered {completedLevels.length} out of {TOTAL_LEVELS} levels. Keep up the great work!</p>
            </div>

            <div className="glass-card rounded-xl p-4">
                <h3 className="text-xl font-semibold text-gray-700 mb-1 flex items-center gap-2"><Target size={20}/> Phonation Strength</h3>
                 <p className="text-base text-gray-500 mb-2">Avg. sustained vowel time.</p>
                <div className="text-center">
                    <span className="text-6xl font-bold text-teal-600">{phonationAverageTime}</span>
                    <span className="text-2xl font-semibold text-teal-500 ml-1">s</span>
                </div>
            </div>

            <div className="glass-card rounded-xl p-4">
                <h3 className="text-xl font-semibold text-gray-700 mb-1 flex items-center gap-2"><TrendingUp size={20}/> Breathing Control</h3>
                <p className="text-base text-gray-500">Best set from Level 3.</p>
                {bestBreathingSet.setIndex > -1 ? (
                    <BarChart data={breathingChartData} maxValue={maxBreathingTime} unit="s" />
                ) : (
                    <p className="text-center text-lg text-gray-500 pt-12">Complete Level 3 to see stats.</p>
                )}
            </div>

            <StatDisplay icon={<Flame size={28} />} value={`${currentStreak} days`} label="Current Streak" />
            <StatDisplay icon={<Award size={28} />} value={`${longestStreak} days`} label="Longest Streak" />
            <StatDisplay icon={<Clock size={28} />} value={`${peakBreathTime > 0 ? peakBreathTime : 'N/A'}s`} label="Peak Breath Time" sublabel={`(Lvl 3 Max)`}/>

        </div>
    </div>
  );
};

export default AnalyticsDashboard;