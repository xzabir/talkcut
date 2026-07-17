import type { TranscriptWord } from './types.ts';
import type { WhisperWorkerOutMessage } from './whisper-types.ts';

export interface TranscriptionCallbacks {
  onProgress: (status: string, progress: number, message: string) => void;
  onComplete: (words: TranscriptWord[]) => void;
  onError: (error: string) => void;
}

const MODEL_DIR = 'models';
const WHISPER_MODEL = 'whisper-base.bin';
const MODEL_URL = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin';

export class TranscriptionService {
  private worker: Worker | null = null;
  private modelLoaded = false;
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
            const errMsg = msg.message;
            if (this.modelLoadReject) {
              this.modelLoadReject(new Error(errMsg));
              this.modelLoadResolve = null;
              this.modelLoadReject = null;
            } else if (this.currentCallbacks) {
              this.currentCallbacks.onError(errMsg);
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

  async ensureModel(
    onProgress?: (progress: number, message: string) => void
  ): Promise<void> {
    if (this.modelLoaded) return;

    return new Promise<void>((resolve, reject) => {
      this.modelLoadResolve = resolve;
      this.modelLoadReject = reject;

      (async () => {
        try {
          const root = await navigator.storage.getDirectory();
          let modelDir: FileSystemDirectoryHandle;
          try {
            modelDir = await root.getDirectoryHandle(MODEL_DIR);
          } catch {
            modelDir = await root.getDirectoryHandle(MODEL_DIR, { create: true });
          }

          let modelData: ArrayBuffer;

          try {
            const fh = await modelDir.getFileHandle(WHISPER_MODEL);
            const file = await fh.getFile();
            modelData = await file.arrayBuffer();
            onProgress?.(1, 'Model loaded from cache');
          } catch {
            onProgress?.(0, 'Downloading whisper model...');
            const resp = await fetch(MODEL_URL);
            if (!resp.ok) throw new Error(`Model download failed: ${resp.status}`);

            const body = resp.body;
            if (!body) {
              modelData = await resp.arrayBuffer();
              onProgress?.(0.95, 'Caching model...');
            } else {
              const contentLength = resp.headers.get('content-length');
              const total = contentLength ? parseInt(contentLength, 10) : 0;
              const reader = body.getReader();
              const chunks: Uint8Array[] = [];
              let received = 0;

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                received += value.length;
                if (total) {
                  const pct = Math.round((received / total) * 100);
                  onProgress?.(received / total, `Downloading model... ${pct}%`);
                }
              }

              const merged = new Uint8Array(received);
              let offset = 0;
              for (const chunk of chunks) {
                merged.set(chunk, offset);
                offset += chunk.length;
              }
              modelData = merged.buffer.slice(0);
              onProgress?.(0.95, 'Caching model...');
            }

            const fh = await modelDir.getFileHandle(WHISPER_MODEL, { create: true });
            const writable = await fh.createWritable();
            await writable.write(new Uint8Array(modelData));
            await writable.close();
          }

          this.worker?.postMessage(
            { type: 'load-model', modelData },
            [modelData]
          );
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      })();
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
