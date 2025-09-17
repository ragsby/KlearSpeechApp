
import { useState, useEffect, useCallback } from 'react';
import { CompletedDays } from '../types';

const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const useSpeechTherapyProgress = () => {
  const [completedDays, setCompletedDays] = useState<CompletedDays>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('speechTherapyProgress');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setCompletedDays(parsed.completedDays || {});
        setLongestStreak(parsed.longestStreak || 0);
      }
    } catch (error) {
      console.error("Failed to load progress from localStorage", error);
    }
  }, []);

  const calculateCurrentStreak = useCallback((days: CompletedDays) => {
    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);

    // Check if today is completed
    if (days[formatDateKey(checkDate)]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    } else {
        // if today is not complete, check from yesterday
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateKey = formatDateKey(checkDate);
      if (days[dateKey]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    setCurrentStreak(streak);
    if (streak > longestStreak) {
      setLongestStreak(streak);
    }
  }, [longestStreak]);


  useEffect(() => {
    calculateCurrentStreak(completedDays);
    try {
        const dataToSave = {
          completedDays,
          longestStreak
        };
        localStorage.setItem('speechTherapyProgress', JSON.stringify(dataToSave));
    } catch (error) {
        console.error("Failed to save progress to localStorage", error);
    }
  }, [completedDays, longestStreak, calculateCurrentStreak]);

  const markTodayCompleted = useCallback(() => {
    const todayKey = formatDateKey(new Date());
    if (!completedDays[todayKey]) {
        setCompletedDays(prev => ({
          ...prev,
          [todayKey]: true
        }));
    }
  }, [completedDays]);

  return { completedDays, currentStreak, longestStreak, markTodayCompleted };
};