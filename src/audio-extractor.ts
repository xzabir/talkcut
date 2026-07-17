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
  onProgress?.(0.5);

  const { numberOfChannels, length, sampleRate } = audioBuffer;

  let monoData: Float32Array;
  if (numberOfChannels === 1) {
    monoData = new Float32Array(audioBuffer.getChannelData(0));
  } else {
    monoData = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      let sum = 0;
      for (let ch = 0; ch < numberOfChannels; ch++) {
        sum += audioBuffer.getChannelData(ch)[i];
      }
      monoData[i] = sum / numberOfChannels;
    }
  }
  onProgress?.(0.6);

  const duration = length / sampleRate;
  const targetLength = Math.ceil(duration * TARGET_SAMPLE_RATE);

  const audioData = resample(monoData, sampleRate, TARGET_SAMPLE_RATE, targetLength, onProgress);

  void audioContext.close();

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

function resample(
  input: Float32Array,
  inputSampleRate: number,
  outputSampleRate: number,
  outputLength: number,
  onProgress?: (progress: number) => void,
): Float32Array {
  const output = new Float32Array(outputLength);
  const ratio = inputSampleRate / outputSampleRate;

  for (let i = 0; i < outputLength; i++) {
    const position = i * ratio;
    const index = Math.floor(position);
    const fraction = position - index;

    if (index + 1 < input.length) {
      output[i] = input[index] + fraction * (input[index + 1] - input[index]);
    } else if (index < input.length) {
      output[i] = input[index];
    }

    if (onProgress && i % 10000 === 0) {
      onProgress(0.6 + 0.4 * (i / outputLength));
    }
  }

  return output;
}
