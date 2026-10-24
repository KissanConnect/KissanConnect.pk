import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BrandLogo } from './BrandLogo';
import { BRAND_KEYS, BRANDS } from '../data/brandLogos';
import { ShieldCheck } from 'lucide-react';

interface TrustedBrandsProps {
  className?: string;
}

export const TrustedBrands: React.FC<TrustedBrandsProps> = ({
  className = ''
}) => {
  const { lang } = useLanguage();

  return (
    <section className={`py-8 sm:py-12 ${className}`}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E3D3A8]/40 text-[#0B3A17] text-xs font-bold uppercase tracking-wider mb-2.5">
            <ShieldCheck className="w-4 h-4 text-[#1B6B2A] shrink-0" />
            <span>{lang === 'ur' ? 'پاکستان کے قابلِ اعتماد زرعی برانڈز' : 'Trusted by Leading Agricultural Brands'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0B3A17]">
            {lang === 'ur' ? 'قومی کھاد اور ٹریکٹر مینوفیکچررز' : 'Nationwide Fertilizer & Tractor Partners'}
          </h2>
        </div>

        {/* 160x100px fixed-size white rounded cards */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {BRAND_KEYS.map((key) => {
            const brand = BRANDS[key];
            if (!brand) return null;
            return (
              <BrandLogo
                key={brand.key}
                brandId={brand.key}
                variant="card"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
