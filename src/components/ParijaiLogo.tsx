import React, { useState } from 'react';

interface ParijaiLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export const ParijaiLogo: React.FC<ParijaiLogoProps> = ({
  size = 44,
  className = '',
  showWordmark = false,
  wordmarkClassName = ''
}) => {
  const [imageSrc, setImageSrc] = useState<string>('/parijai-logo.png');

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Pristine, untouched circular official logo */}
      <img
        src={imageSrc}
        alt="Parijay Group of Hotels Logo"
        width={size}
        height={size}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="rounded-full object-cover shrink-0 select-none drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        referrerPolicy="no-referrer"
        onError={() => {
          if (imageSrc === '/parijai-logo.png') {
            setImageSrc('/business-logo.jpeg');
          } else if (imageSrc === '/business-logo.jpeg') {
            setImageSrc('/business logo.jpeg');
          }
        }}
      />

      {/* Optional Wordmark Text Alongside Logo */}
      {showWordmark && (
        <div className={`flex flex-col ${wordmarkClassName}`}>
          <div className="flex items-center gap-1.5 flex-nowrap">
            <span className="font-brand-cinzel text-lg sm:text-xl font-bold tracking-[0.08em] uppercase text-luxury-gold">
              PARIJAY GROUP OF HOTELS
            </span>
          </div>
          <span className="text-[9px] tracking-[0.2em] uppercase font-sans font-semibold text-amber-200/90">
            Sikkim & Bengal · Gangtok & Kalyani
          </span>
        </div>
      )}
    </div>
  );
};
