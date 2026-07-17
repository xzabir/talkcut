import { saveProject } from './opfs.ts';
import type { ProjectState, TranscriptWord } from './types.ts';
import type { CutManager } from './cut-manager.ts';

const STYLES = `
.tp-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.tp-header h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.tp-word-count {
  font-size: 11px;
  color: var(--text-secondary);
}

.tp-flow {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  line-height: 2.4;
  font-size: 14px;
  min-height: 0;
  outline: none;
}

.tp-word {
  display: inline;
  padding: 2px 4px;
  margin: 1px;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  outline: none;
  border: 1px solid transparent;
  position: relative;
  white-space: nowrap;
}

.tp-word:hover {
  background: rgba(79, 140, 255, 0.10);
}

.tp-word:focus {
  background: rgba(79, 140, 255, 0.18);
  border-color: var(--accent);
}

.tp-word.active {
  background: rgba(79, 140, 255, 0.25);
  color: var(--accent);
  border-color: rgba(79, 140, 255, 0.30);
}

.tp-word.low-confidence {
  text-decoration: underline;
  text-decoration-color: var(--danger);
  text-decoration-style: wavy;
  text-underline-offset: 3px;
}

.tp-word.low-confidence.active {
  text-decoration-color: var(--accent);
}

.tp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-size: 14px;
  text-align: center;
}

.tp-empty-hint {
  font-size: 12px;
  opacity: 0.5;
  margin-top: 6px;
}
`;

export class TranscriptPanel {
  private container: HTMLElement;
  private el!: HTMLElement;
  private flowEl!: HTMLElement;
  private emptyEl!: HTMLElement;
  private wordCountEl: HTMLElement | null = null;
  private headerEl: HTMLElement | null = null;

  private words: TranscriptWord[] = [];
  private cachedSpans: HTMLElement[] = [];
  private getVideoEl: (() => HTMLVideoElement) | null = null;
  private getProject: (() => ProjectState | null) | null = null;
  private onSave: (() => void) | null = null;
  private cutManager: CutManager | null = null;

