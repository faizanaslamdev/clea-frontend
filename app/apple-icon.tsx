import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #1a1a1a 0%, #000000 100%)',
          borderRadius: 36,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            background: '#fafafa',
            transform: 'rotate(45deg)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
