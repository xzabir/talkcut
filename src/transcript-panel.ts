import { saveProject } from './opfs.ts';
import type { ProjectState, TranscriptWord } from './types.ts';
import type { CutManager } from './cut-manager.ts';

export class TranscriptPanel {
  private container: HTMLElement;
  private el!: HTMLElement;
  private flowEl!: HTMLElement;
  private emptyEl!: HTMLElement;
  private wordCountEl: HTMLElement | null = null;
  private searchInputEl: HTMLInputElement | null = null;
  private modeIndicatorEl: HTMLElement | null = null;
  private toolbarEl: HTMLElement | null = null;

  private words: TranscriptWord[] = [];
  private cachedSpans: HTMLElement[] = [];
  private getVideoEl: (() => HTMLVideoElement) | null = null;
  private getProject: (() => ProjectState | null) | null = null;
  private onSave: (() => void) | null = null;
  private cutManager: CutManager | null = null;

  private activeWordIndex = -1;
  private selectedIndexStart = -1;
  private selectedIndexEnd = -1;
  private isDragging = false;
  private editingIndex = -1;
  private timeUpdateHandler: (() => void) | null = null;
  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private cutRegionsCache: { start: number; end: number }[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.buildDOM();
    this.attachEvents();
  }

  mount(
    getVideoEl: () => HTMLVideoElement,
    getProject: () => ProjectState | null,
    onSave: () => void,
    cutManager?: CutManager,
  ): void {
    this.getVideoEl = getVideoEl;
    this.getProject = getProject;
    this.onSave = onSave;
    this.cutManager = cutManager || null;

    this.container.innerHTML = '';
    this.container.appendChild(this.el);

    const video = getVideoEl();
    if (video) {
      this.timeUpdateHandler = () => this.highlightWord(video.currentTime);
      video.addEventListener('timeupdate', this.timeUpdateHandler);
    }

    const project = getProject();
    if (project && project.transcript.length > 0) {
      this.setWords(project.transcript);
    }

    if (this.cutManager) {
      this.cutManager.onChange((regions) => {
        this.cutRegionsCache = regions.map((r) => ({ start: r.start, end: r.end }));
        this.updateCutStyles();
      });
      this.cutRegionsCache = this.cutManager.getRegions().map((r) => ({ start: r.start, end: r.end }));
    }
  }

  setWords(words: TranscriptWord[]): void {
    this.words = words.map((w) => ({ ...w }));
    this.selectedIndexStart = -1;
    this.selectedIndexEnd = -1;
    this.editingIndex = -1;
    this.renderWords();
  }

  getWords(): TranscriptWord[] {
    return this.words.map((w) => ({ ...w }));
  }

