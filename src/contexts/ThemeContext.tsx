
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeType = 'dark' | 'light' | 'forest';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('light'); // Changed default to light

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as ThemeType | null;
    
    // Check for stored theme first, then default to light
    if (storedTheme && ['dark', 'light', 'forest'].includes(storedTheme)) {
      setTheme(storedTheme);
    } else {
      setTheme('light'); // Default to light instead of checking system preference
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark', 'forest', 'cyberpunk', 'ocean');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
    
    // Ensure text visibility based on theme with high contrast
    if (theme === 'light') {
      root.style.setProperty('--foreground', '222.2 84% 4.9%');
      root.style.setProperty('--background', '0 0% 100%');
      root.style.setProperty('--card', '0 0% 100%');
      root.style.setProperty('--popover', '0 0% 100%');
      root.style.setProperty('--sidebar-accent', '0 0% 96%');
      root.style.setProperty('--sidebar-background', '0 0% 98%');
    } else if (theme === 'dark') {
      // True black for dark mode
      root.style.setProperty('--foreground', '210 40% 98%');
      root.style.setProperty('--background', '0 0% 7%');
      root.style.setProperty('--sidebar-background', '0 0% 5%');
      root.style.setProperty('--card', '0 0% 9%');
      root.style.setProperty('--popover', '0 0% 9%');
    } else if (theme === 'forest') {
      // Improve forest theme for better text contrast
      root.style.setProperty('--foreground', '0 0% 95%');
      root.style.setProperty('--background', '150 30% 10%');
      root.style.setProperty('--sidebar-background', '150 30% 8%');
      root.style.setProperty('--card', '150 30% 12%');
      root.style.setProperty('--popover', '150 30% 12%');
    }
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