  private activeWordIndex = -1;
  private styleEl: HTMLStyleElement;
  private timeUpdateHandler: (() => void) | null = null;
  private syncTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    this.styleEl = document.createElement('style');
    this.styleEl.textContent = STYLES;
    document.head.appendChild(this.styleEl);

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
  }

  setWords(words: TranscriptWord[]): void {
    this.words = words.map((w) => ({ ...w }));
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
        if (document.activeElement !== activeSpan) {
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

    if (this.styleEl && this.styleEl.parentNode) {
      this.styleEl.parentNode.removeChild(this.styleEl);
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
      <div class="tp-header">
        <h3>Transcript</h3>
        <span class="tp-word-count">0 words</span>
      </div>
      <div class="tp-flow"></div>
      <div class="tp-empty">
        <p>Load a video and transcribe to get started.</p>
        <p class="tp-empty-hint">Click to seek. Double-click to edit. Arrow keys to navigate.</p>
      </div>
    `;

    this.headerEl = this.el.querySelector('.tp-header');
    this.wordCountEl = this.el.querySelector('.tp-word-count');
    this.flowEl = this.el.querySelector('.tp-flow')!;
    this.emptyEl = this.el.querySelector('.tp-empty')!;
  }

  private attachEvents(): void {
    this.flowEl.addEventListener('click', this.handleClick);
    this.flowEl.addEventListener('dblclick', this.handleDblClick);
    this.flowEl.addEventListener('focusout', this.handleFocusOut);
    this.flowEl.addEventListener('keydown', this.handleKeyDown);
    this.flowEl.addEventListener('input', this.handleInput);
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
      span.contentEditable = 'true';
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
  }

  private showEmpty(show: boolean): void {
    this.emptyEl.style.display = show ? 'flex' : 'none';
    if (this.headerEl) {
      this.headerEl.style.display = show ? 'none' : 'flex';
    }
  }

  private updateWordCount(): void {
    if (this.wordCountEl) {
      const n = this.words.length;
      this.wordCountEl.textContent = `${n} word${n !== 1 ? 's' : ''}`;
    }
  }

  private handleClick = (e: MouseEvent): void => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('.tp-word');
    if (!target) return;

    const index = parseInt(target.getAttribute('data-index') || '-1', 10);
    if (index < 0 || index >= this.words.length) return;

    const video = this.getVideoEl?.();
    if (video) {
      video.currentTime = this.words[index].start;
    }
  };

  private handleDblClick = (e: MouseEvent): void => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('.tp-word');
    if (!target) return;

    target.focus();

    const range = document.createRange();
    range.selectNodeContents(target);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  private handleFocusOut = (e: FocusEvent): void => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('tp-word')) return;
    this.scheduleSync();
  };

  private handleInput = (_e: Event): void => {
    this.scheduleSync();
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('tp-word')) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      target.blur();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      const index = parseInt(target.getAttribute('data-index') || '-1', 10);
      if (index >= 0 && index < this.words.length) {
        target.textContent = this.words[index].word;
      }
      target.blur();
      return;
    }

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    if (!range.collapsed) return;

    const node = range.startContainer;
    const offset = range.startOffset;

    if (e.key === 'ArrowLeft') {
      if (isAtStartOfWord(node, target, offset)) {
        e.preventDefault();
        this.navigateWord(target, -1);
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      if (isAtEndOfWord(node, target, offset)) {
        e.preventDefault();
        this.navigateWord(target, 1);
      }
      return;
    }
  };

  private navigateWord(currentSpan: HTMLElement, direction: number): void {
    const index = parseInt(currentSpan.getAttribute('data-index') || '-1', 10);
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= this.words.length) return;

    const video = this.getVideoEl?.();
    if (video) {
      video.currentTime = this.words[newIndex].start;
    }

    if (newIndex < this.cachedSpans.length) {
      const nextSpan = this.cachedSpans[newIndex];
      nextSpan.focus();

      const textNode = nextSpan.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const pos = direction < 0 ? (textNode.textContent?.length || 0) : 0;
        const r = document.createRange();
        r.setStart(textNode, pos);
        r.collapse(true);
        const s = window.getSelection();
        if (s) {
          s.removeAllRanges();
          s.addRange(r);
        }
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

    if (this.cutManager) {
      const newStarts = new Set(newWords.map((w) => w.start.toFixed(3)));
      for (const w of this.words) {
        if (!newStarts.has(w.start.toFixed(3))) {
          this.cutManager.addRegion(w.start, w.end, 'delete', `Deleted: "${w.word}"`);
        }
      }
    }

    if (transcriptEqual(this.words, newWords)) return;

    this.words = newWords;

    if (tokenCountChanged) {
      this.renderWords();
    } else {
      for (let i = 0; i < this.words.length && i < spans.length; i++) {
        spans[i].setAttribute('data-start', String(this.words[i].start));
        spans[i].setAttribute('data-end', String(this.words[i].end));
      }
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

function isAtStartOfWord(node: Node, wordEl: HTMLElement, offset: number): boolean {
  if (offset !== 0) return false;
  let current: Node | null = node;
  while (current && current !== wordEl) {
    for (let child = current.previousSibling; child; child = child.previousSibling) {
      if (child.nodeType === Node.TEXT_NODE && (child.textContent || '').trim().length > 0) {
        return false;
      }
      if (child.nodeType === Node.ELEMENT_NODE) {
        return false;
      }
    }
    current = current.parentNode;
  }
  return current === wordEl;
}

function isAtEndOfWord(node: Node, wordEl: HTMLElement, offset: number): boolean {
  if (node.nodeType === Node.TEXT_NODE) {
    if (offset < (node.textContent || '').length) return false;
  }
  let current: Node | null = node;
  while (current && current !== wordEl) {
    for (let child = current.nextSibling; child; child = child.nextSibling) {
      if (child.nodeType === Node.TEXT_NODE && (child.textContent || '').trim().length > 0) {
        return false;
      }
      if (child.nodeType === Node.ELEMENT_NODE) {
        return false;
      }
    }
    current = current.parentNode;
  }
  return current === wordEl;
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
