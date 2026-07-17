import type { CutRegion, TranscriptWord } from './types.ts';
import type { CutManager } from './cut-manager.ts';

const STYLES = `
.cp-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
  overflow-y: auto;
}

.cp-notice {
  background: rgba(234, 179, 8, 0.15);
  border: 1px solid rgba(234, 179, 8, 0.4);
  border-radius: var(--radius);
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.5;
  color: #facc15;
  flex-shrink: 0;
}

.cp-notice strong {
  color: #fbbf24;
}

.cp-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.cp-section h4 {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cp-threshold-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cp-threshold-row label {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.cp-threshold-row span {
  color: var(--text-primary);
  font-weight: 600;
}

.cp-threshold-row input[type="range"] {
  flex: 1;
  accent-color: var(--accent);
  height: 4px;
}

.cp-results {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 160px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 4px;
}

.cp-result-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 4px;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
}

.cp-result-item:hover {
  background: var(--bg-surface);
}

.cp-result-item input[type="checkbox"] {
  accent-color: var(--accent);
  margin: 0;
  flex-shrink: 0;
}

.cp-result-time {
  color: var(--text-secondary);
  font-family: monospace;
  font-size: 11px;
  white-space: nowrap;
}

.cp-result-label {
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cp-result-dur {
  color: var(--accent);
  font-size: 11px;
  margin-left: auto;
  white-space: nowrap;
}

.cp-results-empty {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  padding: 8px;
}

.cp-add-btn {
  align-self: flex-end;
  margin-top: 2px;
}

.cp-regions-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 200px;
  overflow-y: auto;
}

.cp-region-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: var(--bg-surface);
  border-radius: var(--radius);
  font-size: 12px;
}

.cp-badge {
  display: inline-block;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
}

.cp-badge-delete { background: rgba(239, 68, 68, 0.2); color: var(--danger); }
.cp-badge-silence { background: rgba(234, 179, 8, 0.2); color: #facc15; }
.cp-badge-filler { background: rgba(79, 140, 255, 0.2); color: var(--accent); }

.cp-region-times {
  color: var(--text-secondary);
  font-family: monospace;
  font-size: 11px;
  white-space: nowrap;
}

.cp-region-label {
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.cp-remove-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
  flex-shrink: 0;
}

.cp-remove-btn:hover {
  color: var(--danger);
}

.cp-empty {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  padding: 8px;
}

.cp-toolbar {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.cp-toolbar .btn {
  font-size: 11px;
  padding: 4px 10px;
}

.cp-clear-btn {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
}

.cp-clear-btn:hover {
  background: rgba(239, 68, 68, 0.35);
}

.cp-region-count {
  font-weight: 400;
  font-size: 11px;
  color: var(--text-secondary);
}
`;

export class CutsPanel {
  private container: HTMLElement;
  private cutManager: CutManager;
  private getVideoEl: () => HTMLVideoElement;
  private getTranscript: () => TranscriptWord[];

  private el!: HTMLElement;
  private styleEl: HTMLStyleElement;

  private fillerResultsEl!: HTMLElement;
  private silenceResultsEl!: HTMLElement;
  private silenceThresholdInput!: HTMLInputElement;
  private silenceThresholdValueEl!: HTMLElement;
  private regionsListEl!: HTMLElement;
  private regionCountEl!: HTMLElement;
  private undoBtn!: HTMLButtonElement;
  private redoBtn!: HTMLButtonElement;

  private fillerMatches: Array<{ word: TranscriptWord; filler: string }> = [];
  private silenceMatches: Array<{ start: number; end: number; duration: number }> = [];

  private boundOnChange: ((regions: CutRegion[]) => void) | null = null;

  constructor(
    container: HTMLElement,
    cutManager: CutManager,
    getVideoEl: () => HTMLVideoElement,
    getTranscript: () => TranscriptWord[],
  ) {
    this.container = container;
    this.cutManager = cutManager;
    this.getVideoEl = getVideoEl;
    this.getTranscript = getTranscript;

    this.styleEl = document.createElement('style');
    this.styleEl.textContent = STYLES;
    document.head.appendChild(this.styleEl);

    this.buildDOM();
    this.attachEvents();
  }

  mount(): void {
    this.container.innerHTML = '';
    this.container.appendChild(this.el);

    this.boundOnChange = (regions: CutRegion[]) => {
      this.renderRegions(regions);
      this.updateUndoRedo();
    };

    this.cutManager.onChange(this.boundOnChange);
    this.renderRegions(this.cutManager.getRegions());
    this.updateUndoRedo();
  }

