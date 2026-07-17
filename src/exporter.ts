import type { CutRegion, ExportProgress } from './types.ts';

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

// ============================================================================
// Feature Detection
// ============================================================================

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

// ============================================================================
// EBML / WebM Helpers
// ============================================================================

function writeVINT(value: number): Uint8Array {
  let n = 1;
  if (value > 0x7f) n = 2;
  if (value > 0x3fff) n = 3;
  if (value > 0x1fffff) n = 4;
  if (value > 0x0fffffff) n = 5;
  if (value > 0x07ffffffff) n = 6;
  if (value > 0x03ffffffffff) n = 7;
  if (value > 0x01ffffffffffff) n = 8;

  const result = new Uint8Array(n);
  const marker = 0x80 >> (n - 1);
  const firstByteMask = (1 << (8 - n)) - 1;

  result[0] = marker | ((value >>> ((n - 1) * 8)) & firstByteMask);
  for (let i = 1; i < n; i++) {
    result[i] = (value >>> ((n - 1 - i) * 8)) & 0xff;
  }

  return result;
}

function writeUnsignedInt(value: number): Uint8Array {
  if (value === 0) return new Uint8Array([0x00]);
  let bytes = 0;
  let v = value;
  while (v > 0) {
    bytes++;
    v >>>= 8;
  }
  const result = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i++) {
    result[bytes - 1 - i] = (value >>> (i * 8)) & 0xff;
  }
  return result;
}

function writeFloat64(value: number): Uint8Array {
  const buf = new ArrayBuffer(8);
  new DataView(buf).setFloat64(0, value, false);
  return new Uint8Array(buf);
}

function writeElement(id: number[], data: Uint8Array): Uint8Array {
  const size = writeVINT(data.length);
  const result = new Uint8Array(id.length + size.length + data.length);
  result.set(id, 0);
  result.set(size, id.length);
  result.set(data, id.length + size.length);
  return result;
}

function writeStringElement(id: number[], str: string): Uint8Array {
  const encoder = new TextEncoder();
  return writeElement(id, encoder.encode(str));
}

function writeUnsignedIntElement(id: number[], value: number): Uint8Array {
  return writeElement(id, writeUnsignedInt(value));
}

function writeFloatElement(id: number[], value: number): Uint8Array {
  return writeElement(id, writeFloat64(value));
}

function concatArrays(arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    result.set(a, offset);
    offset += a.length;
  }
  return result;
}

// ============================================================================
// WebM Muxer
// ============================================================================

class WebMMuxer {
  private videoTrackNum = 1;
  private audioTrackNum = 2;

  private videoChunks: { data: Uint8Array; timecode: number; keyframe: boolean }[] = [];
  private audioChunks: { data: Uint8Array; timecode: number }[] = [];

  private width = 640;
  private height = 480;
  private sampleRate = 48000;
  private channels = 1;

