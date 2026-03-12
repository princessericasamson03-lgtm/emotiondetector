export interface EmotionLog {
  id: number;
  timestamp: string;
  emotion: string;
  confidence: number;
  source: 'webcam' | 'upload';
  notes?: string;
}

export type EmotionType = 'felicità' | 'rabbia' | 'tristezza' | 'disgusto' | 'paura';

export const EMOTION_LABELS: Record<string, string> = {
  happy: 'felicità',
  angry: 'rabbia',
  sad: 'tristezza',
  disgusted: 'disgusto',
  fearful: 'paura'
};

export const EMOTION_COLORS: Record<string, string> = {
  felicità: '#fbbf24', // Yellow
  rabbia: '#ef4444',   // Red
  tristezza: '#3b82f6', // Blue
  disgusto: '#10b981', // Green
  paura: '#8b5cf6'     // Purple
};
