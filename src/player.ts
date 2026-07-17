export class VideoPlayer {
  private container: HTMLElement;
  private videoElement: HTMLVideoElement;
  private dragOverlay: HTMLElement;
  private onVideoLoaded?: (file: File) => void;

  constructor(container: HTMLElement) {
    this.container = container;

    this.videoElement = document.createElement('video');
    this.videoElement.controls = true;
    this.videoElement.className = 'video-player';
    this.videoElement.crossOrigin = 'anonymous';

    this.dragOverlay = document.createElement('div');
    this.dragOverlay.className = 'drag-overlay';
    this.dragOverlay.innerHTML = `
      <div class="drag-overlay-content">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17,8 12,3 7,8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p>Drop a video file here</p>
        <p class="drag-overlay-hint">MP4, MOV, MKV</p>
        <button id="file-select-btn" class="btn btn-primary">Or select a file</button>
      </div>
    `;

    this.container.appendChild(this.videoElement);
    this.container.appendChild(this.dragOverlay);

    this.setupDragDrop();
    this.setupClickHandler();
  }

  private setupDragDrop(): void {
    const preventDefaults = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
      this.container.addEventListener(eventName, preventDefaults);
    });

    this.container.addEventListener('dragenter', () => {
      this.dragOverlay.classList.add('active');
    });

    this.container.addEventListener('dragleave', () => {
      this.dragOverlay.classList.remove('active');
    });

    this.container.addEventListener('drop', (e: DragEvent) => {
      this.dragOverlay.classList.remove('active');
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        this.loadFile(files[0]);
      }
    });
  }

  private setupClickHandler(): void {
    const btn = this.dragOverlay.querySelector('#file-select-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/mp4,video/quicktime,video/x-matroska,.mp4,.mov,.mkv';
        input.onchange = () => {
          if (input.files && input.files.length > 0) {
            this.loadFile(input.files[0]);
          }
        };
        input.click();
      });
    }
  }

  onLoad(callback: (file: File) => void): void {
    this.onVideoLoaded = callback;
  }

  loadFile(file: File): void {
    const url = URL.createObjectURL(file);
    this.videoElement.src = url;
    this.videoElement.style.display = 'block';
    this.dragOverlay.style.display = 'none';
    this.onVideoLoaded?.(file);
  }

  loadBlobUrl(url: string): void {
    this.videoElement.src = url;
    this.videoElement.style.display = 'block';
    this.dragOverlay.style.display = 'none';
  }

  getVideoElement(): HTMLVideoElement {
    return this.videoElement;
  }

  getCurrentTime(): number {
    return this.videoElement.currentTime;
  }

  seekTo(time: number): void {
    this.videoElement.currentTime = time;
  }

  play(): void {
    this.videoElement.play();
  }

  pause(): void {
    this.videoElement.pause();
  }

  getDuration(): number {
    return this.videoElement.duration;
  }
}
