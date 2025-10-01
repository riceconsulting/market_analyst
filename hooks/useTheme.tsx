import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Define the possible theme values
type Theme = 'light' | 'dark';

// Define the shape of the context data.
interface ThemeContextProps {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

// Create the context. It should not be used without a provider.
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// The provider component that will wrap our application
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State to hold the current theme. We determine the initial theme
  // from localStorage or system settings to prevent a flash of the wrong theme.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme as Theme;
    }
    // Default to light mode, ignoring system preference.
    return 'light';
  });

  // This effect runs whenever the theme state changes.
  // It applies the theme to the app and persists the choice.
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Failed to save theme to localStorage', error);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// A custom hook for components to easily access and control the theme.
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  const { theme, setTheme } = context;

  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
};