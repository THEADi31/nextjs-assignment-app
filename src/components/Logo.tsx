import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export function Logo({ className = '', size = 'md', href = '/' }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      {/* App Logo Icon */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-md shadow-orange-500/25 ring-1 ring-white/20`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white transform -translate-y-[0.5px]"
        >
          {/* Chef Hat & Food Cloche combination */}
          <path d="M18 10h-1.26A8 8 0 1 0 3 16.3V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1.7A8 8 0 0 0 18 10z" />
          <path d="M12 2v3" />
          <circle cx="12" cy="14" r="1.5" fill="currentColor" />
          <path d="M7 17h10" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <div className={`font-black ${textSizes[size]} tracking-tight flex items-center gap-1`}>
          <span>Campus</span>
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Bite
          </span>
        </div>
        <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          Canteen Pre-Orders
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-90 inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
