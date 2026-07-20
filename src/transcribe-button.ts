import { TranscriptionService } from './transcription-service.ts';
import { saveProject } from './opfs.ts';
import type { ProjectState, TranscriptWord } from './types.ts';
import type { TranscriptPanel } from './transcript-panel.ts';
import { extractAudioFromVideoElement } from './audio-extractor.ts';
import { toast } from './toast.ts';

export class TranscribeButton {
  private panel: TranscriptPanel;
  private service: TranscriptionService;
  private el: HTMLElement;
  private styleEl: HTMLStyleElement;

  private buttonEl: HTMLButtonElement;
  private cancelBtnEl: HTMLButtonElement;
  private progressEl: HTMLElement;
  private progressFill: HTMLElement;
  private progressLabel: HTMLElement;
  private progressEta: HTMLElement;
  private errorEl: HTMLElement;

  private getVideoElement: (() => HTMLVideoElement) | null = null;
  private getProject: (() => ProjectState | null) | null = null;
  private onProjectUpdated: (() => void) | null = null;
  private getModelId: (() => string) | null = null;

  private isTranscribing = false;
  private transcribeStartTime = 0;

  constructor(panel: TranscriptPanel) {
    this.panel = panel;
    this.service = new TranscriptionService();

    this.styleEl = document.createElement('style');
    document.head.appendChild(this.styleEl);

    this.el = document.createElement('div');
    this.el.className = 'tc-container';
    this.el.innerHTML = `
      <div class="tc-btn-row">
        <button class="tc-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 8a6.5 6.5 0 1 1 13 0A6.5 6.5 0 0 1 1.5 8Zm6.5-5a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM3 8a5 5 0 0 1 10 0H3Z"/></svg>
          Transcribe
        </button>
        <button class="tc-cancel-btn" style="display:none;">Cancel</button>
      </div>
      <div class="tc-progress" style="display:none;">
        <div class="tc-progress-bar"><div class="tc-progress-fill"></div></div>
        <div class="tc-progress-label">
          <span class="tc-progress-label-text"></span>
          <span class="tc-progress-eta"></span>
        </div>
      </div>
      <div class="tc-error" style="display:none;"></div>
    `;

    this.buttonEl = this.el.querySelector('.tc-btn')!;
    this.cancelBtnEl = this.el.querySelector('.tc-cancel-btn')!;
    this.progressEl = this.el.querySelector('.tc-progress')!;
    this.progressFill = this.el.querySelector('.tc-progress-fill')!;
    this.progressLabel = this.el.querySelector('.tc-progress-label-text')!;
    this.progressEta = this.el.querySelector('.tc-progress-eta')!;
    this.errorEl = this.el.querySelector('.tc-error')!;

    this.buttonEl.addEventListener('click', () => this.handleTranscribe());
    this.cancelBtnEl.addEventListener('click', () => this.cancelTranscription());
    this.buttonEl.disabled = true;
  }

  mount(
    getVideoElement: () => HTMLVideoElement,
    getProject: () => ProjectState | null,
    onProjectUpdated: () => void,
    getModelId: () => string,
  ): void {
    this.getVideoElement = getVideoElement;
    this.getProject = getProject;
    this.onProjectUpdated = onProjectUpdated;
    this.getModelId = getModelId;
    this.buttonEl.disabled = false;
  }

  unmount(): void {
    this.cancelTranscription();
    this.getVideoElement = null;
    this.getProject = null;
    this.onProjectUpdated = null;
    this.buttonEl.disabled = true;
  }

  getElement(): HTMLElement {
    return this.el;
  }

  destroy(): void {
    this.service.destroy();
    if (this.styleEl.parentNode) {
      this.styleEl.parentNode.removeChild(this.styleEl);
    }
  }

  private async handleTranscribe(): Promise<void> {
    if (this.isTranscribing) return;

    const getVideo = this.getVideoElement;
    if (!getVideo) return;

    const video = getVideo();
    if (!video || !video.src) {
      this.showError('Please load a video first.');
      return;
    }

    if (video.readyState < 2) {
      this.showError('Video is not ready yet. Please wait.');
      return;
    }

    this.isTranscribing = true;
    this.transcribeStartTime = performance.now();
    this.hideError();
    this.showProgress(true);
    this.cancelBtnEl.style.display = '';
    this.updateProgress(0, 'Extracting audio...');

    try {
      const { audioData, sampleRate } = await extractAudioFromVideoElement(video);

      const audioPct = 0.15;
      this.updateProgress(audioPct, 'Loading speech model...');

      const modelId = this.getModelId?.() ?? 'Xenova/whisper-tiny.en';
      this.service.setModelId(modelId);

      await this.service.ensureModel((progress, message) => {
        const displayProgress = audioPct + progress * 0.25;
        this.updateProgress(displayProgress, message);
      });

      this.updateProgress(0.4, 'Running Whisper inference... (this may take a while)');

      this.service.transcribe(audioData, sampleRate, {
        onProgress: (_status, progress, message) => {
          const displayProgress = 0.4 + progress * 0.6;
          this.updateProgress(displayProgress, message || 'Running Whisper inference...');
        },
        onComplete: (words: TranscriptWord[]) => {
          this.isTranscribing = false;
          this.showProgress(false);
          this.cancelBtnEl.style.display = 'none';
          this.panel.setWords(words);
          this.saveResults(words);
          toast.success(`Transcription complete: ${words.length} words`);
        },
        onError: (error: string) => {
          this.isTranscribing = false;
          this.showProgress(false);
          this.cancelBtnEl.style.display = 'none';
          this.showError(error);
          toast.error('Transcription failed');
        },
      });
    } catch (err) {
      this.isTranscribing = false;
      this.showProgress(false);
      this.cancelBtnEl.style.display = 'none';
      this.showError(err instanceof Error ? err.message : String(err));
    }
  }

  private cancelTranscription(): void {
    if (this.isTranscribing) {
      this.service.cancel();
      this.isTranscribing = false;
      this.showProgress(false);
      this.cancelBtnEl.style.display = 'none';
      toast.info('Transcription cancelled');
    }
  }

  private async saveResults(words: TranscriptWord[]): Promise<void> {
    const getProject = this.getProject;
    if (!getProject) return;

    const project = getProject();
    if (!project) return;

    project.transcript = words;
    project.updatedAt = Date.now();
    try {
      await saveProject(project);
      this.onProjectUpdated?.();
    } catch {
      // save failed, results remain in memory
    }
  }

  private showProgress(show: boolean): void {
    this.progressEl.style.display = show ? 'block' : 'none';
    this.buttonEl.disabled = this.isTranscribing;
  }

  private updateProgress(progress: number, message: string): void {
    this.progressFill.style.width = `${Math.round(progress * 100)}%`;
    this.progressLabel.textContent = message;

    if (progress > 0.05 && progress < 1) {
      const elapsed = (performance.now() - this.transcribeStartTime) / 1000;
      const total = elapsed / progress;
      const remaining = total - elapsed;
      const m = Math.floor(remaining / 60);
      const s = Math.floor(remaining % 60);
      if (m > 0) {
        this.progressEta.textContent = `~${m}m ${s}s left`;
      } else {
        this.progressEta.textContent = `~${s}s left`;
      }
    } else {
      this.progressEta.textContent = '';
    }
  }

  private showError(message: string): void {
    this.errorEl.textContent = message;
    this.errorEl.style.display = 'block';
  }

  private hideError(): void {
    this.errorEl.style.display = 'none';
  }
}
