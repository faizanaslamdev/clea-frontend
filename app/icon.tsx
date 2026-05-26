import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontStyle: 'italic',
            fontFamily: 'Georgia, serif',
            color: '#fafafa',
            marginTop: 2,
            marginLeft: -1,
          }}
        >
          c
        </div>
      </div>
    ),
    { ...size },
  );
}
