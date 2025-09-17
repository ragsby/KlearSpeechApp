export type AppStatus = 'idle' | 'recording' | 'analyzing' | 'results' | 'error';

export interface Word {
  word: string;
  start: number;
  end: number;
  confidence: number;
  punctuated_word?: string;
  speaker?: number;
  language: string;
}

export interface WpmResult {
  minute: number;
  wordCount: number;
}
