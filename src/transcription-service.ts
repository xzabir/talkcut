import type { TranscriptWord } from './types.ts';
import type { WhisperWorkerOutMessage } from './whisper-types.ts';

export interface TranscriptionCallbacks {
  onProgress: (status: string, progress: number, message: string) => void;
  onComplete: (words: TranscriptWord[]) => void;
  onError: (error: string) => void;
}

const DEFAULT_MODEL = 'Xenova/whisper-tiny.en';

export class TranscriptionService {
  private worker: Worker | null = null;
  private modelLoaded = false;
  private currentModelId: string = DEFAULT_MODEL;
  private modelLoadResolve: ((value: void) => void) | null = null;
  private modelLoadReject: ((reason: Error) => void) | null = null;
  private currentCallbacks: TranscriptionCallbacks | null = null;

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
            this.modelLoadResolve();
            this.modelLoadResolve = null;
            this.modelLoadReject = null;
          }
          break;

        case 'progress':
          if (this.modelLoadResolve && msg.status === 'loading-model') {
            // Model download progress — forward to the ensureModel callback
            // via a side channel. The caller's onProgress is not yet set.
          }
          if (this.currentCallbacks) {
            this.currentCallbacks.onProgress(msg.status, msg.progress, msg.message);
          }
          break;

        case 'result':
          if (this.currentCallbacks) {
            this.currentCallbacks.onComplete(msg.words);
            this.currentCallbacks = null;
          }
          break;

        case 'error':
          {
            if (this.modelLoadReject) {
              this.modelLoadReject(new Error(msg.message));
              this.modelLoadResolve = null;
              this.modelLoadReject = null;
            } else if (this.currentCallbacks) {
              this.currentCallbacks.onError(msg.message);
              this.currentCallbacks = null;
            }
          }
          break;
      }
    };

    this.worker.onerror = (error: ErrorEvent) => {
      const msg = error.message || 'Unknown worker error';
      if (this.modelLoadReject) {
        this.modelLoadReject(new Error(msg));
        this.modelLoadResolve = null;
        this.modelLoadReject = null;
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

    return new Promise<void>((resolve, reject) => {
      this.modelLoadResolve = resolve;
      this.modelLoadReject = reject;

      // Intercept progress messages during model loading
      const originalOnmessage = this.worker!.onmessage;
      this.worker!.onmessage = (event: MessageEvent<WhisperWorkerOutMessage>) => {
        const msg = event.data;
        if (msg.type === 'progress' && msg.status === 'loading-model') {
          onProgress?.(msg.progress / 100, msg.message);
        } else if (msg.type === 'model-loaded') {
          this.modelLoaded = true;
          this.worker!.onmessage = originalOnmessage;
          resolve();
        } else if (msg.type === 'error') {
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

    const buffer = audioData.buffer.slice(0);
    this.worker.postMessage(
      { type: 'transcribe', audioData: buffer, sampleRate },
      [buffer]
    );
  }

  cancel(): void {
    this.currentCallbacks = null;
    this.worker?.postMessage({ type: 'cancel' });
  }

  destroy(): void {
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
