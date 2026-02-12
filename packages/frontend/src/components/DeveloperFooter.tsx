interface DeveloperFooterProps {
  variant?: 'dark' | 'light';
}

export default function DeveloperFooter({ variant = 'dark' }: DeveloperFooterProps) {
  const isDark = variant === 'dark';

  return (
    <div
      className={`py-3 text-center text-sm ${
        isDark ? 'text-navy-500' : 'text-gray-500'
      }`}
      data-testid="developer-footer"
    >
      Developed by{' '}
      <a
        href="https://ManiG.dev"
        target="_blank"
        rel="noopener noreferrer"
        className={`font-medium transition-colors ${
          isDark
            ? 'text-navy-300 hover:text-primary-400'
            : 'text-gray-700 hover:text-indigo-600'
        }`}
        aria-label="Visit ManiG's website"
      >
        ManiG
      </a>{' '}
      with{' '}
      <span className="text-red-500" aria-label="love">
        &#10084;
      </span>
    </div>
  );
}
