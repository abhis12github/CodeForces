import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const ModeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    // Toggle between light and dark theme/mode
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  return (
    <div
      className="rounded-full p-[6px] cursor-pointer w-11"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"
        } mode`}
    >
      {theme === "dark" ? <Moon className='w-5 h-5' /> : <Sun className='w-5 h-5' />}
    </div>
  );
}

export default ModeToggle;
