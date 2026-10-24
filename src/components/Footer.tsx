import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { HelplineSection } from './HelplineSection';
import { 
  Heart, 
  ShieldAlert, 
  ShoppingBag
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-[#0F3D1E] text-[#FFF8E1] border-t border-[#1B6B2A] pt-12 pb-24 xl:pb-12 mt-16 text-start">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Grid: Brand & Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#1B6B2A]/60">
          
          {/* Brand Col */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/aistudio/Kisan_Connect_Agricultural_Emblem_4927b7a8.png" 
                alt="Kissan Connect Logo" 
                className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-[#F2A900] bg-white" 
              />
              <div>
                <span className="font-extrabold text-xl text-white block">
                  {lang === 'ur' ? 'کسان کنیکٹ' : 'Kissan Connect'}
                </span>
                <span className="text-xs text-[#F2A900] font-medium">
                  {lang === 'ur' ? 'پاکستان کا ڈیجیٹل زرعی نیٹ ورک' : 'Pakistan\'s Digital Agri Network'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#FFF8E1]/80 leading-relaxed max-w-md">
              {lang === 'ur'
                ? 'کسان کنیکٹ پاکستانی کاشتکاروں کو براہ راست غلہ و مشینری بیوپاریوں سے جوڑتا ہے، تاکہ پیداواری لاگت کم اور منافع میں اضافہ ہو۔'
                : 'Connecting Pakistani farmers directly with grain wholesalers and machinery dealers for transparent pricing, live weather, and digital farm management.'}
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B3A17] text-[#FFF8E1] text-xs font-semibold border border-[#1B6B2A]">
                <Heart className="w-3.5 h-3.5 text-[#F2A900] fill-[#F2A900]" />
                {t.madeForPakistan}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-black text-[#F2A900] uppercase tracking-wider mb-3">
              {lang === 'ur' ? 'اہم سیکشنز' : 'Platform Links'}
            </h4>
            <ul className="space-y-2 text-xs text-[#FFF8E1]/85">
              <li>
                <Link to="/market" className="hover:text-[#F2A900] font-bold transition-colors flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#F2A900]" />
                  <span>{t.navMarket}</span>
                </Link>
              </li>
              <li>
                <Link to="/fertilizer" className="hover:text-[#F2A900] transition-colors">
                  {t.navFertilizer}
                </Link>
              </li>
              <li>
                <Link to="/tractors" className="hover:text-[#F2A900] transition-colors">
                  {t.navTractors}
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-[#F2A900] transition-colors">
                  {t.navSchemes}
                </Link>
              </li>
              <li>
                <Link to="/weather" className="hover:text-[#F2A900] transition-colors">
                  {t.navWeather}
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-[#F2A900] transition-colors">
                  {t.navNews}
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="hover:text-[#F2A900] transition-colors">
                  {t.navCalendar}
                </Link>
              </li>
              <li>
                <Link to="/learn" className="hover:text-[#F2A900] transition-colors">
                  {t.navLearn}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & About Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-black text-[#F2A900] uppercase tracking-wider mb-3">
              {lang === 'ur' ? 'معلومات و رابطہ' : 'Support & Legal'}
            </h4>
            <ul className="space-y-2 text-xs text-[#FFF8E1]/85">
              <li>
                <Link to="/about" className="hover:text-[#F2A900] transition-colors">
                  {t.aboutUs}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F2A900] transition-colors font-bold text-white">
                  {t.contactUs}
                </Link>
              </li>
              <li>
                <Link to="/suggestions" className="hover:text-[#F2A900] transition-colors">
                  {t.navSuggestions}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#F2A900] transition-colors">
                  {t.termsOfService}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#F2A900] transition-colors">
                  {t.privacyPolicy}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* PART 1: HELPLINE AND OFFICE LOCATION (two simple columns on desktop, stacked on mobile) */}
        <div className="pb-6 border-b border-[#1B6B2A]/60">
          <HelplineSection layout="footer" />
        </div>

        {/* Bottom Disclaimer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FFF8E1]/70">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldAlert className="w-4 h-4 text-[#F2A900] shrink-0" />
            <span>{t.indicativePricesDisclaimer}</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Kissan Connect. {t.allRightsReserved}</span>
          </div>
        </div>

        {/* Small Notice at very bottom */}
        <div className="pt-4 border-t border-[#1B6B2A]/40 text-center">
          <p
            className={`text-[12px] sm:text-[13px] text-[#FFF8E1]/80 max-w-3xl mx-auto leading-relaxed ${
              lang === 'ur' ? 'font-urdu' : 'font-english'
            }`}
            dir={lang === 'ur' ? 'rtl' : 'ltr'}
          >
            {lang === 'ur'
              ? 'کسان کنیکٹ ایک نیا پلیٹ فارم ہے اور اس کی ترقی اور بہتری کا کام جاری ہے۔ ہو سکتا ہے کہ آپ کو کبھی کوئی خرابی یا غلطی نظر آئے، اس کے لیے ہم معذرت خواہ ہیں۔ آپ کے صبر اور تعاون کا شکریہ۔'
              : 'Kissan Connect is a new platform and is still being developed and improved. You may occasionally notice a bug or error, and we apologize for any inconvenience. Thank you for your patience and support.'}
          </p>
        </div>

      </div>
    </footer>
  );
};
