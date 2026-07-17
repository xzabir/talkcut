import './style.css';
import './sw-register.ts';
import { VideoPlayer } from './player.ts';
import { WaveformRenderer } from './waveform.ts';
import { saveVideo, getVideoUrl, loadProject, saveProject, videoExists, requestPersistence } from './opfs.ts';
import { TranscribeButton } from './transcribe-button.ts';
import { TranscriptPanel } from './transcript-panel.ts';
import { CutManager } from './cut-manager.ts';
import { CutsPanel } from './cuts-panel.ts';
import { ExportPanel } from './export-panel.ts';
import { isExportSupported } from './exporter.ts';
import { KeyboardShortcuts } from './keyboard-shortcuts.ts';
import { ModelManager } from './model-manager.ts';
import type { ProjectState } from './types.ts';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <header class="app-header">
    <h1 class="app-title">TalkCut</h1>
    <span class="app-subtitle">Edit video by editing the transcript</span>
    <div class="header-actions">
      <button id="save-btn" class="btn btn-secondary" disabled title="Save project">Save</button>
      <button id="export-btn" class="btn btn-accent" disabled title="Export video">Export</button>
    </div>
  </header>

  <main class="app-main">
    <div class="player-section">
      <div id="player-container" class="player-container"></div>
      <div id="waveform-container" class="waveform-container"></div>
    </div>

    <aside class="sidebar">
      <div class="sidebar-tabs">
        <button class="tab active" data-tab="transcript">Transcript</button>
        <button class="tab" data-tab="cuts">Cuts</button>
        <button class="tab" data-tab="export">Export</button>
        <button class="tab" data-tab="models">Models</button>
      </div>
      <div class="sidebar-content">
        <div id="transcript-panel" class="panel active"></div>
        <div id="cuts-panel" class="panel">
          <div class="panel-empty">
            <p>Cut regions will appear here.</p>
          </div>
        </div>
        <div id="export-panel" class="panel">
          <div class="panel-empty">
            <p>Export settings and progress will appear here.</p>
          </div>
        </div>
        <div id="models-panel" class="panel">
          <div class="panel-empty">
            <p>Model management will appear here.</p>
          </div>
        </div>
      </div>
    </aside>
  </main>

  <footer class="app-footer">
    <span>Everything runs locally. Nothing leaves your browser.</span>
    <span id="opfs-status" class="opfs-status">OPFS: checking...</span>
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

const videoElement = player.getVideoElement();
videoElement.addEventListener('timeupdate', () => {
  const time = videoElement.currentTime;
  const duration = videoElement.duration;
  waveform.setCurrentTime(time);
  if (duration) {
    waveform.setDuration(duration);
  }
});

waveform.onSeekTo((time: number) => {
  player.seekTo(time);
});

cutManager.onChange((regions) => {
  waveform.setCutRegions(regions);
  if (currentProject) {
    cutManager.saveToProject(currentProject);
    saveProject(currentProject).catch(() => {});
  }
});

let transcriptPanel: TranscriptPanel | null = null;
let transcribeButton: TranscribeButton | null = null;

function setupUI(): void {
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
    () => { /* transcript saved */ }
  );

  transcribeButton.mount(
    () => player.getVideoElement(),
    () => currentProject,
    () => { /* transcript saved */ }
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
      const { loadVideo } = await import('./opfs.ts');
      return loadVideo(currentProject.videoFileName);
    },
    () => cutManager.getRegions(),
  );
  exportPanel.mount();

  const modelsPanelEl = document.getElementById('models-panel')!;
  modelsPanelEl.innerHTML = '';
  const modelManager = new ModelManager(modelsPanelEl);
  modelManager.mount();

  const exportBtn = document.getElementById('export-btn') as HTMLButtonElement;
  if (!isExportSupported()) {
    exportBtn.disabled = true;
    exportBtn.title = 'Export requires Chrome or Edge (WebCodecs support)';
  }

  const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
  saveBtn.disabled = false;
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

    const persisted = await requestPersistence();
    updateOpfsStatus(persisted);

    console.log('Project saved:', currentProject.id);
  } catch (err) {
    console.error('Failed to save video:', err);
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
      console.log('Project restored:', project.id);
    }
  }
}

document.getElementById('save-btn')?.addEventListener('click', async () => {
  if (currentProject) {
    cutManager.saveToProject(currentProject);
    await saveProject(currentProject);
    console.log('Project saved');
  }
});

document.getElementById('export-btn')?.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
  const exportTab = document.querySelector<HTMLElement>('[data-tab="export"]');
  if (exportTab) exportTab.classList.add('active');
  const panel = document.getElementById('export-panel');
  if (panel) panel.classList.add('active');
  exportPanel?.updateButtons();
});

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const targetTab = (tab as HTMLElement).dataset.tab;
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById(`${targetTab}-panel`);
    if (panel) panel.classList.add('active');
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

  switch (e.key) {
    case ' ':
      e.preventDefault();
      if (videoElement.paused) player.play();
      else player.pause();
      break;
    case 'ArrowLeft':
      player.seekTo(Math.max(0, videoElement.currentTime - 5));
      break;
    case 'ArrowRight':
      player.seekTo(Math.min(videoElement.duration, videoElement.currentTime + 5));
      break;
    case 'Escape':
      if (shortcuts.isOpen()) {
        e.preventDefault();
        shortcuts.close();
      }
      break;
  }
});

shortcuts.mount();

restoreProject();

(async () => {
  const { isPersisted } = await import('./opfs.ts');
  const persisted = await isPersisted();
  updateOpfsStatus(persisted);
})();
