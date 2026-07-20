import type { CutRegion, ExportProgress, ExportFormat } from './types.ts';
import { isWebCodecsExportSupported, getSupportedExportFormats, exportVideo } from './exporter.ts';
import { toast } from './toast.ts';

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
  private root: HTMLElement | null = null;
  private exportBlob: Blob | null = null;
  private exporting = false;
  private exportStartTime = 0;
  private mounted = false;
  private supported: boolean;
  private supportedFormats: ExportFormat[];
  private selectedFormat: ExportFormat = 'webm';

  private warningSection: HTMLElement | null = null;
  private formatSelector: HTMLElement | null = null;
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
    this.supported = isWebCodecsExportSupported();
    this.supportedFormats = getSupportedExportFormats();
    if (!this.supported) {
      this.selectedFormat = 'mp4';
    }
  }

  mount(): void {
    if (this.mounted) return;
    this.mounted = true;
    this.render();
    this.bindEvents();
    this.refreshVideoState();
  }

  destroy(): void {
    if (!this.mounted) return;
    this.mounted = false;
    this.exporting = false;
    this.exportBlob = null;
    this.container.innerHTML = '';
    this.root = null;
    this.warningSection = null;
    this.formatSelector = null;
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

  private render(): void {
    this.root = document.createElement('div');
    this.root.className = 'exp-panel';
    this.container.appendChild(this.root);

    if (!this.supported) {
      this.warningSection = document.createElement('div');
      this.warningSection.className = 'exp-warning-banner';
      this.warningSection.innerHTML = `WebCodecs not available. MP4 export via FFmpeg.wasm is available but slower. Transcription and editing work in any browser.`;
      this.root.appendChild(this.warningSection);
    }

    this.formatSelector = document.createElement('div');
    this.formatSelector.className = 'exp-format-selector';
    for (const fmt of this.supportedFormats) {
      const option = document.createElement('div');
      option.className = 'exp-format-option' + (fmt === this.selectedFormat ? ' selected' : '');
      option.setAttribute('data-format', fmt);
      if (fmt === 'webm') {
        option.innerHTML = `<div class="exp-format-name">WebM</div><div class="exp-format-desc">VP9/Opus · Faster · Chrome/Edge</div>`;
      } else {
        option.innerHTML = `<div class="exp-format-name">MP4</div><div class="exp-format-desc">H264/AAC · Universal · FFmpeg.wasm</div>`;
      }
      this.formatSelector.appendChild(option);
    }
    this.root.appendChild(this.formatSelector);

    this.summarySection = document.createElement('div');
    this.summarySection.className = 'exp-summary exp-hidden';
    this.summarySection.innerHTML = `
      <div class="exp-summary-title" data-el="summary-text"></div>
      <div class="exp-summary-detail" data-el="summary-detail"></div>
      <div class="exp-keyframe-note">Cuts are applied at the frame level via per-frame re-encoding.</div>
    `;
    this.root.appendChild(this.summarySection);
    this.summaryText = this.summarySection.querySelector('[data-el="summary-text"]');
    const summaryDetail = this.summarySection.querySelector('[data-el="summary-detail"]');
    if (summaryDetail) {
      this.summarySection.querySelector('[data-el="summary-detail"]');
    }

    this.noVideoMsg = document.createElement('div');
    this.noVideoMsg.className = 'exp-no-video exp-hidden';
    this.noVideoMsg.textContent = 'No video loaded. Drop a video file to get started.';
    this.root.appendChild(this.noVideoMsg);

    const actions = document.createElement('div');
    actions.className = 'exp-actions';
    this.exportBtn = document.createElement('button');
    this.exportBtn.className = 'exp-btn exp-export-btn';
    this.exportBtn.id = 'exp-export-btn';
    this.exportBtn.textContent = 'Export Video';
    this.exportBtn.disabled = true;
    actions.appendChild(this.exportBtn);
    this.root.appendChild(actions);

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
    this.root.appendChild(this.progressSection);
    this.statusText = this.progressSection.querySelector('[data-el="status-text"]');
    this.progressFill = this.progressSection.querySelector('[data-el="progress-fill"]');
    this.frameCount = this.progressSection.querySelector('[data-el="frame-count"]');
    this.etaText = this.progressSection.querySelector('[data-el="eta-text"]');

    this.successSection = document.createElement('div');
    this.successSection.className = 'exp-success exp-hidden';
    this.root.appendChild(this.successSection);

    this.errorSection = document.createElement('div');
    this.errorSection.className = 'exp-error-box exp-hidden';
    this.errorSection.innerHTML = `
      <div class="exp-error-title">Export failed</div>
      <div data-el="error-message"></div>
      <div class="exp-error-actions">
        <button class="exp-retry-btn" id="exp-retry-btn">Try Again</button>
      </div>
    `;
    this.root.appendChild(this.errorSection);
    this.errorMessage = this.errorSection.querySelector('[data-el="error-message"]');
  }

  private bindEvents(): void {
    this.exportBtn?.addEventListener('click', () => this.startExport());
    this.root?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      const fmtOption = target.closest<HTMLElement>('.exp-format-option');
      if (fmtOption) {
        const fmt = fmtOption.getAttribute('data-format') as ExportFormat;
        if (fmt && this.supportedFormats.includes(fmt)) {
          this.selectedFormat = fmt;
          this.formatSelector?.querySelectorAll('.exp-format-option').forEach((el) => {
            el.classList.toggle('selected', el.getAttribute('data-format') === fmt);
          });
          this.refreshVideoState();
        }
        return;
      }

      if (target.id === 'exp-download-btn') this.download();
      if (target.id === 'exp-another-btn') this.resetToReady();
      if (target.id === 'exp-retry-btn') this.resetToReady();
    });
  }

  async refreshVideoState(): Promise<void> {
    if (!this.mounted) return;

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

    if (this.exportBtn) {
      this.exportBtn.textContent = this.selectedFormat === 'webm' ? 'Export WebM' : 'Export MP4';
    }
  }

  async updateButtons(): Promise<void> {
    await this.refreshVideoState();
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
      }, this.selectedFormat);

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
    if (this.frameCount && progress.totalFrames > 0) {
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
    if (this.successSection) {
      this.successSection.classList.remove('exp-hidden');
      this.successSection.innerHTML = `
        <div class="exp-success-msg">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>
          Export complete!
        </div>
        <div class="exp-success-actions">
          <button class="exp-btn exp-download-btn" id="exp-download-btn">Download</button>
          <button class="exp-btn exp-another-btn" id="exp-another-btn">Export Another</button>
        </div>
      `;
    }
    if (this.errorSection) this.errorSection.classList.add('exp-hidden');
    if (this.exportBtn) this.exportBtn.classList.add('exp-hidden');

    toast.success(`${this.selectedFormat.toUpperCase()} export complete!`);
  }

  private onExportError(error: Error): void {
    this.exporting = false;

    if (this.progressSection) this.progressSection.classList.add('exp-hidden');
    if (this.errorSection) this.errorSection.classList.remove('exp-hidden');
    if (this.exportBtn) {
      this.exportBtn.disabled = false;
      this.exportBtn.textContent = this.selectedFormat === 'webm' ? 'Export WebM' : 'Export MP4';
    }

    if (this.errorMessage) {
      this.errorMessage.textContent = error.message || 'Unknown error during export.';
    }

    toast.error(error.message || 'Export failed');
  }

  private download(): void {
    if (!this.exportBlob) return;
    const url = URL.createObjectURL(this.exportBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.selectedFormat === 'webm' ? 'talkcut-export.webm' : 'talkcut-export.mp4';
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
    }

    this.refreshVideoState();
  }
}
