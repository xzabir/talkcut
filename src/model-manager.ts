interface ModelDef {
  id: string;
  name: string;
  size: string;
  description: string;
}

const MODEL_REGISTRY: ModelDef[] = [
  {
    id: 'Xenova/whisper-tiny.en',
    name: 'Tiny English',
    size: '~40 MB',
    description: 'Fastest, less accurate',
  },
  {
    id: 'Xenova/whisper-base.en',
    name: 'Base English',
    size: '~100 MB',
    description: 'Balanced speed and accuracy',
  },
  {
    id: 'Xenova/whisper-small.en',
    name: 'Small English',
    size: '~240 MB',
    description: 'Slower, more accurate',
  },
];

const STORAGE_KEY = 'talkcut-active-model';

export class ModelManager {
  private container: HTMLElement;
  private root: HTMLElement | null = null;
  private mounted = false;

  private activeModelId = 'Xenova/whisper-base.en';
  private activeModelEl: HTMLElement | null = null;
  private modelListEl: HTMLElement | null = null;
  private noteEl: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.loadActiveModel();
  }

  private loadActiveModel(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && MODEL_REGISTRY.some((m) => m.id === stored)) {
        this.activeModelId = stored;
      }
    } catch {
      // localStorage may be unavailable
    }
  }

  private saveActiveModel(): void {
    try {
      localStorage.setItem(STORAGE_KEY, this.activeModelId);
    } catch {
      // best-effort
    }
  }

  getActiveModelId(): string {
    return this.activeModelId;
  }

  mount(): void {
    if (this.mounted) return;
    this.mounted = true;

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

    this.noteEl = document.createElement('div');
    this.noteEl.className = 'mm-note';
    this.noteEl.textContent = 'Models are downloaded automatically on first use and cached by the browser for offline use.';
    this.root.appendChild(this.noteEl);

    this.container.appendChild(this.root);

    this.root.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!btn) return;

      const modelId = btn.getAttribute('data-model');
      if (!modelId) return;

      const action = btn.getAttribute('data-action');
      if (action === 'use') this.setActiveModel(modelId);
    });

    this.render();
  }

  destroy(): void {
    if (!this.mounted) return;
    this.mounted = false;
    this.container.innerHTML = '';
    this.root = null;
    this.activeModelEl = null;
    this.modelListEl = null;
    this.noteEl = null;
  }

  private setActiveModel(modelId: string): void {
    if (!MODEL_REGISTRY.some((m) => m.id === modelId)) return;
    this.activeModelId = modelId;
    this.saveActiveModel();
    this.render();
  }

  private render(): void {
    this.renderActive();
    this.renderList();
  }

  private renderActive(): void {
    if (!this.activeModelEl) return;

    const def = MODEL_REGISTRY.find((m) => m.id === this.activeModelId);

    this.activeModelEl.innerHTML = `
      <div class="mm-active-card">
        <span class="mm-active-badge">Active</span>
        <div class="mm-active-info">
          <div class="mm-active-name">${def?.name ?? this.activeModelId}</div>
          <div class="mm-active-detail">${def?.size ?? ''} - ${def?.description ?? ''}</div>
        </div>
      </div>
    `;
  }

  private renderList(): void {
    if (!this.modelListEl) return;

    this.modelListEl.innerHTML = MODEL_REGISTRY.map((def) => {
      const isActive = this.activeModelId === def.id;
      const cardClass = isActive ? 'mm-model-card active' : 'mm-model-card';

      let actionsHtml: string;
      if (isActive) {
        actionsHtml = '<button class="mm-btn mm-btn-active" disabled>In use</button>';
      } else {
        actionsHtml = `<button class="mm-btn mm-btn-use" data-model="${def.id}" data-action="use">Use this model</button>`;
      }

      return `
        <div class="${cardClass}">
          <div class="mm-model-header">
            <span class="mm-model-name">${def.name}</span>
            <span class="mm-model-size">${def.size}</span>
          </div>
          <div class="mm-model-desc">${def.description}</div>
          <div class="mm-model-actions">${actionsHtml}</div>
        </div>
      `;
    }).join('');
  }
}
