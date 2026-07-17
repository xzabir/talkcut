import type { CutRegion, ExportProgress, ExportFormat } from './types.ts';
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

export function isWebCodecsExportSupported(): boolean {
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

export function isExportSupported(): boolean {
  return isWebCodecsExportSupported();
}

export function getSupportedExportFormats(): ExportFormat[] {
  if (isWebCodecsExportSupported()) {
    return ['webm', 'mp4'];
  }
  return ['mp4'];
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

const STALL_TIMEOUT_MS = 20000;

export async function exportVideo(
  videoFile: File,
  cutRegions: CutRegion[],
  callbacks: ExportCallbacks,
  format: ExportFormat = 'webm',
): Promise<void> {
  if (format === 'webm') {
    if (!isWebCodecsExportSupported()) {
      callbacks.onError('WebM export requires Chrome or Edge (WebCodecs support). Try MP4 export instead.');
      return;
    }
    return exportWebM(videoFile, cutRegions, callbacks);
  }
  return exportMp4(videoFile, cutRegions, callbacks);
}

async function exportWebM(
  videoFile: File,
  cutRegions: CutRegion[],
  callbacks: ExportCallbacks,
): Promise<void> {
  let totalFrames = 0;
  let processedFrames = 0;
  let lastProgressTime = performance.now();

  const reportProgress = (partial: Omit<ExportProgress, 'totalFrames' | 'processedFrames'>): void => {
    lastProgressTime = performance.now();
    callbacks.onProgress({
      totalFrames,
      processedFrames,
      ...partial,
    });
  };

  let video: HTMLVideoElement | null = null;
  let blobUrl = '';
  let videoEncoder: VideoEncoder | null = null;
  let audioEncoder: AudioEncoder | null = null;

  const stallChecker = setInterval(() => {
    if (performance.now() - lastProgressTime > STALL_TIMEOUT_MS) {
      callbacks.onError('Export stalled - no progress for 20 seconds. The video format may not be supported.');
      try { (videoEncoder as VideoEncoder | null)?.close(); } catch { /* */ }
      try { (audioEncoder as AudioEncoder | null)?.close(); } catch { /* */ }
    }
  }, 5000);

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
    let firstVideoTimestamp: number | null = null;

    videoEncoder = new VideoEncoder({
      output: (chunk, meta) => {
        try {
          muxer.addVideoChunk(chunk, meta);
        } catch (e) {
          videoEncodeError = `Muxer error: ${(e as Error).message}`;
        }
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
        (adjustedTimeS) => {
          if (firstVideoTimestamp === null) {
            firstVideoTimestamp = adjustedTimeS;
          }
          return Math.round((adjustedTimeS - firstVideoTimestamp) * 1_000_000);
        },
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
      videoEncoder!.flush().then(() => {
        if (pendingVideoFrames === 0) resolve();
      });
    });

    if (videoEncodeError) throw new Error(`Video encoder: ${videoEncodeError}`);

    videoEncoder.close();
    videoEncoder = null;
    videoEncodeDone = null;

    reportProgress({
      status: 'encoding',
      progress: 0.80,
      message: 'Processing audio...',
    });

    const audioResult = await processAudio(videoFile, snapped, muxer, (audioProgress) => {
      reportProgress({
        status: 'encoding',
        progress: 0.80 + audioProgress * 0.15,
        message: `Processing audio... ${Math.round(audioProgress * 100)}%`,
      });
    });
    if (!audioResult.ok) {
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

    clearInterval(stallChecker);

    reportProgress({
      status: 'done',
      progress: 1,
      message: 'Export complete',
    });

    callbacks.onComplete(blob);
  } catch (e) {
    clearInterval(stallChecker);
    callbacks.onError((e as Error).message);
  } finally {
    if (videoEncoder) { try { (videoEncoder as VideoEncoder).close(); } catch { /* */ } }
    if (audioEncoder) { try { (audioEncoder as AudioEncoder).close(); } catch { /* */ } }
    if (video) {
      try { video.pause(); } catch { /* */ }
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
  getTimestamp: (adjustedTimeS: number) => number,
  onFrameCaptured: (count: number) => void,
): Promise<void> {
  const deletedBefore = segment.deletedBefore;
  const segmentStart = segment.start;
  const segmentEnd = segment.end;

  return new Promise<void>((resolve, reject) => {
    let lastMediaTime = -1;
    let resolved = false;
    let keyframeForced = !forceKeyframe;
    let lastFrameTime = performance.now();
    let stallTimer: ReturnType<typeof setInterval> | null = null;

    function done(): void {
      if (resolved) return;
      resolved = true;
      if (stallTimer) { clearInterval(stallTimer); stallTimer = null; }
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('pause', onPaused);
      resolve();
    }

    function onEnded(): void {
      if (resolved) return;
      if (video.currentTime < segmentEnd - 0.5) {
        video.currentTime = segmentStart;
        video.play().catch(() => { done(); });
      } else {
        done();
      }
    }

    function onPaused(): void {
      if (resolved) return;
      if (!video.ended) {
        video.play().catch(() => { done(); });
      }
    }

    stallTimer = setInterval(() => {
      if (resolved) { if (stallTimer) { clearInterval(stallTimer); stallTimer = null; } return; }
      if (performance.now() - lastFrameTime > 10000) {
        done();
      }
    }, 3000);

    function onFrameCallback(now: number, metadata: VideoFrameCallbackMetadata): void {
      void now;
      if (resolved) return;

      lastFrameTime = performance.now();
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
      const timestamp = getTimestamp(adjustedTimeS);

      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } catch {
        video.requestVideoFrameCallback(onFrameCallback);
        return;
      }

      const frame = new VideoFrame(canvas, { timestamp });

      try {
        onEncodeStart();
        encoder.encode(frame, { keyFrame: !keyframeForced });
        keyframeForced = true;
        onFrameCaptured(1);
      } catch {
        onEncodeError();
      }

      frame.close();

      if (video.paused || video.ended) {
        done();
        return;
      }

      video.requestVideoFrameCallback(onFrameCallback);
    }

    video.currentTime = segmentStart;

    function onSeeked(): void {
      video.removeEventListener('seeked', onSeeked);
      video.addEventListener('ended', onEnded);
      video.addEventListener('pause', onPaused);
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
  onProgress?: (progress: number) => void,
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

  const { sampleRate: inputSampleRate, numberOfChannels, length } = audioBuffer;
  const duration = length / inputSampleRate;

  const outputSampleRate = 48000;

  let channels: Float32Array[];
  let sampleRate: number;

  if (outputSampleRate !== inputSampleRate) {
    void audioContext.close();
    const offlineCtx = new OfflineAudioContext(1, Math.ceil(duration * outputSampleRate), outputSampleRate);
    const monoBuffer = offlineCtx.createBuffer(1, length, inputSampleRate);
    const monoData = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      let sum = 0;
      for (let ch = 0; ch < numberOfChannels; ch++) {
        sum += audioBuffer.getChannelData(ch)[i];
      }
      monoData[i] = sum / numberOfChannels;
    }
    monoBuffer.copyToChannel(monoData, 0);
    const source = offlineCtx.createBufferSource();
    source.buffer = monoBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);
    const rendered = await offlineCtx.startRendering();
    channels = [new Float32Array(rendered.getChannelData(0))];
    sampleRate = outputSampleRate;
  } else {
    channels = [];
    for (let ch = 0; ch < numberOfChannels; ch++) {
      channels.push(new Float32Array(audioBuffer.getChannelData(ch)));
    }
    sampleRate = inputSampleRate;
    void audioContext.close();
  }

  const snapped = snapRegions(cutRegions);
  const keepSegments = invertToKeepSegments(snapped, duration);
  if (keepSegments.length === 0) return { ok: true };

  const CHUNK_SECONDS = 1.0;
  let firstAudioTimestamp: number | null = null;

  let totalSamples = 0;
  let processedSamples = 0;
  for (const seg of keepSegments) {
    totalSamples += Math.min(Math.floor(seg.end * sampleRate), length) - Math.floor(seg.start * sampleRate);
  }

  return new Promise<{ ok: boolean; error?: string }>((resolve) => {
    let encodeError: string | null = null;
    let resolved = false;

    function finish(result: { ok: boolean; error?: string }): void {
      if (resolved) return;
      resolved = true;
      try { audioEncoder.close(); } catch { /* */ }
      resolve(result);
    }

    const audioEncoder = new AudioEncoder({
      output: (chunk) => {
        try {
          muxer.addAudioChunk(chunk, undefined);
        } catch (e) {
          encodeError = `Audio muxer error: ${(e as Error).message}`;
        }
      },
      error: (e) => {
        encodeError = e.message;
        finish({ ok: false, error: encodeError });
      },
    });

    audioEncoder.configure({
      codec: 'opus',
      sampleRate,
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
          let timestamp = Math.round((adjustedStartS + timeOffsetS) * 1_000_000);

          if (firstAudioTimestamp === null) {
            firstAudioTimestamp = timestamp;
          }
          timestamp -= firstAudioTimestamp;

          let monoChunk: Float32Array;
          if (channels.length === 1) {
            monoChunk = channels[0].subarray(sampleOffset, sampleOffset + frameCount);
          } else {
            monoChunk = new Float32Array(frameCount);
            for (let i = 0; i < frameCount; i++) {
              let sum = 0;
              for (let ch = 0; ch < channels.length; ch++) {
                sum += channels[ch][sampleOffset + i];
              }
              monoChunk[i] = sum / channels.length;
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

          audioEncoder.encode(audioData);
          audioData.close();

          processedSamples += frameCount;
          if (onProgress && totalSamples > 0) {
            onProgress(Math.min(0.99, processedSamples / totalSamples));
          }
        }
      }
    } catch (e) {
      encodeError = (e as Error).message;
    }

    if (encodeError) {
      finish({ ok: false, error: encodeError });
      return;
    }

    const flushTimeout = setTimeout(() => {
      finish({ ok: false, error: 'Audio encoder timed out' });
    }, 30000);

    audioEncoder.flush().then(() => {
      clearTimeout(flushTimeout);
      onProgress?.(1);
      if (encodeError) {
        finish({ ok: false, error: encodeError });
      } else {
        finish({ ok: true });
      }
    }).catch((e) => {
      clearTimeout(flushTimeout);
      finish({ ok: false, error: `Audio flush failed: ${e.message}` });
    });
  });
}

async function exportMp4(
  videoFile: File,
  cutRegions: CutRegion[],
  callbacks: ExportCallbacks,
): Promise<void> {
  callbacks.onProgress({
    status: 'decoding',
    progress: 0,
    message: 'Loading FFmpeg...',
    totalFrames: 0,
    processedFrames: 0,
  });

  try {
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

    const ffmpeg = new FFmpeg();
    const coreURL = await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js', 'text/javascript');
    const wasmURL = await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm', 'application/wasm');

    await ffmpeg.load({ coreURL, wasmURL });

    callbacks.onProgress({
      status: 'decoding',
      progress: 0.1,
      message: 'Loading video...',
      totalFrames: 0,
      processedFrames: 0,
    });

    const inputName = 'input.' + (videoFile.name.split('.').pop() || 'mp4');
    const outputName = 'output.mp4';

    await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

    if (cutRegions.length === 0) {
      callbacks.onProgress({
        status: 'encoding',
        progress: 0.3,
        message: 'Encoding MP4 (no cuts)...',
        totalFrames: 0,
        processedFrames: 0,
      });

      await ffmpeg.exec(['-i', inputName, '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', outputName]);
    } else {
      const snapped = snapRegions(cutRegions);
      const keepSegments = invertToKeepSegments(snapped, 999999);

      const parts: string[] = [];
      let partIdx = 0;

      callbacks.onProgress({
        status: 'encoding',
        progress: 0.2,
        message: `Extracting ${keepSegments.length} segments...`,
        totalFrames: 0,
        processedFrames: 0,
      });

      for (const seg of keepSegments) {
        const partName = `part${partIdx}.mp4`;
        const dur = seg.end - seg.start;
        await ffmpeg.exec([
          '-i', inputName,
          '-ss', seg.start.toFixed(3),
          '-t', dur.toFixed(3),
          '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
          '-c:a', 'aac', '-b:a', '128k',
          partName,
        ]);
        parts.push(`file '${partName}'`);
        partIdx++;

        callbacks.onProgress({
          status: 'encoding',
          progress: 0.2 + (0.5 * partIdx / keepSegments.length),
          message: `Extracted segment ${partIdx}/${keepSegments.length}...`,
          totalFrames: 0,
          processedFrames: 0,
        });
      }

      const concatList = parts.join('\n');
      await ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatList));

      callbacks.onProgress({
        status: 'muxing',
        progress: 0.8,
        message: 'Concatenating segments...',
        totalFrames: 0,
        processedFrames: 0,
      });

      await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-c', 'copy', outputName]);
    }

    callbacks.onProgress({
      status: 'muxing',
      progress: 0.95,
      message: 'Finalizing MP4...',
      totalFrames: 0,
      processedFrames: 0,
    });

    const data = await ffmpeg.readFile(outputName);
    const blob = new Blob([data as unknown as BlobPart], { type: 'video/mp4' });

    callbacks.onProgress({
      status: 'done',
      progress: 1,
      message: 'Export complete',
      totalFrames: 0,
      processedFrames: 0,
    });

    callbacks.onComplete(blob);
  } catch (e) {
    callbacks.onError(`MP4 export failed: ${(e as Error).message}`);
  }
}
