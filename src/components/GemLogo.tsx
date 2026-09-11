import React from 'react';
import gemLogoUrl from '../assets/gem-logo.png';

export const GemLogo: React.FC<{ className?: string }> = ({ className = 'h-9 w-9' }) => (
  <img src={gemLogoUrl} alt="Global Engine Maintenance" className={`${className} object-contain`} />
);
