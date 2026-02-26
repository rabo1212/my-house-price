import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.MOLIT_API_KEY || '';
  const hasKey = key.length > 0;
  const keyLen = key.length;
  const keyPreview = key.slice(0, 6) + '...';

  // 직접 API 호출 테스트
  const testUrl = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade?serviceKey=${encodeURIComponent(key)}&LAWD_CD=11710&DEAL_YMD=202602&pageNo=1&numOfRows=5`;

  let apiStatus = '';
  let apiBody = '';
  try {
    const res = await fetch(testUrl, { cache: 'no-store' });
    apiStatus = `${res.status} ${res.statusText}`;
    apiBody = (await res.text()).slice(0, 500);
  } catch (e: unknown) {
    apiStatus = 'FETCH_ERROR';
    apiBody = String(e);
  }

  return NextResponse.json({
    hasKey,
    keyLen,
    keyPreview: hasKey ? keyPreview : '(empty)',
    apiStatus,
    apiBody,
  });
}
