import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { lang, t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-black text-[#1B5E20]">
          {t.privacyPolicy}
        </h1>
        <p className="text-xs text-gray-500 mt-1">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h3 className="font-bold text-base text-gray-900">1. Information We Collect</h3>
          <p>
            When you register for an account or publish a listing on Kissan Connect, we collect your name, email address, mobile number, province, district/city, and role (farmer or wholesaler). We also collect the farm records, harvest yields, and crop planner dates you choose to store in your private dashboard.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-base text-gray-900">2. How Your Data is Used</h3>
          <p>
            Your phone number and city are made publicly visible on marketplace listings so prospective buyers and sellers can contact you via telephone call or WhatsApp. Your private farm ledger (expenses, revenue, harvest stores) and personalized crop calendars are strictly confidential and accessible only by your authenticated account.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-base text-gray-900">3. Local Image Compression & Storage</h3>
          <p>
            To conserve mobile data for rural users, all photos uploaded to Kissan Connect are compressed locally on your device prior to transmission. We do not sell user data to advertising third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-base text-gray-900">4. Contacting Privacy Officers</h3>
          <p>
            For any data removal requests or privacy inquiries, contact our team at privacy@kissanconnect.pk.
          </p>
        </section>
      </div>
    </div>
  );
};
