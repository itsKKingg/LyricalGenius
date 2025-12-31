export interface TranscriptionSegment {
  text: string;
  startMs: number;
  endMs: number;
  confidence?: number;
}

export interface TranscriptionResponse {
  segments: TranscriptionSegment[];
  fullText: string;
  confidence: number;
  language?: string;
}

export interface TranscriptionRequest {
  audioData: string; // base64-encoded audio
  language?: string;
  model?: string;
}

export interface VoiceoverRequest {
  text: string;
  voiceId?: string;
  model?: string;
}

export interface VoiceoverResponse {
  audioData: string; // base64-encoded audio
  duration: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
