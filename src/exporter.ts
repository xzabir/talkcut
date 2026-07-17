import type { CutRegion, ExportProgress } from './types.ts';
import { Muxer, ArrayBufferTarget } from 'webm-muxer';

export interface ExportCallbacks {
  onProgress: (progress: ExportProgress) => void;
  onComplete: (blob: Blob) => void;
  onError: (error: string) => void;
}

interface KeepSegment {
  start: number;
  end: number;
  deletedBefore: number;
}

export function isExportSupported(): boolean {
  try {
    return (
      typeof VideoEncoder !== 'undefined' &&
      typeof AudioEncoder !== 'undefined' &&
      typeof VideoFrame !== 'undefined' &&
      typeof OffscreenCanvas !== 'undefined'
    );
  } catch {
    return false;
  }
}

function snapRegions(regions: CutRegion[]): CutRegion[] {
  if (regions.length === 0) return [];
  const sorted = [...regions].sort((a, b) => a.start - b.start);
  const merged: CutRegion[] = [];
  for (const r of sorted) {
    const last = merged[merged.length - 1];
    if (!last || r.start > last.end) {
      merged.push({ ...r });
    } else if (r.end > last.end) {
      last.end = r.end;
    }
  }
  return merged;
}

function invertToKeepSegments(regions: CutRegion[], duration: number): KeepSegment[] {
  if (regions.length === 0) {
    return [{ start: 0, end: duration, deletedBefore: 0 }];
  }

  const merged = snapRegions(regions);
  const keeps: KeepSegment[] = [];

  let pos = 0;
  let deleted = 0;

  for (const cut of merged) {
    if (cut.start > pos + 0.001) {
      keeps.push({ start: pos, end: cut.start, deletedBefore: deleted });
    }
    pos = cut.end;
    deleted += cut.end - cut.start;
  }

  if (pos < duration - 0.001) {
    keeps.push({ start: pos, end: duration, deletedBefore: deleted });
  }

  return keeps;
}

function isInCutRegion(timeS: number, regions: CutRegion[]): boolean {
  for (const r of regions) {
    if (timeS >= r.start && timeS < r.end) return true;
  }
  return false;
}

