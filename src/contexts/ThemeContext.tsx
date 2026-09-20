import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './useTheme';

function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem('zhiyi-theme');
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const explicitPreference = useRef(savedTheme() !== null);
  const [theme, setTheme] = useState<Theme>(() => savedTheme() ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#17191f' : '#faf8f6');
  }, [theme]);

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const followSystem = (event: MediaQueryListEvent) => {
      if (!explicitPreference.current) setTheme(event.matches ? 'dark' : 'light');
    };
    const syncPreference = (event: StorageEvent) => {
      if (event.key !== 'zhiyi-theme') return;
      const stored = savedTheme();
      explicitPreference.current = stored !== null;
      setTheme(stored ?? (media.matches ? 'dark' : 'light'));
    };
    media.addEventListener('change', followSystem);
    window.addEventListener('storage', syncPreference);
    return () => {
      media.removeEventListener('change', followSystem);
      window.removeEventListener('storage', syncPreference);
    };
  }, []);

  const toggleTheme = () => {
    explicitPreference.current = true;
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('zhiyi-theme', next); } catch { /* The theme still works when browser storage is unavailable. */ }
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
