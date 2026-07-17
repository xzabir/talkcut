import type {
  LoadModelRequest,
  WhisperWorkerInMessage,
  WhisperWorkerOutMessage,
} from './whisper-types.ts';
import type { TranscriptWord } from './types.ts';

import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;

type WhisperPipeline = Awaited<ReturnType<typeof pipeline<'automatic-speech-recognition'>>>;

let transcriber: WhisperPipeline | null = null;
let loadedModelId: string | null = null;
let cancellationRequested = false;

function post(msg: WhisperWorkerOutMessage): void {
  self.postMessage(msg);
}

async function handleLoadModel(request: LoadModelRequest): Promise<void> {
  if (loadedModelId === request.modelId && transcriber) {
    post({ type: 'model-loaded' });
    return;
  }

  post({ type: 'progress', status: 'loading-model', progress: 0, message: `Loading ${request.modelId}...` });

  try {
    transcriber = await pipeline('automatic-speech-recognition', request.modelId, {
      progress_callback: (data: { status?: string; progress?: number; file?: string }) => {
        if (data.status === 'progress' && data.progress !== undefined) {
          const pct = Math.round(data.progress);
          post({
            type: 'progress',
            status: 'loading-model',
            progress: pct,
            message: `Downloading model... ${pct}%`,
          });
        } else if (data.status === 'done') {
          post({
            type: 'progress',
            status: 'loading-model',
            progress: 100,
            message: 'Model loaded.',
          });
        }
      },
    });

    loadedModelId = request.modelId;
    post({ type: 'model-loaded' });
  } catch (err) {
    transcriber = null;
    loadedModelId = null;
    post({
      type: 'error',
      message: `Failed to load model: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
}

async function realTranscription(audioData: Float32Array, _sampleRate: number): Promise<void> {
  cancellationRequested = false;

  if (!transcriber) {
    post({ type: 'error', message: 'Model not loaded. Call load-model first.' });
    return;
  }

  post({ type: 'progress', status: 'transcribing', progress: 0, message: 'Running Whisper inference...' });

  try {
    const output = await transcriber(audioData, {
      return_timestamps: 'word',
      chunk_length_s: 30,
      stride_length_s: 5,
    });

    if (cancellationRequested) return;

    const chunks = (output as { chunks?: Array<{ text: string; timestamp: [number, number] }> }).chunks;
    if (!chunks || chunks.length === 0) {
      post({ type: 'progress', status: 'done', progress: 100, message: 'No speech detected.' });
      post({ type: 'result', words: [] });
      return;
    }

    const words: TranscriptWord[] = chunks.map((chunk) => ({
      word: chunk.text.trim(),
      start: chunk.timestamp[0] ?? 0,
      end: chunk.timestamp[1] ?? (chunk.timestamp[0] ?? 0) + 0.3,
      confidence: 0.9,
    }));

    post({
      type: 'progress',
      status: 'done',
      progress: 100,
      message: `Transcription complete — ${words.length} words`,
    });
    post({ type: 'result', words });
  } catch (err) {
    post({
      type: 'error',
      message: `Transcription failed: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
}

self.onmessage = (e: MessageEvent<WhisperWorkerInMessage>): void => {
  const { type } = e.data;

  if (type === 'load-model') {
    handleLoadModel(e.data).catch((err: unknown) => {
      post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
    });
    return;
  }

  if (type === 'cancel') {
    cancellationRequested = true;
    return;
  }

  if (type === 'transcribe') {
    const { audioData, sampleRate } = e.data;

    const samples = audioData instanceof Float32Array
      ? audioData
      : new Float32Array(audioData);

    realTranscription(samples, sampleRate).catch((err: unknown) => {
      post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
    });
    return;
  }
};

export type {};
