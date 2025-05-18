
import { useEffect, useRef } from 'react';
import { Check, MoonIcon, SunIcon, Laptop, Leaf, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import gsap from 'gsap';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThemeOption {
  value: 'dark' | 'light' | 'cyberpunk' | 'forest' | 'ocean';
  label: string;
  icon: React.ElementType;
  description: string;
}

const themes: ThemeOption[] = [
  {
    value: 'dark',
    label: 'Dark',
    icon: MoonIcon,
    description: 'Dark background with purple accents'
  },
  {
    value: 'light',
    label: 'Light',
    icon: SunIcon,
    description: 'White background with purple accents'
  },
  {
    value: 'cyberpunk',
    label: 'Cyberpunk',
    icon: Laptop,
    description: 'Neon pink and blue accents'
  },
  {
    value: 'forest',
    label: 'Forest',
    icon: Leaf,
    description: 'Nature-inspired green palette'
  },
  {
    value: 'ocean',
    label: 'Ocean',
    icon: Waves,
    description: 'Calming blue color palette'
  }
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (buttonRef.current) {
      gsap.fromTo(
        buttonRef.current,
        { rotation: -90, opacity: 0 },
        { rotation: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, [theme]);

  const activeTheme = themes.find(t => t.value === theme) || themes[0];
  const Icon = activeTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          ref={buttonRef}
          variant="ghost" 
          size="icon"
          className="rounded-full h-8 w-8 hover:bg-accent/30"
        >
          <Icon className="h-[1.1rem] w-[1.1rem] text-foreground" />
          <span className="sr-only">Change theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl overflow-hidden">
        {themes.map((themeOption) => {
          const ThemeIcon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`flex items-center justify-between py-2 px-3 cursor-pointer rounded-lg ${
                theme === themeOption.value ? 'bg-accent/25' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <ThemeIcon className="h-4 w-4 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">{themeOption.label}</p>
                  <p className="text-xs text-foreground/70">{themeOption.description}</p>
                </div>
              </div>
              {theme === themeOption.value && (
                <Check className="h-4 w-4 text-foreground" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