  setVideoParams(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  setAudioParams(sampleRate: number, channels: number): void {
    this.sampleRate = sampleRate;
    this.channels = channels;
  }

  addVideoChunk(data: Uint8Array, timestampMs: number, isKeyframe: boolean): void {
    this.videoChunks.push({
      data,
      timecode: Math.round(timestampMs),
      keyframe: isKeyframe,
    });
  }

  addAudioChunk(data: Uint8Array, timestampMs: number): void {
    this.audioChunks.push({
      data,
      timecode: Math.round(timestampMs),
    });
  }

  finalize(): Uint8Array {
    const segmentContent = this.buildSegmentContent();
    const ebmlHeader = this.buildEBMLHeader();

    const segmentId = [0x18, 0x53, 0x80, 0x67];
    const segmentSize = writeVINT(segmentContent.length);

    return concatArrays([
      ebmlHeader,
      new Uint8Array(segmentId),
      segmentSize,
      segmentContent,
    ]);
  }

  private buildEBMLHeader(): Uint8Array {
    return concatArrays([
      new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]),
      writeVINT(0x2b),
      concatArrays([
        writeUnsignedIntElement([0x42, 0x86], 1),
        writeUnsignedIntElement([0x42, 0xf7], 1),
        writeUnsignedIntElement([0x42, 0xf2], 4),
        writeUnsignedIntElement([0x42, 0xf3], 8),
        writeStringElement([0x42, 0x82], 'webm'),
        writeUnsignedIntElement([0x42, 0x87], 4),
        writeUnsignedIntElement([0x42, 0x85], 2),
      ]),
    ]);
  }

  private buildInfo(durationMs: number): Uint8Array {
    const timecodeScale = writeUnsignedInt(1_000_000);
    return writeElement(
      [0x15, 0x49, 0xa9, 0x66],
      concatArrays([
        writeElement([0x2a, 0xd7, 0xb1], timecodeScale),
        writeStringElement([0x4d, 0x80], 'TalkCut'),
        writeStringElement([0x57, 0x41], 'TalkCut'),
        writeFloatElement([0x44, 0x89], durationMs),
      ]),
    );
  }

  private buildTracks(): Uint8Array {
    const videoTrack = this.buildVideoTrackEntry();
    const audioTrack = this.buildAudioTrackEntry();
    return writeElement([0x16, 0x54, 0xae, 0x6b], concatArrays([videoTrack, audioTrack]));
  }

  private buildVideoTrackEntry(): Uint8Array {
    const trackEntry = concatArrays([
      writeUnsignedIntElement([0xd7], this.videoTrackNum),
      writeUnsignedIntElement([0x73, 0xc5], this.videoTrackNum),
      writeUnsignedIntElement([0x83], 1),
      writeStringElement([0x86], 'V_VP9'),
      writeElement(
        [0xe0],
        concatArrays([
          writeUnsignedIntElement([0xb0], this.width),
          writeUnsignedIntElement([0xba], this.height),
        ]),
      ),
    ]);
    return writeElement([0xae], trackEntry);
  }

  private buildAudioTrackEntry(): Uint8Array {
    const audioElem = writeElement(
      [0xe1],
      concatArrays([
        writeFloatElement([0xb5], this.sampleRate),
        writeUnsignedIntElement([0x9f], this.channels),
      ]),
    );
    const trackEntry = concatArrays([
      writeUnsignedIntElement([0xd7], this.audioTrackNum),
      writeUnsignedIntElement([0x73, 0xc5], this.audioTrackNum),
      writeUnsignedIntElement([0x83], 2),
      writeStringElement([0x86], 'A_OPUS'),
      audioElem,
    ]);
    return writeElement([0xae], trackEntry);
  }

  private buildSegmentContent(): Uint8Array {
    const hasVideo = this.videoChunks.length > 0;
    const hasAudio = this.audioChunks.length > 0;

    const allChunks = [
      ...this.videoChunks.map((c) => ({ ...c, track: this.videoTrackNum })),
      ...this.audioChunks.map((c) => ({ ...c, track: this.audioTrackNum, keyframe: true })),
    ].sort((a, b) => a.timecode - b.timecode);

    let maxTime = 0;
    if (hasVideo) maxTime = Math.max(maxTime, ...this.videoChunks.map((c) => c.timecode));
    if (hasAudio) maxTime = Math.max(maxTime, ...this.audioChunks.map((c) => c.timecode));
    const durationMs = maxTime;

    const info = this.buildInfo(durationMs);

    let tracks: Uint8Array;
    if (hasVideo && hasAudio) {
      tracks = this.buildTracks();
    } else if (hasVideo) {
      tracks = writeElement([0x16, 0x54, 0xae, 0x6b], this.buildVideoTrackEntry());
    } else {
      tracks = writeElement([0x16, 0x54, 0xae, 0x6b], this.buildAudioTrackEntry());
    }

    const clusters = this.buildClusters(allChunks);

    return concatArrays([info, tracks, ...clusters]);
  }

  private buildClusters(
    chunks: { data: Uint8Array; track: number; timecode: number; keyframe: boolean }[],
  ): Uint8Array[] {
    const results: Uint8Array[] = [];
    const CLUSTER_MAX_MS = 5000;

    let i = 0;
    while (i < chunks.length) {
      const clusterTimecode = chunks[i].timecode;
      const blocks: Uint8Array[] = [];

      while (i < chunks.length && chunks[i].timecode - clusterTimecode < CLUSTER_MAX_MS) {
        const c = chunks[i];
        const relativeTimecode = c.timecode - clusterTimecode;

        const flags = c.keyframe ? 0x80 : 0x00;
        const blockHeader = new Uint8Array(4);
        blockHeader[0] = c.track & 0xff;
        blockHeader[1] = (relativeTimecode >> 8) & 0xff;
        blockHeader[2] = relativeTimecode & 0xff;
        blockHeader[3] = flags;

        const blockData = concatArrays([blockHeader, c.data]);
        blocks.push(writeElement([0xa3], blockData));
        i++;
      }

      const timecodeBytes = writeUnsignedInt(clusterTimecode);
      const clusterContent = concatArrays([
        writeElement([0xe7], timecodeBytes),
        ...blocks,
      ]);
      results.push(writeElement([0x1f, 0x43, 0xb6, 0x75], clusterContent));
    }

    return results;
  }
}

// ============================================================================
// Region Snapping & Inversion
// ============================================================================

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

