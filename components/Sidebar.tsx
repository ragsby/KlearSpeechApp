import React from 'react';
import { Calendar as CalendarIcon, CheckCircle, Flame, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { CompletedDays } from '../types';
import { TOTAL_LEVELS } from '../constants';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface SidebarProps {
  completedDays: CompletedDays;
  currentStreak: number;
  longestStreak: number;
  completedLevels: number[];
}

const StatCard: React.FC<{ icon: React.ReactElement; value: string | number; label: string; color: string;}> = ({ icon, value, label, color }) => {
    const colors: {[key: string]: string} = {
        orange: 'text-orange-500 bg-orange-100/70',
        purple: 'text-purple-500 bg-purple-100/70',
        blue: 'text-blue-500 bg-blue-100/70'
    }
    return (
        <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl transition-transform duration-300 transform hover:scale-105">
            <div className={`p-2 rounded-lg ${colors[color]}`}>
                 {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-base font-medium text-gray-500">{label}</p>
            </div>
        </div>
    )
}


const Sidebar: React.FC<SidebarProps> = ({ completedDays, currentStreak, longestStreak, completedLevels }) => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const getCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (number|null)[] = Array(startingDayOfWeek).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const isDayCompleted = (day: number | null) => {
    if (!day) return false;
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    return completedDays[formatDateKey(date)] || false;
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    // FIX: Replaced `and` with the correct logical operator `&&`.
    return day === today.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear();
  };

  return (
    <div className="glass-card rounded-2xl shadow-lg p-5 space-y-6">
      <div className="grid grid-cols-1 gap-3">
        <StatCard icon={<Flame />} value={currentStreak} label="Current Streak" color="orange" />
        <StatCard icon={<Trophy />} value={longestStreak} label="Best Streak" color="purple" />
        <StatCard icon={<CheckCircle />} value={`${completedLevels.length}/${TOTAL_LEVELS}`} label="Levels Done" color="blue" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CalendarIcon size={20} className="text-primary-dark" />
            Progress Calendar
        </h2>
        
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-700">{monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</h3>
            <div className="flex gap-1">
                <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))} className="p-1.5 hover:bg-gray-200/50 rounded-full transition-colors text-gray-500"><ChevronLeft size={18}/></button>
                <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))} className="p-1.5 hover:bg-gray-200/50 rounded-full transition-colors text-gray-500"><ChevronRight size={18}/></button>
            </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-400 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="py-1">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {getCalendarDays().map((day, index) => {
            const dayCompleted = isDayCompleted(day);
            const today = isToday(day);
            
            let dayClasses = 'w-8 h-8 flex items-center justify-center rounded-full text-base font-medium transition-colors';
            if (dayCompleted) {
                dayClasses += ' bg-green-500 text-white shadow-sm';
            } else if (today) {
                dayClasses += ' bg-sky-500 text-white';
            } else {
                dayClasses += ' text-gray-600 hover:bg-gray-100/50';
            }

            return (
                <div key={index} className="aspect-square flex items-center justify-center relative">
                    {day && (
                        <span className={dayClasses}>
                            {day}
                        </span>
                    )}
                </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;