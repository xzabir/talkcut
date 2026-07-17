import type { TranscriptWord } from './types.ts';

// ── Main → Worker ──────────────────────────────────────────
export interface LoadModelRequest {
  type: 'load-model';
  modelId: string;
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

export interface ModelLoadProgressMessage {
  type: 'model-progress';
  progress: number;
  message: string;
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
  | ModelLoadProgressMessage
  | WhisperProgressMessage
  | WhisperResultMessage
  | WhisperErrorMessage;
