import React from 'react';

interface LogoProps {
  theme?: 'light' | 'dark';
  layout?: 'horizontal' | 'stacked';
  className?: string;
  iconClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  layout = 'horizontal', 
  className = '',
  iconClassName = '' 
}) => {
  const textColor = theme === 'dark' ? 'text-white' : 'text-foreground';
  const blueColor = '#3b82f6'; // Tailwind blue-500

  return (
    <div className={`flex ${layout === 'stacked' ? 'flex-col items-center justify-center gap-4' : 'items-center gap-2'} font-extrabold tracking-tighter ${textColor} ${className}`} style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      
      {/* Waveform Icon */}
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={layout === 'stacked' ? 'w-24 h-24 sm:w-32 sm:h-32 mb-2' : `w-[1.2em] h-[1.2em] ${iconClassName}`}
      >
        <path d="M 12 55 C 25 55, 30 20, 50 40 C 65 55, 60 85, 75 85" stroke="url(#teal-grad)" strokeWidth="12" strokeLinecap="round" />
        <path d="M 25 15 C 40 15, 35 45, 50 60 C 70 80, 75 45, 88 45" stroke="url(#purple-grad)" strokeWidth="12" strokeLinecap="round" />
        
        <defs>
          <linearGradient id="teal-grad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id="purple-grad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#a855f7" />
            <stop offset="1" stopColor="#7e22ce" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex items-center">
        <span>Soner</span>
        <span className="relative inline-block">
          <span className="opacity-0">v</span>
          <span className="absolute left-0 top-0 w-full h-full text-current">v</span>
          <span className="absolute left-0 top-0 w-[50%] h-full overflow-hidden" style={{ color: blueColor }}>v</span>
        </span>
        <span>ant</span>
      </div>
    </div>
  );
};
