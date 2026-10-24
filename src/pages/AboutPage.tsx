import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { HelplineSection } from '../components/HelplineSection';
import { TrustedBrands } from '../components/TrustedBrands';
import { Sprout, Users, Award, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  const { lang, t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <img 
          src="/assets/aistudio/Kisan_Connect_Agricultural_Emblem_4927b7a8.png" 
          alt="Kissan Connect Official Emblem" 
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto shadow-xl border-4 border-[#F2A900] bg-white object-cover" 
        />
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFBEF] border border-[#E3D3A8] text-[#0B3A17] text-xs font-bold uppercase tracking-wider">
          <Heart className="w-4 h-4 text-[#F2A900]" />
          <span>Made for Pakistan's Agriculture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#0B3A17]">
          {lang === 'ur' ? 'کسان کنیکٹ: کسانوں کی طاقت، خوشحال پاکستان' : 'Connecting Pakistani Agriculture from Seed to Sale'}
        </h1>
        <p className="text-sm sm:text-base text-[#3E3E3E] leading-relaxed">
          {lang === 'ur'
            ? 'کسان کنیکٹ ایک ایسا خود مختار ڈیجیٹل پل ہے جو پاکستانی کاشتکاروں کو مارکیٹ کے حقیقی ریٹس، جدید زرعی معلومات اور غلہ بیوپاریوں سے براہ راست جوڑتا ہے۔'
            : 'Kissan Connect is Pakistan\'s dedicated digital agricultural platform built to empower growers, eliminate extortionate middlemen, and provide transparent price discovery across Punjab, Sindh, KPK, and Balochistan.'}
        </p>
      </div>

      {/* Core Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#FFFBEF] rounded-3xl border border-[#E3D3A8] shadow-md space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0F3D1E] text-[#FFF8E1] flex items-center justify-center font-bold">
            <Sprout className="w-6 h-6 text-[#F2A900]" />
          </div>
          <h3 className="text-lg font-black text-[#0B3A17]">
            {lang === 'ur' ? '1. علم اور آگاہی' : '1. Scientific Knowledge'}
          </h3>
          <p className="text-xs text-[#3E3E3E] leading-relaxed">
            {lang === 'ur'
              ? 'سائنسی بنیادوں پر فصلوں کی کاشت، موسمیاتی ایڈوائزری اور کھاد کے متوازن استعمال کی مفت رہنمائی۔'
              : 'Empowering growers with localized agronomic manuals, spray timings, and weather-aware irrigation recommendations.'}
          </p>
        </div>

        <div className="p-6 bg-[#FFFBEF] rounded-3xl border border-[#E3D3A8] shadow-md space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F2A900] text-[#1A1A1A] flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-[#0B3A17]">
            {lang === 'ur' ? '2. مالی خود مختاری' : '2. Financial Transparency'}
          </h3>
          <p className="text-xs text-[#3E3E3E] leading-relaxed">
            {lang === 'ur'
              ? 'کھاد اور ٹریکٹروں کی تصدیق شدہ قیمتیں، فارم کھاتہ بک اور سرکاری کسان کارڈ سبسیڈی کی بروقت معلومات۔'
              : 'Delivering real-time fertilizer mandi rates, tractor installment calculators, and digital farm ledger tracking.'}
          </p>
        </div>

        <div className="p-6 bg-[#FFFBEF] rounded-3xl border border-[#E3D3A8] shadow-md space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1B6B2A] text-white flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-[#0B3A17]">
            {lang === 'ur' ? '3. براہ راست منڈی تجارت' : '3. Commission-Free Mandi'}
          </h3>
          <p className="text-xs text-[#3E3E3E] leading-relaxed">
            {lang === 'ur'
              ? 'کسان اور ہول سیل خریدار کے درمیان براہ راست رابطہ، بغیر کسی آڑھتی فیس یا کٹوتی کے۔'
              : 'Direct peer-to-peer marketplace with verified mobile numbers and zero transaction cuts.'}
          </p>
        </div>
      </div>

      {/* Requirement 5: Founders Helpline & Real Office Location */}
      <HelplineSection layout="cards" />

      {/* Requirement 8: Trusted Brands */}
      <TrustedBrands />

    </div>
  );
};
