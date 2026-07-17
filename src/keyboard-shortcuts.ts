export class KeyboardShortcuts {
  private overlay: HTMLDivElement | null = null;
  private styleEl: HTMLStyleElement | null = null;
  private mounted = false;
  private boundHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    this.boundHandler = this.handleKeydown.bind(this);
  }

  mount(): void {
    if (this.mounted) return;
    this.mounted = true;
    document.addEventListener('keydown', this.boundHandler!);
  }

  destroy(): void {
    document.removeEventListener('keydown', this.boundHandler!);
    this.removeOverlay();
    this.mounted = false;
  }

  isOpen(): boolean {
    return this.overlay !== null;
  }

  close(): void {
    this.removeOverlay();
  }

  toggle(): void {
    if (this.isOpen()) this.removeOverlay();
    else this.showOverlay();
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (e.key !== '?') return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if ((e.target as HTMLElement)?.isContentEditable) return;
    if (e.repeat) return;
    e.preventDefault();
    this.toggle();
  }

  private showOverlay(): void {
    this.removeOverlay();

    this.styleEl = document.createElement('style');
    this.styleEl.textContent = `
      .kbs-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: kbs-fade-in 0.15s ease;
      }
      @keyframes kbs-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .kbs-card {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 24px 28px;
        max-width: 440px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
      }
      .kbs-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--accent);
        margin-bottom: 18px;
      }
      .kbs-section {
        margin-bottom: 16px;
      }
      .kbs-section:last-child {
        margin-bottom: 0;
      }
      .kbs-section-title {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-secondary);
        margin-bottom: 8px;
        padding-bottom: 4px;
        border-bottom: 1px solid var(--border);
      }
      .kbs-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 3px 0;
        font-size: 13px;
      }
      .kbs-key {
        display: inline-block;
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 1px 6px;
        font-size: 11px;
        font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
        color: var(--text-primary);
        margin-right: 2px;
        white-space: nowrap;
      }
      .kbs-desc {
        color: var(--text-secondary);
        text-align: right;
        flex-shrink: 0;
      }
    `;
    document.head.appendChild(this.styleEl);

    this.overlay = document.createElement('div');
    this.overlay.className = 'kbs-overlay';
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.removeOverlay();
    });

    this.overlay.innerHTML = `
      <div class="kbs-card">
        <div class="kbs-title">Keyboard Shortcuts</div>

        <div class="kbs-section">
          <div class="kbs-section-title">Playback</div>
          <div class="kbs-row">
            <span><span class="kbs-key">Space</span></span>
            <span class="kbs-desc">Play / Pause</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">←</span></span>
            <span class="kbs-desc">Seek back 5s</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">→</span></span>
            <span class="kbs-desc">Seek forward 5s</span>
          </div>
        </div>

        <div class="kbs-section">
          <div class="kbs-section-title">Editing</div>
          <div class="kbs-row">
            <span><span class="kbs-key">Ctrl</span> + <span class="kbs-key">Z</span></span>
            <span class="kbs-desc">Undo</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">Ctrl</span> + <span class="kbs-key">Shift</span> + <span class="kbs-key">Z</span></span>
            <span class="kbs-desc">Redo</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">Ctrl</span> + <span class="kbs-key">Y</span></span>
            <span class="kbs-desc">Redo</span>
          </div>
        </div>

        <div class="kbs-section">
          <div class="kbs-section-title">Transcript</div>
          <div class="kbs-row">
            <span><span class="kbs-key">Click</span> word</span>
            <span class="kbs-desc">Seek to word</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">←</span> / <span class="kbs-key">→</span> in transcript</span>
            <span class="kbs-desc">Navigate words</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">Enter</span> in transcript</span>
            <span class="kbs-desc">Finish editing</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">Esc</span> in transcript</span>
            <span class="kbs-desc">Cancel editing</span>
          </div>
        </div>

        <div class="kbs-section">
          <div class="kbs-section-title">Overlay</div>
          <div class="kbs-row">
            <span><span class="kbs-key">?</span></span>
            <span class="kbs-desc">Toggle this overlay</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">Esc</span></span>
            <span class="kbs-desc">Close overlay</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);
  }

  private removeOverlay(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = null;
    }
  }
}
