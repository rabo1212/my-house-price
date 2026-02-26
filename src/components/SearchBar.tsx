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
      <div className={`flex items-center bg-white border border-teal-200 rounded-xl focus-within:ring-2 focus-within:ring-teal-400 focus-within:border-teal-400 transition-all duration-200 ${isLg ? 'h-14 text-base px-5 shadow-sm' : 'h-11 text-sm px-4'}`}>
        <IconSearch className="w-5 h-5 text-teal-400 mr-2.5 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={e => { if (e.key === 'Enter' && results.length) go(results[0].code); }}
          placeholder="지역명 또는 코드로 검색 (예: 강남구, 송파구)"
          className="flex-1 bg-transparent outline-none placeholder:text-teal-400/60 text-teal-900"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1.5 w-full bg-white rounded-xl shadow-lg border border-teal-100 overflow-hidden">
          {results.map(r => (
            <button
              key={r.code}
              onClick={() => go(r.code)}
              className="w-full px-4 py-3 text-left hover:bg-teal-50 flex items-center gap-3 text-sm cursor-pointer transition-colors duration-150"
            >
              <IconMapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span className="font-medium text-teal-800">{r.name}</span>
              <span className="text-xs text-teal-400 num ml-auto">{r.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
