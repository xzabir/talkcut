const STYLES = `
.mm-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}

.mm-active-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.mm-active-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(34, 197, 94, 0.15);
  color: var(--success);
}

.mm-active-badge::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
}

.mm-active-info {
  flex: 1;
  min-width: 0;
}

.mm-active-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.mm-active-detail {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.mm-no-active {
  padding: 10px;
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  background: var(--bg-primary);
  border-radius: var(--radius);
}

.mm-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.mm-model-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mm-model-card {
  padding: 10px 12px;
  background: var(--bg-primary);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mm-model-card.active {
  border-color: var(--success);
  background: rgba(34, 197, 94, 0.05);
}

.mm-model-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mm-model-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.mm-model-size {
  font-size: 11px;
  color: var(--text-secondary);
  font-family: monospace;
}

.mm-model-desc {
  font-size: 11px;
  color: var(--text-secondary);
}

.mm-model-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
  display: inline-block;
  width: fit-content;
}

.mm-model-status.cached {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success);
}

.mm-model-status.not-cached {
  background: rgba(160, 160, 176, 0.1);
  color: var(--text-secondary);
}

.mm-model-status.downloading {
  background: rgba(79, 140, 255, 0.1);
  color: var(--accent);
}

.mm-model-actions {
  display: flex;
  gap: 6px;
}

.mm-btn {
  padding: 5px 12px;
  border: none;
  border-radius: var(--radius);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}

.mm-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.mm-btn-download {
  background: var(--accent);
  color: white;
}

.mm-btn-download:hover:not(:disabled) {
  background: var(--accent-hover);
}

.mm-btn-delete {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

.mm-btn-delete:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
}

.mm-btn-use {
  background: var(--success);
  color: white;
}

.mm-btn-use:hover:not(:disabled) {
  background: #16a34a;
}

.mm-btn-active {
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: default;
}

.mm-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mm-progress-text {
  font-size: 11px;
  color: var(--text-secondary);
  display: flex;
  justify-content: space-between;
}

.mm-progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.mm-progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.2s ease;
  width: 0%;
}

.mm-error {
  padding: 10px 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger);
  border-radius: var(--radius);
  font-size: 12px;
  color: var(--danger);
  line-height: 1.4;
}

.mm-storage-info {
  font-size: 11px;
  color: var(--text-secondary);
  padding: 6px 10px;
  background: var(--bg-primary);
  border-radius: var(--radius);
  display: flex;
  justify-content: space-between;
}
`;

interface ModelDef {
  id: string;
  name: string;
  size: string;
  filename: string;
  url: string;
  description: string;
}

const MODEL_REGISTRY: ModelDef[] = [
  {
    id: 'tiny-en',
    name: 'Tiny English',
    size: '~40 MB',
    filename: 'whisper-tiny.en.bin',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin',
    description: 'Fastest, less accurate (default)',
  },
  {
    id: 'base-en',
    name: 'Base English',
    size: '~142 MB',
    filename: 'whisper-base.bin',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
    description: 'Balanced speed and accuracy',
  },
  {
    id: 'small-en',
    name: 'Small English',
    size: '~240 MB',
    filename: 'whisper-small.en.bin',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.en.bin',
    description: 'Slower, more accurate (optional)',
  },
];

const MODEL_DIR = 'models';
const ACTIVE_MODEL_KEY = 'active-model.json';

type DownloadState = 'idle' | 'downloading' | 'cached' | 'not-cached' | 'error';

interface ModelEntry {
  def: ModelDef;
  status: DownloadState;
  progress: number;
  sizeOnDisk?: number;
  error?: string;
}

async function getModelDir(): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  try {
    return await root.getDirectoryHandle(MODEL_DIR);
  } catch {
    return await root.getDirectoryHandle(MODEL_DIR, { create: true });
  }
}

export class ModelManager {
  private container: HTMLElement;
  private styleEl: HTMLStyleElement | null = null;
  private root: HTMLElement | null = null;
  private mounted = false;

