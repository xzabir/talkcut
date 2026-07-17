import type { ProjectState } from './types.ts';

const PROJECT_FILE = 'project.json';
const VIDEO_DIR = 'videos';

let opfsRoot: FileSystemDirectoryHandle | null = null;

async function getRoot(): Promise<FileSystemDirectoryHandle> {
  if (!opfsRoot) {
    opfsRoot = await navigator.storage.getDirectory();
  }
  return opfsRoot;
}

export async function saveVideo(file: File): Promise<string> {
  const root = await getRoot();
  let videoDir: FileSystemDirectoryHandle;
  try {
    videoDir = await root.getDirectoryHandle(VIDEO_DIR);
  } catch {
    videoDir = await root.getDirectoryHandle(VIDEO_DIR, { create: true });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileHandle = await videoDir.getFileHandle(safeName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(file);
  await writable.close();

  return safeName;
}

export async function loadVideo(fileName: string): Promise<File> {
  const root = await getRoot();
  const videoDir = await root.getDirectoryHandle(VIDEO_DIR);
  const fileHandle = await videoDir.getFileHandle(fileName);
  const file = await fileHandle.getFile();
  return file;
}

export async function getVideoUrl(fileName: string): Promise<string> {
  const file = await loadVideo(fileName);
  return URL.createObjectURL(file);
}

export async function videoExists(fileName: string): Promise<boolean> {
  try {
    const root = await getRoot();
    const videoDir = await root.getDirectoryHandle(VIDEO_DIR);
    await videoDir.getFileHandle(fileName);
    return true;
  } catch {
    return false;
  }
}

export async function saveProject(state: ProjectState): Promise<void> {
  const root = await getRoot();
  state.updatedAt = Date.now();
  const fileHandle = await root.getFileHandle(PROJECT_FILE, { create: true });
  const writable = await fileHandle.createWritable();
  const json = JSON.stringify(state, null, 2);
  await writable.write(json);
  await writable.close();
}

export async function loadProject(): Promise<ProjectState | null> {
  try {
    const root = await getRoot();
    const fileHandle = await root.getFileHandle(PROJECT_FILE);
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text) as ProjectState;
  } catch {
    return null;
  }
}

export async function deleteProject(): Promise<void> {
  try {
    const root = await getRoot();
    await root.removeEntry(PROJECT_FILE);
    try {
      await root.removeEntry(VIDEO_DIR, { recursive: true });
    } catch {
      // video dir may not exist
    }
  } catch {
    // project file may not exist
  }
}

export async function isPersisted(): Promise<boolean> {
  return navigator.storage?.persisted?.() ?? false;
}

export async function requestPersistence(): Promise<boolean> {
  if (navigator.storage?.persist) {
    return navigator.storage.persist();
  }
  return false;
}