export async function exportVideo(
  videoFile: File,
  cutRegions: CutRegion[],
  callbacks: ExportCallbacks,
): Promise<void> {
  if (!isExportSupported()) {
    callbacks.onError('WebCodecs not available. Please use Chrome or Edge.');
    return;
  }

  let totalFrames = 0;
  let processedFrames = 0;

  const reportProgress = (partial: Omit<ExportProgress, 'totalFrames' | 'processedFrames'>): void => {
    callbacks.onProgress({
      totalFrames,
      processedFrames,
      ...partial,
    });
  };

  let video: HTMLVideoElement | null = null;
  let blobUrl = '';

  try {
    blobUrl = URL.createObjectURL(videoFile);
    video = document.createElement('video');
    video.src = blobUrl;
    video.muted = true;
    video.preload = 'auto';
    video.setAttribute('playsinline', '');
    video.style.position = 'absolute';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);

    await new Promise<void>((resolve, reject) => {
      video!.onloadedmetadata = () => resolve();
      video!.onerror = () => reject(new Error('Failed to load video'));
    });

    await new Promise<void>((resolve) => {
      if (video!.readyState >= 2) { resolve(); } else { video!.oncanplay = () => resolve(); }
    });

    const duration = video.duration;
    if (!isFinite(duration) || duration <= 0) {
      throw new Error('Could not determine video duration');
    }

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const snapped = snapRegions(cutRegions);
    const keepSegments = invertToKeepSegments(snapped, duration);

    const estimatedFps = 30;
    totalFrames = Math.ceil(duration * estimatedFps);
    processedFrames = 0;

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      video: {
        codec: 'V_VP9',
        width,
        height,
      },
      audio: {
        codec: 'A_OPUS',
        sampleRate: 48000,
        numberOfChannels: 1,
      },
    });

    reportProgress({
      status: 'decoding',
      progress: 0,
      message: 'Setting up video encoder...',
    });

    let videoEncodeError: string | null = null;
    let pendingVideoFrames = 0;
    let videoEncodeDone: (() => void) | null = null;

    const videoEncoder = new VideoEncoder({
      output: (chunk, meta) => {
        muxer.addVideoChunk(chunk, meta);
        pendingVideoFrames--;
        if (pendingVideoFrames === 0 && videoEncodeDone) {
          videoEncodeDone();
        }
      },
      error: (e) => {
        videoEncodeError = e.message;
        pendingVideoFrames = 0;
        if (videoEncodeDone) videoEncodeDone();
      },
    });

    videoEncoder.configure({
      codec: 'vp09.00.10.08',
      width,
      height,
      bitrate: 2_000_000,
      framerate: estimatedFps,
    });

    for (let si = 0; si < keepSegments.length; si++) {
      if (videoEncodeError) throw new Error(`Video encoder: ${videoEncodeError}`);

      const segment = keepSegments[si];
      const isFirstSegment = si === 0;

      await processKeepSegment(
        video,
        canvas,
        ctx,
        videoEncoder,
        segment,
        snapped,
        isFirstSegment,
        () => { pendingVideoFrames++; },
        () => { pendingVideoFrames--; },
        (count) => {
          processedFrames += count;
          if (processedFrames % 30 === 0) {
            reportProgress({
              status: 'encoding',
              progress: totalFrames > 0 ? processedFrames / totalFrames : 0,
              message: `Encoding... ${processedFrames}/${totalFrames} frames`,
            });
          }
        },
      );
    }

    if (videoEncodeError) throw new Error(`Video encoder: ${videoEncodeError}`);

    reportProgress({
      status: 'encoding',
      progress: totalFrames > 0 ? processedFrames / totalFrames : 0,
      message: 'Flushing video encoder...',
    });

    await new Promise<void>((resolve) => {
      videoEncodeDone = () => {
        if (pendingVideoFrames === 0) resolve();
      };
      videoEncoder.flush().then(() => {
        if (pendingVideoFrames === 0) resolve();
      });
    });

    if (videoEncodeError) throw new Error(`Video encoder: ${videoEncodeError}`);

    videoEncoder.close();
    videoEncodeDone = null;

    reportProgress({
      status: 'encoding',
      progress: totalFrames > 0 ? Math.min(1, processedFrames / totalFrames) : 0,
      message: 'Processing audio...',
    });

    const audioResult = await processAudio(videoFile, snapped, muxer);
    if (!audioResult.ok) {
      // Continue without audio — surface a warning but don't fail
      console.warn('Audio processing skipped:', audioResult.error);
    }

    reportProgress({
      status: 'muxing',
      progress: 0.95,
      message: 'Muxing output file...',
    });

    await muxer.finalize();

    const webmData = target.buffer!;
    const blob = new Blob([webmData as unknown as BlobPart], { type: 'video/webm' });

    reportProgress({
      status: 'done',
      progress: 1,
      message: 'Export complete',
    });

    callbacks.onComplete(blob);
  } catch (e) {
    callbacks.onError((e as Error).message);
  } finally {
    if (video) {
      try { video.pause(); } catch { /* ignore */ }
      if (video.parentNode) {
        video.parentNode.removeChild(video);
      }
    }
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
  }
}

async function processKeepSegment(
  video: HTMLVideoElement,
  canvas: OffscreenCanvas,
  ctx: OffscreenCanvasRenderingContext2D,
  encoder: VideoEncoder,
  segment: KeepSegment,
  cutRegions: CutRegion[],
  forceKeyframe: boolean,
  onEncodeStart: () => void,
  onEncodeError: () => void,
  onFrameCaptured: (count: number) => void,
): Promise<void> {
  const deletedBefore = segment.deletedBefore;
  const segmentStart = segment.start;
  const segmentEnd = segment.end;

  return new Promise<void>((resolve, reject) => {
    let lastMediaTime = -1;
    let resolved = false;
    let frameCount = 0;
    let keyframeForced = !forceKeyframe;

    function done(): void {
      if (resolved) return;
      resolved = true;
      resolve();
    }

    function onFrameCallback(now: number, metadata: VideoFrameCallbackMetadata): void {
      void now;
      if (resolved) return;

      const mediaTime = metadata.mediaTime;

      if (Math.abs(mediaTime - lastMediaTime) < 0.0005) {
        if (video.paused || video.ended) {
          done();
          return;
        }
        video.requestVideoFrameCallback(onFrameCallback);
        return;
      }
      lastMediaTime = mediaTime;

      if (mediaTime >= segmentEnd) {
        video.pause();
        done();
        return;
      }

      if (isInCutRegion(mediaTime, cutRegions)) {
        video.requestVideoFrameCallback(onFrameCallback);
        return;
      }

      const adjustedTimeS = mediaTime - deletedBefore;

      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } catch {
        video.requestVideoFrameCallback(onFrameCallback);
        return;
      }

      const frame = new VideoFrame(canvas, {
        timestamp: Math.round(adjustedTimeS * 1_000_000),
      });

      try {
        onEncodeStart();
        encoder.encode(frame, { keyFrame: !keyframeForced });
        keyframeForced = true;
        frameCount++;
        onFrameCaptured(frameCount);
      } catch {
        onEncodeError();
      }

      frame.close();
      frameCount = 0;

      if (video.paused || video.ended) {
        done();
        return;
      }

      video.requestVideoFrameCallback(onFrameCallback);
    }

    video.currentTime = segmentStart;

    function onSeeked(): void {
      video.removeEventListener('seeked', onSeeked);
      video.requestVideoFrameCallback(onFrameCallback);
      video.play().catch((e) => {
        reject(new Error(`Video playback failed: ${e.message}`));
      });
    }

    video.addEventListener('seeked', onSeeked);
  });
}

