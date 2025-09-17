import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createClient, LiveClient, LiveTranscriptionEvents, LiveTranscriptionEvent } from '@deepgram/sdk';
import { GoogleGenAI, Type } from '@google/genai';
import { StopIcon, SpinnerIcon } from './Icons';
import type { AppStatus, Word, WpmResult } from '../../types/wordCount';
import { stories } from './stories';
import { UserRound, Rocket, Clock, Wand2, BarChart2, AlertTriangle, Lightbulb, Gauge, MessageSquare, ArrowLeft, ChevronDown, LayoutGrid, Timer, Mic, BookText, TrendingUp, ClipboardList } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

// Let TypeScript know mixpanel is a global variable
declare var mixpanel: any;

const DEEPGRAM_API_KEY = "228da19dc6e565513a2124cbceee0b1a51f2ef60";
const ANALYSIS_TIMEOUT_MS = 20000;

const storyColors = [
    'from-sky-400 to-cyan-500',
    'from-emerald-400 to-green-500',
    'from-amber-400 to-orange-500',
    'from-pink-400 to-fuchsia-500',
    'from-purple-500 to-indigo-600',
];

// --- Helper Functions ---

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const getWpmColorClass = (wpm: number): string => {
    if (wpm === 0) return 'text-gray-500';
    if (wpm < 78 || wpm > 114) return 'text-red-400';
    if ((wpm >= 78 && wpm <= 85) || (wpm >= 102 && wpm <= 114)) return 'text-amber-400';
    if (wpm >= 86 && wpm <= 101) return 'text-green-400';
    return 'text-gray-500'; // Fallback
};

const getWpmHexColor = (wpm: number): string => {
    if (wpm < 78 || wpm > 114) return '#f87171'; // red-400
    if ((wpm >= 78 && wpm <= 85) || (wpm >= 102 && wpm <= 114)) return '#fbbf24'; // amber-400
    if (wpm >= 86 && wpm <= 101) return '#4ade80'; // green-400
    return '#9ca3af'; // gray-400
};

const getWpmGradientColors = (wpm: number) => {
    if (wpm < 78 || wpm > 114) return { line: '#ef4444', gradientStart: '#f87171', gradientEnd: '#fee2e2' }; // red
    if ((wpm >= 78 && wpm <= 85) || (wpm >= 102 && wpm <= 114)) return { line: '#f59e0b', gradientStart: '#fbbf24', gradientEnd: '#fef3c7' }; // amber
    if (wpm >= 86 && wpm <= 101) return { line: '#22c55e', gradientStart: '#4ade80', gradientEnd: '#dcfce7' }; // green
    return { line: '#6b7280', gradientStart: '#9ca3af', gradientEnd: '#f3f4f6' }; // gray
};

