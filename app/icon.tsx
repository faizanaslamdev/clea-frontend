import { ImageResponse } from 'next/og';
import {
  CLEA_MARK_PATH,
  CLEA_MARK_TRANSFORM,
  CLEA_MARK_VIEWBOX,
} from '@/lib/constants/icon-mark';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <svg
        width="32"
        height="32"
        viewBox={CLEA_MARK_VIEWBOX}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bg" x1="4" y1="4" x2="28" y2="28">
            <stop color="#1f1f1f" />
            <stop offset="1" color="#0a0a0a" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#bg)" />
        <g transform={CLEA_MARK_TRANSFORM}>
          <path
            d={CLEA_MARK_PATH}
            fill="none"
            stroke="#fafafa"
            strokeWidth={2.15}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    ),
    { ...size },
  );
}
