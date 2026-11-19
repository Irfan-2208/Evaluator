import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('examiner_theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch (e) {}
    return 'light';
  });

  const applyTheme = (mode) => {
    const root = document.documentElement;
    const body = document.body;
    if (mode === 'dark') {
      root.classList.add('dark');
      if (body) {
        body.classList.add('dark');
        body.style.backgroundColor = '#1a1a1a';
        body.style.color = '#ede4da';
      }
    } else {
      root.classList.remove('dark');
      if (body) {
        body.classList.remove('dark');
        body.style.backgroundColor = '#f6f2ee';
        body.style.color = '#323232';
      }
    }
    try {
      localStorage.setItem('examiner_theme', mode);
    } catch (e) {}
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (mode) => {
    const nextMode = mode === 'dark' ? 'dark' : 'light';
    applyTheme(nextMode);
    setThemeState(nextMode);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light',
      toggleTheme: () => {},
      isDark: false,
      setTheme: () => {},
    };
  }
  return context;
}
