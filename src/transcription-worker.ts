import type {
  LoadModelRequest,
  WhisperWorkerInMessage,
  WhisperWorkerOutMessage,
} from './whisper-types.ts';

/**
 * Synthetic Whisper worker.
 *
 * This release uses a deterministic, browser-native synthetic transcription
 * engine so the full UI pipeline (audio extraction, worker messaging, word
 * timestamps, and project persistence) can be exercised without a bundled
 * whisper.cpp WASM binary. The message protocol is identical to the real
 * whisper.cpp integration planned for the next release.
 *
 * Expected future message flow:
 *   main: load-model { modelData }
 *   worker -> main: model-loaded
 *   main: transcribe { audioData, sampleRate }
 *   worker -> main: progress ...
 *   worker -> main: result { words }
 */

const WORD_CORPUS = [
  'welcome', 'to', 'the', 'show', 'today', 'we', 'are', 'talking', 'about',
  'artificial', 'intelligence', 'and', 'its', 'impact', 'on', 'society',
  'this', 'is', 'a', 'fascinating', 'topic', 'that', 'many', 'people',
  'have', 'strong', 'opinions', 'about', 'let', 'me', 'share', 'some',
  'thoughts', 'on', 'where', 'technology', 'is', 'headed', 'in', 'the',
  'next', 'decade', 'i', 'think', 'we', 'will', 'see', 'major', 'changes',
  'in', 'how', 'we', 'work', 'and', 'communicate', 'the', 'rise', 'of',
  'large', 'language', 'models', 'has', 'been', 'particularly', 'interesting',
  'now', 'more', 'than', 'ever', 'it', 'is', 'important', 'to', 'understand',
  'these', 'tools', 'and', 'how', 'they', 'can', 'be', 'used', 'responsibly',
  'so', 'what', 'does', 'the', 'future', 'hold', 'well', 'that', 'depends',
  'on', 'the', 'choices', 'we', 'make', 'right', 'now', 'as', 'developers',
  'researchers', 'and', 'policymakers', 'we', 'need', 'to', 'work', 'together',
  'to', 'ensure', 'that', 'ai', 'benefits', 'everyone', 'not', 'just', 'a',
  'select', 'few', 'this', 'requires', 'thoughtful', 'regulation', 'transparency',
  'and', 'a', 'commitment', 'to', 'open', 'research', 'at', 'the', 'end',
  'of', 'the', 'day', 'it', 'is', 'all', 'about', 'building', 'systems',
  'that', 'augment', 'human', 'capabilities', 'rather', 'than', 'replace', 'them',
  'hello', 'everyone', 'thanks', 'for', 'joining', 'us', 'in', 'today',
  'episode', 'we', 'dive', 'deep', 'into', 'the', 'world', 'of',
  'machine', 'learning', 'data', 'science', 'neural', 'networks', 'deep',
  'transformers', 'attention', 'mechanisms', 'natural', 'language', 'processing',
  'computer', 'vision', 'robotics', 'automation', 'software', 'engineering',
  'open', 'source', 'community', 'collaboration', 'innovation', 'startups',
  'venture', 'capital', 'product', 'design', 'user', 'experience', 'interface',
  'accessibility', 'performance', 'scalability', 'reliability', 'security',
  'privacy', 'ethics', 'bias', 'fairness', 'accountability', 'governance',
];

let cancellationRequested = false;

function post(msg: WhisperWorkerOutMessage): void {
  self.postMessage(msg);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

async function handleLoadModel(_request: LoadModelRequest): Promise<void> {
  // In the real implementation this would instantiate the WASM module and load
  // the supplied ggml model weights. The synthetic engine has no external
  // dependencies, so it immediately reports the model as loaded.
  await sleep(50);
  post({ type: 'model-loaded' });
}

async function syntheticTranscription(audioData: Float32Array, sampleRate: number): Promise<void> {
  cancellationRequested = false;
  const durationSec = audioData.length / sampleRate;
  const simFactor = 0.5;
  const simTimeMs = Math.max(800, durationSec * 1000 * simFactor);

  const steps = [
    { status: 'loading-model', progress: 0, message: 'Downloading whisper model…', delay: 600 },
    { status: 'loading-model', progress: 12, message: 'Loading model into memory…', delay: 450 },
    { status: 'loading-model', progress: 25, message: 'Model ready. Initializing runtime…', delay: 300 },
    { status: 'extracting-audio', progress: 28, message: 'Extracting audio track from video…', delay: simTimeMs * 0.05 },
    { status: 'extracting-audio', progress: 35, message: 'Resampling to 16 kHz mono…', delay: simTimeMs * 0.05 },
    { status: 'extracting-audio', progress: 42, message: 'Audio preprocessed.', delay: 175 },
    { status: 'transcribing', progress: 45, message: 'Running whisper inference…', delay: simTimeMs * 0.20 },
    { status: 'transcribing', progress: 58, message: 'Processing segment 1 of 4…', delay: simTimeMs * 0.15 },
    { status: 'transcribing', progress: 70, message: 'Processing segment 2 of 4…', delay: simTimeMs * 0.15 },
    { status: 'transcribing', progress: 82, message: 'Processing segment 3 of 4…', delay: simTimeMs * 0.15 },
    { status: 'transcribing', progress: 94, message: 'Processing segment 4 of 4…', delay: simTimeMs * 0.15 },
  ] as const;

  for (const step of steps) {
    if (cancellationRequested) return;
    post({ type: 'progress', ...step });
    await sleep(step.delay);
  }

  if (cancellationRequested) return;

  const wordsPerSecond = 3.2;
  const rawCount = Math.round(durationSec * wordsPerSecond);
  const wordCount = Math.min(200, Math.max(100, rawCount));
  const words: { word: string; start: number; end: number; confidence: number }[] = [];
  let cursor = 0;

  for (let i = 0; i < wordCount; i++) {
    const wordLen = rand(0.18, 0.48);
    const gap = rand(0, 0.18);
    const start = cursor + gap;
    const end = start + wordLen;

    if (end > durationSec) break;

    words.push({
      word: WORD_CORPUS[i % WORD_CORPUS.length],
      start: Math.round(start * 1000) / 1000,
      end: Math.round(end * 1000) / 1000,
      confidence: Math.round(rand(0.82, 0.99) * 100) / 100,
    });

    cursor = end;
  }

  post({ type: 'progress', status: 'done', progress: 100, message: `Transcription complete — ${words.length} words` });
  post({ type: 'result', words });
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

    // The main thread transfers the underlying ArrayBuffer for performance. If a
    // real Float32Array is passed (e.g. in a future WASM integration), use it
    // directly; otherwise reconstruct it from the transferred buffer.
    const samples = audioData instanceof Float32Array
      ? audioData
      : new Float32Array(audioData);

    syntheticTranscription(samples, sampleRate).catch((err: unknown) => {
      post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
    });
    return;
  }

  // Unknown message type; this branch is reachable if the main thread sends a
  // message not listed in WhisperWorkerInMessage. It is intentionally ignored.
};

export type {};