const getSvgPath = (points: [number, number][], smoothing: number): string => {
    if (points.length < 2) {
        return points.length === 1 ? `M ${points[0][0]},${points[0][1]}` : "";
    }

    const line = (pointA: [number, number], pointB: [number, number]) => {
        const lengthX = pointB[0] - pointA[0];
        const lengthY = pointB[1] - pointA[1];
        return {
            length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
            angle: Math.atan2(lengthY, lengthX)
        };
    };

    const controlPoint = (current: [number, number], previous: [number, number] | undefined, next: [number, number] | undefined, reverse?: boolean): [number, number] => {
        const p = previous || current;
        const n = next || current;
        const o = line(p, n);
        const angle = o.angle + (reverse ? Math.PI : 0);
        const length = o.length * smoothing;
        const x = current[0] + Math.cos(angle) * length;
        const y = current[1] + Math.sin(angle) * length;
        return [x, y];
    };

    const path = points.reduce((acc, point, i, a) => {
        if (i === 0) return `M ${point[0]},${point[1]}`;
        const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
        const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
        return `${acc} C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
    }, '');
    return path;
};


// --- Child Components ---

const AudioVisualizer = ({ audioData }: { audioData: Uint8Array }) => {
    const BAR_WIDTH = 3;
    const BAR_GAP = 2;
    const width = (BAR_WIDTH + BAR_GAP) * audioData.length;
    const height = 80;
    
    return (
        <div className="w-full h-[80px] flex items-center justify-center">
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                {Array.from(audioData).map((value, index) => {
                    const barHeight = Math.max(2, (value / 255) * height);
                    return (
                        <rect
                            key={index}
                            x={index * (BAR_WIDTH + BAR_GAP)}
                            y={(height - barHeight) / 2}
                            width={BAR_WIDTH}
                            height={barHeight}
                            fill="url(#vizGradient)"
                            rx="1.5"
                        />
                    );
                })}
                <defs>
                    <linearGradient id="vizGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

const ResultsChart = ({ data, avgWpm }: { data: WpmResult[], avgWpm: number }) => {
  const width = 500;
  const height = 250;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };

  const maxX = Math.max(data.length > 0 ? data.length - 1 : 0, 9); // At least 10 minutes on X-axis (indices 0-9)
  const yAxisMax = Math.ceil((Math.max(...data.map(d => d.wordCount), 0, 40) + 1) / 40) * 40;

  const xScale = (index: number) => padding.left + (index / maxX) * (width - padding.left - padding.right);
  const yScale = (value: number) => height - padding.bottom - (value / yAxisMax) * (height - padding.top - padding.bottom);

  const points: [number, number][] = data.map((d, i) => [xScale(i), yScale(d.wordCount)]);
  
  const { line, gradientStart, gradientEnd } = getWpmGradientColors(avgWpm);
  const linePath = data.length > 0 ? getSvgPath(points, 0.2) : "";
  const areaPath = data.length > 0 ? `${linePath} L${xScale(data.length - 1)},${height - padding.bottom} L${padding.left},${height - padding.bottom} Z` : "";

  const xAxisLabels = Array.from({ length: maxX + 1 }, (_, i) => i);
  const yAxisLabels = Array.from({ length: 5 }, (_, i) => yAxisMax * i / 4);

  return (
    <div className="w-full bg-white/80 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/50">
        <h3 className="font-bold text-2xl text-gray-700 mb-2">Pacing Over Time 📈</h3>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="font-sans text-base min-w-[${width}px] w-full">
              <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gradientStart} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={gradientEnd} stopOpacity="0.05" />
                  </linearGradient>
              </defs>

              {yAxisLabels.map(label => (
                  <g key={label} className="text-gray-400">
                      <line
                          x1={padding.left} y1={yScale(label)}
                          x2={width - padding.right} y2={yScale(label)}
                          stroke="currentColor" strokeDasharray="2,3" strokeWidth="0.5"
                      />
                      <text x={padding.left - 8} y={yScale(label) + 4} textAnchor="end" className="fill-current text-sm text-gray-500">{label}</text>
                  </g>
              ))}

              {xAxisLabels.map((label) => {
                  if (label % 2 === 0) {
                     return (<text key={label} x={xScale(label)} y={height - padding.bottom + 18} textAnchor="middle" className="fill-current text-sm text-gray-500">{label}</text>)
                  }
                  return null;
              })}
              <text x={width/2} y={height - 5} textAnchor="middle" className="fill-current font-semibold text-sm text-gray-600">Time (minutes)</text>
              
              <path d={areaPath} fill="url(#areaGradient)" />
              <path d={linePath} fill="none" stroke={line} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              {data.map((d, i) => (
                d.wordCount > 0 &&
                  <g key={i}>
                      <circle
                          cx={xScale(i)} cy={yScale(d.wordCount)}
                          r="3.5" fill={getWpmHexColor(d.wordCount)}
                          stroke="white"
                          strokeWidth="1.5"
                          className="pointer-events-none"
                      />
                       <text x={xScale(i)} y={yScale(d.wordCount) - 10} textAnchor="middle" className="fill-gray-700 font-semibold text-sm">
                          {d.wordCount}
                        </text>
                  </g>
              ))}
          </svg>
        </div>
    </div>
  );
};

const ResultsStatCard = ({ icon, value, label, sublabel, color = 'sky' }: { icon: React.ReactElement, value: React.ReactNode, label: string, sublabel?: string, color?: 'sky' | 'amber' | 'emerald' | 'violet' }) => {
    const colorClasses = {
        sky: 'bg-sky-100/70 text-sky-600',
        amber: 'bg-amber-100/70 text-amber-600',
        emerald: 'bg-emerald-100/70 text-emerald-600',
        violet: 'bg-violet-100/70 text-violet-600',
    };
    return (
        <Card className="flex items-center gap-4 p-4">
            <div className={`${colorClasses[color]} p-3 rounded-xl`}>{React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}</div>
            <div><p className="text-3xl font-bold text-gray-800">{value}</p><p className="text-lg text-gray-600 font-medium">{label}</p>{sublabel && <p className="text-base text-gray-500">{sublabel}</p>}</div>
        </Card>
    );
};

const SpeedometerGauge = ({ value, tips }: { value: number, tips: string }) => {
    const getColor = (v: number) => {
        if (v < 65) return { stroke: 'stroke-red-400', text: 'text-red-500', bg: 'bg-red-100/50', border: 'border-red-200/50', tipText: 'text-red-700' };
        if (v < 85) return { stroke: 'stroke-amber-400', text: 'text-amber-500', bg: 'bg-amber-100/50', border: 'border-amber-200/50', tipText: 'text-amber-700' };
        return { stroke: 'stroke-green-400', text: 'text-green-500', bg: 'bg-green-100/50', border: 'border-green-200/50', tipText: 'text-green-700' };
    };
    const { stroke, text, bg, border, tipText } = getColor(value);
    return (
        <Card className="space-y-2"><h3 className="font-bold text-xl text-foreground flex items-center gap-2"><Gauge size={20} className="text-primary-dark" /> Speed Control</h3><div className="relative w-32 h-16 mx-auto"><svg viewBox="0 0 100 50" className="w-full h-full"><path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" className="stroke-gray-200" strokeWidth="8" strokeLinecap="round" /><path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" className={`${stroke} transition-all duration-700 ease-out`} strokeWidth="8" strokeLinecap="round" strokeDasharray={Math.PI * 40} strokeDashoffset={Math.PI * 40 * (1 - value / 100)}/></svg><div className={`absolute bottom-0 w-full text-center ${text}`}><span className="text-3xl font-bold">{value}</span><span className="text-xl font-medium">/100</span></div></div><div className={`p-2 ${bg} border ${border} rounded-lg`}><h4 className={`font-semibold text-base mb-0.5 flex items-center gap-1.5 ${tipText}`}><Lightbulb size={16} /> Coach's Tip</h4><p className={`text-sm ${tipText}`}>{tips}</p></div></Card>
    );
};

const CollapsibleCard = ({ title, icon, children, defaultOpen = false }: { title: string, icon: React.ReactElement, children: React.ReactNode, defaultOpen?: boolean }) => (
    <Card className="p-0 overflow-hidden"><details className="group" open={defaultOpen}><summary className="p-4 font-bold text-xl text-foreground cursor-pointer list-none flex justify-between items-center hover:bg-gray-100/50"><div className="flex items-center gap-3">{icon} {title}</div><ChevronDown className="transition-transform duration-300 group-open:rotate-180 text-gray-400" /></summary><div className="px-4 pb-4 border-t border-gray-200/80">{children}</div></details></Card>
);

// --- Main Component ---

const VocalPaceAnalyzer: React.FC = () => {
    const [status, _setStatus] = useState<AppStatus>('idle');
    const [instructionsRead, setInstructionsRead] = useState(false);
    const [setupStep, setSetupStep] = useState<'initial' | 'openReadingConfig' | 'storyConfig' | 'storyReady'>('initial');
    const [showStoryList, setShowStoryList] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [wpmResults, setWpmResults] = useState<WpmResult[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [rawTranscriptJson, setRawTranscriptJson] = useState<any[]>([]);
    const [timerDuration, setTimerDuration] = useState(1);
    const [countdown, setCountdown] = useState(0);
    const [totalRecordedTime, setTotalRecordedTime] = useState(0);
    const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
    const [aiAnalysisStatus, setAiAnalysisStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
    const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);
    const [selectedStory, setSelectedStory] = useState<{ title: string; content: string } | null>(null);
    const [activeSection, setActiveSection] = useState('overview');
    const [audioData, setAudioData] = useState(new Uint8Array(0));

    const mediaRecorderRef = useRef<MediaRecorder | null>(null); const connectionRef = useRef<LiveClient | null>(null); const transcriptDataRef = useRef<Word[]>([]); const rawTranscriptJsonRef = useRef<any[]>([]); const audioChunksRef = useRef<Blob[]>([]); const analysisTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null); const timerDurationRef = useRef(timerDuration); const countdownRef = useRef(countdown); const recordedTimeRef = useRef(0); const statusRef = useRef(status); const audioContextRef = useRef<AudioContext | null>(null); const analyserRef = useRef<AnalyserNode | null>(null); const animationFrameIdRef = useRef<number | null>(null);

    useEffect(() => { timerDurationRef.current = timerDuration; }, [timerDuration]);
    useEffect(() => { countdownRef.current = countdown; }, [countdown]);

    const setStatus = useCallback((newStatus: AppStatus) => { statusRef.current = newStatus; _setStatus(newStatus); }, []);
    
    const { avgWpm, totalWords, peakWpm } = useMemo(() => {
        if (totalRecordedTime < 60) {
            return { avgWpm: 0, totalWords: 0, peakWpm: 0 };
        }
        const totalWords = wpmResults.reduce((sum, result) => sum + result.wordCount, 0);
        const avgWpm = totalRecordedTime > 0 ? Math.round((totalWords / totalRecordedTime) * 60) : 0;
        const peakWpm = wpmResults.length > 0 ? Math.max(...wpmResults.map(r => r.wordCount)) : 0;
        return { avgWpm, totalWords, peakWpm };
    }, [wpmResults, totalRecordedTime]);
    
    // Mixpanel: Update user profile on new results
    useEffect(() => {
        if (status === 'results' && avgWpm > 0) {
            mixpanel.people.set({
                'Last Average WPM': avgWpm,
                'Last Peak WPM': peakWpm,
            });
        }
    }, [status, avgWpm, peakWpm]);

    const cleanupRecording = useCallback(() => {
        if (animationFrameIdRef.current) { cancelAnimationFrame(animationFrameIdRef.current); animationFrameIdRef.current = null; }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') { audioContextRef.current.close(); audioContextRef.current = null; }
        analyserRef.current = null; setAudioData(new Uint8Array(0));
    }, []);

    const resetState = useCallback(() => { setStatus('idle'); setSetupStep('initial'); setShowStoryList(false); setError(null); setWpmResults([]); transcriptDataRef.current = []; rawTranscriptJsonRef.current = []; audioChunksRef.current = []; setRawTranscriptJson([]); setCountdown(0); setTotalRecordedTime(0); setRecordedAudioBlob(null); setAiAnalysisStatus('idle'); setAiAnalysisResult(null); setAiAnalysisError(null); setSelectedStory(null); setActiveSection('overview'); if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current); if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); mediaRecorderRef.current = null; connectionRef.current = null; cleanupRecording(); }, [setStatus, cleanupRecording]);
    const stopRecording = useCallback(() => { if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop(); if (connectionRef.current) connectionRef.current.finish(); if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); cleanupRecording(); const recordedTime = (timerDurationRef.current * 60) - countdownRef.current; recordedTimeRef.current = recordedTime; setTotalRecordedTime(recordedTime); setStatus('analyzing'); analysisTimeoutRef.current = setTimeout(() => { setError('Analysis timed out.'); setStatus('error'); }, ANALYSIS_TIMEOUT_MS); }, [setStatus, cleanupRecording]);
    
    useEffect(() => { if (status === 'recording' && countdown === 0 && connectionRef.current) { stopRecording(); } }, [status, countdown, stopRecording]);
    
    const startRecording = useCallback(async () => {
        if (!selectedLanguage) return; setStatus('recording');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)(); audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream); const analyser = audioContext.createAnalyser(); analyser.fftSize = 128; analyserRef.current = analyser;
            source.connect(analyser); const bufferLength = analyser.frequencyBinCount; const dataArray = new Uint8Array(bufferLength); setAudioData(new Uint8Array(bufferLength));
            const draw = () => { if (analyserRef.current) { analyserRef.current.getByteFrequencyData(dataArray); setAudioData(new Uint8Array(dataArray)); animationFrameIdRef.current = requestAnimationFrame(draw); }}; draw();

            const deepgram = createClient(DEEPGRAM_API_KEY);
            const connection = deepgram.listen.live({ model: 'nova-2', punctuate: true, smart_format: true, filler_words: true, language: selectedLanguage });
            connectionRef.current = connection;
            connection.on(LiveTranscriptionEvents.Open, () => {
                const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                mediaRecorderRef.current = recorder; audioChunksRef.current = [];
                recorder.ondataavailable = (event) => { if (event.data.size > 0) { audioChunksRef.current.push(event.data); if (connection.getReadyState() === 1) connection.send(event.data); } };
                recorder.onstop = () => { stream.getTracks().forEach(track => track.stop()); if (audioChunksRef.current.length > 0) setRecordedAudioBlob(new Blob(audioChunksRef.current, { type: 'audio/webm' })); };
                const initialCountdown = timerDurationRef.current * 60; setCountdown(initialCountdown);
                timerIntervalRef.current = setInterval(() => { setCountdown(prev => { if (prev <= 1) { clearInterval(timerIntervalRef.current!); return 0; } return prev - 1; }); }, 1000);
                recorder.start(250);
            });
            connection.on(LiveTranscriptionEvents.Transcript, (data: LiveTranscriptionEvent) => {
                const words = data.channel?.alternatives[0]?.words;
                if (data.is_final && words?.length > 0) rawTranscriptJsonRef.current.push(...words.map(w=>({...w,punctuated_word:w.punctuated_word||w.word})));
                if (words) transcriptDataRef.current.push(...words.filter((w): w is typeof w & { punctuated_word: string } => typeof w.punctuated_word === 'string').map(w => ({...w,language:selectedLanguage})));
            });
            connection.on(LiveTranscriptionEvents.Close, () => {
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                if (statusRef.current !== 'error') {
                    if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);

                    let finalWpmResults: WpmResult[] = [];
                    let finalTotalWords = 0;
                    let finalAvgWpm = 0;
                    let finalPeakWpm = 0;

                    if (transcriptDataRef.current.length > 0) {
                        const wordsByMinute: { [minute: number]: number } = {}; let maxMinute = 0;
                        transcriptDataRef.current.forEach(word => { const minute = Math.floor(word.start / 60); wordsByMinute[minute] = (wordsByMinute[minute] || 0) + 1; if (minute > maxMinute) maxMinute = minute; });
                        const totalMinutesFromDuration = Math.ceil(recordedTimeRef.current / 60); const loopLimit = Math.max(totalMinutesFromDuration, maxMinute + 1);
                        finalWpmResults = Array.from({length: loopLimit}, (_,i) => ({ minute: i, wordCount: wordsByMinute[i] || 0 }));
                        
                        if (recordedTimeRef.current >= 60) {
                            finalTotalWords = finalWpmResults.reduce((sum, result) => sum + result.wordCount, 0);
                            finalAvgWpm = recordedTimeRef.current > 0 ? Math.round((finalTotalWords / recordedTimeRef.current) * 60) : 0;
                            finalPeakWpm = finalWpmResults.length > 0 ? Math.max(...finalWpmResults.map(r => r.wordCount)) : 0;
                        }
                    }

                    // Mixpanel: Track analysis event
                    mixpanel.track('Vocal Pace Analysis Completed', {
                        'duration_seconds': recordedTimeRef.current,
                        'average_wpm': finalAvgWpm,
                        'peak_wpm': finalPeakWpm,
                        'total_words': finalTotalWords,
                        'language': selectedLanguage,
                        'practice_mode': selectedStory ? 'Story Practice' : 'Open Reading',
                        'story_title': selectedStory ? selectedStory.title : null
                    });
                    
                    setWpmResults(finalWpmResults);
                    setRawTranscriptJson(rawTranscriptJsonRef.current);
                    setStatus('results');
                }
            });
            connection.on(LiveTranscriptionEvents.Error, (err) => { console.error(err); if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); setError('Transcription service error.'); setStatus('error'); cleanupRecording(); });
        } catch (err) { console.error(err); setError('Microphone access denied.'); setStatus('error'); cleanupRecording(); }
    }, [selectedLanguage, selectedStory, setStatus, cleanupRecording]);

    const fileToGenerativePart = (file: Blob): Promise<{inlineData: {data: string, mimeType: string}}> => new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve({ inlineData: { data: (reader.result as string).split(',')[1], mimeType: file.type } }); reader.onerror = (err) => reject(err); });
    const handleAiAnalysis = async (currentAvgWpm: number) => {
        if (!recordedAudioBlob) { setAiAnalysisError('No audio was recorded to analyze.'); setAiAnalysisStatus('error'); return; };
        setAiAnalysisStatus('loading'); setAiAnalysisResult(null); setAiAnalysisError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: "AIzaSyDK4c-bx0URgWviJfXJ-vE4iFddQuNXrTM" });
            const audioPart = await fileToGenerativePart(recordedAudioBlob);
            const prompt = `You are a speech coach AI. Analyze the provided audio. The user's average speaking rate was ${currentAvgWpm} Words Per Minute (WPM). The target WPM range is 86–101. Based on your analysis, provide feedback in JSON format. The feedback should be encouraging and constructive. - overallFeedback: A brief, encouraging summary (1-2 sentences). - pacingFeedback: Specific feedback on their speaking rate and consistency.`;
            const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: { parts: [audioPart, {text: prompt}] }, config: { temperature: 0.5, responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { overallFeedback: { type: Type.STRING }, pacingFeedback: { type: Type.STRING } }, required: ["overallFeedback", "pacingFeedback"] } } });
            setAiAnalysisResult(JSON.parse(response.text)); setAiAnalysisStatus('done');
        } catch (e) { console.error(e); setAiAnalysisError('An error occurred during AI analysis. The model may have had trouble processing the audio, or the response was not valid. Please try again.'); setAiAnalysisStatus('error'); }
    };
    
    useEffect(() => { return () => { if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop(); if (connectionRef.current) connectionRef.current.finish(); if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current); cleanupRecording(); }; }, [cleanupRecording]);

    const formatCountdown = (seconds: number) => `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
    const getGaugeValueForWpm = (wpm: number) => { if (wpm >= 85 && wpm <= 102) return 100; if ((wpm >= 72 && wpm <= 84) || (wpm >= 103 && wpm <= 114)) return 80; if ((wpm >= 58 && wpm <= 71) || (wpm >= 115 && wpm <= 130)) return 60; if (wpm < 58 || wpm > 130) return 40; return 0; };
    const calculateSpeedControl = (results: WpmResult[]) => { const minutesToConsider = results.slice(0, 5); if (minutesToConsider.length === 0 || minutesToConsider.every(r => r.wordCount === 0)) return { gauge_value: 0, tips: "Speak for at least one minute for analysis." }; const gaugeValues = minutesToConsider.map(r => getGaugeValueForWpm(r.wordCount)); const avgGaugeValue = gaugeValues.reduce((sum, val) => sum + val, 0) / minutesToConsider.length; let tips = ""; if (avgGaugeValue < 65) tips = "Your pacing has some variation. Focus on keeping a steady rhythm to improve clarity."; else if (avgGaugeValue < 85) tips = "Good consistency! You're mostly in a good range. A little polish will make it perfect."; else tips = "Excellent speed control! Your delivery is steady and confident, making you easy to understand."; return { gauge_value: Math.round(avgGaugeValue), tips: tips }; };
    const getWpmFeedback = (wpm: number) => { if (wpm === 0) return { emoji: '🤫', label: 'No words detected' }; if (wpm < 86) return { emoji: '🐢', label: 'A Bit Slow' }; if (wpm > 101) return { emoji: '🚀', label: 'A Bit Fast' }; return { emoji: '✅', label: 'Great Pace!' }; }

    const renderContent = () => {
        if (!instructionsRead) {
            return (
                <div className="flex flex-col items-center justify-center w-full h-full max-w-2xl mx-auto p-4 animate-fade-in text-center">
                    <Card className="w-full">
                        <div className="flex flex-col items-center gap-3 mb-4">
                            <div className="bg-sky-100 text-sky-600 p-3 rounded-xl">
                                <ClipboardList size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Rate of Speech Ground Rules</h3>
                        </div>
                        <div className="text-left text-lg text-gray-700 space-y-3 px-4">
                            <ol className="list-decimal list-outside space-y-2 pl-5">
                                <li>The initial sound of the sentence should be slightly prolonged and the rest of the words should follow smoothly and gently.</li>
                                <li>If the sentence is long, take an appropriate pause, release your breath, and then re-apply the first rule.</li>
                                <li>If you misspell a word, do not repeat or correct it. Instead, continue reading ahead.</li>
                                <li>Keep your voice slightly loud and clear.</li>
                                <li>By applying these rules, your target rate of speech should be between <strong>87 to 100 words per minute</strong>.</li>
                            </ol>
                        </div>
                    </Card>
                    <Button onClick={() => setInstructionsRead(true)} className="mt-6 text-lg px-8 py-3">
                        I have read the instructions
                    </Button>
                </div>
            );
        }

        switch (status) {
            case 'recording': return (
                <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4">
                    <div className="p-3 bg-sky-100/50 border border-sky-200/50 rounded-lg text-sky-800 text-base flex items-center gap-2 mb-4 animate-fade-in">
                        <Lightbulb size={18} />
                        <p>For the most accurate results, try to speak for at least one full minute before stopping.</p>
                    </div>
                    {selectedStory ? (
                        <>
                            <div className="flex-shrink-0 w-full pb-4 flex flex-col items-center justify-center">
                                <div className="text-5xl font-mono tracking-widest text-gray-800 bg-white/50 backdrop-blur-sm rounded-full px-6 py-3 shadow-inner mb-2">{formatCountdown(countdown)}</div>
                                <AudioVisualizer audioData={audioData} />
                                <button onClick={stopRecording} className="mt-2 w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg transform hover:scale-105" aria-label="Stop recording">
                                    <StopIcon className="w-7 h-7 text-white" />
                                </button>
                            </div>
                            <Card className="flex-grow w-full min-h-0 overflow-y-auto p-4">
                                <h2 className="text-2xl font-bold text-sky-700 mb-3 text-center">{selectedStory.title}</h2>
                                <p className="whitespace-pre-line text-2xl leading-relaxed text-gray-700">{selectedStory.content}</p>
                            </Card>
                        </>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center">
                            <div className="text-5xl font-mono tracking-widest text-gray-800 bg-white/50 backdrop-blur-sm rounded-full px-6 py-3 shadow-inner mb-2">{formatCountdown(countdown)}</div>
                            <AudioVisualizer audioData={audioData} />
                            <button onClick={stopRecording} className="mt-4 w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg transform hover:scale-105" aria-label="Stop recording">
                                <StopIcon className="w-8 h-8 text-white" />
                            </button>
                        </div>
                    )}
                </div>
            );
            case 'analyzing': return (<div className="flex flex-col items-center justify-center h-full"><SpinnerIcon className="w-16 h-16 animate-spin text-primary" /><p className="mt-4 text-2xl text-foreground">Analyzing your speech...</p></div>);
            case 'results': {
                const speedControlResult = calculateSpeedControl(wpmResults);
                const wpmFeedback = getWpmFeedback(avgWpm);
                const totalWords = wpmResults.reduce((sum, result) => sum + result.wordCount, 0);
                const navItems = [{ id: 'overview', label: 'Overview', icon: <LayoutGrid/> }, { id: 'pacing', label: 'Pacing', icon: <BarChart2/> }, { id: 'ai-analysis', label: 'AI Coach', icon: <Wand2/> }, { id: 'transcript', label: 'Transcript', icon: <MessageSquare/> }];
                return (
                    <div className="w-full max-w-5xl animate-fade-in p-4 space-y-4">
                        {totalRecordedTime >= 60 ? (
                            <header className="text-center space-y-2">
                                <p className="text-xl font-medium text-gray-500">Your Average Pace</p>
                                <h2 className="text-7xl font-bold text-gray-800">{avgWpm} <span className="text-6xl">{wpmFeedback.emoji}</span></h2>
                                <p className={`text-2xl font-semibold ${getWpmColorClass(avgWpm)}`}>{wpmFeedback.label}</p>
                                <Button onClick={resetState} variant="ghost" className="mx-auto !text-base !text-sky-600 !font-bold">Test Again</Button>
                            </header>
                        ) : (
                            <Card className="text-center p-6 bg-amber-50 border border-amber-200/50">
                                <Timer size={32} className="mx-auto text-amber-500 mb-3" />
                                <h2 className="text-3xl font-bold text-amber-800">More Time Needed for Pace Analysis</h2>
                                <p className="text-lg text-amber-700 mt-2 mb-4">Please record for at least 60 seconds to calculate your average words per minute.</p>
                                <Button onClick={resetState} variant="ghost" className="mx-auto !text-base !text-sky-600 !font-bold">Record Again</Button>
                            </Card>
                        )}
                        <div className="sticky top-4 z-30 bg-gray-100/50 backdrop-blur-md shadow-inner rounded-full flex justify-center items-center p-1 max-w-sm mx-auto gap-1">
                            {navItems.map(item => (
                                <button 
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`flex-1 flex flex-col items-center justify-center gap-0 py-2 px-1 rounded-full transition-all duration-300 font-semibold
                                        ${activeSection === item.id ? 'bg-white text-primary-dark shadow-md' : 'text-gray-500 hover:bg-white/50'}`
                                    }
                                >
                                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: 20, className: "mb-0.5" })}
                                    <span className="text-xs">{item.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="pt-2">
                            {activeSection === 'overview' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in"><SpeedometerGauge value={speedControlResult.gauge_value} tips={speedControlResult.tips} /><ResultsStatCard icon={<TrendingUp />} value={totalRecordedTime >= 60 ? <span className={getWpmColorClass(avgWpm)}>{avgWpm}</span> : 'N/A'} label="Average WPM" sublabel="Words per minute" color="violet" /><ResultsStatCard icon={<Rocket />} value={<span className={getWpmColorClass(peakWpm)}>{peakWpm}</span>} label="Peak WPM" sublabel="Highest words in a minute" color="amber" /><ResultsStatCard icon={<Clock />} value={formatTime(totalRecordedTime)} label="Time Recorded" sublabel={`${totalRecordedTime} seconds total`} color="emerald" /><ResultsStatCard icon={<UserRound />} value={totalWords} label="Total Words" sublabel="Words detected in recording" color="sky"/></div>)}
                            {activeSection === 'pacing' && (<div className="animate-fade-in space-y-4">{wpmResults.length > 0 && totalWords > 0 ? (
                                <>
                                <ResultsChart data={wpmResults} avgWpm={avgWpm} />
                                <Card>
                                    <h3 className="font-bold text-3xl text-gray-800 mb-2">WPM Breakdown</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Time Range</th>
                                                    <th className="p-3 font-semibold text-gray-500 uppercase tracking-wider text-sm">Word Count</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {wpmResults.map((result, index) => (
                                                    <tr key={index} className="border-t border-gray-200">
                                                        <td className="p-3 text-lg text-gray-600">{`${result.minute}-${result.minute + 1} min`}</td>
                                                        <td className={`p-3 font-bold text-xl ${getWpmColorClass(result.wordCount)}`}>
                                                            {result.wordCount} words
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                                </>
                            ) : (<Card className="text-center text-gray-500 py-10"><p>No words were detected. The graph can't be displayed.</p></Card>)}</div>)}
                            {activeSection === 'ai-analysis' && (<div className="animate-fade-in"><Card><h3 className="font-bold text-2xl text-foreground mb-3 flex items-center gap-3"><Wand2 size={22} className="text-primary-dark"/>AI Voice Coach</h3>{aiAnalysisStatus === 'idle' && <div className="text-center py-8"><p className="text-gray-600 mb-4 text-lg">Click to get personalized feedback on your speech from our AI coach.</p><Button onClick={() => handleAiAnalysis(avgWpm)}><Wand2 size={18}/> Analyze My Speech</Button></div>}{aiAnalysisStatus === 'loading' && <div className="space-y-2 animate-pulse"><div className="h-5 w-3/4 bg-gray-200 rounded-md"></div><div className="h-8 w-full bg-gray-200 rounded-md"></div></div>}{aiAnalysisStatus === 'error' && <div className="p-2 bg-red-100/50 border border-red-200/50 rounded-lg text-red-700 text-base flex items-start gap-2"><AlertTriangle size={20} className="flex-shrink-0 mt-0.5" /><p>{aiAnalysisError}</p></div>}{aiAnalysisStatus === 'done' && aiAnalysisResult && <div className="space-y-4 pt-1 animate-fade-in"><div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200/50"><h4 className="font-bold text-xl mb-2 text-indigo-700 flex items-center gap-2"><Lightbulb size={20}/> Overall Feedback</h4><p className="text-lg text-indigo-900/80">{aiAnalysisResult.overallFeedback}</p></div><div className="p-4 bg-teal-50 rounded-2xl border border-teal-200/50"><h4 className="font-bold text-xl mb-2 text-teal-700 flex items-center gap-2"><Gauge size={20}/> Pacing Analysis</h4><p className="text-lg text-teal-900/80">{aiAnalysisResult.pacingFeedback}</p></div></div>}</Card></div>)}
                            {activeSection === 'transcript' && (<div className="animate-fade-in"><CollapsibleCard title="Full Transcript" icon={<MessageSquare size={22} className="text-primary-dark"/>} defaultOpen={true}><div className="mt-2 max-h-60 overflow-y-auto bg-gray-100/70 font-mono p-3 rounded-md text-base text-gray-700"><p className="whitespace-pre-wrap break-words">{rawTranscriptJson.length>0 ? transcriptDataRef.current.map(w=>w.punctuated_word).join(' ') : 'No transcript data.'}</p></div></CollapsibleCard></div>)}
                        </div>
                    </div>);
            }
            case 'error': return (<Card className="max-w-md text-center bg-red-100/50 border-red-200/60 p-6"><h2 className="text-3xl font-bold mb-3 text-red-700">An Error Occurred</h2><p className="text-lg text-red-600">{error}</p><Button onClick={resetState} className="w-full mt-4">Try Again</Button></Card>);
            case 'idle': default: return (
                <div className="flex flex-col items-center justify-center w-full h-full max-w-4xl mx-auto p-4 animate-fade-in">
                    {setupStep === 'initial' && (<div className="text-center max-w-lg">
                        <h2 className="text-4xl font-bold text-gray-800">Practice Your Pace</h2>
                        <p className="text-xl text-gray-600 mt-2 mb-6">Choose a practice mode to get started. You can speak freely or follow a guided story.</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                           <Button variant="choice" onClick={() => setSetupStep('openReadingConfig')} className="border-sky-400 bg-sky-50 hover:bg-sky-100 hover:border-sky-500 transform transition-all duration-300 hover:scale-[1.03]"><div className="flex items-center gap-3 mb-2"><div className="bg-sky-100 text-sky-600 p-2 rounded-lg"><Mic size={20}/></div><h3 className="text-xl font-bold text-gray-800">Open Reading</h3></div><p className="text-base font-normal text-gray-600">Read from your own text or topic to analyze your pacing.</p></Button>
                           <Button variant="choice" onClick={() => setSetupStep('storyConfig')} className="border-sky-400 bg-sky-50 hover:bg-sky-100 hover:border-sky-500 transform transition-all duration-300 hover:scale-[1.03]"><div className="flex items-center gap-3 mb-2"><div className="bg-sky-100 text-sky-600 p-2 rounded-lg"><BookText size={20}/></div><h3 className="text-xl font-bold text-gray-800">Story Practice</h3></div><p className="text-base font-normal text-gray-600">Read a story aloud to practice maintaining a consistent pace.</p></Button>
                        </div>
                    </div>)}
                    
                    {setupStep === 'openReadingConfig' && (<div className="w-full max-w-md text-center">
                         <Button onClick={() => { setSetupStep('initial'); setSelectedLanguage(''); }} variant="ghost" className="absolute top-4 left-4 !text-base"><ArrowLeft size={16}/> Back</Button>
                         <h3 className="text-3xl font-bold text-gray-800 mb-2">Open Reading Setup</h3>
                         <div className="space-y-4 bg-white/80 p-4 rounded-2xl shadow-inner-soft">
                            <div><label className="font-bold text-lg text-gray-700">1. Select Language</label><div className="grid grid-cols-2 gap-1 bg-gray-200/70 p-1 rounded-full mt-1"><Button onClick={()=>setSelectedLanguage('en-US')} variant='secondary' className={`!text-base ${selectedLanguage==='en-US'?'bg-white text-primary-dark shadow-md':'text-gray-600 hover:bg-white/50'}`}>English</Button><Button onClick={()=>setSelectedLanguage('hi')} variant='secondary' className={`!text-base ${selectedLanguage==='hi'?'bg-white text-primary-dark shadow-md':'text-gray-600 hover:bg-white/50'}`}>Hindi</Button></div></div>
                            <div className={`${!selectedLanguage ? 'opacity-50' : ''}`}><label className="font-bold text-lg text-gray-700">2. Set Duration</label><div className="flex items-center justify-center gap-2 bg-gray-200/70 p-1 rounded-full mt-1"><Button onClick={()=>setTimerDuration(p=>Math.max(1,p-1))} disabled={timerDuration<=1 || !selectedLanguage} className="px-4 py-1.5 text-xl text-gray-700 rounded-full bg-white shadow disabled:opacity-50">-</Button><span className="w-20 text-center text-xl font-semibold text-gray-700">{timerDuration} min</span><Button onClick={()=>setTimerDuration(p=>Math.min(10,p+1))} disabled={timerDuration>=10 || !selectedLanguage} className="px-4 py-1.5 text-xl text-gray-700 rounded-full bg-white shadow disabled:opacity-50">+</Button></div></div>
                         </div>
                         <button onClick={startRecording} disabled={!selectedLanguage} className="mt-6 mx-auto w-20 h-20 rounded-full bg-sky-500 text-white flex items-center justify-center transition-all shadow-lg transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:animate-none animate-subtle-breathing"><Mic className="w-9 h-9"/></button>
                    </div>)}
                    
                    {setupStep === 'storyConfig' && (<div className="w-full max-w-md">
                        <Button
                            onClick={() => {
                                if (showStoryList) {
                                    setShowStoryList(false);
                                } else if (selectedLanguage) {
                                    setSelectedLanguage('');
                                } else {
                                    setSetupStep('initial');
                                }
                            }}
                            variant="ghost"
                            className="absolute top-4 left-4 !text-base"
                        >
                            <ArrowLeft size={16}/> Back
                        </Button>
                        
                        <div className="text-center mb-6">
                            <h3 className="text-3xl font-bold text-gray-800 mb-2">Guided Practice Setup</h3>
                            {!selectedLanguage ? (
                                <p className="text-lg text-gray-600">Step 1: Select your language.</p>
                            ) : !showStoryList ? (
                                <p className="text-lg text-gray-600">Step 2: Set your recording duration.</p>
                            ) : (
                                <p className="text-lg text-gray-600">Step 3: Choose a story to read aloud.</p>
                            )}
                        </div>

                        {/* Step 1: Language Selection */}
                        {!selectedLanguage && (
                            <div className="grid grid-cols-2 gap-1 bg-gray-200/70 p-1 rounded-full mt-2 max-w-xs mx-auto animate-fade-in">
                                <Button onClick={()=>setSelectedLanguage('en-US')} variant='secondary' className={`!text-base ${selectedLanguage==='en-US'?'bg-white text-primary-dark shadow-md':'text-gray-600 hover:bg-white/50'}`}>English</Button>
                                <Button onClick={()=>setSelectedLanguage('hi')} variant='secondary' className={`!text-base ${selectedLanguage==='hi'?'bg-white text-primary-dark shadow-md':'text-gray-600 hover:bg-white/50'}`}>Hindi</Button>
                            </div>
                        )}

                        {/* Step 2: Timer Selection */}
                        {selectedLanguage && !showStoryList && (
                            <div className="space-y-4 animate-fade-in">
                                <Card className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Timer size={24} className="text-sky-500" />
                                            <h4 className="text-xl font-bold text-gray-800">Timer</h4>
                                        </div>
                                        <div className="flex items-center justify-center gap-4">
                                            <button onClick={()=>setTimerDuration(p=>Math.max(1,p-1))} disabled={timerDuration<=1} className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-2xl font-light disabled:opacity-50 hover:bg-gray-200 transition-colors">-</button>
                                            <span className="w-16 text-center text-xl font-semibold text-gray-700">{timerDuration} min</span>
                                            <button onClick={()=>setTimerDuration(p=>Math.min(10,p+1))} disabled={timerDuration>=10} className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xl font-light disabled:opacity-50 hover:bg-gray-200 transition-colors">+</button>
                                        </div>
                                    </div>
                                </Card>
                                <Button onClick={() => setShowStoryList(true)} className="w-full">
                                    Next: Choose a story
                                </Button>
                            </div>
                        )}
                        
                        {/* Step 3: Story Selection */}
                        {selectedLanguage && showStoryList && (
                            <div className="space-y-4 animate-fade-in">
                                <Card className="p-4">
                                    <h4 className="text-2xl font-bold text-gray-800 mb-4">Practice with a story:</h4>
                                    <div className="space-y-3">
                                        {(stories[selectedLanguage as keyof typeof stories] || []).map((story, index) => (
                                            <button 
                                                key={index} 
                                                onClick={() => { setSelectedStory(story); setSetupStep('storyReady'); }}
                                                className={`w-full p-4 text-left rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 text-white bg-gradient-to-r ${storyColors[index % storyColors.length]}`}
                                            >
                                                <p className="font-bold text-xl">Story {index + 1}</p>
                                                <p className="font-medium text-base opacity-90">{story.title}</p>
                                            </button>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>)}

                    {setupStep === 'storyReady' && selectedStory && (<div className="w-full flex flex-col h-full"><div className="flex-shrink-0 flex items-center justify-between mb-2 gap-2"><Button onClick={() => setSetupStep('storyConfig')} variant="ghost" className="!text-base"><ArrowLeft size={16}/> Back to stories</Button><button onClick={startRecording} className="w-14 h-14 rounded-full bg-sky-500 text-white flex items-center justify-center transition-all shadow-lg transform hover:scale-105"><Mic className="w-7 h-7"/></button></div><Card className="flex-grow min-h-0 overflow-y-auto p-4"><h2 className="text-2xl font-bold text-sky-700 mb-3 text-center">{selectedStory.title}</h2><p className="whitespace-pre-line text-2xl leading-relaxed text-gray-700">{selectedStory.content}</p></Card></div>)}
                </div>
            );
        }
    };

    return (
        <div className="relative flex flex-col items-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-1">Vocal Pace Analyzer</h2>
            <p className="text-xl text-gray-500 mb-4 max-w-xl text-center">Improve your speaking clarity by analyzing your words per minute.</p>
            <Card className={`w-full h-[80vh] flex flex-col items-center ${status === 'results' ? 'justify-start' : 'justify-center'} overflow-y-auto`}>
                {renderContent()}
            </Card>
        </div>
    );
};

export default VocalPaceAnalyzer;