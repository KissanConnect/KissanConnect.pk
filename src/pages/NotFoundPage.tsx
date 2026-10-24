import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Home, ShoppingBag } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { lang, t } = useLanguage();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6">
        <img 
          src="/assets/aistudio/Kisan_Connect_Agricultural_Emblem_4927b7a8.png" 
          alt="Kissan Connect Logo" 
          className="w-20 h-20 rounded-full mx-auto shadow-xl border-2 border-[#81C784]/60 bg-white object-cover" 
        />

        <div className="space-y-2">
          <span className="text-4xl sm:text-6xl font-black text-[#1B5E20]">404</span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">
            {lang === 'ur' ? 'صفحہ نہیں مل سکا' : 'Page Not Found'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {lang === 'ur'
              ? 'معذرت، جو صفحہ آپ تلاش کر رہے ہیں وہ موجود نہیں ہے یا اس کا پتہ تبدیل کر دیا گیا ہے۔'
              : 'Sorry, the page you are looking for does not exist or has been relocated.'}
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/"
            className="px-5 py-3 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{t.navHome}</span>
          </Link>

          <Link
            to="/market"
            className="px-5 py-3 bg-[#F9A825] hover:bg-[#F57F17] text-[#1B5E20] font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#1B5E20]" />
            <span>{t.navMarket}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
