import React, { useState } from 'react';
import { Tractor } from '../types';
import { TractorImage } from './TractorImage';
import { useLanguage } from '../context/LanguageContext';
import { formatPKR } from '../utils/formatters';
import { Calculator, Landmark, ShieldCheck, AlertCircle, Info } from 'lucide-react';

interface TractorInstallmentCalcProps {
  tractors: Tractor[];
  preSelectedId?: string;
  defaultTractorId?: string;
}

export const TractorInstallmentCalc: React.FC<TractorInstallmentCalcProps> = ({
  tractors,
  preSelectedId,
  defaultTractorId
}) => {
  const { lang, t } = useLanguage();

  const [selectedTractorId, setSelectedTractorId] = useState<string>(
    defaultTractorId || preSelectedId || tractors[0]?.id || ''
  );
  const selectedTractor = tractors.find((t) => t.id === selectedTractorId) || tractors[0];

  const defaultPrice = selectedTractor ? selectedTractor.pricePKR : 3000000;
  const [downPayment, setDownPayment] = useState<number>(Math.round(defaultPrice * 0.25)); // 25% down payment default
  const [tenureMonths, setTenureMonths] = useState<number>(36); // 3 years default
  const [markupRate, setMarkupRate] = useState<number>(18); // 18% default

  // When tractor changes, adjust down payment default if needed
  const handleTractorChange = (id: string) => {
    setSelectedTractorId(id);
    const tr = tractors.find((t) => t.id === id);
    if (tr) {
      setDownPayment(Math.round(tr.pricePKR * 0.25));
    }
  };

  // Calculations:
  // Principal = Price - DownPayment
  const tractorPrice = selectedTractor ? selectedTractor.pricePKR : 0;
  const principal = Math.max(0, tractorPrice - downPayment);
  const years = tenureMonths / 12;
  // Standard simple reducing or flat lease formula common in Pakistani bank agricultural loans (e.g. ZTBL / BOP)
  const totalMarkup = Math.round(principal * (markupRate / 100) * years);
  const totalPayable = principal + totalMarkup;
  const monthlyInstallment = tenureMonths > 0 ? Math.round(totalPayable / tenureMonths) : 0;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
      <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] flex items-center justify-center text-[#1B5E20]">
          <Calculator className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#1B5E20]">
            {t.calculatorTitle}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            {lang === 'ur'
              ? 'اپنے پسندیدہ ٹریکٹر کی ماہانہ قسط اور کل لاگت کا آسان حساب لگائیں'
              : 'Calculate estimated monthly payments and leasing costs across major Pakistani banks'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Form Column */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Tractor Select with Visual Preview */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              {t.selectTractor}
            </label>
            {selectedTractor && (
              <div className="mb-3 max-w-xs rounded-2xl overflow-hidden border border-[#E3D3A8]">
                <TractorImage tractor={selectedTractor} frameClassName="w-full aspect-[4/3]" />
              </div>
            )}
            <select
              value={selectedTractorId}
              onChange={(e) => handleTractorChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-[#2E7D32]"
            >
              {tractors.map((tr) => (
                <option key={tr.id} value={tr.id}>
                  {tr.name} ({tr.horsepower} HP) — Rs. {tr.pricePKR.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Price & Down Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {lang === 'ur' ? 'ٹریکٹر کی نقد قیمت' : 'Total Cash Price'}
              </label>
              <div className="px-4 py-3 bg-gray-100 rounded-xl text-sm font-extrabold text-[#1B5E20] border border-gray-200">
                {formatPKR(tractorPrice)}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t.downPayment}
                </label>
                <span className="text-xs font-bold text-[#2E7D32]">
                  {tractorPrice > 0 ? Math.round((downPayment / tractorPrice) * 100) : 0}%
                </span>
              </div>
              <input
                type="number"
                min="0"
                max={tractorPrice}
                step="50000"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          {/* Quick Down Payment Percent Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">
              {lang === 'ur' ? 'فوری انتخاب:' : 'Quick Select:'}
            </span>
            {[20, 25, 30, 40].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setDownPayment(Math.round(tractorPrice * (pct / 100)))}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  Math.round((downPayment / tractorPrice) * 100) === pct
                    ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Tenure & Markup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {t.tenureMonths}
              </label>
              <select
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-[#2E7D32]"
              >
                <option value={12}>12 {lang === 'ur' ? 'ماہ (1 سال)' : 'Months (1 Year)'}</option>
                <option value={24}>24 {lang === 'ur' ? 'ماہ (2 سال)' : 'Months (2 Years)'}</option>
                <option value={36}>36 {lang === 'ur' ? 'ماہ (3 سال)' : 'Months (3 Years)'}</option>
                <option value={48}>48 {lang === 'ur' ? 'ماہ (4 سال)' : 'Months (4 Years)'}</option>
                <option value={60}>60 {lang === 'ur' ? 'ماہ (5 سال)' : 'Months (5 Years)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {t.markupRate}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="35"
                  step="0.5"
                  value={markupRate}
                  onChange={(e) => setMarkupRate(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-[#2E7D32]"
                />
                <span className="absolute right-4 top-3 text-sm font-bold text-gray-400 pointer-events-none">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Card Column */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] rounded-3xl p-6 sm:p-7 text-white shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/20">
              <span className="text-xs uppercase tracking-wider text-[#A5D6A7] font-semibold">
                {lang === 'ur' ? 'فنانسنگ تخمینہ' : 'Financing Estimate'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#F9A825] text-[#1B5E20] font-black">
                {tenureMonths} {lang === 'ur' ? 'ماہ' : 'Months'}
              </span>
            </div>

            <div className="my-6">
              <span className="text-xs text-[#C8E6C9] uppercase font-bold tracking-wider">
                {t.monthlyInstallment}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
                {formatPKR(monthlyInstallment)}
                <span className="text-xs font-normal text-[#C8E6C9] ml-1">/ month</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-[#E8F5E9]">
                <span>{lang === 'ur' ? 'قرض کی اصل رقم' : 'Financed Amount (Principal):'}</span>
                <span className="font-bold text-white">{formatPKR(principal)}</span>
              </div>

              <div className="flex justify-between items-center text-[#E8F5E9]">
                <span>{t.totalMarkup}:</span>
                <span className="font-bold text-[#FFE082]">{formatPKR(totalMarkup)}</span>
              </div>

              <div className="flex justify-between items-center text-[#E8F5E9]">
                <span>{t.downPayment}:</span>
                <span className="font-bold text-white">{formatPKR(downPayment)}</span>
              </div>

              <div className="pt-2 border-t border-white/20 flex justify-between items-center text-sm font-black">
                <span>{t.totalPayable}:</span>
                <span className="text-[#F9A825] text-base">{formatPKR(totalPayable + downPayment)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/15">
            <p className="text-[11px] text-[#C8E6C9] leading-relaxed">
              {t.calculatorNote}
            </p>
          </div>
        </div>
      </div>

      {/* Approximate Bank / Leasing Options Box */}
      <div className="mt-8 p-5 bg-[#FFF8E7] border border-[#FFE082] rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#F9A825] text-[#1B5E20] flex items-center justify-center shrink-0 mt-0.5">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1B5E20]">
              {lang === 'ur' ? 'پاکستان میں ٹریکٹر لیزنگ کے متبادل بینک' : 'Available Agricultural Tractor Leasing Options in Pakistan'}
            </h4>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-700">
              <div className="p-3 bg-white rounded-xl border border-amber-200">
                <span className="font-bold text-emerald-900 block">ZTBL Kissan Tractor Scheme</span>
                <p className="text-gray-500 mt-0.5">Bi-annual installment schedule aligned with Rabi & Kharif harvest crops. Low processing fee on passbook.</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-200">
                <span className="font-bold text-emerald-900 block">Bank of Punjab (BOP) Kissan Rozgar</span>
                <p className="text-gray-500 mt-0.5">Subsidized green markup rates, quick 14-day approval for Millat & Al-Ghazi verified authorized dealers.</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-200">
                <span className="font-bold text-emerald-900 block">HBL & MCB Zarai Leasing</span>
                <p className="text-gray-500 mt-0.5">Comprehensive Islamic Ijarah financing with optional takaful insurance coverage against accidental damages.</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
              <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              {lang === 'ur'
                ? 'درج بالا تفصیلات صرف کسانوں کی معلومات کے لیے ہیں۔ درخواست دینے سے قبل متعلقہ بینک برانچ سے رابطہ کریں۔'
                : 'Note: Provided for guidance only. Please confirm current markup, insurance and eligibility with the respective bank branch.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
