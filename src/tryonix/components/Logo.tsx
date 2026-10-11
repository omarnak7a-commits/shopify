interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  showWordmark?: boolean;
  size?: number;
}

export function LogoMark({ className = '', variant = 'dark', size = 32 }: Omit<LogoProps, 'showWordmark'> & { size?: number }) {
  const fg = variant === 'dark' ? '#171717' : '#FAFAF8';
  const bg = variant === 'dark' ? '#FAFAF8' : '#171717';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="7" fill={fg} />
      <path
        d="M16 6.5c-1.2 0-2.2 1-2.2 2.2 0 .9.5 1.7 1.3 2v1.3L7.5 21.2c-.4.5-.1 1.3.6 1.3h15.8c.7 0 1-.8.6-1.3L16.9 12V10.7c.8-.3 1.3-1.1 1.3-2 0-1.2-1-2.2-2.2-2.2z"
        fill={bg}
      />
      <circle cx="16" cy="8.4" r="1" fill={fg} />
    </svg>
  );
}

export function Logo({ className = '', variant = 'dark', showWordmark = true, size = 32 }: LogoProps) {
  const textColor = variant === 'dark' ? 'text-ink' : 'text-canvas';
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} variant={variant} />
      {showWordmark && (
        <span className={`font-display text-xl font-semibold tracking-tighter2 ${textColor}`}>
          TryOnix
        </span>
      )}
    </div>
  );
}
