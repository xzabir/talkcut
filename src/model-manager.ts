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

.mm-note {
  font-size: 11px;
  color: var(--text-secondary);
  padding: 8px 10px;
  background: var(--bg-primary);
  border-radius: var(--radius);
  line-height: 1.5;
}
`;

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
    description: 'Fastest, less accurate (default)',
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
    description: 'Slower, more accurate (optional)',
  },
];

const STORAGE_KEY = 'talkcut-active-model';

export class ModelManager {
  private container: HTMLElement;
  private styleEl: HTMLStyleElement | null = null;
  private root: HTMLElement | null = null;
  private mounted = false;

  private activeModelId = 'Xenova/whisper-tiny.en';
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

    this.styleEl = document.createElement('style');
    this.styleEl.textContent = STYLES;
    document.head.appendChild(this.styleEl);

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

    this.styleEl?.remove();
    this.styleEl = null;
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
          <div class="mm-active-detail">${def?.size ?? ''} — ${def?.description ?? ''}</div>
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
