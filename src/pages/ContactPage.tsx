import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { HelplineSection } from '../components/HelplineSection';
import { ContactFormspree } from '../components/ContactFormspree';
import { MessageSquare, ArrowRight, ShieldCheck, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ContactPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const isUrdu = lang === 'ur';

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-start" dir={isUrdu ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-[#E3D3A8]">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A17]">
          {t.contactUs}
        </h1>
        <p className="text-xs sm:text-sm text-[#3E3E3E]">
          {isUrdu
            ? 'کسان کنیکٹ کی بانی ٹیم کسانوں اور بیوپاریوں کی رہنمائی کے لیے براہ راست دستیاب ہے۔'
            : 'Get in touch directly with our team for platform assistance, partnership, mandi queries, or agricultural guidance.'}
        </p>
      </div>

      {/* Main 2-column Section: Contact Form (Formspree) + Helplines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (7 cols): Direct Formspree Message Form */}
        <div className="lg:col-span-7 space-y-6">
          <ContactFormspree
            title={isUrdu ? 'براہ راست پیغام یا سوال بھیجیں' : 'Send Us a Direct Message'}
            subtitle={
              isUrdu
                ? 'فارم پُر کریں، آپ کی انکوائری فارمسپری کے محفوظ چینل کے ذریعے سیدھی ہماری کسٹمر سپورٹ ٹیم تک پہنچے گی۔'
                : 'Fill out this form to send your message directly to our support team powered by Formspree.'
            }
          />

          {/* Trust badge */}
          <div className="p-4 bg-[#FFFBEF] rounded-xl border border-[#E3D3A8] flex items-center gap-3 text-xs text-[#3E3E3E]">
            <ShieldCheck className="w-5 h-5 text-[#1B6B2A] shrink-0" />
            <p>
              {isUrdu
                ? 'آپ کی معلومات اور موبائل نمبر مکمل محفوظ ہیں اور صرف رہنمائی کے لیے استعمال ہوتے ہیں۔'
                : 'Your contact details are encrypted and securely submitted via Formspree for customer support.'}
            </p>
          </div>
        </div>

        {/* Right Column (5 cols): Office Location, Emergency Helplines & Suggestion Link */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Helplines and Office Section */}
          <div className="bg-[#FFFBEF] p-6 sm:p-7 rounded-2xl border border-[#E3D3A8] space-y-4">
            <h3 className="text-base font-bold text-[#0B3A17] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#1B6B2A]" />
              <span>{isUrdu ? 'دفتر اور ہاٹ لائنز' : 'Offices & Helplines'}</span>
            </h3>
            <HelplineSection layout="contact" theme="light" />
          </div>

          {/* Suggestion Box Link */}
          <div className="bg-[#FFFBEF] rounded-2xl p-6 border border-[#E3D3A8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#0B3A17] font-bold text-base">
                <MessageSquare className="w-4 h-4 text-[#1B6B2A]" />
                <h3>{isUrdu ? 'آن لائن تجاویز اور آراء کا باکس' : 'Online Suggestion Box'}</h3>
              </div>
              <p className="text-xs text-[#3E3E3E]">
                {isUrdu
                  ? 'کیا آپ کے پاس کوئی تجویز ہے یا کسی ریٹ کی غلطی بتانا چاہتے ہیں؟ ہمارے تجاویز باکس کا استعمال کریں۔'
                  : 'Have feedback, feature ideas, or want to report an inaccurate mandi rate? Send your suggestion directly to our team.'}
              </p>
            </div>

            <Link
              to="/suggestions"
              className="px-4 py-2 bg-[#1B6B2A] hover:bg-[#0F3D1E] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shrink-0 self-start sm:self-auto"
            >
              <span>{t.navSuggestions}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};