// ============================================================================
// Main Export Pipeline
// ============================================================================

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
    // --- Load video ---
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

    // Canvas for frame capture
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    // Muxer
    const muxer = new WebMMuxer();
    muxer.setVideoParams(width, height);

    // --- Video Encoder ---
    reportProgress({
      status: 'decoding',
      progress: 0,
      message: 'Setting up video encoder...',
    });

    let videoEncodeError: string | null = null;
    let pendingVideoFrames = 0;
    let videoEncodeDone: (() => void) | null = null;

    const videoEncoder = new VideoEncoder({
      output: (chunk) => {
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        muxer.addVideoChunk(data, chunk.timestamp / 1000, chunk.type === 'key');
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

    // --- Process video keep segments ---
    for (let si = 0; si < keepSegments.length; si++) {
      if (videoEncodeError) throw new Error(`Video encoder: ${videoEncodeError}`);

      const segment = keepSegments[si];

      await processKeepSegment(
        video,
        canvas,
        ctx,
        videoEncoder,
        segment,
        snapped,
        () => {
          pendingVideoFrames++;
        },
        () => {
          pendingVideoFrames--;
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

    // Flush video encoder
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

    // --- Audio Pipeline ---
    reportProgress({
      status: 'encoding',
      progress: totalFrames > 0 ? Math.min(1, processedFrames / totalFrames) : 0,
      message: 'Processing audio...',
    });

    await processAudio(videoFile, snapped, muxer);

    // --- Mux ---
    reportProgress({
      status: 'muxing',
      progress: totalFrames > 0 ? Math.min(1, processedFrames / totalFrames) : 0,
      message: 'Muxing output file...',
    });

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        try {
          const webmData = muxer.finalize();
          const blob = new Blob([webmData as unknown as BlobPart], { type: 'video/webm' });

          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'talkcut-export.webm';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          reportProgress({
            status: 'done',
            progress: 1,
            message: 'Export complete',
          });

          callbacks.onComplete(blob);
          resolve();
        } catch (e) {
          callbacks.onError(`Muxing failed: ${(e as Error).message}`);
          resolve();
        }
      }, 50);
    });
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

// ============================================================================
// Keep Segment Video Processing
// ============================================================================

async function processKeepSegment(
  video: HTMLVideoElement,
  canvas: OffscreenCanvas,
  ctx: OffscreenCanvasRenderingContext2D,
  encoder: VideoEncoder,
  segment: KeepSegment,
  cutRegions: CutRegion[],
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

    function done(): void {
      if (resolved) return;
      resolved = true;
      resolve();
    }

    function onFrameCallback(now: number, metadata: VideoFrameCallbackMetadata): void {
      void now;
      if (resolved) return;

      const mediaTime = metadata.mediaTime;

      // Detect duplicate / stale frame
      if (Math.abs(mediaTime - lastMediaTime) < 0.0005) {
        if (video.paused || video.ended) {
          done();
          return;
        }
        video.requestVideoFrameCallback(onFrameCallback);
        return;
      }
      lastMediaTime = mediaTime;

      // Check if we've passed the segment end
      if (mediaTime >= segmentEnd) {
        video.pause();
        done();
        return;
      }

      // Check if frame is in a cut region
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
        encoder.encode(frame, { keyFrame: false });
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

// ============================================================================
// Audio Pipeline
// ============================================================================

async function processAudio(
  videoFile: File,
  cutRegions: CutRegion[],
  muxer: WebMMuxer,
): Promise<void> {
  const arrayBuffer = await videoFile.arrayBuffer();
  const audioContext = new AudioContext();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  } catch {
    void audioContext.close();
    return;
  }
  const { sampleRate, numberOfChannels, length } = audioBuffer;

  const duration = length / sampleRate;

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numberOfChannels; ch++) {
    channels.push(new Float32Array(audioBuffer.getChannelData(ch)));
  }
  void audioContext.close();

  muxer.setAudioParams(sampleRate, numberOfChannels);

  const snapped = snapRegions(cutRegions);
  const keepSegments = invertToKeepSegments(snapped, duration);
  if (keepSegments.length === 0) return;

  const CHUNK_SECONDS = 1.0;

  return new Promise<void>((resolve, reject) => {
    let pending = 0;
    let flushed = false;
    let encodeError: string | null = null;

    function checkDone(): void {
      if (pending === 0 && flushed) {
        audioEncoder.close();
        resolve();
      }
    }

    const audioEncoder = new AudioEncoder({
      output: (chunk) => {
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        muxer.addAudioChunk(data, chunk.timestamp / 1000);
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
      sampleRate,
      numberOfChannels,
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

          const planarData = new Float32Array(frameCount * numberOfChannels);
          for (let ch = 0; ch < numberOfChannels; ch++) {
            planarData.set(
              channels[ch].subarray(sampleOffset, sampleOffset + frameCount),
              ch * frameCount,
            );
          }

          const audioData = new AudioData({
            format: 'f32-planar',
            sampleRate,
            numberOfFrames: frameCount,
            numberOfChannels,
            timestamp,
            data: planarData,
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
      if (encodeError) {
        reject(new Error(`Audio encoder: ${encodeError}`));
      } else {
        checkDone();
      }
    });
  });
}
