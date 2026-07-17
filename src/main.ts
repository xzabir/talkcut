import './style.css';
import './sw-register.ts';
import { VideoPlayer } from './player.ts';
import { WaveformRenderer } from './waveform.ts';
import { saveVideo, getVideoUrl, loadProject, saveProject, videoExists, requestPersistence, isPersisted, loadVideo } from './opfs.ts';
import { TranscribeButton } from './transcribe-button.ts';
import { TranscriptPanel } from './transcript-panel.ts';
import { CutManager } from './cut-manager.ts';
import { CutsPanel } from './cuts-panel.ts';
import { ExportPanel } from './export-panel.ts';
import { isWebCodecsExportSupported } from './exporter.ts';
import { KeyboardShortcuts } from './keyboard-shortcuts.ts';
import { ModelManager } from './model-manager.ts';
import { store } from './store.ts';
import { toast } from './toast.ts';
import type { ProjectState } from './types.ts';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <header class="app-header">
    <div class="app-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
        <path d="M3 7l9-4 9 4-9 4-9-4z"/>
        <path d="M3 12l9 4 9-4"/>
        <path d="M3 17l9 4 9-4"/>
      </svg>
      <span class="app-title">TalkCut</span>
    </div>
    <span class="app-project-name" id="project-name"></span>
    <div class="header-actions">
      <button id="save-btn" class="btn btn-ghost btn-sm" disabled title="Save project">Save</button>
      <button id="export-btn" class="btn btn-primary btn-sm" disabled title="Export video">Export</button>
    </div>
  </header>

  <main class="app-main">
    <div class="player-section">
      <div id="player-container" class="player-container"></div>
      <div id="waveform-container" class="waveform-container"></div>
    </div>

    <div class="sidebar" id="sidebar">
      <div class="sidebar-resize-handle" id="resize-handle"></div>
      <div class="sidebar-tabs">
        <button class="tab active" data-tab="transcript">Transcript</button>
        <button class="tab" data-tab="cuts">Cuts <span class="tab-badge" id="cuts-badge" style="display:none;">0</span></button>
        <button class="tab" data-tab="export">Export</button>
        <button class="tab" data-tab="models">Models</button>
      </div>
      <div class="sidebar-content">
        <div id="transcript-panel" class="panel active"></div>
        <div id="cuts-panel" class="panel"></div>
        <div id="export-panel" class="panel"></div>
        <div id="models-panel" class="panel"></div>
      </div>
    </div>
  </main>

  <footer class="app-footer">
    <div class="footer-left">
      <span>Everything runs locally. Nothing leaves your browser.</span>
    </div>
    <div class="footer-right">
      <span class="footer-stat" id="time-stat" style="display:none;">
        <span class="footer-stat-label">Time:</span>
        <span class="footer-stat-value" id="time-value">0:00 / 0:00</span>
      </span>
      <span class="footer-stat" id="word-stat" style="display:none;">
        <span class="footer-stat-label">Words:</span>
        <span class="footer-stat-value" id="word-value">0</span>
      </span>
      <span class="footer-stat" id="cut-stat" style="display:none;">
        <span class="footer-stat-label">Cuts:</span>
        <span class="footer-stat-value" id="cut-value">0</span>
      </span>
      <span class="opfs-status" id="opfs-status">OPFS: checking...</span>
    </div>
  </footer>
