import type { TranscriptWord } from './types.ts';

// ── Main → Worker ──────────────────────────────────────────
export interface TranscribeRequest {
  type: 'transcribe';
  audioData: Float32Array;
  sampleRate: number;
}

export type WhisperWorkerInMessage = TranscribeRequest;

// ── Worker → Main ──────────────────────────────────────────
export interface WhisperProgressMessage {
  type: 'progress';
  status: 'loading-model' | 'extracting-audio' | 'transcribing' | 'done' | 'error';
  progress: number;
  message: string;
}

export interface WhisperResultMessage {
  type: 'result';
  words: TranscriptWord[];
}

export interface WhisperErrorMessage {
  type: 'error';
  message: string;
}

export type WhisperWorkerOutMessage =
  | WhisperProgressMessage
  | WhisperResultMessage
  | WhisperErrorMessage;
