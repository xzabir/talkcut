import type {
  TranscribeRequest,
  WhisperProgressMessage,
  WhisperResultMessage,
  WhisperErrorMessage,
} from './whisper-types.ts';

// ── Mock word corpus (podcast-style vocabulary) ────────────
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

// ── Helpers ─────────────────────────────────────────────────
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function post(msg: WhisperProgressMessage | WhisperResultMessage | WhisperErrorMessage): void {
  self.postMessage(msg);
}

// ── Simulated whisper pipeline ──────────────────────────────
async function simulateTranscription(audioData: Float32Array, sampleRate: number): Promise<void> {
  const durationSec = audioData.length / sampleRate;
  const simFactor = 0.5; // simulates ~2× real-time on a fast machine
  const simTimeMs = Math.max(800, durationSec * 1000 * simFactor);

  // 1. loading-model
  post({ type: 'progress', status: 'loading-model', progress: 0, message: 'Downloading whisper model…' });
  await sleep(rand(600, 1000));
  post({ type: 'progress', status: 'loading-model', progress: 12, message: 'Loading model into memory…' });
  await sleep(rand(300, 600));
  post({ type: 'progress', status: 'loading-model', progress: 25, message: 'Model ready. Initializing runtime…' });
  await sleep(rand(200, 400));

  // 2. extracting-audio
  post({ type: 'progress', status: 'extracting-audio', progress: 28, message: 'Extracting audio track from video…' });
  await sleep(simTimeMs * 0.05);
  post({ type: 'progress', status: 'extracting-audio', progress: 35, message: 'Resampling to 16 kHz mono…' });
  await sleep(simTimeMs * 0.05);
  post({ type: 'progress', status: 'extracting-audio', progress: 42, message: 'Audio preprocessed.' });
  await sleep(rand(100, 250));

  // 3. transcribing (bulk of time)
  post({ type: 'progress', status: 'transcribing', progress: 45, message: 'Running whisper inference…' });
  await sleep(simTimeMs * 0.20);
  post({ type: 'progress', status: 'transcribing', progress: 58, message: 'Processing segment 1 of 4…' });
  await sleep(simTimeMs * 0.15);
  post({ type: 'progress', status: 'transcribing', progress: 70, message: 'Processing segment 2 of 4…' });
  await sleep(simTimeMs * 0.15);
  post({ type: 'progress', status: 'transcribing', progress: 82, message: 'Processing segment 3 of 4…' });
  await sleep(simTimeMs * 0.15);
  post({ type: 'progress', status: 'transcribing', progress: 94, message: 'Processing segment 4 of 4…' });
  await sleep(simTimeMs * 0.15);

  // 4. Generate mock word-level timestamps
  const wordsPerSecond = 3.2;
  const rawCount = Math.round(durationSec * wordsPerSecond);
  const wordCount = Math.min(200, Math.max(100, rawCount));

  interface MockWord {
    word: string;
    start: number;
    end: number;
    confidence: number;
  }

  const words: MockWord[] = [];
  let cursor = 0;

  for (let i = 0; i < wordCount; i++) {
    const text = WORD_CORPUS[i % WORD_CORPUS.length];
    const wordLen = rand(0.18, 0.48);
    const gap = rand(0, 0.18);

    const start = cursor + gap;
    const end = start + wordLen;

    if (end > durationSec) break;

    words.push({
      word: text,
      start: Math.round(start * 1000) / 1000,
      end: Math.round(end * 1000) / 1000,
      confidence: Math.round(rand(0.82, 0.99) * 100) / 100,
    });

    cursor = end;
  }

  // 5. Done
  post({
    type: 'progress',
    status: 'done',
    progress: 100,
    message: `Transcription complete — ${words.length} words`,
  });

  post({ type: 'result', words });
}

// ── Entry point ─────────────────────────────────────────────
self.onmessage = (e: MessageEvent<TranscribeRequest>): void => {
  const { audioData, sampleRate } = e.data;

  simulateTranscription(audioData, sampleRate).catch((err: unknown) => {
    post({
      type: 'error',
      message: err instanceof Error ? err.message : String(err),
    });
  });
};
