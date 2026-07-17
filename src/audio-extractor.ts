const TARGET_SAMPLE_RATE = 16000;

export async function extractAudioFromVideo(
  videoFile: File | Blob,
  onProgress?: (progress: number) => void
): Promise<{ audioData: Float32Array; sampleRate: number; duration: number }> {
  onProgress?.(0);

  const arrayBuffer = await videoFile.arrayBuffer();
  onProgress?.(0.1);

  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  onProgress?.(0.4);

  const { numberOfChannels, length, sampleRate } = audioBuffer;

  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numberOfChannels; ch++) {
    channelData.push(audioBuffer.getChannelData(ch));
  }

  let monoData: Float32Array;
  if (numberOfChannels === 1) {
    monoData = new Float32Array(channelData[0]);
  } else {
    monoData = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      let sum = 0;
      for (let ch = 0; ch < numberOfChannels; ch++) {
        sum += channelData[ch][i];
      }
      monoData[i] = sum / numberOfChannels;
    }
  }
  onProgress?.(0.6);

  void audioContext.close();

  const duration = length / sampleRate;

  if (sampleRate === TARGET_SAMPLE_RATE) {
    onProgress?.(1);
    return { audioData: monoData, sampleRate: TARGET_SAMPLE_RATE, duration };
  }

  const audioData = await resampleOffline(monoData, sampleRate, onProgress);
  onProgress?.(1);

  return {
    audioData,
    sampleRate: TARGET_SAMPLE_RATE,
    duration,
  };
}

export async function extractAudioFromVideoElement(
  video: HTMLVideoElement
): Promise<{ audioData: Float32Array; sampleRate: number; duration: number }> {
  const response = await fetch(video.src);
  const blob = await response.blob();
  return extractAudioFromVideo(blob);
}

async function resampleOffline(
  input: Float32Array,
  inputSampleRate: number,
  onProgress?: (progress: number) => void
): Promise<Float32Array> {
  const duration = input.length / inputSampleRate;
  const offlineCtx = new OfflineAudioContext(1, Math.ceil(duration * TARGET_SAMPLE_RATE), TARGET_SAMPLE_RATE);

  const audioBuffer = offlineCtx.createBuffer(1, input.length, inputSampleRate);
  const copy = new Float32Array(input.length);
  copy.set(input);
  audioBuffer.copyToChannel(copy, 0);

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  onProgress?.(0.7);

  const rendered = await offlineCtx.startRendering();
  onProgress?.(0.95);

  return rendered.getChannelData(0).slice();
}
