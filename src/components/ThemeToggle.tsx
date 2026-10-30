import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [isLight, setIsLight] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vf_theme') === 'light';
    }
    return false;
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isLight) {
        document.documentElement.classList.add('light-theme');
        localStorage.setItem('vf_theme', 'light');
      } else {
        document.documentElement.classList.remove('light-theme');
        localStorage.setItem('vf_theme', 'dark');
      }
    }
  }, [isLight]);

  return (
    <button
      onClick={() => setIsLight(prev => !prev)}
      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer"
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {isLight ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-300" />}
    </button>
  );
};
