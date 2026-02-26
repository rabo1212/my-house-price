/** SVG icons — Lucide-style, 24x24 viewBox */

const s = { strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none', stroke: 'currentColor' };

export function IconSearch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export function IconBuilding({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22V12h6v10M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01" />
    </svg>
  );
}

export function IconCalculator({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h8M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  );
}

export function IconTrendingUp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

export function IconMapPin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconHome({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function IconBarChart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

export function IconInfo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...s}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
