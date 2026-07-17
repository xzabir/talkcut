export interface ProjectState {
  id: string;
  name: string;
  videoFileName: string;
  transcript: TranscriptWord[];
  cutList: CutRegion[];
  createdAt: number;
  updatedAt: number;
}

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface CutRegion {
  id: string;
  start: number;
  end: number;
  type: 'delete' | 'silence' | 'filler';
  label?: string;
}

export interface TranscriptionProgress {
  status: 'idle' | 'loading-model' | 'extracting-audio' | 'transcribing' | 'done' | 'error';
  progress: number;
  message: string;
}

export interface ExportProgress {
  status: 'idle' | 'decoding' | 'encoding' | 'muxing' | 'done' | 'error';
  progress: number;
  message: string;
  totalFrames: number;
  processedFrames: number;
}