  destroy(): void {
    if (this.styleEl && this.styleEl.parentNode) {
      this.styleEl.parentNode.removeChild(this.styleEl);
    }
    this.container.innerHTML = '';
    this.boundOnChange = null;
  }

  private buildDOM(): void {
    this.el = document.createElement('div');
    this.el.className = 'cp-panel';
    this.el.innerHTML = `
      <div class="cp-notice">
        <strong>Accuracy notice</strong><br>
        Cuts are accurate to ~2–5 seconds (keyframe granularity). Frame-accurate cuts coming in a future update.
      </div>

      <div class="cp-section">
        <h4>Filler Words</h4>
        <button class="btn btn-secondary cp-scan-filler-btn">Scan for filler words</button>
        <div class="cp-results cp-filler-results"></div>
        <button class="btn btn-primary cp-add-filler-btn cp-add-btn" style="display:none;">Add selected</button>
      </div>

      <div class="cp-section">
        <h4>Silence</h4>
        <div class="cp-threshold-row">
          <label>Min gap: <span class="cp-threshold-value">2.0s</span></label>
          <input type="range" class="cp-silence-threshold" min="0.5" max="5.0" step="0.1" value="2.0">
        </div>
        <button class="btn btn-secondary cp-scan-silence-btn">Scan for silence</button>
        <div class="cp-results cp-silence-results"></div>
        <button class="btn btn-primary cp-add-silence-btn cp-add-btn" style="display:none;">Add selected</button>
      </div>

      <div class="cp-section">
        <h4>Cut Regions <span class="cp-region-count">(0)</span></h4>
        <div class="cp-regions-list"></div>
        <div class="cp-toolbar">
          <button class="btn btn-secondary cp-undo-btn" disabled>↩ Undo</button>
          <button class="btn btn-secondary cp-redo-btn" disabled>↪ Redo</button>
          <button class="cp-clear-btn">Clear all</button>
        </div>
      </div>
    `;

    this.fillerResultsEl = this.el.querySelector('.cp-filler-results')!;
    this.silenceResultsEl = this.el.querySelector('.cp-silence-results')!;
    this.silenceThresholdInput = this.el.querySelector('.cp-silence-threshold')!;
    this.silenceThresholdValueEl = this.el.querySelector('.cp-threshold-value')!;
    this.regionsListEl = this.el.querySelector('.cp-regions-list')!;
    this.regionCountEl = this.el.querySelector('.cp-region-count')!;
    this.undoBtn = this.el.querySelector('.cp-undo-btn')!;
    this.redoBtn = this.el.querySelector('.cp-redo-btn')!;
  }

