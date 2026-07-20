import type { TranscriptWord } from './types.ts';
import type { WhisperWorkerOutMessage } from './whisper-types.ts';

export interface TranscriptionCallbacks {
  onProgress: (status: string, progress: number, message: string) => void;
  onComplete: (words: TranscriptWord[]) => void;
  onError: (error: string) => void;
}

const DEFAULT_MODEL = 'Xenova/whisper-tiny.en';

const TRANSCRIPTION_TIMEOUT_MS = 10 * 60 * 1000;

export class TranscriptionService {
  private worker: Worker | null = null;
  private modelLoaded = false;
  private currentModelId: string = DEFAULT_MODEL;
  private modelLoadResolve: ((value: void) => void) | null = null;
  private modelLoadReject: ((reason: Error) => void) | null = null;
  private currentCallbacks: TranscriptionCallbacks | null = null;
  private transcriptionTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    this.worker = new Worker(
      new URL('./transcription-worker.ts', import.meta.url),
      { type: 'module' }
    );

    this.worker.onmessage = (event: MessageEvent<WhisperWorkerOutMessage>) => {
      const msg = event.data;
      switch (msg.type) {
        case 'model-loaded':
          this.modelLoaded = true;
          if (this.modelLoadResolve) {
            const resolve = this.modelLoadResolve;
            this.modelLoadResolve = null;
            this.modelLoadReject = null;
            resolve();
          }
          break;

        case 'progress':
          if (this.currentCallbacks) {
            this.currentCallbacks.onProgress(msg.status, msg.progress, msg.message);
          }
          break;

        case 'result':
          this.clearTranscriptionTimer();
          if (this.currentCallbacks) {
            this.currentCallbacks.onComplete(msg.words);
            this.currentCallbacks = null;
          }
          break;

        case 'error':
          this.clearTranscriptionTimer();
          if (this.modelLoadReject) {
            const reject = this.modelLoadReject;
            this.modelLoadResolve = null;
            this.modelLoadReject = null;
            reject(new Error(msg.message));
          } else if (this.currentCallbacks) {
            this.currentCallbacks.onError(msg.message);
            this.currentCallbacks = null;
          }
          break;
      }
    };

    this.worker.onerror = (error: ErrorEvent) => {
      this.clearTranscriptionTimer();
      const msg = error.message || 'Unknown worker error';
      if (this.modelLoadReject) {
        const reject = this.modelLoadReject;
        this.modelLoadResolve = null;
        this.modelLoadReject = null;
        reject(new Error(msg));
      } else if (this.currentCallbacks) {
        this.currentCallbacks.onError(msg);
        this.currentCallbacks = null;
      }
    };
  }

  setModelId(modelId: string): void {
    if (this.currentModelId === modelId && this.modelLoaded) return;
    this.currentModelId = modelId;
    this.modelLoaded = false;
  }

  async ensureModel(
    onProgress?: (progress: number, message: string) => void
  ): Promise<void> {
    if (this.modelLoaded) return;
    if (!this.worker) throw new Error('Worker not initialized');

    return new Promise<void>((resolve, reject) => {
      this.modelLoadResolve = resolve;
      this.modelLoadReject = reject;

      const originalOnmessage = this.worker!.onmessage;
      this.worker!.onmessage = (event: MessageEvent<WhisperWorkerOutMessage>) => {
        const msg = event.data;
        if (msg.type === 'progress' && msg.status === 'loading-model') {
          onProgress?.(msg.progress / 100, msg.message);
        } else if (msg.type === 'model-loaded') {
          this.modelLoaded = true;
          this.modelLoadResolve = null;
          this.modelLoadReject = null;
          this.worker!.onmessage = originalOnmessage;
          resolve();
        } else if (msg.type === 'error') {
          this.modelLoadResolve = null;
          this.modelLoadReject = null;
          this.worker!.onmessage = originalOnmessage;
          reject(new Error(msg.message));
        }
      };

      this.worker?.postMessage({
        type: 'load-model',
        modelId: this.currentModelId,
      });
    });
  }

  transcribe(
    audioData: Float32Array,
    sampleRate: number,
    callbacks: TranscriptionCallbacks
  ): void {
    if (!this.worker) {
      callbacks.onError('Worker not initialized');
      return;
    }

    this.currentCallbacks = callbacks;

    this.clearTranscriptionTimer();
    this.transcriptionTimer = setTimeout(() => {
      if (this.currentCallbacks) {
        this.currentCallbacks.onError(
          'Transcription timed out after 10 minutes. Try a shorter video or the Tiny model.'
        );
        this.currentCallbacks = null;
      }
      this.cancel();
    }, TRANSCRIPTION_TIMEOUT_MS);

    const buffer = audioData.buffer.slice(0);
    this.worker.postMessage(
      { type: 'transcribe', audioData: buffer, sampleRate },
      [buffer]
    );
  }

  private clearTranscriptionTimer(): void {
    if (this.transcriptionTimer) {
      clearTimeout(this.transcriptionTimer);
      this.transcriptionTimer = null;
    }
  }

  cancel(): void {
    this.clearTranscriptionTimer();
    this.currentCallbacks = null;
    this.worker?.postMessage({ type: 'cancel' });
  }

  destroy(): void {
    this.clearTranscriptionTimer();
    this.currentCallbacks = null;
    this.modelLoadResolve = null;
    this.modelLoadReject = null;
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.modelLoaded = false;
  }

  isModelLoaded(): boolean {
    return this.modelLoaded;
  }
}
