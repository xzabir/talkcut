import type { CutRegion, ExportProgress } from './types.ts';
import { isExportSupported, exportVideo } from './exporter.ts';

const STYLES = `
.exp-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}

.exp-warning-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger);
  border-radius: var(--radius);
  font-size: 13px;
  line-height: 1.5;
  color: var(--danger);
}

.exp-warning-banner-icon {
  flex-shrink: 0;
  font-size: 18px;
  line-height: 1.2;
}

.exp-summary {
  padding: 10px 12px;
  background: var(--bg-primary);
  border-radius: var(--radius);
  font-size: 13px;
  line-height: 1.6;
}

.exp-summary-title {
  color: var(--text-primary);
  font-weight: 600;
}

.exp-keyframe-note {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 6px;
  font-style: italic;
}

.exp-no-video {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 4px 0;
}

.exp-actions {
  display: flex;
  gap: 8px;
}

.exp-btn {
  padding: 8px 20px;
  border: none;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}

.exp-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.exp-export-btn {
  background: var(--accent);
  color: white;
}

.exp-export-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.exp-download-btn {
  background: var(--success);
  color: white;
}

.exp-download-btn:hover:not(:disabled) {
  background: #16a34a;
}

.exp-another-btn {
  background: var(--bg-surface);
  color: var(--text-primary);
}

.exp-another-btn:hover:not(:disabled) {
  background: #1a4a80;
}

.exp-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exp-status-text {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.exp-progress-bar-track {
  width: 100%;
  height: 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  overflow: hidden;
}

.exp-progress-bar-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 4px;
  transition: width 0.3s ease;
  width: 0%;
}

.exp-frame-count,
.exp-eta {
  font-size: 12px;
  color: var(--text-secondary);
}

.exp-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.exp-success-msg {
  font-size: 15px;
  font-weight: 600;
  color: var(--success);
}

.exp-success-actions {
  display: flex;
  gap: 8px;
}

.exp-error-box {
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger);
  border-radius: var(--radius);
  font-size: 13px;
  color: var(--danger);
  line-height: 1.5;
}

.exp-error-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.exp-error-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.exp-retry-btn {
  padding: 6px 14px;
  border: none;
  border-radius: var(--radius);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background: var(--bg-surface);
  color: var(--text-primary);
}

.exp-retry-btn:hover {
  background: #1a4a80;
}

.exp-hidden {
  display: none !important;
}
`;

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m > 0) return `~${m} min ${s} sec remaining`;
  return `~${s} sec remaining`;
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  if (m > 0 && s > 0) return `${m} min ${s} sec`;
  if (m > 0) return `${m} min`;
  return `${s} sec`;
}

export class ExportPanel {
  private container: HTMLElement;
  private getVideoFile: () => Promise<File | null>;
  private getCutRegions: () => CutRegion[];
  private styleEl: HTMLStyleElement | null = null;
  private root: HTMLElement | null = null;
  private exportBlob: Blob | null = null;
  private exporting = false;
  private exportStartTime = 0;
  private mounted = false;
  private supported: boolean;

  private warningSection: HTMLElement | null = null;
  private chromeOkSection: HTMLElement | null = null;
  private summarySection: HTMLElement | null = null;
  private summaryText: HTMLElement | null = null;
  private noVideoMsg: HTMLElement | null = null;
  private exportBtn: HTMLButtonElement | null = null;
  private progressSection: HTMLElement | null = null;
  private statusText: HTMLElement | null = null;
  private progressFill: HTMLElement | null = null;
  private frameCount: HTMLElement | null = null;
  private etaText: HTMLElement | null = null;
  private successSection: HTMLElement | null = null;
  private errorSection: HTMLElement | null = null;
  private errorMessage: HTMLElement | null = null;

  constructor(
    container: HTMLElement,
    getVideoFile: () => Promise<File | null>,
    getCutRegions: () => CutRegion[],
  ) {
    this.container = container;
    this.getVideoFile = getVideoFile;
    this.getCutRegions = getCutRegions;
    this.supported = isExportSupported();
  }

  mount(): void {
    if (this.mounted) return;
    this.mounted = true;

    this.injectStyles();
    this.render();
    this.bindEvents();
    this.updateButtons();
  }

  destroy(): void {
    if (!this.mounted) return;
    this.mounted = false;
    this.exporting = false;
    this.exportBlob = null;

    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = null;
    }
    this.container.innerHTML = '';
    this.root = null;

