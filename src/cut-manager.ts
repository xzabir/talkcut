import type { CutRegion, TranscriptWord, ProjectState } from './types.ts';

const MAX_UNDO_STEPS = 50;

const FILLER_PATTERNS: string[] = [
  'um', 'uh', 'hmm', 'er', 'ah',
  'you know',
  'like',
  'i mean',
  'sort of', 'kind of',
  'basically', 'actually', 'literally',
  'right',
  'so', 'well', 'okay',
];

const MAX_NGRAM = Math.max(...FILLER_PATTERNS.map((p) => p.split(' ').length));

export class CutManager {
  private regions: CutRegion[] = [];
  private past: CutRegion[][] = [];
  private future: CutRegion[][] = [];
  private listeners: Array<(regions: CutRegion[]) => void> = [];

  getRegions(): CutRegion[] {
    return this.regions.map((r) => ({ ...r }));
  }

  addRegion(start: number, end: number, type: CutRegion['type'], label?: string): void {
    this.snapshot();
    this.regions.push({
      id: crypto.randomUUID(),
      start,
      end,
      type,
      label,
    });
    this.notify();
  }

  removeRegion(id: string): void {
    this.snapshot();
    this.regions = this.regions.filter((r) => r.id !== id);
    this.notify();
  }

  clear(): void {
    if (this.regions.length === 0) return;
    this.snapshot();
    this.regions = [];
    this.notify();
  }

  findFillerWords(transcript: TranscriptWord[]): Array<{ words: TranscriptWord[]; filler: string; start: number; end: number }> {
    const results: Array<{ words: TranscriptWord[]; filler: string; start: number; end: number }> = [];
    const used = new Set<number>();

    for (let i = 0; i < transcript.length; i++) {
      for (let n = Math.min(MAX_NGRAM, transcript.length - i); n >= 1; n--) {
        const slice = transcript.slice(i, i + n);
        const phrase = slice
          .map((w) => w.word.toLowerCase().replace(/[.,!?;:]+$/, ''))
          .join(' ');

        if (FILLER_PATTERNS.includes(phrase)) {
          let alreadyCut = false;
          for (const r of this.regions) {
            if (r.start <= slice[0].start && r.end >= slice[slice.length - 1].end) {
              alreadyCut = true;
              break;
            }
          }

          if (!alreadyCut) {
            results.push({
              words: slice,
              filler: phrase,
              start: slice[0].start,
              end: slice[slice.length - 1].end,
            });
            for (let k = i; k < i + n; k++) used.add(k);
          }
          break;
        }
      }
    }

    return results;
  }

  findSilence(
    transcript: TranscriptWord[],
    minGapSeconds: number,
  ): Array<{ start: number; end: number; duration: number }> {
    const silences: Array<{ start: number; end: number; duration: number }> = [];

    for (let i = 0; i < transcript.length - 1; i++) {
      const gap = transcript[i + 1].start - transcript[i].end;
      if (gap >= minGapSeconds) {
        let alreadyCut = false;
        for (const r of this.regions) {
          if (r.start <= transcript[i].end && r.end >= transcript[i + 1].start) {
            alreadyCut = true;
            break;
          }
        }
        if (!alreadyCut) {
          silences.push({
            start: transcript[i].end,
            end: transcript[i + 1].start,
            duration: gap,
          });
        }
      }
    }

    return silences;
  }

  undo(): void {
    if (this.past.length === 0) return;
    this.future.push(this.regions.map((r) => ({ ...r })));
    this.regions = this.past.pop()!;
    this.notify();
  }

  redo(): void {
    if (this.future.length === 0) return;
    this.past.push(this.regions.map((r) => ({ ...r })));
    this.regions = this.future.pop()!;
    this.notify();
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  saveToProject(project: ProjectState): void {
    project.cutList = this.regions.map((r) => ({ ...r }));
  }

  loadFromProject(project: ProjectState): void {
    this.regions = (project.cutList || []).map((r) => ({ ...r }));
    this.past = [];
    this.future = [];
    this.notify();
  }

  onChange(callback: (regions: CutRegion[]) => void): void {
    this.listeners.push(callback);
  }

  private snapshot(): void {
    this.past.push(this.regions.map((r) => ({ ...r })));
    if (this.past.length > MAX_UNDO_STEPS) {
      this.past.shift();
    }
    this.future = [];
  }

  private notify(): void {
    const copy = this.getRegions();
    for (const cb of this.listeners) {
      cb(copy);
    }
  }
}
