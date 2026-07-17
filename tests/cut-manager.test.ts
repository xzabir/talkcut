import { describe, it, expect } from 'vitest';
import { CutManager } from '../src/cut-manager.ts';
import type { TranscriptWord } from '../src/types.ts';

function word(w: string, start: number, end: number, confidence = 0.95): TranscriptWord {
  return { word: w, start, end, confidence };
}

describe('CutManager', () => {
  it('adds and removes regions', () => {
    const manager = new CutManager();
    manager.addRegion(1, 2, 'delete', 'trim');
    manager.addRegion(5, 6, 'silence', 'pause');

    expect(manager.getRegions()).toHaveLength(2);

    const id = manager.getRegions()[0].id;
    manager.removeRegion(id);

    expect(manager.getRegions()).toHaveLength(1);
    expect(manager.getRegions()[0].type).toBe('silence');
  });

  it('detects filler words', () => {
    const manager = new CutManager();
    const transcript = [
      word('um', 0.0, 0.3),
      word('hello', 0.4, 0.8),
      word('like', 1.0, 1.2),
      word('world', 1.3, 1.7),
    ];

    const found = manager.findFillerWords(transcript);
    expect(found).toHaveLength(2);
    expect(found[0].word.word).toBe('um');
    expect(found[1].word.word).toBe('like');
  });

  it('detects silence between words', () => {
    const manager = new CutManager();
    const transcript = [
      word('hello', 0.0, 0.5),
      word('world', 2.5, 3.0),
    ];

    const pauses = manager.findSilence(transcript, 1.5);
    expect(pauses).toHaveLength(1);
    expect(pauses[0].start).toBe(0.5);
    expect(pauses[0].end).toBe(2.5);
    expect(pauses[0].duration).toBe(2.0);
  });

  it('supports undo and redo', () => {
    const manager = new CutManager();
    manager.addRegion(1, 2, 'delete', 'a');
    manager.addRegion(3, 4, 'delete', 'b');

    expect(manager.getRegions()).toHaveLength(2);
    expect(manager.canUndo()).toBe(true);
    expect(manager.canRedo()).toBe(false);

    manager.undo();
    expect(manager.getRegions()).toHaveLength(1);
    expect(manager.canRedo()).toBe(true);

    manager.redo();
    expect(manager.getRegions()).toHaveLength(2);
  });

  it('notifies on change', () => {
    const manager = new CutManager();
    let calls = 0;
    manager.onChange(() => {
      calls++;
    });

    manager.addRegion(1, 2, 'delete', 'x');
    manager.undo();
    manager.redo();

    expect(calls).toBe(3);
  });
});
