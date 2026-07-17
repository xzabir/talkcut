import type { TranscriptWord } from './types.ts';

// ── Main → Worker ──────────────────────────────────────────
export interface LoadModelRequest {
  type: 'load-model';
  modelData?: ArrayBuffer;
}

export interface TranscribeRequest {
  type: 'transcribe';
  audioData: Float32Array;
  sampleRate: number;
}

export interface CancelRequest {
  type: 'cancel';
}

export type WhisperWorkerInMessage =
  | LoadModelRequest
  | TranscribeRequest
  | CancelRequest;

// ── Worker → Main ──────────────────────────────────────────
export interface ModelLoadedMessage {
  type: 'model-loaded';
}

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
  | ModelLoadedMessage
  | WhisperProgressMessage
  | WhisperResultMessage
  | WhisperErrorMessage;
