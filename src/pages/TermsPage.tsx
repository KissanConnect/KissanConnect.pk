import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const { lang, t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-black text-[#1B5E20]">
          {t.termsOfService}
        </h1>
        <p className="text-xs text-gray-500 mt-1">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h3 className="font-bold text-base text-gray-900">1. Acceptance of Terms</h3>
          <p>
            By accessing or using Kissan Connect, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-base text-gray-900">2. Free Agricultural Marketplace</h3>
          <p>
            Kissan Connect acts strictly as a neutral digital bulletin board connecting Pakistani agricultural producers, wholesalers, and equipment sellers. Kissan Connect does not buy, sell, warehouse, inspect, or guarantee any produce, seeds, machinery, or chemicals advertised on the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-base text-gray-900">3. Indicative Prices & Weather Disclaimers</h3>
          <p>
            Fertilizer prices, tractor prices, and government subsidy information are collected from public market sources and are provided solely for indicative and informational guidance. Buyers and sellers must verify actual current prices directly with authorized local dealers before entering into financial transactions. Weather data and irrigation advisories are generated through open meteorological models and should be evaluated alongside local field observations.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-base text-gray-900">4. User Conduct & Prohibited Items</h3>
          <p>
            Users agree not to post false, misleading, fraudulent, or counterfeit agricultural inputs (such as uncertified or fake pesticide batches). Users must provide legitimate contact numbers. Violations may result in account termination and listing removal.
          </p>
        </section>
      </div>
    </div>
  );
};
