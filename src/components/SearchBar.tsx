'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { REGION_CODES } from '@/lib/region-codes';

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
      <div className={`flex items-center bg-white border border-slate-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${isLg ? 'h-14 text-lg px-5' : 'h-11 text-sm px-4'}`}>
        <svg className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={e => { if (e.key === 'Enter' && results.length) go(results[0].code); }}
          placeholder="지역명 또는 코드로 검색 (예: 강남구, 송파구)"
          className="flex-1 bg-transparent outline-none placeholder:text-slate-400"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
          {results.map(r => (
            <button
              key={r.code}
              onClick={() => go(r.code)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center justify-between text-sm"
            >
              <span className="font-medium text-slate-700">{r.name}</span>
              <span className="text-xs text-slate-400 num">{r.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
