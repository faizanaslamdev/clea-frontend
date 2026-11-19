/**
 * Thumbnails of photos sent in chat, kept in this browser only, so a
 * reloaded conversation still shows the photo the shopper sent. The server
 * never stores the photo. A small JPEG per turn, the newest 24 kept.
 */
const STORAGE_KEY = 'clea.photo-thumbnails';
const MAX_ENTRIES = 24;
const THUMB_PX = 320;

type Stored = Record<string, string>;

function read(): Stored {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? (parsed as Stored) : {};
  } catch {
    return {};
  }
}

function write(store: Stored): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota or private mode: the photo shows until the next reload only */
  }
}

/** A ~320 px JPEG of the sent photo, small enough for localStorage. */
export async function makePhotoThumbnail(dataUrl: string): Promise<string> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('thumb_decode'));
    image.src = dataUrl;
  });
  const scale = Math.min(1, THUMB_PX / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d');
  if (!context) return dataUrl;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.7);
}

export function rememberPhotoThumbnail(turnId: string, thumbnail: string): void {
  const store = read();
  const keys = Object.keys(store);
  // Oldest first: insertion order is the age.
  while (keys.length >= MAX_ENTRIES) {
    const oldest = keys.shift();
    if (oldest) delete store[oldest];
  }
  store[turnId] = thumbnail;
  write(store);
}

export function recallPhotoThumbnail(turnId: string | undefined): string | undefined {
  if (!turnId || typeof window === 'undefined') return undefined;
  return read()[turnId];
}
