import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const apt = searchParams.get('apt') || '아파트';
  const region = searchParams.get('region') || '';
  const avg = searchParams.get('avg') || '0';
  const min = searchParams.get('min') || '0';
  const max = searchParams.get('max') || '0';
  const trend = searchParams.get('trend') || '0';
  const count = searchParams.get('count') || '0';

  const trendNum = parseFloat(trend);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f9fafb',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 상단 헤더 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '40px 60px 0',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            🏠
          </div>
          <span style={{ fontSize: '24px', color: '#9ca3af' }}>내 집 얼마?</span>
        </div>

        {/* 메인 콘텐츠 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 60px',
          }}
        >
          <div style={{ fontSize: '20px', color: '#6b7280', marginBottom: '8px' }}>{region}</div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>
            {apt}
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            {/* 평균가 */}
            <div
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px solid #e5e7eb',
              }}
            >
              <span style={{ fontSize: '16px', color: '#9ca3af', marginBottom: '8px' }}>평균 실거래가</span>
              <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827' }}>{avg}</span>
            </div>

            {/* 최저~최고 */}
            <div
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px solid #e5e7eb',
              }}
            >
              <span style={{ fontSize: '16px', color: '#9ca3af', marginBottom: '8px' }}>가격 범위</span>
              <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
                {min} ~ {max}
              </span>
            </div>

            {/* 추세 */}
            <div
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px solid #e5e7eb',
              }}
            >
              <span style={{ fontSize: '16px', color: '#9ca3af', marginBottom: '8px' }}>추세 · {count}건</span>
              <span
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: trendNum > 0 ? '#e11d48' : trendNum < 0 ? '#6366f1' : '#6b7280',
                }}
              >
                {trendNum > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          </div>
        </div>

        {/* 하단 */}
        <div
          style={{
            padding: '0 60px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '16px', color: '#d1d5db' }}>국토교통부 실거래가 기반</span>
          <span style={{ fontSize: '16px', color: '#d1d5db' }}>my-house-price.vercel.app</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
