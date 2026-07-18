import { useState, useEffect, createContext, useContext } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

// Simple global state for theme
let themeListeners: Array<(isDark: boolean) => void> = [];
let currentIsDark = true;

const getIsDark = () => {
  const saved = localStorage.getItem('theme');
  return saved !== 'light';
};

export const useTheme = () => {
  const [isDark, setIsDark] = useState(getIsDark);

  useEffect(() => {
    const listener = (v: boolean) => setIsDark(v);
    themeListeners.push(listener);
    return () => { themeListeners = themeListeners.filter(l => l !== listener); };
  }, []);

  return isDark;
};

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(getIsDark);

  useEffect(() => {
    const dark = getIsDark();
    setIsDark(dark);
    currentIsDark = dark;
    if (dark) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    currentIsDark = next;
    themeListeners.forEach(l => l(next));
    if (next) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggle}
      className="relative w-9 h-9 flex items-center justify-center rounded-full border border-foreground/10 bg-foreground/5 hover:border-foreground/20 transition-colors duration-300"
      aria-label="Toggle theme"
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
