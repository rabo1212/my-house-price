/** 국토교통부 실거래가 API (서버 사이드 전용) */

const API_BASE = 'https://apis.data.go.kr/1613000';
const APT_TRADE_URL = `${API_BASE}/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade`;

export interface Trade {
  date: string;
  price: number;
  area_m2: number;
  floor: number;
  type: string;
  apartment: string;
  dong: string;
  build_year: number;
  price_per_pyeong: number;
}

function parseXmlItems(xml: string): Record<string, string>[] {
  const items: Record<string, string>[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const fields: Record<string, string> = {};
    const fr = /<([^\/][^>]*)>([\s\S]*?)<\/\1>/g;
    let fm;
    while ((fm = fr.exec(m[1])) !== null) fields[fm[1].trim()] = fm[2].trim();
    if (Object.keys(fields).length > 0) items.push(fields);
  }
  return items;
}

export async function fetchTrades(lawdCd: string, dealYm: string): Promise<Trade[]> {
  const key = process.env.MOLIT_API_KEY || '';
  if (!key) return [];

  const url = `${APT_TRADE_URL}?serviceKey=${encodeURIComponent(key)}&LAWD_CD=${lawdCd}&DEAL_YMD=${dealYm}&pageNo=1&numOfRows=500`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    console.error(`[MOLIT] HTTP ${res.status} for ${lawdCd}/${dealYm}`);
    return [];
  }
  const text = await res.text();
  if (!text.includes('<resultCode>000</resultCode>')) {
    console.error(`[MOLIT] API error for ${lawdCd}/${dealYm}:`, text.slice(0, 300));
    return [];
  }

  return parseXmlItems(text)
    .filter(i => (i['cdealType'] || '').trim() !== 'O')
    .map(i => {
      const price = parseInt((i['dealAmount'] || '0').replace(/,/g, '').trim());
      const area = parseFloat(i['excluUseAr'] || '0');
      const pyeong = area / 3.3058;
      return {
        date: `${i['dealYear']}-${String(i['dealMonth']).padStart(2, '0')}-${String(i['dealDay']).padStart(2, '0')}`,
        price, area_m2: area,
        floor: parseInt(i['floor'] || '0'),
        type: (i['dealingGbn'] || '').trim(),
        apartment: (i['aptNm'] || '').trim(),
        dong: (i['umdNm'] || '').trim(),
        build_year: parseInt(i['buildYear'] || '0'),
        price_per_pyeong: pyeong > 0 ? Math.round(price / pyeong) : 0,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function fetchMultiMonthTrades(lawdCd: string, months: number = 6): Promise<Trade[]> {
  const now = new Date();
  const all: Trade[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const trades = await fetchTrades(lawdCd, ym);
    all.push(...trades);
  }
  return all;
}

/** 동시 호출 수를 제한하면서 Promise 배열 실행 */
export async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let idx = 0;

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