  highlightWord(time: number): void {
    if (this.words.length === 0 || this.cachedSpans.length === 0) return;

    let foundIndex = -1;

    for (let i = 0; i < this.words.length; i++) {
      if (time >= this.words[i].start && time < this.words[i].end) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex < 0) {
      let closest = 0;
      let closestDist = Infinity;
      for (let i = 0; i < this.words.length; i++) {
        const mid = (this.words[i].start + this.words[i].end) / 2;
        const dist = Math.abs(time - mid);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      }
      if (closestDist < 2.0) {
        foundIndex = closest;
      }
    }

    if (foundIndex !== this.activeWordIndex) {
      if (this.activeWordIndex >= 0 && this.activeWordIndex < this.cachedSpans.length) {
        this.cachedSpans[this.activeWordIndex].classList.remove('active');
      }
      this.activeWordIndex = foundIndex;
      if (foundIndex >= 0 && foundIndex < this.cachedSpans.length) {
        const activeSpan = this.cachedSpans[foundIndex];
        activeSpan.classList.add('active');
        if (document.activeElement !== activeSpan && this.editingIndex < 0) {
          activeSpan.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }
  }

  destroy(): void {
    if (this.timeUpdateHandler && this.getVideoEl) {
      const video = this.getVideoEl();
      if (video) {
        video.removeEventListener('timeupdate', this.timeUpdateHandler);
      }
    }
    this.timeUpdateHandler = null;

    if (this.syncTimer !== null) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }

    this.container.innerHTML = '';
    this.getVideoEl = null;
    this.getProject = null;
    this.onSave = null;
    this.words = [];
    this.cachedSpans = [];
    this.activeWordIndex = -1;
  }

  private buildDOM(): void {
    this.el = document.createElement('div');
    this.el.className = 'tp-panel';
    this.el.innerHTML = `
      <div class="tp-toolbar">
        <div class="tp-toolbar-info">
          <span class="tp-mode-indicator" id="tp-mode">Select</span>
          <span class="tp-word-count">0 words</span>
        </div>
        <div class="tp-search-box">
          <svg class="tp-search-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M11.5 7a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm-.82 4.74a6 6 0 1 1 1.06-1.06l3.04 3.04a.75.75 0 1 1-1.06 1.06l-3.04-3.04Z"/></svg>
          <input type="text" placeholder="Search transcript..." />
        </div>
      </div>
      <div class="tp-flow" tabindex="0"></div>
      <div class="tp-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/></svg>
        <div class="tp-empty-title">No transcript yet</div>
        <div class="tp-empty-hint">Load a video and click Transcribe to get started.<br>Click to seek, drag to select, Delete to cut.</div>
      </div>
    `;

    this.toolbarEl = this.el.querySelector('.tp-toolbar');
    this.wordCountEl = this.el.querySelector('.tp-word-count');
    this.searchInputEl = this.el.querySelector('.tp-search-box input');
    this.modeIndicatorEl = this.el.querySelector('#tp-mode');
    this.flowEl = this.el.querySelector('.tp-flow')!;
    this.emptyEl = this.el.querySelector('.tp-empty')!;
  }

  private attachEvents(): void {
    this.flowEl.addEventListener('mousedown', this.handleMouseDown);
    this.flowEl.addEventListener('mouseover', this.handleMouseOver);
    document.addEventListener('mouseup', this.handleMouseUp);
    this.flowEl.addEventListener('dblclick', this.handleDblClick);
    this.flowEl.addEventListener('focusout', this.handleFocusOut);
    this.flowEl.addEventListener('keydown', this.handleKeyDown);
    this.flowEl.addEventListener('input', this.handleInput);
    this.flowEl.addEventListener('click', this.handleClick);

    this.searchInputEl?.addEventListener('input', () => {
      this.handleSearch(this.searchInputEl!.value);
    });
  }

  private renderWords(): void {
    this.flowEl.innerHTML = '';
    this.activeWordIndex = -1;
    this.cachedSpans = [];

    if (this.words.length === 0) {
      this.showEmpty(true);
      this.updateWordCount();
      return;
    }

    this.showEmpty(false);
    this.updateWordCount();

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.words.length; i++) {
      const w = this.words[i];
      const span = document.createElement('span');
      span.className = 'tp-word';
      span.contentEditable = 'false';
      span.spellcheck = false;
      if (w.confidence < 0.85) {
        span.classList.add('low-confidence');
      }
      span.setAttribute('data-index', String(i));
      span.setAttribute('data-start', String(w.start));
      span.setAttribute('data-end', String(w.end));
      span.setAttribute('data-confidence', String(w.confidence));
      span.textContent = w.word;

      fragment.appendChild(span);
      this.cachedSpans.push(span);

      if (i < this.words.length - 1) {
        fragment.appendChild(document.createTextNode(' '));
      }
    }

    this.flowEl.appendChild(fragment);
    this.updateCutStyles();
  }

  private updateCutStyles(): void {
    for (let i = 0; i < this.cachedSpans.length; i++) {
      const span = this.cachedSpans[i];
      const start = parseFloat(span.getAttribute('data-start') || '0');
      const end = parseFloat(span.getAttribute('data-end') || '0');

      let isCut = false;
      for (const region of this.cutRegionsCache) {
        if (start >= region.start && end <= region.end) {
          isCut = true;
          break;
        }
      }

      if (isCut) {
        span.classList.add('cut');
      } else {
        span.classList.remove('cut');
      }
    }
  }

  private showEmpty(show: boolean): void {
    this.emptyEl.style.display = show ? 'flex' : 'none';
    if (this.toolbarEl) {
      this.toolbarEl.style.display = show ? 'none' : 'flex';
    }
  }

  private updateWordCount(): void {
    if (this.wordCountEl) {
      const n = this.words.length;
      const selected = this.getSelectedCount();
      let text = `${n} word${n !== 1 ? 's' : ''}`;
      if (selected > 0) {
        text += ` · ${selected} selected`;
      }
      this.wordCountEl.textContent = text;
    }
  }

  private getSelectedCount(): number {
    if (this.selectedIndexStart < 0 || this.selectedIndexEnd < 0) return 0;
    return Math.abs(this.selectedIndexEnd - this.selectedIndexStart) + 1;
  }

