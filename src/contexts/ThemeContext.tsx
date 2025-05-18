
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
    
    // Ensure text visibility based on theme with high contrast
    if (theme === 'light') {
      root.style.setProperty('--foreground', '222.2 84% 4.9%');
      root.style.setProperty('--background', '0 0% 100%');
      root.style.setProperty('--card', '0 0% 100%');
      root.style.setProperty('--popover', '0 0% 100%');
      root.style.setProperty('--sidebar-accent', '0 0% 96%');
    } else {
      // Set different variables for different themes
      if (theme === 'dark') {
        // True black for dark mode instead of blue-ish dark
        root.style.setProperty('--foreground', '210 40% 98%');
        root.style.setProperty('--background', '0 0% 7%');
        root.style.setProperty('--sidebar-background', '0 0% 5%');
        root.style.setProperty('--card', '0 0% 9%');
        root.style.setProperty('--popover', '0 0% 9%');
      } else if (theme === 'forest') {
        // Improve forest theme for better text contrast
        root.style.setProperty('--foreground', '0 0% 95%');
      } else if (theme === 'ocean') {
        // Improve ocean theme for better text contrast
        root.style.setProperty('--foreground', '0 0% 95%');
      } else if (theme === 'cyberpunk') {
        // Improve cyberpunk theme for better text contrast
        root.style.setProperty('--foreground', '0 0% 95%');
      }
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
