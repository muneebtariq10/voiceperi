import React from 'react';

interface LogoProps {
  theme?: 'light' | 'dark';
  layout?: 'horizontal' | 'stacked';
  className?: string;
  iconClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  theme = 'light',
  layout = 'horizontal', 
  className = '',
  iconClassName = '' 
}) => {
  const textColor = theme === 'dark' ? 'text-white' : 'text-foreground';

  return (
    <div className={`flex ${layout === 'stacked' ? 'flex-col items-center justify-center gap-4' : 'items-center gap-2.5'} font-extrabold tracking-tight ${textColor} ${className}`} style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      
      {/* Modern Premium Waveform/Equalizer Icon */}
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={layout === 'stacked' ? 'w-24 h-24 sm:w-28 sm:h-28 mb-2 drop-shadow-xl' : `w-[1.4em] h-[1.4em] ${iconClassName}`}
      >
        <rect x="20" y="35" width="14" height="30" rx="7" fill="url(#teal-grad)" />
        <rect x="43" y="15" width="14" height="70" rx="7" fill="url(#mix-grad)" />
        <rect x="66" y="45" width="14" height="40" rx="7" fill="url(#purple-grad)" />
        
        {/* Abstract connection dot */}
        <circle cx="27" cy="20" r="5" fill="#14b8a6" />
        
        <defs>
          <linearGradient id="teal-grad" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id="mix-grad" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#14b8a6" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="purple-grad" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#a855f7" />
            <stop offset="1" stopColor="#7e22ce" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex items-center">
        <span>Soner</span>
        <span className="text-[var(--primary)]">vant</span>
      </div>
    </div>
  );
};
