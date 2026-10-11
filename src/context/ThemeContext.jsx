import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

// Same behaviour as the original pages: start from the OS colour scheme,
// toggle the `dark` class on <html>.
function getInitialDark() {
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(getInitialDark);

  // layout effect: apply the class before first paint (no light-mode flash)
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((d) => !d), []);
  const value = useMemo(() => ({ darkMode, toggleDarkMode }), [darkMode, toggleDarkMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