  private attachEvents(): void {
    this.el.querySelector('.cp-scan-filler-btn')?.addEventListener('click', () => {
      this.scanFillers();
    });

    this.el.querySelector('.cp-add-filler-btn')?.addEventListener('click', () => {
      this.addSelectedFillers();
    });

    this.el.querySelector('.cp-scan-silence-btn')?.addEventListener('click', () => {
      this.scanSilence();
    });

    this.el.querySelector('.cp-add-silence-btn')?.addEventListener('click', () => {
      this.addSelectedSilences();
    });

    this.silenceThresholdInput.addEventListener('input', () => {
      const val = parseFloat(this.silenceThresholdInput.value);
      this.silenceThresholdValueEl.textContent = `${val.toFixed(1)}s`;
    });

    this.undoBtn.addEventListener('click', () => {
      this.cutManager.undo();
    });

    this.redoBtn.addEventListener('click', () => {
      this.cutManager.redo();
    });

    this.el.querySelector('.cp-clear-btn')?.addEventListener('click', () => {
      if (this.cutManager.getRegions().length === 0) return;
      this.cutManager.clear();
    });

    this.regionsListEl.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const removeBtn = target.closest<HTMLElement>('.cp-remove-btn');
      if (removeBtn) {
        const id = removeBtn.getAttribute('data-id');
        if (id) {
          this.cutManager.removeRegion(id);
        }
        return;
      }

      const regionItem = target.closest<HTMLElement>('.cp-region-item');
      if (regionItem) {
        const start = parseFloat(regionItem.getAttribute('data-start') || '0');
        const video = this.getVideoEl();
        if (video && !isNaN(start)) {
          video.currentTime = start;
        }
      }
    });
  }

  private scanFillers(): void {
    const transcript = this.getTranscript();
    if (transcript.length === 0) {
      this.fillerResultsEl.innerHTML = '<div class="cp-results-empty">No transcript available.</div>';
      this.toggleAddBtn('filler', false);
      return;
    }

    this.fillerMatches = this.cutManager.findFillerWords(transcript);

    if (this.fillerMatches.length === 0) {
      this.fillerResultsEl.innerHTML = '<div class="cp-results-empty">No filler words found.</div>';
      this.toggleAddBtn('filler', false);
      return;
    }

    this.fillerResultsEl.innerHTML = this.fillerMatches
      .map(
        (m, i) => `
        <label class="cp-result-item">
          <input type="checkbox" class="cp-filler-check" data-index="${i}">
          <span class="cp-result-time">${formatTime(m.word.start)}</span>
          <span class="cp-result-label">"${escHtml(m.word.word)}"</span>
          <span class="cp-result-dur">${m.filler}</span>
        </label>
      `,
      )
      .join('');

    this.toggleAddBtn('filler', true);
  }

  private addSelectedFillers(): void {
    const checks = this.fillerResultsEl.querySelectorAll<HTMLInputElement>('.cp-filler-check');
    let added = 0;

    checks.forEach((cb) => {
      if (!cb.checked) return;
      const idx = parseInt(cb.getAttribute('data-index') || '-1', 10);
      if (idx < 0 || idx >= this.fillerMatches.length) return;

      const m = this.fillerMatches[idx];
      this.cutManager.addRegion(m.word.start, m.word.end, 'filler', `"${m.word.word}"`);
      added++;
    });

    if (added > 0) {
      this.scanFillers();
    }
  }

  private scanSilence(): void {
    const transcript = this.getTranscript();
    if (transcript.length === 0) {
      this.silenceResultsEl.innerHTML = '<div class="cp-results-empty">No transcript available.</div>';
      this.toggleAddBtn('silence', false);
      return;
    }

    const threshold = parseFloat(this.silenceThresholdInput.value);
    this.silenceMatches = this.cutManager.findSilence(transcript, threshold);

    if (this.silenceMatches.length === 0) {
      this.silenceResultsEl.innerHTML = `<div class="cp-results-empty">No pauses ≥ ${threshold.toFixed(1)}s found.</div>`;
      this.toggleAddBtn('silence', false);
      return;
    }

    this.silenceResultsEl.innerHTML = this.silenceMatches
      .map(
        (s, i) => `
        <label class="cp-result-item">
          <input type="checkbox" class="cp-silence-check" data-index="${i}">
          <span class="cp-result-time">${formatTime(s.start)} – ${formatTime(s.end)}</span>
          <span class="cp-result-dur">${s.duration.toFixed(1)}s</span>
        </label>
      `,
      )
      .join('');

    this.toggleAddBtn('silence', true);
  }

  private addSelectedSilences(): void {
    const checks = this.silenceResultsEl.querySelectorAll<HTMLInputElement>('.cp-silence-check');
    let added = 0;

    checks.forEach((cb) => {
      if (!cb.checked) return;
      const idx = parseInt(cb.getAttribute('data-index') || '-1', 10);
      if (idx < 0 || idx >= this.silenceMatches.length) return;

      const s = this.silenceMatches[idx];
      this.cutManager.addRegion(s.start, s.end, 'silence', `${s.duration.toFixed(1)}s pause`);
      added++;
    });

    if (added > 0) {
      this.scanSilence();
    }
  }

  private renderRegions(regions: CutRegion[]): void {
    this.regionCountEl.textContent = `(${regions.length})`;

    if (regions.length === 0) {
      this.regionsListEl.innerHTML = '<div class="cp-empty">No cut regions yet.</div>';
      return;
    }

    this.regionsListEl.innerHTML = regions
      .map(
        (r) => `
        <div class="cp-region-item" data-start="${r.start}" data-end="${r.end}">
          <span class="cp-badge cp-badge-${r.type}">${r.type}</span>
          <span class="cp-region-times">${formatTime(r.start)} – ${formatTime(r.end)}</span>
          <span class="cp-region-label">${r.label ? escHtml(r.label) : ''}</span>
          <button class="cp-remove-btn" data-id="${r.id}" title="Remove">✕</button>
        </div>
      `,
      )
      .join('');
  }

  private updateUndoRedo(): void {
    this.undoBtn.disabled = !this.cutManager.canUndo();
    this.redoBtn.disabled = !this.cutManager.canRedo();
  }

  private toggleAddBtn(kind: 'filler' | 'silence', show: boolean): void {
    const sel = kind === 'filler' ? '.cp-add-filler-btn' : '.cp-add-silence-btn';
    const btn = this.el.querySelector<HTMLElement>(sel);
    if (btn) {
      btn.style.display = show ? '' : 'none';
    }
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  const secStr = secs.padStart(4, '0');
  return `${mins}:${secStr}`;
}

function escHtml(text: string): string {
  const el = document.createElement('span');
  el.textContent = text;
  return el.innerHTML;
}