async function processAudio(
  videoFile: File,
  cutRegions: CutRegion[],
  muxer: Muxer<ArrayBufferTarget>,
): Promise<{ ok: boolean; error?: string }> {
  const arrayBuffer = await videoFile.arrayBuffer();
  const audioContext = new AudioContext();
  let audioBuffer: AudioBuffer;

  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  } catch (e) {
    void audioContext.close();
    return { ok: false, error: `Audio decode failed: ${(e as Error).message}` };
  }

  const { sampleRate, numberOfChannels, length } = audioBuffer;
  const duration = length / sampleRate;

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numberOfChannels; ch++) {
    channels.push(new Float32Array(audioBuffer.getChannelData(ch)));
  }
  void audioContext.close();

  const snapped = snapRegions(cutRegions);
  const keepSegments = invertToKeepSegments(snapped, duration);
  if (keepSegments.length === 0) return { ok: true };

  const CHUNK_SECONDS = 1.0;
  const outputSampleRate = 48000;

  return new Promise<{ ok: boolean; error?: string }>((resolve) => {
    let pending = 0;
    let flushed = false;
    let encodeError: string | null = null;

    function checkDone(): void {
      if (pending === 0 && flushed) {
        audioEncoder.close();
        if (encodeError) {
          resolve({ ok: false, error: encodeError });
        } else {
          resolve({ ok: true });
        }
      }
    }

    const audioEncoder = new AudioEncoder({
      output: (chunk) => {
        muxer.addAudioChunk(chunk, undefined);
        pending--;
        checkDone();
      },
      error: (e) => {
        encodeError = e.message;
        pending = 0;
        flushed = true;
        checkDone();
      },
    });

    audioEncoder.configure({
      codec: 'opus',
      sampleRate: outputSampleRate,
      numberOfChannels: 1,
      bitrate: 128_000,
    });

    try {
      for (const segment of keepSegments) {
        const startSample = Math.floor(segment.start * sampleRate);
        const endSample = Math.min(Math.floor(segment.end * sampleRate), length);
        const totalInSegment = endSample - startSample;
        if (totalInSegment <= 0) continue;

        const chunkFrames = Math.floor(CHUNK_SECONDS * sampleRate);
        const adjustedStartS = segment.start - segment.deletedBefore;

        for (let offset = 0; offset < totalInSegment; offset += chunkFrames) {
          const frameCount = Math.min(chunkFrames, totalInSegment - offset);
          const sampleOffset = startSample + offset;
          const timeOffsetS = offset / sampleRate;
          const timestamp = Math.round((adjustedStartS + timeOffsetS) * 1_000_000);

          let monoChunk: Float32Array;
          if (numberOfChannels === 1) {
            monoChunk = channels[0].subarray(sampleOffset, sampleOffset + frameCount);
          } else {
            monoChunk = new Float32Array(frameCount);
            for (let i = 0; i < frameCount; i++) {
              let sum = 0;
              for (let ch = 0; ch < numberOfChannels; ch++) {
                sum += channels[ch][sampleOffset + i];
              }
              monoChunk[i] = sum / numberOfChannels;
            }
          }

          const audioData = new AudioData({
            format: 'f32-planar',
            sampleRate,
            numberOfFrames: frameCount,
            numberOfChannels: 1,
            timestamp,
            data: monoChunk as unknown as BufferSource,
          });

          pending++;
          audioEncoder.encode(audioData);
          audioData.close();
        }
      }
    } catch (e) {
      encodeError = (e as Error).message;
    }

    audioEncoder.flush().then(() => {
      flushed = true;
      checkDone();
    });
  });
}