`;

const playerContainer = document.getElementById('player-container')!;
const waveformContainer = document.getElementById('waveform-container')!;
const transcriptPanelEl = document.getElementById('transcript-panel')!;

const player = new VideoPlayer(playerContainer);
const waveform = new WaveformRenderer(waveformContainer);
let currentProject: ProjectState | null = null;
const cutManager = new CutManager();
const shortcuts = new KeyboardShortcuts();
let cutsPanel: CutsPanel | null = null;
let exportPanel: ExportPanel | null = null;
let modelManager: ModelManager | null = null;

const videoElement = player.getVideoElement();
videoElement.addEventListener('timeupdate', () => {
  const time = videoElement.currentTime;

  if (!videoElement.paused) {
    const regions = cutManager.getRegions();
    for (const region of regions) {
      if (time >= region.start && time < region.end - 0.05) {
        player.seekTo(region.end);
        return;
      }
    }
  }

  const currentTime = videoElement.currentTime;
  const duration = videoElement.duration;
  waveform.setCurrentTime(currentTime);
  if (duration) {
    waveform.setDuration(duration);
  }

  updateTimeDisplay(currentTime, duration);
});

function updateTimeDisplay(current: number, duration: number): void {
  const timeStat = document.getElementById('time-stat');
  const timeValue = document.getElementById('time-value');
  if (timeStat && timeValue) {
    timeStat.style.display = duration > 0 ? 'inline-flex' : 'none';
    timeValue.textContent = `${formatTimeShort(current)} / ${formatTimeShort(duration)}`;
  }
}

function formatTimeShort(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

waveform.onSeekTo((time: number) => {
  player.seekTo(time);
});

cutManager.onChange((regions) => {
  waveform.setCutRegions(regions);
  if (currentProject) {
    cutManager.saveToProject(currentProject);
    saveProject(currentProject).catch(() => {});
  }

  const cutsBadge = document.getElementById('cuts-badge');
  if (cutsBadge) {
    cutsBadge.textContent = String(regions.length);
    cutsBadge.style.display = regions.length > 0 ? 'inline-flex' : 'none';
  }

  const cutStat = document.getElementById('cut-stat');
  const cutValue = document.getElementById('cut-value');
  if (cutStat && cutValue) {
    cutStat.style.display = regions.length > 0 ? 'inline-flex' : 'none';
    cutValue.textContent = String(regions.length);
  }

  exportPanel?.refreshVideoState();
});

let transcriptPanel: TranscriptPanel | null = null;
let transcribeButton: TranscribeButton | null = null;

function setupUI(): void {
  transcribeButton?.destroy();
  transcriptPanel?.destroy();
  transcriptPanelEl.innerHTML = '';
  transcriptPanelEl.style.display = 'flex';
  transcriptPanelEl.style.flexDirection = 'column';

  const transcriptContent = document.createElement('div');
  transcriptContent.style.cssText = 'flex:1;min-height:0;overflow:hidden;';
  transcriptPanelEl.appendChild(transcriptContent);

  transcriptPanel = new TranscriptPanel(transcriptContent);

  transcribeButton = new TranscribeButton(transcriptPanel);
  transcriptPanelEl.insertBefore(transcribeButton.getElement(), transcriptContent);

  transcriptPanel.mount(
    () => player.getVideoElement(),
    () => currentProject,
    () => { /* transcript saved */ },
    cutManager
  );

  transcribeButton.mount(
    () => player.getVideoElement(),
    () => currentProject,
    () => { /* transcript saved */ },
    () => modelManager?.getActiveModelId() ?? 'Xenova/whisper-base.en',
  );

  const cutsPanelContainer = document.getElementById('cuts-panel')!;
  cutsPanel?.destroy();
  cutsPanelContainer.innerHTML = '';
  cutsPanel = new CutsPanel(
    cutsPanelContainer,
    cutManager,
    () => player.getVideoElement(),
    () => transcriptPanel?.getWords() || [],
  );
  cutsPanel.mount();

  const exportPanelContainer = document.getElementById('export-panel')!;
  exportPanel?.destroy();
  exportPanelContainer.innerHTML = '';
  exportPanel = new ExportPanel(
    exportPanelContainer,
    async () => {
      if (!currentProject) return null;
      return loadVideo(currentProject.videoFileName);
    },
    () => cutManager.getRegions(),
  );
  exportPanel.mount();

  const modelsPanelEl = document.getElementById('models-panel')!;
  modelManager?.destroy();
  modelsPanelEl.innerHTML = '';
  modelManager = new ModelManager(modelsPanelEl);
  modelManager.mount();

  const exportBtn = document.getElementById('export-btn') as HTMLButtonElement;
  if (!isWebCodecsExportSupported()) {
    exportBtn.title = 'Export available (MP4 via FFmpeg.wasm)';
  }

  const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
  saveBtn.disabled = false;

  updateWordCountDisplay(0);
}

player.onLoad(async (file: File) => {
  try {
    const fileName = await saveVideo(file);
    currentProject = {
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^.]+$/, ''),
      videoFileName: fileName,
      transcript: [],
      cutList: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveProject(currentProject);
    cutManager.loadFromProject(currentProject);
    waveform.loadFromVideo(videoElement);
    setupUI();

    const projectNameEl = document.getElementById('project-name');
    if (projectNameEl) {
      projectNameEl.textContent = currentProject.name;
    }

    const persisted = await requestPersistence();
    updateOpfsStatus(persisted);

    store.setProject(currentProject);
    store.setVideoDuration(videoElement.duration || 0);

    toast.success('Video loaded successfully');
  } catch (err) {
    console.error('Failed to save video:', err);
    toast.error('Failed to load video: ' + (err instanceof Error ? err.message : String(err)));
  }
});

async function restoreProject(): Promise<void> {
  const project = await loadProject();
  if (project && project.videoFileName) {
    const exists = await videoExists(project.videoFileName);
    if (exists) {
      currentProject = project;
      cutManager.loadFromProject(project);
      const url = await getVideoUrl(project.videoFileName);
      player.loadBlobUrl(url);
      waveform.loadFromVideo(videoElement);
      setupUI();

      const projectNameEl = document.getElementById('project-name');
      if (projectNameEl) {
        projectNameEl.textContent = project.name;
      }

      store.setProject(project);

      if (project.transcript.length > 0) {
        updateWordCountDisplay(project.transcript.length);
      }

      console.log('Project restored:', project.id);
    }
  }
}

function updateWordCountDisplay(count: number): void {
  const wordStat = document.getElementById('word-stat');
  const wordValue = document.getElementById('word-value');
  if (wordStat && wordValue) {
    wordStat.style.display = count > 0 ? 'inline-flex' : 'none';
    wordValue.textContent = String(count);
  }
}

document.getElementById('save-btn')?.addEventListener('click', async () => {
  if (currentProject) {
    cutManager.saveToProject(currentProject);
    await saveProject(currentProject);
    toast.success('Project saved');
  }
});

document.getElementById('export-btn')?.addEventListener('click', () => {
  switchToTab('export');
  exportPanel?.refreshVideoState();
});

function switchToTab(tabName: string): void {
  document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
  const tab = document.querySelector<HTMLElement>(`[data-tab="${tabName}"]`);
  if (tab) tab.classList.add('active');
  const panel = document.getElementById(`${tabName}-panel`);
  if (panel) panel.classList.add('active');

  store.setTab(tabName as any);

  if (tabName === 'export') {
    exportPanel?.refreshVideoState();
  }
  if (tabName === 'cuts') {
    updateWordCountDisplay(transcriptPanel?.getWords().length || 0);
  }
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const targetTab = (tab as HTMLElement).dataset.tab;
    if (targetTab) switchToTab(targetTab);
  });
});

function updateOpfsStatus(persisted: boolean): void {
  const status = document.getElementById('opfs-status');
  if (status) {
    status.textContent = `OPFS: ${persisted ? 'persisted' : 'best-effort'}`;
    status.className = `opfs-status ${persisted ? 'persisted' : ''}`;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
  if ((e.target as HTMLElement)?.isContentEditable) return;

  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    if (e.shiftKey) {
      cutManager.redo();
    } else {
      cutManager.undo();
    }
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault();
    cutManager.redo();
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    if (currentProject) {
      cutManager.saveToProject(currentProject);
      saveProject(currentProject);
      toast.success('Project saved');
    }
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
    e.preventDefault();
    switchToTab('export');
    return;
  }

  switch (e.key) {
    case ' ':
      e.preventDefault();
      if (videoElement.paused) player.play();
      else player.pause();
      break;
    case 'ArrowLeft':
      if (!e.shiftKey) {
        player.seekTo(Math.max(0, videoElement.currentTime - 5));
      }
      break;
    case 'ArrowRight':
      if (!e.shiftKey) {
        player.seekTo(Math.min(videoElement.duration, videoElement.currentTime + 5));
      }
      break;
    case 'Escape':
      if (shortcuts.isOpen()) {
        e.preventDefault();
        shortcuts.close();
      }
      break;
  }
});

const resizeHandle = document.getElementById('resize-handle');
const sidebar = document.getElementById('sidebar');
let isResizing = false;

resizeHandle?.addEventListener('mousedown', (e) => {
  isResizing = true;
  resizeHandle.classList.add('dragging');
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isResizing || !sidebar) return;
  const containerWidth = sidebar.parentElement?.clientWidth || window.innerWidth;
  const newWidth = containerWidth - e.clientX;
  const min = 300;
  const max = Math.min(600, containerWidth - 400);
  const clamped = Math.max(min, Math.min(max, newWidth));
  sidebar.style.width = `${clamped}px`;
});

document.addEventListener('mouseup', () => {
  if (isResizing) {
    isResizing = false;
    resizeHandle?.classList.remove('dragging');
  }
});

shortcuts.mount();
restoreProject();

(async () => {
  const persisted = await isPersisted();
  updateOpfsStatus(persisted);
})();
