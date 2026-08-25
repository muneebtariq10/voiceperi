import React from 'react';

interface LogoProps {
  theme?: 'light' | 'dark';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ theme = 'light', className = '' }) => {
  const textColor = theme === 'light' ? 'text-[#1e293b]' : 'text-white';
  const blueColor = '#3b82f6'; // Tailwind blue-500

  return (
    <div className={`flex items-center font-extrabold tracking-tighter ${textColor} ${className}`} style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <span>Soner</span>
      <span className="relative inline-block">
        <span className="opacity-0">v</span>
        <span className="absolute left-0 top-0 w-full h-full text-current">v</span>
        <span className="absolute left-0 top-0 w-[50%] h-full overflow-hidden" style={{ color: blueColor }}>v</span>
      </span>
      <span>ant</span>
    </div>
  );
};