  private getSelectedRange(): { start: number; end: number } | null {
    if (this.selectedIndexStart < 0 || this.selectedIndexEnd < 0) return null;
    const lo = Math.min(this.selectedIndexStart, this.selectedIndexEnd);
    const hi = Math.max(this.selectedIndexStart, this.selectedIndexEnd);
    return { start: lo, end: hi };
  }

  private updateSelectionStyles(): void {
    for (let i = 0; i < this.cachedSpans.length; i++) {
      this.cachedSpans[i].classList.remove('selected');
    }

    const range = this.getSelectedRange();
    if (range) {
      for (let i = range.start; i <= range.end; i++) {
        if (i >= 0 && i < this.cachedSpans.length) {
          this.cachedSpans[i].classList.add('selected');
        }
      }
    }
    this.updateWordCount();
  }

  private selectWord(index: number, extend: boolean): void {
    if (index < 0 || index >= this.words.length) return;

    if (extend && this.selectedIndexStart >= 0) {
      this.selectedIndexEnd = index;
    } else {
      this.selectedIndexStart = index;
      this.selectedIndexEnd = index;
    }
    this.updateSelectionStyles();
  }

  private clearSelection(): void {
    this.selectedIndexStart = -1;
    this.selectedIndexEnd = -1;
    this.updateSelectionStyles();
  }

  deleteSelection(): void {
    const range = this.getSelectedRange();
    if (!range || !this.cutManager) return;

    const startWord = this.words[range.start];
    const endWord = this.words[range.end];
    if (!startWord || !endWord) return;

    this.cutManager.addRegion(
      startWord.start,
      endWord.end,
      'delete',
      `Deleted: "${this.words.slice(range.start, range.end + 1).map((w) => w.word).join(' ')}"`,
    );

    this.clearSelection();
  }

  private handleClick = (e: MouseEvent): void => {
    if (this.editingIndex >= 0) return;
    const target = (e.target as HTMLElement).closest<HTMLElement>('.tp-word');
    if (!target) return;

    const index = parseInt(target.getAttribute('data-index') || '-1', 10);
    if (index < 0 || index >= this.words.length) return;

    const video = this.getVideoEl?.();
    if (video) {
      video.currentTime = this.words[index].start;
    }
  };

  private handleMouseDown = (e: MouseEvent): void => {
    if (this.editingIndex >= 0) return;
    const target = (e.target as HTMLElement).closest<HTMLElement>('.tp-word');
    if (!target) return;

    const index = parseInt(target.getAttribute('data-index') || '-1', 10);
    if (index < 0 || index >= this.words.length) return;

    this.isDragging = true;
    const extend = e.shiftKey;
    this.selectWord(index, extend);
  };

  private handleMouseOver = (e: MouseEvent): void => {
    if (!this.isDragging) return;
    const target = (e.target as HTMLElement).closest<HTMLElement>('.tp-word');
    if (!target) return;

    const index = parseInt(target.getAttribute('data-index') || '-1', 10);
    if (index < 0 || index >= this.words.length) return;

    this.selectedIndexEnd = index;
    this.updateSelectionStyles();
  };

  private handleMouseUp = (): void => {
    this.isDragging = false;
  };

  private handleDblClick = (e: MouseEvent): void => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('.tp-word');
    if (!target) return;

    const index = parseInt(target.getAttribute('data-index') || '-1', 10);
    if (index < 0 || index >= this.words.length) return;

