import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { isDark, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-xl bg-[#DDD0C8]/70 dark:bg-charcoal-800 border border-[#DDD0C8] dark:border-charcoal-600 shadow-2xs select-none transition-colors ${className}`}
      role="group"
      aria-label="Theme switcher"
    >
      {/* Light Option Button */}
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
          !isDark
            ? 'bg-white text-[#323232] shadow-xs'
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
            ? 'bg-[#323232] text-[#DDD0C8] shadow-xs border border-charcoal-600'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Switch to Dark Theme"
        aria-pressed={isDark}
      >
        <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-[#DDD0C8]' : 'text-slate-500'}`} />
        <span>Dark</span>
      </button>
    </div>
  );
}
