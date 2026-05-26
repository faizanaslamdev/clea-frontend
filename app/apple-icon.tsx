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
          background: '#1a1a1a',
          borderRadius: 36,
        }}
      >
        <div
          style={{
            fontSize: 108,
            fontStyle: 'italic',
            fontFamily: 'Georgia, serif',
            color: '#fafafa',
            marginTop: 6,
            marginLeft: -4,
          }}
        >
          c
        </div>
      </div>
    ),
    { ...size },
  );
}
