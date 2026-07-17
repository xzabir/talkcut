const TOAST_STYLES = `
.toast-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: var(--bg-elevated, #22272e);
  border: 1px solid var(--border-default, #30363d);
  border-radius: var(--radius-md, 10px);
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.2));
  font-size: 13px;
  color: var(--text-primary, #e6edf3);
  max-width: 360px;
  min-width: 240px;
  pointer-events: auto;
  animation: toast-slide-in 200ms cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1.5;
}

.toast.toast-leaving {
  animation: toast-slide-out 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes toast-slide-in {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes toast-slide-out {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(20px); }
}

.toast-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 1px;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 2px;
}

.toast-message {
  color: var(--text-secondary, #7d8590);
  font-size: 12px;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--text-tertiary, #6e7681);
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  line-height: 1;
}

.toast-close:hover {
  color: var(--text-primary, #e6edf3);
}

.toast-success { border-left: 3px solid var(--success, #2ea043); }
.toast-error { border-left: 3px solid var(--danger, #f85149); }
.toast-info { border-left: 3px solid var(--accent, #5e60ce); }
.toast-warning { border-left: 3px solid var(--warning, #d29922); }
`;

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

class ToastManager {
  private container: HTMLElement | null = null;
  private styleEl: HTMLStyleElement | null = null;

  private ensureContainer(): HTMLElement {
    if (!this.styleEl) {
      this.styleEl = document.createElement('style');
      this.styleEl.textContent = TOAST_STYLES;
      document.head.appendChild(this.styleEl);
    }
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  show(options: ToastOptions): void {
    const container = this.ensureContainer();
    const type = options.type ?? 'info';
    const duration = options.duration ?? 4000;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons: Record<ToastType, string> = {
      success: '<svg class="toast-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>',
      error: '<svg class="toast-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M3.404 2.343A.75.75 0 0 0 2.343 3.404L6.94 8l-4.596 4.596a.75.75 0 1 0 1.06 1.06L8 9.06l4.596 4.596a.75.75 0 1 0 1.06-1.06L9.06 8l4.596-4.596a.75.75 0 0 0-1.06-1.06L8 6.94 3.404 2.343Z"/></svg>',
      info: '<svg class="toast-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>',
      warning: '<svg class="toast-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>',
    };

    toast.innerHTML = `
      ${icons[type]}
      <div class="toast-content">
        ${options.title ? `<div class="toast-title">${escapeHtml(options.title)}</div>` : ''}
        <div class="toast-message">${escapeHtml(options.message)}</div>
      </div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close')!;
    const remove = () => {
      toast.classList.add('toast-leaving');
      setTimeout(() => toast.remove(), 200);
    };
    closeBtn.addEventListener('click', remove);

    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(remove, duration);
    }
  }

  success(message: string, title?: string): void {
    this.show({ type: 'success', message, title, duration: 3000 });
  }

  error(message: string, title?: string): void {
    this.show({ type: 'error', message, title, duration: 6000 });
  }

  info(message: string, title?: string): void {
    this.show({ type: 'info', message, title, duration: 4000 });
  }

  warning(message: string, title?: string): void {
    this.show({ type: 'warning', message, title, duration: 5000 });
  }
}

function escapeHtml(text: string): string {
  const el = document.createElement('span');
  el.textContent = text;
  return el.innerHTML;
}

export const toast = new ToastManager();
