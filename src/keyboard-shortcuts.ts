export class KeyboardShortcuts {
  private overlay: HTMLDivElement | null = null;
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
            <span><span class="kbs-key">&larr;</span></span>
            <span class="kbs-desc">Seek back 5s</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">&rarr;</span></span>
            <span class="kbs-desc">Seek forward 5s</span>
          </div>
        </div>

        <div class="kbs-section">
          <div class="kbs-section-title">Transcript Editing</div>
          <div class="kbs-row">
            <span><span class="kbs-key">Click</span> word</span>
            <span class="kbs-desc">Select + seek to word</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">Drag</span> words</span>
            <span class="kbs-desc">Select range</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">Shift</span> + <span class="kbs-key">Click</span></span>
            <span class="kbs-desc">Extend selection</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">Double-click</span> word</span>
            <span class="kbs-desc">Edit word text</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">Delete</span> / <span class="kbs-key">Backspace</span></span>
            <span class="kbs-desc">Cut selected words</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">&larr;</span> / <span class="kbs-key">&rarr;</span></span>
            <span class="kbs-desc">Navigate words</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">Ctrl</span> + <span class="kbs-key">A</span></span>
            <span class="kbs-desc">Select all words</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">Enter</span> in edit mode</span>
            <span class="kbs-desc">Finish editing</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">Esc</span></span>
            <span class="kbs-desc">Cancel selection / editing</span>
          </div>
        </div>

        <div class="kbs-section">
          <div class="kbs-section-title">Actions</div>
          <div class="kbs-row">
            <span><span class="kbs-key">Ctrl</span> + <span class="kbs-key">Z</span></span>
            <span class="kbs-desc">Undo</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">Ctrl</span> + <span class="kbs-key">Shift</span> + <span class="kbs-key">Z</span></span>
            <span class="kbs-desc">Redo</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">Ctrl</span> + <span class="kbs-key">S</span></span>
            <span class="kbs-desc">Save project</span>
          </div>
          <div class="kbs-row">
            <span><span class="kbs-key">Ctrl</span> + <span class="kbs-key">E</span></span>
            <span class="kbs-desc">Go to Export</span>
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
  }
}
