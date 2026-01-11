export interface TimedWord {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptionSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface TranscriptionResponse {
  text: string;
  segments: TranscriptionSegment[];
  words: TimedWord[];
  language: string;
  duration: number;
}

export const mockTranscriptionResponse: TranscriptionResponse = {
  text: "I've been walking through the city lights, searching for a sign. Every corner holds a memory, frozen in time. And I wonder if you think of me, the way I think of you. In the silence of the night, I'm still missing you.",
  language: "en",
  duration: 32.5,
  segments: [
    {
      id: 0,
      seek: 0,
      start: 0.0,
      end: 4.5,
      text: "I've been walking through the city lights, searching for a sign.",
      tokens: [1, 2, 3, 4, 5],
      temperature: 0.0,
      avg_logprob: -0.25,
      compression_ratio: 1.5,
      no_speech_prob: 0.01
    },
    {
      id: 1,
      seek: 450,
      start: 4.5,
      end: 9.2,
      text: "Every corner holds a memory, frozen in time.",
      tokens: [6, 7, 8, 9, 10],
      temperature: 0.0,
      avg_logprob: -0.22,
      compression_ratio: 1.45,
      no_speech_prob: 0.02
    },
    {
      id: 2,
      seek: 920,
      start: 9.2,
      end: 14.8,
      text: "And I wonder if you think of me, the way I think of you.",
      tokens: [11, 12, 13, 14, 15],
      temperature: 0.0,
      avg_logprob: -0.28,
      compression_ratio: 1.52,
      no_speech_prob: 0.015
    },
    {
      id: 3,
      seek: 1480,
      start: 14.8,
      end: 19.5,
      text: "In the silence of the night, I'm still missing you.",
      tokens: [16, 17, 18, 19, 20],
      temperature: 0.0,
      avg_logprob: -0.24,
      compression_ratio: 1.48,
      no_speech_prob: 0.018
    }
  ],
  words: [
    { word: "I've", start: 0.0, end: 0.3 },
    { word: "been", start: 0.3, end: 0.5 },
    { word: "walking", start: 0.5, end: 0.9 },
    { word: "through", start: 0.9, end: 1.2 },
    { word: "the", start: 1.2, end: 1.3 },
    { word: "city", start: 1.3, end: 1.6 },
    { word: "lights,", start: 1.6, end: 2.1 },
    { word: "searching", start: 2.5, end: 3.0 },
    { word: "for", start: 3.0, end: 3.2 },
    { word: "a", start: 3.2, end: 3.3 },
    { word: "sign.", start: 3.3, end: 4.5 },
    
    { word: "Every", start: 4.5, end: 4.9 },
    { word: "corner", start: 4.9, end: 5.3 },
    { word: "holds", start: 5.3, end: 5.7 },
    { word: "a", start: 5.7, end: 5.8 },
    { word: "memory,", start: 5.8, end: 6.4 },
    { word: "frozen", start: 6.8, end: 7.3 },
    { word: "in", start: 7.3, end: 7.4 },
    { word: "time.", start: 7.4, end: 9.2 },
    
    { word: "And", start: 9.2, end: 9.4 },
    { word: "I", start: 9.4, end: 9.5 },
    { word: "wonder", start: 9.5, end: 9.9 },
    { word: "if", start: 9.9, end: 10.0 },
    { word: "you", start: 10.0, end: 10.2 },
    { word: "think", start: 10.2, end: 10.5 },
    { word: "of", start: 10.5, end: 10.7 },
    { word: "me,", start: 10.7, end: 11.2 },
    { word: "the", start: 11.6, end: 11.7 },
    { word: "way", start: 11.7, end: 11.9 },
    { word: "I", start: 11.9, end: 12.0 },
    { word: "think", start: 12.0, end: 12.3 },
    { word: "of", start: 12.3, end: 12.5 },
    { word: "you.", start: 12.5, end: 14.8 },
    
    { word: "In", start: 14.8, end: 15.0 },
    { word: "the", start: 15.0, end: 15.1 },
    { word: "silence", start: 15.1, end: 15.6 },
    { word: "of", start: 15.6, end: 15.7 },
    { word: "the", start: 15.7, end: 15.8 },
    { word: "night,", start: 15.8, end: 16.5 },
    { word: "I'm", start: 16.9, end: 17.1 },
    { word: "still", start: 17.1, end: 17.4 },
    { word: "missing", start: 17.4, end: 17.9 },
    { word: "you.", start: 17.9, end: 19.5 }
  ]
};

export const mockIsolatedVocalsUrl = "https://example.com/mock-isolated-vocals.mp3";

export async function getMockTranscription(): Promise<TranscriptionResponse> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return mockTranscriptionResponse;
}

export async function getMockIsolatedVocals(): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return mockIsolatedVocalsUrl;
}
