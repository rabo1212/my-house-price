import { NextRequest, NextResponse } from 'next/server';
import { REGION_CODES } from '@/lib/region-codes';

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const results: { code: string; name: string }[] = [];
  for (const [code, name] of Object.entries(REGION_CODES)) {
    if (name.includes(q) || code.includes(q)) {
      results.push({ code, name });
    }
  }

  return NextResponse.json({ results: results.slice(0, 20) });
}
