/**
 * Photo search: shrink the picked photo in the browser before it is sent.
 * The backend accepts a JPEG/PNG/WebP data URL up to 1.5 MB and reads it at
 * low detail, so 1024 px on the long side is plenty and keeps uploads small.
 */

export const PHOTO_MAX_SIDE = 1024;
/** Stay under the backend's 1.5 MB data URL limit with some margin. */
export const PHOTO_MAX_DATA_URL_LENGTH = 1_400_000;

export type PhotoErrorCode = 'not_image' | 'unreadable' | 'too_large';

export class PhotoPrepareError extends Error {
  constructor(readonly code: PhotoErrorCode) {
    super(code);
    this.name = 'PhotoPrepareError';
  }
}

export interface PreparedPhoto {
  /** `data:image/jpeg;base64,…` to send. */
  dataUrl: string;
}

/** Longest side scaled to `max`, never upscaled. */
export function fitWithin(width: number, height: number, max = PHOTO_MAX_SIDE): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max || longest === 0) {
    return { width, height };
  }
  const scale = max / longest;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

async function decode(file: Blob): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      // Fall through to <img>, which some browsers decode more formats with.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
  } catch {
    URL.revokeObjectURL(url);
    throw new PhotoPrepareError('unreadable');
  }
}

export async function preparePhoto(file: Blob): Promise<PreparedPhoto> {
  if (file.type && !file.type.startsWith('image/')) {
    throw new PhotoPrepareError('not_image');
  }
  const image = await decode(file);
  try {
    const size = fitWithin(image.width, image.height);
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new PhotoPrepareError('unreadable');
    }
    // White behind transparent PNGs, otherwise JPEG turns them black.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, size.width, size.height);
    context.drawImage(image.source, 0, 0, size.width, size.height);
    for (const quality of [0.85, 0.75, 0.6, 0.45]) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (dataUrl.length <= PHOTO_MAX_DATA_URL_LENGTH) {
        return { dataUrl };
      }
    }
    throw new PhotoPrepareError('too_large');
  } finally {
    image.close();
  }
}

export function photoErrorMessage(code: PhotoErrorCode): string {
  switch (code) {
    case 'not_image':
      return 'Velg et bilde (JPEG, PNG eller WebP).';
    case 'too_large':
      return 'Bildet er for stort. Prøv et annet bilde.';
    default:
      return 'Klarte ikke å lese bildet. Prøv et annet bilde.';
  }
}