    this.enterEditMode(index);
  };

  private enterEditMode(index: number): void {
    if (index < 0 || index >= this.cachedSpans.length) return;

    if (this.editingIndex >= 0 && this.editingIndex !== index) {
      this.exitEditMode();
    }

    this.editingIndex = index;
    const span = this.cachedSpans[index];
    span.contentEditable = 'true';
    span.classList.add('editing');
    span.focus();

    const range = document.createRange();
    range.selectNodeContents(span);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }

    if (this.modeIndicatorEl) {
      this.modeIndicatorEl.textContent = 'Edit';
      this.modeIndicatorEl.classList.add('edit-mode');
    }
  }

  private exitEditMode(): void {
    if (this.editingIndex < 0) return;

    const span = this.cachedSpans[this.editingIndex];
    span.contentEditable = 'false';
    span.classList.remove('editing');

    this.editingIndex = -1;

    if (this.modeIndicatorEl) {
      this.modeIndicatorEl.textContent = 'Select';
      this.modeIndicatorEl.classList.remove('edit-mode');
    }

    this.scheduleSync();
  }

  private handleFocusOut = (e: FocusEvent): void => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('tp-word') || !target.classList.contains('editing')) return;
    this.exitEditMode();
  };

  private handleInput = (_e: Event): void => {
    if (this.editingIndex >= 0) {
      this.scheduleSync();
    }
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (this.editingIndex >= 0) {
      this.handleEditKeyDown(e);
      return;
    }

    this.handleSelectionKeyDown(e);
  };

  private handleEditKeyDown = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('tp-word')) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      target.blur();
      this.exitEditMode();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      const index = parseInt(target.getAttribute('data-index') || '-1', 10);
      if (index >= 0 && index < this.words.length) {
        target.textContent = this.words[index].word;
      }
      target.blur();
      this.exitEditMode();
      return;
    }
  };

  private handleSelectionKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      this.deleteSelection();
      return;
    }

    if (e.key === 'Escape') {
      this.clearSelection();
      return;
    }

    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      this.selectedIndexStart = 0;
      this.selectedIndexEnd = this.words.length - 1;
      this.updateSelectionStyles();
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const range = this.getSelectedRange();
      const current = range ? (e.key === 'ArrowLeft' ? range.start : range.end) : 0;
      const next = e.key === 'ArrowLeft' ? Math.max(0, current - 1) : Math.min(this.words.length - 1, current + 1);
      this.selectWord(next, e.shiftKey);

      const video = this.getVideoEl?.();
      if (video) {
        video.currentTime = this.words[next].start;
      }
      return;
    }
  };

  private handleSearch(query: string): void {
    const q = query.trim().toLowerCase();
    if (!q) {
      for (const span of this.cachedSpans) {
        span.style.background = '';
      }
      return;
    }

    for (let i = 0; i < this.cachedSpans.length; i++) {
      const word = this.words[i].word.toLowerCase();
      if (word.includes(q)) {
        this.cachedSpans[i].style.background = 'rgba(210, 153, 34, 0.2)';
      } else {
        this.cachedSpans[i].style.background = '';
      }
    }
  }

  private scheduleSync(): void {
    if (this.syncTimer !== null) {
      clearTimeout(this.syncTimer);
    }
    this.syncTimer = setTimeout(() => {
      this.syncTimer = null;
      this.syncFromDOM();
    }, 300);
  }

  private syncFromDOM(): void {
    if (this.editingIndex < 0) return;

    const spans = this.cachedSpans;
    const newWords: TranscriptWord[] = [];
    let tokenCountChanged = false;

    for (let i = 0; i < spans.length; i++) {
      const span = spans[i];
      const rawText = span.textContent || '';
      const tokens = rawText.trim().split(/\s+/).filter((t) => t.length > 0);

      if (tokens.length === 0) continue;

      const start = parseFloat(span.getAttribute('data-start') || '0');
      const end = parseFloat(span.getAttribute('data-end') || '0');
      const confidence = parseFloat(span.getAttribute('data-confidence') || '0.9');

      if (tokens.length !== 1) {
        tokenCountChanged = true;
      }

      if (tokens.length === 1) {
        newWords.push({ word: tokens[0], start, end, confidence });
      } else {
        const duration = end - start;
        const perToken = duration / tokens.length;
        for (let j = 0; j < tokens.length; j++) {
          newWords.push({
            word: tokens[j],
            start: start + j * perToken,
            end: start + (j + 1) * perToken,
            confidence,
          });
        }
      }
    }

    if (transcriptEqual(this.words, newWords)) return;

    this.words = newWords;

    if (tokenCountChanged) {
      this.renderWords();
    }

    this.saveTranscript();
  }

  private async saveTranscript(): Promise<void> {
    const getProject = this.getProject;
    if (!getProject) return;

    const project = getProject();
    if (!project) return;

    project.transcript = this.words.map((w) => ({ ...w }));
    project.updatedAt = Date.now();

    try {
      await saveProject(project);
      this.onSave?.();
    } catch {
      // save failed — words remain in memory
    }
  }
}

function transcriptEqual(a: TranscriptWord[], b: TranscriptWord[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].word !== b[i].word) return false;
    if (Math.abs(a[i].start - b[i].start) > 0.001) return false;
    if (Math.abs(a[i].end - b[i].end) > 0.001) return false;
  }
  return true;
}
