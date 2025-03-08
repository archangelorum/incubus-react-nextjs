'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-lg ${
          theme === 'light'
            ? 'bg-foreground text-background'
            : 'hover:bg-foreground/10'
        }`}
        aria-label="Light mode"
      >
        <Sun className="h-5 w-5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-lg ${
          theme === 'dark'
            ? 'bg-foreground text-background'
            : 'hover:bg-foreground/10'
        }`}
        aria-label="Dark mode"
      >
        <Moon className="h-5 w-5" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-lg ${
          theme === 'system'
            ? 'bg-foreground text-background'
            : 'hover:bg-foreground/10'
        }`}
        aria-label="System theme"
      >
        <Monitor className="h-5 w-5" />
      </button>
    </div>
  );
} 