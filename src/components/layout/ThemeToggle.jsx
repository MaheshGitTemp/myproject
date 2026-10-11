import { useTheme } from '../../context/ThemeContext.jsx';

// ariaLabel differs in capitalisation between original pages ("Toggle Dark Mode" vs "Toggle dark mode").
export default function ThemeToggle({ ariaLabel = 'Toggle Dark Mode' }) {
  const { darkMode, toggleDarkMode } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center"
      aria-label={ariaLabel}
    >
      <i aria-hidden="true" className={`fas ${darkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-slate-600'}`} />
    </button>
  );
}
