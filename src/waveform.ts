import type { CutRegion } from './types.ts';

export class WaveformRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private data: Float32Array | null = null;
  private currentTime = 0;
  private duration = 0;
  private cutRegions: CutRegion[] = [];
  private isDragging = false;
  private onSeek?: (time: number) => void;

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'waveform-canvas';
    this.canvas.width = container.clientWidth;
    this.canvas.height = 80;
    container.appendChild(this.canvas);

    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context not available');
    this.ctx = context;

    this.setupMouseEvents();
    this.setupResizeObserver(container);
  }

  private setupResizeObserver(container: HTMLElement): void {
    const observer = new ResizeObserver(() => {
      this.canvas.width = container.clientWidth;
      this.canvas.height = 80;
      this.draw();
    });
    observer.observe(container);
  }

  async loadFromVideo(video: HTMLVideoElement): Promise<void> {
    try {
      const audioContext = new AudioContext();
      const response = await fetch(video.src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      this.data = this.downsample(channelData, this.canvas.width * 4);
      this.duration = audioBuffer.duration;
      audioContext.close();
      this.draw();
    } catch (e) {
      console.warn('Waveform generation failed:', e);
    }
  }

  private downsample(data: Float32Array, targetLength: number): Float32Array {
    const result = new Float32Array(targetLength);
    const blockSize = Math.floor(data.length / targetLength);
    for (let i = 0; i < targetLength; i++) {
      let max = 0;
      const start = i * blockSize;
      for (let j = 0; j < blockSize && start + j < data.length; j++) {
        const abs = Math.abs(data[start + j]);
        if (abs > max) max = abs;
      }
      result[i] = max;
    }
    return result;
  }

  setCurrentTime(time: number): void {
    this.currentTime = time;
    this.draw();
  }

  setDuration(duration: number): void {
    this.duration = duration;
    this.draw();
  }

  setCutRegions(regions: CutRegion[]): void {
    this.cutRegions = regions;
    this.draw();
  }

  onSeekTo(callback: (time: number) => void): void {
    this.onSeek = callback;
  }

  private setupMouseEvents(): void {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.handleSeek(e);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) this.handleSeek(e);
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }

  private handleSeek(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const time = ratio * this.duration;
    this.onSeek?.(time);
  }

  private draw(): void {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);

    const padding = 4;
    const drawHeight = height - padding * 2;
    const midY = height / 2;

    if (this.duration > 0) {
      for (const region of this.cutRegions) {
        const x1 = (region.start / this.duration) * width;
        const x2 = (region.end / this.duration) * width;
        ctx.fillStyle = 'rgba(248, 81, 73, 0.15)';
        ctx.fillRect(x1, padding, x2 - x1, drawHeight);
        ctx.fillStyle = 'rgba(248, 81, 73, 0.5)';
        ctx.fillRect(x1, padding, 1, drawHeight);
        ctx.fillRect(x2 - 1, padding, 1, drawHeight);
      }
    }

    if (this.data) {
      ctx.strokeStyle = '#5e60ce';
      ctx.lineWidth = 1;
      ctx.beginPath();

      const samplesPerPixel = this.data.length / width;
      for (let x = 0; x < width; x++) {
        const i = Math.floor(x * samplesPerPixel);
        const val = this.data[i] || 0;
        const y = midY - val * (drawHeight / 2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(94, 96, 206, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const i = Math.floor(x * samplesPerPixel);
        const val = this.data[i] || 0;
        const y = midY + val * (drawHeight / 2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (this.duration > 0) {
        const playheadX = (this.currentTime / this.duration) * width;
        ctx.strokeStyle = '#e6edf3';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(playheadX, padding);
        ctx.lineTo(playheadX, height - padding);
        ctx.stroke();

        ctx.fillStyle = '#e6edf3';
        ctx.beginPath();
        ctx.arc(playheadX, padding, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#6e7681';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload a video to see the waveform', width / 2, midY);
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
