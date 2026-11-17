import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { isDark, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-xl bg-slate-200/90 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-2xs select-none transition-colors ${className}`}
      role="group"
      aria-label="Theme switcher"
    >
      {/* Light Option Button */}
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
          !isDark
            ? 'bg-white text-indigo-700 shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Switch to Light Theme"
        aria-pressed={!isDark}
      >
        <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500' : 'text-slate-500'}`} />
        <span>Light</span>
      </button>

      {/* Dark Option Button */}
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
          isDark
            ? 'bg-indigo-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Switch to Dark Theme"
        aria-pressed={isDark}
      >
        <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-indigo-200' : 'text-slate-500'}`} />
        <span>Dark</span>
      </button>
    </div>
  );
}