  private activeModelId = 'tiny-en';
  private entries: Map<string, ModelEntry> = new Map();
  private activeModelEl: HTMLElement | null = null;
  private modelListEl: HTMLElement | null = null;
  private storageInfoEl: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  mount(): void {
    if (this.mounted) return;
    this.mounted = true;

    this.injectStyles();
    this.buildDOM();
    this.refreshAll();
  }

  destroy(): void {
    if (!this.mounted) return;
    this.mounted = false;

    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = null;
    }
    this.container.innerHTML = '';
    this.root = null;
    this.activeModelEl = null;
    this.modelListEl = null;
    this.storageInfoEl = null;
    this.entries.clear();
  }

  private injectStyles(): void {
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = STYLES;
    document.head.appendChild(this.styleEl);
  }

  private buildDOM(): void {
    this.root = document.createElement('div');
    this.root.className = 'mm-panel';

    this.activeModelEl = document.createElement('div');
    this.root.appendChild(this.activeModelEl);

    const sectionTitle = document.createElement('h4');
    sectionTitle.className = 'mm-section-title';
    sectionTitle.textContent = 'Available Models';
    this.root.appendChild(sectionTitle);

    this.modelListEl = document.createElement('div');
    this.modelListEl.className = 'mm-model-list';
    this.root.appendChild(this.modelListEl);

    this.storageInfoEl = document.createElement('div');
    this.storageInfoEl.className = 'mm-storage-info';
    this.root.appendChild(this.storageInfoEl);

    this.container.appendChild(this.root);

    this.root.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!btn) return;

      const modelId = btn.getAttribute('data-model');
      if (!modelId) return;

      const action = btn.getAttribute('data-action');
      if (action === 'download') this.startDownload(modelId);
      if (action === 'delete') this.deleteModel(modelId);
      if (action === 'use') this.setActiveModel(modelId);
    });
  }

  private async refreshAll(): Promise<void> {
    await this.loadActiveModel();
    await this.checkAllStatuses();
    await this.updateStorageInfo();
    this.render();
  }

  private async loadActiveModel(): Promise<void> {
    try {
      const dir = await getModelDir();
      const fh = await dir.getFileHandle(ACTIVE_MODEL_KEY);
      const file = await fh.getFile();
      const json = await file.text();
      const data = JSON.parse(json) as { activeModel: string };
      if (MODEL_REGISTRY.some((m) => m.id === data.activeModel)) {
        this.activeModelId = data.activeModel;
      }
    } catch {
      this.activeModelId = 'tiny-en';
    }
  }

  private async saveActiveModel(): Promise<void> {
    try {
      const dir = await getModelDir();
      const fh = await dir.getFileHandle(ACTIVE_MODEL_KEY, { create: true });
      const writable = await fh.createWritable();
      await writable.write(JSON.stringify({ activeModel: this.activeModelId }));
      await writable.close();
    } catch {
      // best-effort
    }
  }

  async checkModelStatus(modelName: string): Promise<{ exists: boolean; size?: number }> {
    try {
      const def = MODEL_REGISTRY.find((m) => m.filename === modelName || m.id === modelName);
      if (!def) return { exists: false };

      const dir = await getModelDir();
      const fh = await dir.getFileHandle(def.filename);
      const file = await fh.getFile();
      return { exists: true, size: file.size };
    } catch {
      return { exists: false };
    }
  }

  private async checkAllStatuses(): Promise<void> {
    const dir = await getModelDir();

    for (const def of MODEL_REGISTRY) {
      const existing = this.entries.get(def.id);
      if (existing?.status === 'downloading') continue;

      try {
        const fh = await dir.getFileHandle(def.filename);
        const file = await fh.getFile();

        this.entries.set(def.id, {
          def,
          status: 'cached',
          progress: 100,
          sizeOnDisk: file.size,
        });
      } catch {
        this.entries.set(def.id, {
          def,
          status: 'not-cached',
          progress: 0,
        });
      }
    }
  }

  async downloadModel(
    modelName: string,
    url: string,
    onProgress: (pct: number) => void,
  ): Promise<void> {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Download failed: HTTP ${resp.status}`);

    const body = resp.body;
    if (!body) {
      const data = await resp.arrayBuffer();
      onProgress(0.95);
      await this.writeModelToOpfs(modelName, data);
      onProgress(1);
      return;
    }

    const contentLength = resp.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (total) {
        onProgress(received / total);
      }
    }

    const merged = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    onProgress(0.95);
    await this.writeModelToOpfs(modelName, merged.buffer);
    onProgress(1);
  }

  private async writeModelToOpfs(modelId: string, data: ArrayBuffer): Promise<void> {
    const def = MODEL_REGISTRY.find((m) => m.id === modelId);
    if (!def) throw new Error(`Unknown model: ${modelId}`);

    const dir = await getModelDir();
    const fh = await dir.getFileHandle(def.filename, { create: true });
    const writable = await fh.createWritable();
    await writable.write(new Uint8Array(data));
    await writable.close();
  }

  private async startDownload(modelId: string): Promise<void> {
    const entry = this.entries.get(modelId);
    if (!entry || entry.status === 'downloading') return;

    const def = entry.def;
    this.entries.set(modelId, {
      ...entry,
      status: 'downloading',
      progress: 0,
      error: undefined,
    });
    this.render();

    try {
      await this.downloadModel(modelId, def.url, (pct) => {
        const e = this.entries.get(modelId);
        if (e && e.status === 'downloading') {
          this.entries.set(modelId, { ...e, progress: Math.round(pct * 100) });
          this.render();
        }
      });

      const dir = await getModelDir();
      const fh = await dir.getFileHandle(def.filename);
      const file = await fh.getFile();

      this.entries.set(modelId, {
        def,
        status: 'cached',
        progress: 100,
        sizeOnDisk: file.size,
      });
      await this.updateStorageInfo();
    } catch (err) {
      this.entries.set(modelId, {
        def,
        status: 'error',
        progress: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    this.render();
  }

  private async deleteModel(modelId: string): Promise<void> {
    const def = MODEL_REGISTRY.find((m) => m.id === modelId);
    if (!def) return;

    try {
      const dir = await getModelDir();
      await dir.removeEntry(def.filename);
    } catch {
      // file may not exist
    }

    this.entries.set(modelId, {
      def,
      status: 'not-cached',
      progress: 0,
      sizeOnDisk: undefined,
    });

    if (this.activeModelId === modelId) {
      this.activeModelId = 'tiny-en';
      await this.saveActiveModel();
    }

    await this.updateStorageInfo();
    this.render();
  }

  async setActiveModel(modelId: string): Promise<void> {
    const entry = this.entries.get(modelId);
    if (!entry || entry.status !== 'cached') return;

    this.activeModelId = modelId;
    await this.saveActiveModel();
    this.render();
  }

  async getActiveModel(): Promise<string> {
    return this.activeModelId;
  }

  async getActiveModelDef(): Promise<ModelDef | undefined> {
    return MODEL_REGISTRY.find((m) => m.id === this.activeModelId);
  }

  private async updateStorageInfo(): Promise<void> {
    if (!this.storageInfoEl) return;

    let totalSize = 0;
    this.entries.forEach((e) => {
      if (e.sizeOnDisk) totalSize += e.sizeOnDisk;
    });

    const bytes = totalSize;
    let sizeText: string;
    if (bytes >= 1_000_000_000) {
      sizeText = `${(bytes / 1_000_000_000).toFixed(1)} GB`;
    } else if (bytes >= 1_000_000) {
      sizeText = `${(bytes / 1_000_000).toFixed(1)} MB`;
    } else if (bytes >= 1_000) {
      sizeText = `${(bytes / 1_000).toFixed(1)} KB`;
    } else {
      sizeText = `${bytes} B`;
    }

    const estimate = await navigator.storage?.estimate?.();
    let quotaText = '';
    if (estimate?.quota) {
      const gb = estimate.quota / 1_000_000_000;
      quotaText = ` / ${gb.toFixed(1)} GB available`;
    }

    this.storageInfoEl.textContent = `Models on disk: ${sizeText}${quotaText}`;
  }

  private render(): void {
    this.renderActive();
    this.renderList();
  }

  private renderActive(): void {
    if (!this.activeModelEl) return;

    const activeDef = MODEL_REGISTRY.find((m) => m.id === this.activeModelId);
    const activeEntry = this.entries.get(this.activeModelId);
    const isCached = activeEntry?.status === 'cached';

    if (!isCached) {
      this.activeModelEl.innerHTML = `
        <div class="mm-no-active">
          Active model "${activeDef?.name ?? this.activeModelId}" is not downloaded.
          Download it below.
        </div>
      `;
      return;
    }

    this.activeModelEl.innerHTML = `
      <div class="mm-active-card">
        <span class="mm-active-badge">Active</span>
        <div class="mm-active-info">
          <div class="mm-active-name">${activeDef?.name ?? this.activeModelId}</div>
          <div class="mm-active-detail">
            ${activeDef?.size ?? ''}${activeEntry?.sizeOnDisk ? ` · ${formatBytes(activeEntry.sizeOnDisk)} on disk` : ''}
          </div>
        </div>
      </div>
    `;
  }

  private renderList(): void {
    if (!this.modelListEl) return;

    this.modelListEl.innerHTML = MODEL_REGISTRY.map((def) => {
      const entry = this.entries.get(def.id);
      const isActive = this.activeModelId === def.id;
      const status = entry?.status ?? 'not-cached';

      let statusHtml = '';
      if (isActive) {
        statusHtml = '<span class="mm-model-status cached">Active</span>';
      } else if (status === 'cached') {
        const sizeStr = entry?.sizeOnDisk ? ` · ${formatBytes(entry.sizeOnDisk)}` : '';
        statusHtml = `<span class="mm-model-status cached">Downloaded${sizeStr}</span>`;
      } else if (status === 'downloading') {
        statusHtml = `<span class="mm-model-status downloading">Downloading ${entry?.progress ?? 0}%</span>`;
      } else if (status === 'error') {
        statusHtml = `<span class="mm-model-status not-cached" style="color:var(--danger);background:rgba(239,68,68,0.1)">Error: ${escHtml(entry?.error ?? '')}</span>`;
      } else {
        statusHtml = '<span class="mm-model-status not-cached">Not downloaded</span>';
      }

      let progressHtml = '';
      if (status === 'downloading') {
        const pct = entry?.progress ?? 0;
        progressHtml = `
          <div class="mm-progress">
            <div class="mm-progress-bar">
              <div class="mm-progress-fill" style="width:${pct}%"></div>
            </div>
            <div class="mm-progress-text"><span>${def.name}</span><span>${pct}%</span></div>
          </div>
        `;
      }

      let actionsHtml = '';
      if (isActive) {
        actionsHtml = '<button class="mm-btn mm-btn-active" disabled>In use</button>';
      } else if (status === 'cached') {
        actionsHtml = `
          <button class="mm-btn mm-btn-use" data-model="${def.id}" data-action="use">Use this model</button>
          <button class="mm-btn mm-btn-delete" data-model="${def.id}" data-action="delete">Delete</button>
        `;
      } else if (status === 'downloading') {
        actionsHtml = '';
      } else if (status === 'error') {
        actionsHtml = `
          <button class="mm-btn mm-btn-download" data-model="${def.id}" data-action="download">Retry</button>
        `;
      } else {
        actionsHtml = `
          <button class="mm-btn mm-btn-download" data-model="${def.id}" data-action="download">Download</button>
        `;
      }

      const cardClass = isActive ? 'mm-model-card active' : 'mm-model-card';

      return `
        <div class="${cardClass}">
          <div class="mm-model-header">
            <span class="mm-model-name">${def.name}</span>
            <span class="mm-model-size">${def.size}</span>
          </div>
          <div class="mm-model-desc">${def.description}</div>
          ${statusHtml}
          ${progressHtml}
          <div class="mm-model-actions">${actionsHtml}</div>
        </div>
      `;
    }).join('');
  }
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}

function escHtml(text: string): string {
  const el = document.createElement('span');
  el.textContent = text;
  return el.innerHTML;
}
