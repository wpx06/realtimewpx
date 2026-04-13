import React from 'react';

interface CountryFlagProps {
  countryCode: string;
  countryName?: string;
  className?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({ countryCode, countryName, className = 'w-5 h-4' }) => {
  // Hanya render jika kode negara valid 2 huruf
  const isValid = /^[A-Z]{2}$/i.test(countryCode);
  if (!isValid) {
    return <span className="text-lg">🌍</span>;
  }

  return (
    <img
      src={`/flags/${countryCode.toLowerCase()}.svg`}
      alt={countryName || countryCode}
      className={`object-contain ${className}`}
      onError={(e) => {
        const imgElement = e.target as HTMLImageElement;
        imgElement.style.display = 'none';
        const span = document.createElement('span');
        span.textContent = '🌍';
        span.className = 'text-lg';
        imgElement.parentNode?.insertBefore(span, imgElement);
      }}
    />
  );
}; 