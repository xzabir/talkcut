export const BRAND = {
  name: 'Scripta',
  tagline: 'Edit video by editing the transcript.',
  subtitle: 'Nothing leaves your browser.',
  description: 'Free, open-source, browser-based video editor. Transcribe, edit text, export. All processing runs locally — no server, no API key, no cloud.',
  url: 'https://xzabir.github.io/scripta',
  github: 'https://github.com/xzabir/scripta',
  license: 'MIT',
  theme: {
    bgCanvas: '#0a0a0f',
    bgSurface: '#111118',
    bgOverlay: '#1a1a24',
    bgElevated: '#22222e',
    accent: '#6c5ce7',
    accentHover: '#7f70f0',
    accentGlow: 'rgba(108, 92, 231, 0.4)',
    textPrimary: '#f0f0f5',
    textSecondary: '#8888a0',
    textTertiary: '#555568',
    border: '#2a2a38',
    success: '#2ea043',
    danger: '#f85149',
  },
  fontDisplay: "'Inter', system-ui, sans-serif",
  fontBody: "'Inter', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', 'SF Mono', monospace",
};

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Compare', href: '#compare' },
  { label: 'FAQ', href: '#faq' },
];

export const FEATURES = [
  {
    icon: 'mic',
    title: 'Local transcription',
    description: 'Whisper runs in your browser via WebAssembly. No server upload, no API key. Your audio never leaves your machine.',
  },
  {
    icon: 'cursor',
    title: 'Edit text, cut video',
    description: 'Select words, press Delete. The video is cut at those exact moments. Edit video as fast as you can read.',
  },
  {
    icon: 'scissors',
    title: 'Filler word removal',
    description: 'One-click scan for "um", "uh", "you know", and long pauses. Review each, apply with a single click.',
  },
  {
    icon: 'export',
    title: 'WebM & MP4 export',
    description: 'WebCodecs for fast WebM on Chrome. FFmpeg.wasm for universal MP4. Both run entirely in your browser.',
  },
  {
    icon: 'lock',
    title: 'Privacy first',
    description: 'No accounts, no tracking, no telemetry. Open source under MIT. Your video stays on your device.',
  },
  {
    icon: 'bolt',
    title: 'Works offline',
    description: 'Install as a PWA. After the first load, everything works without internet — even transcription.',
  },
];

export const STEPS = [
  {
    number: '01',
    title: 'Drop a video',
    description: 'Drag any MP4, MOV, or MKV into the browser. It stays on your device — stored in OPFS, never uploaded.',
  },
  {
    number: '02',
    title: 'Transcribe',
    description: 'Click Transcribe. Whisper runs locally in a Web Worker, producing word-level timestamps in seconds.',
  },
  {
    number: '03',
    title: 'Edit the text',
    description: 'Read the transcript. Select filler words, awkward pauses, or mistakes. Press Delete to mark them for removal.',
  },
  {
    number: '04',
    title: 'Export',
    description: 'Click Export. The video is re-encoded without the cut segments. Download the final file. Done.',
  },
];

export const COMPARISON = [
  { feature: 'Price', descript: '$16-50/mo + credits', scripta: 'Free' },
  { feature: 'Local processing', descript: 'No', scripta: 'Yes' },
  { feature: 'Browser-based', descript: 'Desktop app', scripta: 'Yes' },
  { feature: 'Privacy', descript: 'Server-side', scripta: '100% local' },
  { feature: 'Transcription quota', descript: '10-40 hrs/mo', scripta: 'Unlimited' },
  { feature: 'Watermark', descript: 'Free tier: yes', scripta: 'Never' },
  { feature: 'Open source', descript: 'No', scripta: 'MIT' },
  { feature: 'Works offline', descript: 'No', scripta: 'Yes (PWA)' },
];

export const FAQS = [
  {
    q: 'Is my video uploaded to a server?',
    a: 'No. Everything — transcription, editing, export — runs in your browser. Your video file is stored locally in the browser\'s Origin Private File System (OPFS) and never sent anywhere.',
  },
  {
    q: 'How fast is transcription?',
    a: 'With the Tiny model (~40MB), a 10-minute video takes about 25 seconds on a modern laptop. The Base model (~100MB) is more accurate but slower. Models are downloaded once and cached for offline use.',
  },
  {
    q: 'What browsers are supported?',
    a: 'Transcription and editing work in any modern browser. WebM export (fastest) requires Chrome or Edge. MP4 export via FFmpeg.wasm works in all browsers including Firefox and Safari.',
  },
  {
    q: 'Is it really free?',
    a: 'Yes. MIT licensed, no subscription, no credits, no watermark, no account required. It runs on your hardware, so there\'s no server cost to cover.',
  },
  {
    q: 'Can I use it for commercial projects?',
    a: 'Yes. The MIT license allows any use, including commercial. Your video content is yours — it never leaves your machine.',
  },
  {
    q: 'How accurate are the cuts?',
    a: 'Cuts are applied at the frame level. The video is played segment-by-segment and each displayed frame is re-encoded with adjusted timestamps, so cuts are precise to the video\'s frame rate.',
  },
];

export const STATS = [
  { value: '0', label: 'Dollars. Ever.' },
  { value: '100%', label: 'Local processing' },
  { value: 'MIT', label: 'Open source license' },
  { value: '0', label: 'Servers involved' },
];