    this.warningSection = null;
    this.chromeOkSection = null;
    this.summarySection = null;
    this.summaryText = null;
    this.noVideoMsg = null;
    this.exportBtn = null;
    this.progressSection = null;
    this.statusText = null;
    this.progressFill = null;
    this.frameCount = null;
    this.etaText = null;
    this.successSection = null;
    this.errorSection = null;
    this.errorMessage = null;
  }

  private injectStyles(): void {
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = STYLES;
    document.head.appendChild(this.styleEl);
  }

  private render(): void {
    this.root = document.createElement('div');
    this.root.className = 'exp-panel';
    this.container.appendChild(this.root);

    if (!this.supported) {
      this.renderUnsupported();
    } else {
      this.renderSupported();
    }
  }

  private renderUnsupported(): void {
    if (!this.root) return;

    this.warningSection = document.createElement('div');
    this.warningSection.className = 'exp-warning-banner';
    this.warningSection.innerHTML = `
      <span class="exp-warning-banner-icon">&#9888;</span>
      <span>Export requires Chrome or Edge (WebCodecs support).<br/>You can still transcribe and edit in any browser.</span>
    `;
    this.root.appendChild(this.warningSection);
  }

  private renderSupported(): void {
    if (!this.root) return;

    this.chromeOkSection = document.createElement('div');
    this.chromeOkSection.style.cssText = 'display: contents;';
    this.root.appendChild(this.chromeOkSection);

    this.summarySection = document.createElement('div');
    this.summarySection.className = 'exp-summary exp-hidden';
    this.summarySection.innerHTML = `
      <div class="exp-summary-title" data-el="summary-text"></div>
      <div class="exp-keyframe-note">Cuts are accurate to ~2-5 seconds (keyframe granularity).</div>
    `;
    this.chromeOkSection.appendChild(this.summarySection);
    this.summaryText = this.summarySection.querySelector('[data-el="summary-text"]');

    this.noVideoMsg = document.createElement('div');
    this.noVideoMsg.className = 'exp-no-video exp-hidden';
    this.noVideoMsg.textContent = 'No video loaded.';
    this.chromeOkSection.appendChild(this.noVideoMsg);

    const actions = document.createElement('div');
    actions.className = 'exp-actions';
    this.exportBtn = document.createElement('button');
    this.exportBtn.className = 'exp-btn exp-export-btn';
    this.exportBtn.id = 'exp-export-btn';
    this.exportBtn.textContent = 'Export WebM';
    this.exportBtn.disabled = true;
    actions.appendChild(this.exportBtn);
    this.chromeOkSection.appendChild(actions);

    this.progressSection = document.createElement('div');
    this.progressSection.className = 'exp-progress exp-hidden';
    this.progressSection.innerHTML = `
      <div class="exp-status-text" data-el="status-text"></div>
      <div class="exp-progress-bar-track">
        <div class="exp-progress-bar-fill" data-el="progress-fill" style="width:0%"></div>
      </div>
      <div class="exp-frame-count" data-el="frame-count"></div>
      <div class="exp-eta" data-el="eta-text"></div>
    `;
    this.chromeOkSection.appendChild(this.progressSection);
    this.statusText = this.progressSection.querySelector('[data-el="status-text"]');
    this.progressFill = this.progressSection.querySelector('[data-el="progress-fill"]');
    this.frameCount = this.progressSection.querySelector('[data-el="frame-count"]');
    this.etaText = this.progressSection.querySelector('[data-el="eta-text"]');

    this.successSection = document.createElement('div');
    this.successSection.className = 'exp-success exp-hidden';
    this.successSection.innerHTML = `
      <div class="exp-success-msg">Export complete!</div>
      <div class="exp-success-actions">
        <button class="exp-btn exp-download-btn" id="exp-download-btn">Download</button>
        <button class="exp-btn exp-another-btn" id="exp-another-btn">Export Another</button>
      </div>
    `;
    this.chromeOkSection.appendChild(this.successSection);

    this.errorSection = document.createElement('div');
    this.errorSection.className = 'exp-error-box exp-hidden';
    this.errorSection.innerHTML = `
      <div class="exp-error-title">Export failed</div>
      <div data-el="error-message"></div>
      <div class="exp-error-actions">
        <button class="exp-retry-btn" id="exp-retry-btn">Try Again</button>
      </div>
    `;
    this.chromeOkSection.appendChild(this.errorSection);
    this.errorMessage = this.errorSection.querySelector('[data-el="error-message"]');
  }

  private bindEvents(): void {
    this.exportBtn?.addEventListener('click', () => this.startExport());
    this.root?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.id === 'exp-download-btn') this.download();
      if (target.id === 'exp-another-btn') this.resetToReady();
      if (target.id === 'exp-retry-btn') this.resetToReady();
    });
  }

  async updateButtons(): Promise<void> {
    if (!this.mounted || !this.supported || !this.exporting) {
      this.refreshVideoState();
    }
  }

  private async refreshVideoState(): Promise<void> {
    if (!this.supported || !this.chromeOkSection) return;

    const file = await this.getVideoFile();

    if (!file) {
      if (this.summarySection) this.summarySection.classList.add('exp-hidden');
      if (this.noVideoMsg) this.noVideoMsg.classList.remove('exp-hidden');
      if (this.exportBtn) this.exportBtn.disabled = true;
      if (this.progressSection) this.progressSection.classList.add('exp-hidden');
      if (this.errorSection) this.errorSection.classList.add('exp-hidden');
      return;
    }

    const regions = this.getCutRegions();
    const totalRemoved = regions.reduce((sum, r) => sum + (r.end - r.start), 0);

    if (this.noVideoMsg) this.noVideoMsg.classList.add('exp-hidden');
    if (this.summarySection) this.summarySection.classList.remove('exp-hidden');
    if (this.exportBtn) this.exportBtn.disabled = false;

    if (this.summaryText) {
      if (regions.length > 0) {
        this.summaryText.textContent = `Exporting with ${regions.length} cut${regions.length === 1 ? '' : 's'} (${formatDuration(totalRemoved)} removed)`;
      } else {
        this.summaryText.textContent = 'No cuts selected. The full video will be exported.';
      }
    }
  }

  private async startExport(): Promise<void> {
    if (this.exporting) return;

    const file = await this.getVideoFile();
    if (!file) return;

    const regions = this.getCutRegions();

    this.exporting = true;
    this.exportBlob = null;
    this.exportStartTime = performance.now();

    if (this.exportBtn) {
      this.exportBtn.disabled = true;
      this.exportBtn.textContent = 'Exporting...';
    }
    if (this.progressSection) this.progressSection.classList.remove('exp-hidden');
    if (this.errorSection) this.errorSection.classList.add('exp-hidden');
    if (this.successSection) this.successSection.classList.add('exp-hidden');

    try {
      await exportVideo(file, regions, {
        onProgress: (progress: ExportProgress) => {
          if (!this.mounted) return;
          this.updateProgress(progress);
        },
        onComplete: (blob: Blob) => {
          if (!this.mounted) return;
          this.onExportComplete(blob);
        },
        onError: (error: string) => {
          if (!this.mounted) return;
          this.onExportError(new Error(error));
        },
      });

      if (this.exporting && this.mounted && !this.exportBlob) {
        this.onExportError(new Error('Export finished without producing output.'));
      }
    } catch (err) {
      if (this.mounted) {
        this.onExportError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }

  private updateProgress(progress: ExportProgress): void {
    if (!this.mounted) return;

    const pct = Math.round(progress.progress * 100);

    if (this.statusText) {
      this.statusText.textContent = progress.message;
    }
    if (this.progressFill) {
      this.progressFill.style.width = `${pct}%`;
    }
    if (this.frameCount) {
      this.frameCount.textContent = `${progress.processedFrames} / ${progress.totalFrames} frames`;
    }

    if (pct > 0 && pct < 100) {
      const elapsed = (performance.now() - this.exportStartTime) / 1000;
      const total = elapsed / (pct / 100);
      const remaining = total - elapsed;
      if (this.etaText) {
        this.etaText.textContent = formatTime(remaining);
      }
    } else if (pct >= 100) {
      if (this.etaText) this.etaText.textContent = '';
    }
  }

  private onExportComplete(blob: Blob): void {
    this.exporting = false;
    this.exportBlob = blob;

    if (this.progressSection) this.progressSection.classList.add('exp-hidden');
    if (this.successSection) this.successSection.classList.remove('exp-hidden');
    if (this.errorSection) this.errorSection.classList.add('exp-hidden');
    if (this.exportBtn) this.exportBtn.classList.add('exp-hidden');
  }

  private onExportError(error: Error): void {
    this.exporting = false;

    if (this.progressSection) this.progressSection.classList.add('exp-hidden');
    if (this.errorSection) this.errorSection.classList.remove('exp-hidden');
    if (this.exportBtn) {
      this.exportBtn.disabled = false;
      this.exportBtn.textContent = 'Export WebM';
    }

    if (this.errorMessage) {
      this.errorMessage.textContent = error.message || 'Unknown error during export.';
    }
  }

  private download(): void {
    if (!this.exportBlob) return;
    const url = URL.createObjectURL(this.exportBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'talkcut-export.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private resetToReady(): void {
    this.exportBlob = null;

    if (this.successSection) this.successSection.classList.add('exp-hidden');
    if (this.errorSection) this.errorSection.classList.add('exp-hidden');
    if (this.summarySection) this.summarySection.classList.remove('exp-hidden');
    if (this.exportBtn) {
      this.exportBtn.classList.remove('exp-hidden');
      this.exportBtn.disabled = false;
      this.exportBtn.textContent = 'Export WebM';
    }

    this.refreshVideoState();
  }
}
