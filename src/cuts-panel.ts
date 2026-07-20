import type { CutRegion, TranscriptWord } from './types.ts';
import type { CutManager } from './cut-manager.ts';
import { toast } from './toast.ts';

export class CutsPanel {
  private container: HTMLElement;
  private cutManager: CutManager;
  private getVideoEl: () => HTMLVideoElement;
  private getTranscript: () => TranscriptWord[];

  private el!: HTMLElement;
  private fillerResultsEl!: HTMLElement;
  private silenceResultsEl!: HTMLElement;
  private silenceThresholdInput!: HTMLInputElement;
  private silenceThresholdValueEl!: HTMLElement;
  private regionsListEl!: HTMLElement;
  private regionCountEl!: HTMLElement;
  private undoBtn!: HTMLButtonElement;
  private redoBtn!: HTMLButtonElement;
  private noticeEl!: HTMLElement;
  private summaryEl!: HTMLElement;
  private summaryCutsEl!: HTMLElement;
  private summaryRemovedEl!: HTMLElement;

  private fillerMatches: Array<{ words: TranscriptWord[]; filler: string; start: number; end: number }> = [];
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

    this.buildDOM();
    this.attachEvents();
  }

  mount(): void {
    this.container.innerHTML = '';
    this.container.appendChild(this.el);

    this.boundOnChange = (regions: CutRegion[]) => {
      this.renderRegions(regions);
      this.updateUndoRedo();
      this.updateSummary(regions);
      this.updateNotice(regions);
    };

    this.cutManager.onChange(this.boundOnChange);
    this.renderRegions(this.cutManager.getRegions());
    this.updateUndoRedo();
    this.updateSummary(this.cutManager.getRegions());
    this.updateNotice(this.cutManager.getRegions());
  }

  destroy(): void {
    this.container.innerHTML = '';
    this.boundOnChange = null;
  }

  private buildDOM(): void {
    this.el = document.createElement('div');
    this.el.className = 'cp-panel';
    this.el.innerHTML = `
      <div class="cp-notice" style="display:none;">
        <strong>Cut precision</strong><br>
        Cuts are applied at the frame level during export. The video is played segment-by-segment and each frame is re-encoded with adjusted timestamps.
      </div>

      <div class="cp-summary" style="display:none;">
        <div class="cp-summary-item">
          <span class="cp-summary-label">Cuts</span>
          <span class="cp-summary-value" data-el="summary-cuts">0</span>
        </div>
        <div class="cp-summary-item">
          <span class="cp-summary-label">Removed</span>
          <span class="cp-summary-value" data-el="summary-removed">0s</span>
        </div>
      </div>

      <div class="cp-section">
        <h4>Filler Words</h4>
        <button class="btn btn-sm btn-secondary cp-scan-filler-btn">Scan for filler words</button>
        <div class="cp-results cp-filler-results"></div>
        <div class="cp-results-toolbar" style="display:none;">
          <button class="cp-select-all-btn" data-action="select-all-filler">Select all</button>
          <button class="cp-select-all-btn" data-action="deselect-all-filler">Deselect all</button>
          <button class="btn btn-sm btn-primary cp-add-filler-btn" style="margin-left:auto;">Add selected</button>
        </div>
      </div>

      <div class="cp-section">
        <h4>Silence</h4>
        <div class="cp-threshold-row">
          <label>Min gap: <span class="cp-threshold-value">2.0s</span></label>
          <input type="range" class="cp-silence-threshold" min="0.5" max="5.0" step="0.1" value="2.0">
        </div>
        <button class="btn btn-sm btn-secondary cp-scan-silence-btn">Scan for silence</button>
        <div class="cp-results cp-silence-results"></div>
        <div class="cp-results-toolbar" style="display:none;">
          <button class="cp-select-all-btn" data-action="select-all-silence">Select all</button>
          <button class="cp-select-all-btn" data-action="deselect-all-silence">Deselect all</button>
          <button class="btn btn-sm btn-primary cp-add-silence-btn" style="margin-left:auto;">Add selected</button>
        </div>
      </div>

      <div class="cp-section">
        <h4>Cut Regions <span class="cp-region-count">(0)</span></h4>
        <div class="cp-regions-list"></div>
        <div class="cp-toolbar">
          <button class="btn btn-sm btn-secondary cp-undo-btn" disabled>Undo</button>
          <button class="btn btn-sm btn-secondary cp-redo-btn" disabled>Redo</button>
          <button class="btn btn-sm btn-danger cp-clear-btn">Clear all</button>
        </div>
      </div>
    `;

    this.noticeEl = this.el.querySelector('.cp-notice')!;
    this.summaryEl = this.el.querySelector('.cp-summary')!;
    this.summaryCutsEl = this.el.querySelector('[data-el="summary-cuts"]')!;
    this.summaryRemovedEl = this.el.querySelector('[data-el="summary-removed"]')!;
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
      toast.info('All cut regions cleared');
    });

    this.el.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const actionEl = target.closest<HTMLElement>('[data-action]');
      if (actionEl) {
        const action = actionEl.getAttribute('data-action');
        if (action === 'select-all-filler') {
          this.fillerResultsEl.querySelectorAll<HTMLInputElement>('.cp-filler-check').forEach((cb) => { cb.checked = true; });
        } else if (action === 'deselect-all-filler') {
          this.fillerResultsEl.querySelectorAll<HTMLInputElement>('.cp-filler-check').forEach((cb) => { cb.checked = false; });
        } else if (action === 'select-all-silence') {
          this.silenceResultsEl.querySelectorAll<HTMLInputElement>('.cp-silence-check').forEach((cb) => { cb.checked = true; });
        } else if (action === 'deselect-all-silence') {
          this.silenceResultsEl.querySelectorAll<HTMLInputElement>('.cp-silence-check').forEach((cb) => { cb.checked = false; });
        }
        return;
      }

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
      this.toggleResultsToolbar('filler', false);
      return;
    }

    this.fillerMatches = this.cutManager.findFillerWords(transcript);

    if (this.fillerMatches.length === 0) {
      this.fillerResultsEl.innerHTML = '<div class="cp-results-empty">No filler words found.</div>';
      this.toggleResultsToolbar('filler', false);
      return;
    }

    this.fillerResultsEl.innerHTML = this.fillerMatches
      .map(
        (m, i) => `
        <label class="cp-result-item">
          <input type="checkbox" class="cp-filler-check" data-index="${i}" checked>
          <span class="cp-result-time">${formatTime(m.start)}</span>
          <span class="cp-result-label">"${escHtml(m.words.map((w) => w.word).join(' '))}"</span>
          <span class="cp-result-dur">${m.filler}</span>
        </label>
      `,
      )
      .join('');

    this.toggleResultsToolbar('filler', true);
    toast.info(`Found ${this.fillerMatches.length} filler word${this.fillerMatches.length !== 1 ? 's' : ''}`);
  }

  private addSelectedFillers(): void {
    const checks = this.fillerResultsEl.querySelectorAll<HTMLInputElement>('.cp-filler-check');
    let added = 0;

    checks.forEach((cb) => {
      if (!cb.checked) return;
      const idx = parseInt(cb.getAttribute('data-index') || '-1', 10);
      if (idx < 0 || idx >= this.fillerMatches.length) return;

      const m = this.fillerMatches[idx];
      this.cutManager.addRegion(m.start, m.end, 'filler', `"${m.filler}"`);
      added++;
    });

    if (added > 0) {
      toast.success(`Added ${added} filler cut${added !== 1 ? 's' : ''}`);
      this.scanFillers();
    }
  }

  private scanSilence(): void {
    const transcript = this.getTranscript();
    if (transcript.length === 0) {
      this.silenceResultsEl.innerHTML = '<div class="cp-results-empty">No transcript available.</div>';
      this.toggleResultsToolbar('silence', false);
      return;
    }

    const threshold = parseFloat(this.silenceThresholdInput.value);
    this.silenceMatches = this.cutManager.findSilence(transcript, threshold);

    if (this.silenceMatches.length === 0) {
      this.silenceResultsEl.innerHTML = `<div class="cp-results-empty">No pauses >= ${threshold.toFixed(1)}s found.</div>`;
      this.toggleResultsToolbar('silence', false);
      return;
    }

    this.silenceResultsEl.innerHTML = this.silenceMatches
      .map(
        (s, i) => `
        <label class="cp-result-item">
          <input type="checkbox" class="cp-silence-check" data-index="${i}" checked>
          <span class="cp-result-time">${formatTime(s.start)} - ${formatTime(s.end)}</span>
          <span class="cp-result-dur">${s.duration.toFixed(1)}s</span>
        </label>
      `,
      )
      .join('');

    this.toggleResultsToolbar('silence', true);
    toast.info(`Found ${this.silenceMatches.length} silence${this.silenceMatches.length !== 1 ? 's' : ''} (>= ${threshold.toFixed(1)}s)`);
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
      toast.success(`Added ${added} silence cut${added !== 1 ? 's' : ''}`);
      this.scanSilence();
    }
  }

  private renderRegions(regions: CutRegion[]): void {
    this.regionCountEl.textContent = `(${regions.length})`;

    if (regions.length === 0) {
      this.regionsListEl.innerHTML = '<div class="cp-empty">No cut regions yet. Select words in the transcript and press Delete.</div>';
      return;
    }

    this.regionsListEl.innerHTML = regions
      .map(
        (r) => `
        <div class="cp-region-item" data-start="${r.start}" data-end="${r.end}">
          <span class="cp-badge cp-badge-${r.type}">${r.type}</span>
          <span class="cp-region-times">${formatTime(r.start)} - ${formatTime(r.end)}</span>
          <span class="cp-region-label">${r.label ? escHtml(r.label) : ''}</span>
          <button class="cp-remove-btn" data-id="${r.id}" title="Remove">&times;</button>
        </div>
      `,
      )
      .join('');
  }

  private updateUndoRedo(): void {
    this.undoBtn.disabled = !this.cutManager.canUndo();
    this.redoBtn.disabled = !this.cutManager.canRedo();
  }

  private updateSummary(regions: CutRegion[]): void {
    if (regions.length === 0) {
      this.summaryEl.style.display = 'none';
      return;
    }
    this.summaryEl.style.display = 'flex';
    const totalRemoved = regions.reduce((sum, r) => sum + (r.end - r.start), 0);
    this.summaryCutsEl.textContent = String(regions.length);
    this.summaryRemovedEl.textContent = formatDuration(totalRemoved);
  }

  private updateNotice(regions: CutRegion[]): void {
    this.noticeEl.style.display = regions.length > 0 ? 'block' : 'none';
  }

  private toggleResultsToolbar(kind: 'filler' | 'silence', show: boolean): void {
    const sel = kind === 'filler' ? '.cp-add-filler-btn' : '.cp-add-silence-btn';
    const btn = this.el.querySelector<HTMLElement>(sel);
    if (btn) {
      btn.parentElement!.style.display = show ? 'flex' : 'none';
    }
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  const secStr = secs.padStart(4, '0');
  return `${mins}:${secStr}`;
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds.toFixed(1)}s`;
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}m ${s}s`;
}

function escHtml(text: string): string {
  const el = document.createElement('span');
  el.textContent = text;
  return el.innerHTML;
}
