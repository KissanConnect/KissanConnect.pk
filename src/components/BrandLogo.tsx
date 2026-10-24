import React from 'react';
import { lookupBrand, BrandData, BRANDS } from '../data/brandLogos';

export interface BrandLogoProps {
  brandId?: string;
  brandName?: string;
  domain?: string;
  variant?: 'card' | 'compact' | 'inline';
  showName?: boolean;
  size?: number | string;
  className?: string;
  cardClassName?: string;
}

/**
 * BrandLogo: Text-only display component.
 * Displays company name in clean, bold text on the 160x100px white rounded card (no images, no SVG badges, no favicons).
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  brandId,
  brandName,
  domain,
  variant,
  showName = false,
  size,
  className = '',
  cardClassName = ''
}) => {
  const brand: BrandData = lookupBrand(brandId || brandName || domain);

  const isCardMode = variant === 'card' || showName || (!size && variant !== 'compact' && variant !== 'inline');

  // 1. Fixed size 160x100px white rounded card with clean bold text, no image
  if (isCardMode) {
    return (
      <div
        className={`w-[160px] h-[100px] bg-white rounded-2xl p-4 border border-[#E3D3A8] shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center overflow-hidden shrink-0 group ${cardClassName} ${className}`}
      >
        <span className="font-black text-base sm:text-lg text-[#0B3A17] text-center select-none leading-tight tracking-wide group-hover:scale-105 transition-transform">
          {brand.name}
        </span>
        {brand.fullName && brand.fullName !== brand.name && (
          <span className="text-[10px] text-gray-500 font-medium text-center line-clamp-1 mt-1">
            {brand.fullName}
          </span>
        )}
      </div>
    );
  }

  // 2. Compact / Inline text fallback (plain bold text)
  return (
    <span
      className={`font-bold text-[#1A1A1A] inline-block ${className}`}
      title={brand.fullName || brand.name}
    >
      {brand.name}
    </span>
  );
};

export const BRAND_DIRECTORY = BRANDS;
export { lookupBrand };
