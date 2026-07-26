import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex h-8 w-8 items-center justify-center rounded-lg
        text-gray-500 hover:text-gray-800 hover:bg-gray-100
        dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700
        transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {/* Sun icon — shown in dark mode */}
      <svg
        className={`absolute h-[18px] w-[18px] transition-all duration-300 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-75'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="4" />
        <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>

      {/* Moon icon — shown in light mode */}
      <svg
        className={`absolute h-[18px] w-[18px] transition-all duration-300 ${
          isDark ? 'opacity-0 -rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        />
      </svg>
    </button>
  );
}
