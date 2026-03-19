'use client';

import { useEffect, useState } from 'react';
import * as Icons from '@phosphor-icons/react';
import { THEME_MEDIA_QUERY, THEME_STORAGE_KEY, cn } from '@/lib/utils';

const THEME_SCRIPT = `
  (function(){
    var doc = document.documentElement;
    var theme = localStorage.getItem("${THEME_STORAGE_KEY}") || "dark";
    doc.classList.remove("dark","light");
    if(theme==="system"){
      doc.classList.add(window.matchMedia("${THEME_MEDIA_QUERY}").matches?"dark":"light");
    } else {
      doc.classList.add(theme);
    }
  })();
`.trim();

export type ThemeMode = 'dark' | 'light' | 'system';

function applyTheme(theme: ThemeMode) {
  const doc = document.documentElement;
  doc.classList.remove('dark', 'light');
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  if (theme === 'system') {
    doc.classList.add(window.matchMedia(THEME_MEDIA_QUERY).matches ? 'dark' : 'light');
  } else {
    doc.classList.add(theme);
  }
}

export function ApplyThemeScript() {
  return <script id="theme-script" dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'dark';
    setTheme(stored);
  }, []);

  function handle(t: ThemeMode) {
    applyTheme(t);
    setTheme(t);
  }

  return (
    <div
      className={cn(
        'flex flex-row divide-x divide-white/10 overflow-hidden rounded-full border border-white/10 bg-black/40',
        className
      )}
    >
      <span className="sr-only">Theme toggle</span>
      {([
        { mode: 'dark' as ThemeMode, icon: Icons.MoonIcon, label: 'Dark' },
        { mode: 'light' as ThemeMode, icon: Icons.SunIcon, label: 'Light' },
        { mode: 'system' as ThemeMode, icon: Icons.MonitorIcon, label: 'System' },
      ] as const).map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          type="button"
          onClick={() => handle(mode)}
          className="cursor-pointer px-2 py-1 hover:bg-white/5 transition-colors"
          title={label}
        >
          <span className="sr-only">{label}</span>
          <Icon size={14} weight="bold" className={cn('text-white', theme !== mode && 'opacity-25')} />
        </button>
      ))}
    </div>
  );
}
