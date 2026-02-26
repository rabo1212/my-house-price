'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { REGION_CODES } from '@/lib/region-codes';
import { IconSearch, IconMapPin } from '@/components/icons';

export default function SearchBar({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ code: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const matches: { code: string; name: string }[] = [];
    for (const [code, name] of Object.entries(REGION_CODES)) {
      if (name.includes(query) || code.includes(query)) matches.push({ code, name });
    }
    setResults(matches.slice(0, 10));
    setOpen(matches.length > 0);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (code: string) => {
    setOpen(false);
    setQuery('');
    router.push(`/search?code=${code}`);
  };

  const isLg = size === 'lg';

  return (
    <div ref={ref} className="relative w-full">
      <div
        className={`flex items-center bg-white/80 backdrop-blur-lg border border-white/80 rounded-2xl transition-all duration-300 focus-within:border-indigo-300 ${isLg ? 'h-14 text-base px-5' : 'h-11 text-sm px-4'}`}
        style={{
          boxShadow: '0 2px 8px rgba(99,102,241,0.08), 0 8px 32px rgba(99,102,241,0.04), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        <IconSearch className="w-5 h-5 text-indigo-400 mr-2.5 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={e => { if (e.key === 'Enter' && results.length) go(results[0].code); }}
          placeholder="지역명 또는 코드로 검색 (예: 강남구, 송파구)"
          className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-gray-900"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-2 w-full bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.8)' }}>
          {results.map(r => (
            <button
              key={r.code}
              aria-label={`${r.name} 지역으로 이동`}
              onClick={() => go(r.code)}
              className="w-full px-4 py-3 text-left hover:bg-indigo-50/70 flex items-center gap-3 text-sm cursor-pointer transition-colors duration-150"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                <IconMapPin className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <span className="font-medium text-gray-800">{r.name}</span>
              <span className="text-xs text-gray-400 num ml-auto">{r.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
