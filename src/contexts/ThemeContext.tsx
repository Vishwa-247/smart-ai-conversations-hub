
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeType = 'dark' | 'light' | 'cyberpunk' | 'forest' | 'ocean';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as ThemeType | null;
    
    // Check for stored theme or system preference
    if (storedTheme && ['dark', 'light', 'cyberpunk', 'forest', 'ocean'].includes(storedTheme)) {
      setTheme(storedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    // Update the data theme attribute and store in localStorage
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark', 'cyberpunk', 'forest', 'ocean');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
