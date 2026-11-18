'use client';

import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { PhotoPrepareError, photoErrorMessage, preparePhoto } from '@/lib/photo/prepare-photo';
import { cn } from '@/lib/utils';

/**
 * Camera button for photo search. Opens the photo library (or the camera on
 * phones), shrinks the photo in the browser and hands the data URL on.
 */
export function PhotoSearchButton({
  onPhoto,
  disabled,
  className,
}: {
  onPhoto: (dataUrl: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { dataUrl } = await preparePhoto(file);
      onPhoto(dataUrl);
    } catch (caught) {
      setError(photoErrorMessage(caught instanceof PhotoPrepareError ? caught.code : 'unreadable'));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <button
        type="button"
        className={cn('photo-search-button', className)}
        aria-label="Søk med bilde"
        title="Søk med bilde"
        disabled={disabled || busy}
        aria-busy={busy}
        onClick={() => inputRef.current?.click()}
      >
        <Camera className="size-[1.125rem]" strokeWidth={1.75} aria-hidden />
      </button>
      {error ? (
        <span role="alert" className="photo-search-button__error">
          {error}
        </span>
      ) : null}
    </>
  );
}
