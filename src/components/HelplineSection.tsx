import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export interface FounderContact {
  nameEn: string;
  nameUr: string;
  phone: string;
}

export const FOUNDERS: FounderContact[] = [
  {
    nameEn: 'Mr. Muhammad Maarij Mazhar',
    nameUr: 'محمد معارج مظہر',
    phone: '03017575097'
  },
  {
    nameEn: 'Mr. Muhammad Jahanzeb Malhan',
    nameUr: 'محمد جہانزیب ملہان',
    phone: '03093448696'
  },
  {
    nameEn: 'Mr. Netik Vasandani',
    nameUr: 'نتک واسندانی',
    phone: '03555660571'
  }
];

export const OFFICE_LOCATION = {
  nameEn: 'FFC Township, Mirpur Mathelo',
  nameUr: 'ایف ایف سی ٹاؤن شپ، میرپور ماتھیلو',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=FFC+Township+Mirpur+Mathelo'
};

// Small 20px WhatsApp icon
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
    className={`inline-block shrink-0 align-middle text-[#25D366] hover:opacity-80 transition-opacity ${className}`}
    aria-label="WhatsApp"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.11 7.44C8.94 7.44 8.68 7.5 8.45 7.74C8.22 8 7.58 8.6 7.58 9.83C7.58 11.06 8.47 12.25 8.6 12.42C8.72 12.59 10.36 15.13 12.87 16.21C13.47 16.47 13.93 16.62 14.29 16.74C14.89 16.93 15.44 16.9 15.87 16.84C16.36 16.77 17.37 16.23 17.58 15.64C17.79 15.05 17.79 14.54 17.73 14.44C17.67 14.34 17.5 14.28 17.25 14.15C17 14.03 15.77 13.42 15.54 13.34C15.31 13.26 15.14 13.22 14.97 13.47C14.8 13.72 14.33 14.28 14.19 14.44C14.04 14.6 13.9 14.62 13.65 14.5C13.4 14.37 12.55 14.1 11.54 13.2C10.75 12.5 10.22 11.63 10.06 11.37C9.91 11.12 10.05 10.98 10.17 10.86C10.28 10.75 10.42 10.57 10.55 10.42C10.68 10.27 10.72 10.16 10.8 10C10.88 9.83 10.84 9.68 10.78 9.56C10.72 9.44 10.22 8.21 10.01 7.71C9.81 7.22 9.61 7.29 9.45 7.28C9.31 7.28 9.14 7.28 8.97 7.28L9.11 7.44Z" />
  </svg>
);

interface HelplineSectionProps {
  layout?: 'columns' | 'footer' | 'cards' | 'contact';
  className?: string;
  theme?: 'dark' | 'light';
}

export const HelplineSection: React.FC<HelplineSectionProps> = ({
  layout = 'columns',
  className = '',
  theme
}) => {
  const { lang } = useLanguage();
  const isUrdu = lang === 'ur';

  // In footer, default to dark theme (#FFF8E1 cream text on dark green)
  // Elsewhere, default to light theme (dark text #1A1A1A on cream background)
  const isDark = theme ? theme === 'dark' : layout === 'footer';

  const headingClass = isDark
    ? 'text-[16px] font-bold text-[#FFF8E1] mb-2'
    : 'text-[16px] font-bold text-[#0B3A17] mb-2';

  const textClass = isDark
    ? 'text-[14px] text-[#FFF8E1]/90'
    : 'text-[14px] text-[#1A1A1A]';

  const linkClass = isDark
    ? 'text-[#FFF8E1] underline hover:text-[#F2A900] transition-colors'
    : 'text-[#1B6B2A] underline hover:text-[#0F3D1E] transition-colors';

  const spacingClass = layout === 'contact' ? 'gap-8 md:gap-12' : 'gap-6';

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 ${spacingClass} ${className}`}
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Column 1: Helpline */}
      <div>
        <h4 className={headingClass}>
          {isUrdu ? 'ہماری ہیلپ لائن' : 'Our Helpline'}
        </h4>
        <div className="space-y-1.5">
          {FOUNDERS.map((founder) => (
            <p key={founder.phone} className={`${textClass} leading-relaxed`}>
              <span>
                {isUrdu ? `${founder.nameUr} (بانی): ` : `${founder.nameEn} (Founder): `}
              </span>
              <a
                href={`tel:${founder.phone}`}
                className={linkClass}
                dir="ltr"
              >
                {founder.phone}
              </a>
              <span className="inline-block mx-2">
                <a
                  href={`https://wa.me/92${founder.phone.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp"
                  className="inline-flex items-center align-middle"
                >
                  <WhatsAppIcon />
                </a>
              </span>
            </p>
          ))}
        </div>
      </div>

      {/* Column 2: Office Location */}
      <div>
        <h4 className={headingClass}>
          {isUrdu ? 'ہمارے دفتر کا پتہ' : 'Our Office Location'}
        </h4>
        <p className={`${textClass} leading-relaxed`}>
          {isUrdu ? OFFICE_LOCATION.nameUr : OFFICE_LOCATION.nameEn}
        </p>
        <p className="mt-1">
          <a
            href={OFFICE_LOCATION.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkClass} text-[14px] inline-block`}
          >
            {isUrdu ? 'گوگل میپس میں کھولیں' : 'Open in Google Maps'}
          </a>
        </p>

        {/* Email */}
        <div className="mt-3">
          <h4 className={headingClass}>
            {isUrdu ? 'ای میل' : 'Email'}
          </h4>
          <p className={`${textClass} leading-relaxed`}>
            <a
              href="mailto:KissanConnect.pk@gmail.com"
              className={`${linkClass} text-[14px] inline-block`}
              dir="ltr"
            >
              KissanConnect.pk@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
