import type { AppState, TranscriptWord, CutRegion, ProjectState, TabId, UIState } from './types.ts';

type Listener = (state: AppState) => void;

const initialState: AppState = {
  project: null,
  transcript: [],
  cutRegions: [],
  ui: {
    activeTab: 'transcript',
    selectionStart: -1,
    selectionEnd: -1,
    isEditing: false,
    searchQuery: '',
  },
  isTranscribing: false,
  isExporting: false,
  activeModelId: 'Xenova/whisper-tiny.en',
  videoLoaded: false,
  videoDuration: 0,
};

class Store {
  private state: AppState = { ...initialState };
  private listeners: Set<Listener> = new Set();

  getState(): AppState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setState(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  setUI(partial: Partial<UIState>): void {
    this.state = {
      ...this.state,
      ui: { ...this.state.ui, ...partial },
    };
    this.notify();
  }

  setProject(project: ProjectState | null): void {
    this.state = {
      ...this.state,
      project,
      transcript: project?.transcript ?? [],
      cutRegions: project?.cutList ?? [],
      videoLoaded: !!project,
    };
    this.notify();
  }

  setTranscript(words: TranscriptWord[]): void {
    this.state = { ...this.state, transcript: words };
    if (this.state.project) {
      this.state.project.transcript = words;
      this.state.project.updatedAt = Date.now();
    }
    this.notify();
  }

  setCutRegions(regions: CutRegion[]): void {
    this.state = { ...this.state, cutRegions: regions };
    if (this.state.project) {
      this.state.project.cutList = regions;
      this.state.project.updatedAt = Date.now();
    }
    this.notify();
  }

  addCutRegion(region: CutRegion): void {
    const regions = [...this.state.cutRegions, region];
    this.setCutRegions(regions);
  }

  removeCutRegion(id: string): void {
    const regions = this.state.cutRegions.filter((r) => r.id !== id);
    this.setCutRegions(regions);
  }

  clearCutRegions(): void {
    this.setCutRegions([]);
  }

  setTab(tab: TabId): void {
    this.setUI({ activeTab: tab });
  }

  setSelection(start: number, end: number): void {
    this.setUI({ selectionStart: start, selectionEnd: end });
  }

  clearSelection(): void {
    this.setUI({ selectionStart: -1, selectionEnd: -1 });
  }

  setEditing(editing: boolean): void {
    this.setUI({ isEditing: editing });
  }

  setTranscribing(transcribing: boolean): void {
    this.state = { ...this.state, isTranscribing: transcribing };
    this.notify();
  }

  setExporting(exporting: boolean): void {
    this.state = { ...this.state, isExporting: exporting };
    this.notify();
  }

  setVideoDuration(duration: number): void {
    this.state = { ...this.state, videoDuration: duration };
    this.notify();
  }

  setActiveModel(modelId: string): void {
    this.state = { ...this.state, activeModelId: modelId };
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export const store = new Store();
