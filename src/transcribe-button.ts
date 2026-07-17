import { TranscriptionService } from './transcription-service.ts';
import { saveProject } from './opfs.ts';
import type { ProjectState, TranscriptWord } from './types.ts';
import type { TranscriptPanel } from './transcript-panel.ts';
import { extractAudioFromVideoElement } from './audio-extractor.ts';

const STYLES = `
.tc-container {
  flex-shrink: 0;
  border-bottom: 1px solid var(--border, #2a2a4a);
  padding-bottom: 10px;
  margin-bottom: 0;
}

.tc-btn-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tc-btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius, 8px);
  background: var(--accent, #4f8cff);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  white-space: nowrap;
}

.tc-btn:hover:not(:disabled) {
  background: var(--accent-hover, #3a6fd8);
}

.tc-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tc-progress {
  margin-top: 8px;
}

.tc-progress-bar {
  width: 100%;
  height: 4px;
  background: var(--bg-primary, #1a1a2e);
  border-radius: 2px;
  overflow: hidden;
}

.tc-progress-fill {
  height: 100%;
  width: 0%;
  background: var(--accent, #4f8cff);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.tc-progress-label {
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-secondary, #a0a0b0);
}

.tc-error {
  padding: 8px 10px;
  margin-top: 6px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid var(--danger, #ef4444);
  border-radius: var(--radius, 8px);
  color: var(--danger, #ef4444);
  font-size: 12px;
}
`;

export class TranscribeButton {
  private panel: TranscriptPanel;
  private service: TranscriptionService;
  private el: HTMLElement;
  private styleEl: HTMLStyleElement;

  private buttonEl: HTMLButtonElement;
  private progressEl: HTMLElement;
  private progressFill: HTMLElement;
  private progressLabel: HTMLElement;
  private errorEl: HTMLElement;

  private getVideoElement: (() => HTMLVideoElement) | null = null;
  private getProject: (() => ProjectState | null) | null = null;
  private onProjectUpdated: (() => void) | null = null;

  private isTranscribing = false;

  constructor(panel: TranscriptPanel) {
    this.panel = panel;
    this.service = new TranscriptionService();

    this.styleEl = document.createElement('style');
    this.styleEl.textContent = STYLES;
    document.head.appendChild(this.styleEl);

    this.el = document.createElement('div');
    this.el.className = 'tc-container';
    this.el.innerHTML = `
      <div class="tc-btn-row">
        <button class="tc-btn">Transcribe</button>
      </div>
      <div class="tc-progress" style="display:none;">
        <div class="tc-progress-bar"><div class="tc-progress-fill"></div></div>
        <p class="tc-progress-label"></p>
      </div>
      <div class="tc-error" style="display:none;"></div>
    `;

    this.buttonEl = this.el.querySelector('.tc-btn')!;
    this.progressEl = this.el.querySelector('.tc-progress')!;
    this.progressFill = this.el.querySelector('.tc-progress-fill')!;
    this.progressLabel = this.el.querySelector('.tc-progress-label')!;
    this.errorEl = this.el.querySelector('.tc-error')!;

    this.buttonEl.addEventListener('click', () => this.handleTranscribe());
    this.buttonEl.disabled = true;
  }

  mount(
    getVideoElement: () => HTMLVideoElement,
    getProject: () => ProjectState | null,
    onProjectUpdated: () => void,
  ): void {
    this.getVideoElement = getVideoElement;
    this.getProject = getProject;
    this.onProjectUpdated = onProjectUpdated;

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
    this.hideError();
    this.showProgress(true);
    this.updateProgress(0, 'Extracting audio...');

    try {
      const { audioData, sampleRate } = await extractAudioFromVideoElement(video);

      const audioPct = 0.15;
      this.updateProgress(audioPct, 'Loading speech model...');

      await this.service.ensureModel((progress, message) => {
        const displayProgress = audioPct + progress * 0.25;
        this.updateProgress(displayProgress, message);
      });

      this.updateProgress(0.4, 'Transcribing...');

      this.service.transcribe(audioData, sampleRate, {
        onProgress: (_status, progress, message) => {
          const displayProgress = 0.4 + progress * 0.6;
          this.updateProgress(displayProgress, message);
        },
        onComplete: (words: TranscriptWord[]) => {
          this.showProgress(false);
          this.panel.setWords(words);
          this.saveResults(words);
          this.isTranscribing = false;
        },
        onError: (error: string) => {
          this.showProgress(false);
          this.showError(error);
          this.isTranscribing = false;
        },
      });
    } catch (err) {
      this.showProgress(false);
      this.showError(err instanceof Error ? err.message : String(err));
      this.isTranscribing = false;
    }
  }

  private cancelTranscription(): void {
    if (this.isTranscribing) {
      this.service.cancel();
      this.isTranscribing = false;
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
  }

  private showError(message: string): void {
    this.errorEl.textContent = message;
    this.errorEl.style.display = 'block';
  }

  private hideError(): void {
    this.errorEl.style.display = 'none';
  }
}
