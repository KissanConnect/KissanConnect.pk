import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getTractors } from '../services/dataService';
import { TRACTORS_DATA } from '../data/tractorsData';
import { Tractor } from '../types';
import { TractorImage } from '../components/TractorImage';
import { formatPKR } from '../utils/formatters';
import { TractorInstallmentCalc } from '../components/TractorInstallmentCalc';
import { TrustedBrands } from '../components/TrustedBrands';
import { 
  Truck, 
  Check, 
  X, 
  Scale, 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  Fuel, 
  Cog, 
  Gauge, 
  CheckSquare,
  Square,
  Clock,
  ArrowRight
} from 'lucide-react';

export const TractorsPage: React.FC = () => {
  const { lang, t } = useLanguage();
  // Always initialize with local dataset so page is never empty
  const [tractors, setTractors] = useState<Tractor[]>(TRACTORS_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Compare state: up to 3 tractor IDs
  const [comparedIds, setComparedIds] = useState<string[]>(['mf-240', 'nh-480s']);
  const [selectedForCalc, setSelectedForCalc] = useState<string>('mf-240');
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  useEffect(() => {
    getTractors().then((data) => {
      if (data && data.length > 0) {
        setTractors(data);
      }
    });
  }, []);

  const toggleCompare = (id: string) => {
    if (comparedIds.includes(id)) {
      setComparedIds(comparedIds.filter((item) => item !== id));
    } else {
      if (comparedIds.length >= 3) {
        // replace first item if already 3
        setComparedIds([...comparedIds.slice(1), id]);
      } else {
        setComparedIds([...comparedIds, id]);
      }
    }
  };

  const clearCompare = () => {
    setComparedIds([]);
  };

  const comparedTractors = tractors.filter((tr) => comparedIds.includes(tr.id));

  // Determine best value tractor (MF 240 / NH 480S for high resale and low fuel consumption)
  const isBestValue = (tr: Tractor) => {
    return tr.id === 'mf-240' || tr.id === 'nh-480s';
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 text-start">
      
      {/* Header */}
      <div className="pb-6 border-b border-[#E3D3A8]">
        <div className="flex items-center gap-2 text-[#0B3A17] font-bold text-xs uppercase tracking-wider mb-1">
          <Truck className="w-4 h-4 text-[#1B6B2A] shrink-0" />
          <span>{lang === 'ur' ? 'پاکستان ٹریکٹر پورٹل و موازنہ گائیڈ' : 'Pakistan Tractor Marketplace & Bank Lease Guide'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#0B3A17]">
          {t.tractorsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#3E3E3E] mt-1 max-w-3xl">
          {t.tractorsSubtitle}
        </p>

        {/* Indicative Price Notice & Last Updated */}
        <div className="mt-4 p-4 bg-[#FFFBEF] border border-[#E3D3A8] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#1A1A1A]">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#F2A900] shrink-0" />
            <span className="font-semibold">{t.indicativePricesDisclaimer}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 font-bold shrink-0">
            <Clock className="w-4 h-4 text-[#1B6B2A]" />
            <span>{t.lastUpdated}: October 2026</span>
          </div>
        </div>
      </div>

      {/* Floating Compare Bar (Visible whenever 1+ tractors are selected) */}
      {comparedIds.length > 0 && (
        <div className="fixed bottom-20 xl:bottom-6 left-4 right-4 z-50 max-w-4xl mx-auto bg-[#0F3D1E] text-[#FFF8E1] rounded-2xl p-3.5 sm:p-4 shadow-2xl border-2 border-[#F2A900] flex items-center justify-between gap-4 animate-in slide-in-from-bottom-6">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#F2A900] text-[#1A1A1A] flex items-center justify-center font-black shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-xs sm:text-sm block truncate">
                {comparedIds.length} / 3 {t.compareBarText}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-[#FFF8E1]/80 truncate">
                {comparedTractors.map(tr => (
                  <span key={tr.id} className="bg-[#1B6B2A] px-2 py-0.5 rounded-md truncate max-w-[120px]">
                    {tr.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const el = document.getElementById('comparison-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-4 py-2 bg-[#F2A900] hover:bg-[#d89600] text-[#1A1A1A] font-black rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{t.compareBtn} ({comparedIds.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={clearCompare}
              className="p-2 text-[#FFF8E1]/70 hover:text-white hover:bg-white/10 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Tractor Gallery Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0B3A17]">
              {lang === 'ur' ? 'پاکستان کے مقبول ترین زرعی ٹریکٹرز' : 'Featured Agriculture Tractors'}
            </h2>
            <p className="text-xs text-[#3E3E3E]">
              {lang === 'ur' ? 'موازنہ کرنے کے لیے چیک باکس پر کلک کریں (زیادہ سے زیادہ 3 ماڈلز)' : 'Check the compare box on any tractor to evaluate up to 3 models side-by-side'}
            </p>
          </div>
          <span className="text-xs font-bold text-[#1B6B2A] bg-[#FFFBEF] px-3 py-1 rounded-full border border-[#E3D3A8]">
            {tractors.length} {lang === 'ur' ? 'ماڈلز دستیاب ہیں' : 'Models Loaded'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tractors.map((tr) => {
            const isSelected = comparedIds.includes(tr.id);
            const bestVal = isBestValue(tr);

            return (
              <div
                key={tr.id}
                className={`bg-[#FFFBEF] rounded-3xl overflow-hidden border transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl ${
                  isSelected 
                    ? 'border-[#1B6B2A] ring-3 ring-[#1B6B2A]/30 bg-white' 
                    : 'border-[#E3D3A8] hover:border-[#1B6B2A]'
                }`}
              >
                <div>
                  {/* Image with badges */}
                  <div className="w-full relative overflow-hidden">
                    <TractorImage tractor={tr} frameClassName="w-full aspect-[4/3]" />
                    <div className="absolute top-3 left-3 bg-[#0F3D1E]/90 text-[#FFF8E1] font-black text-xs px-3 py-1 rounded-full backdrop-blur-xs shadow-md">
                      {tr.horsepower} HP
                    </div>

                    {bestVal && (
                      <div className="absolute top-3 right-3 bg-[#F2A900] text-[#1A1A1A] font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{t.bestValue}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-[#1B6B2A] uppercase tracking-wider truncate">
                        {tr.brand}
                      </span>
                      
                      {/* Checkbox trigger */}
                      <button
                        onClick={() => toggleCompare(tr.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#0F3D1E] text-white' : 'bg-white border border-[#E3D3A8] text-[#1A1A1A]'
                        }`}
                        title="Compare this tractor"
                      >
                        {isSelected ? <CheckSquare className="w-4 h-4 text-[#F2A900]" /> : <Square className="w-4 h-4 text-gray-400" />}
                        <span>{t.compareBtn}</span>
                      </button>
                    </div>

                    <h3 className="text-base font-black text-[#1A1A1A] group-hover:text-[#1B6B2A] transition-colors leading-snug">
                      {tr.name}
                    </h3>

                    <div className="pt-2 border-t border-[#E3D3A8]/60">
                      <span className="text-[10px] uppercase text-gray-500 font-bold block">
                        {lang === 'ur' ? 'ایکس فیکٹری قیمت' : 'Ex-Factory List Price'}
                      </span>
                      <span className="text-xl font-black text-[#0B3A17]">
                        {formatPKR(tr.pricePKR)}
                      </span>
                    </div>

                    {/* Specs pills */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#3E3E3E] pt-1">
                      <div className="bg-white p-2 rounded-xl flex items-center gap-1.5 border border-[#E3D3A8]">
                        <Gauge className="w-3.5 h-3.5 text-[#1B6B2A]" />
                        <span>{tr.cylinders} Cylinders</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl flex items-center gap-1.5 border border-[#E3D3A8]">
                        <Layers className="w-3.5 h-3.5 text-[#1B6B2A]" />
                        <span>{tr.liftingCapacityKg} kg Lift</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#3E3E3E] line-clamp-2 leading-relaxed">
                      {lang === 'ur' ? tr.bestForUrdu : tr.bestFor}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2">
                  <button
                    onClick={() => {
                      setSelectedForCalc(tr.id);
                      const el = document.getElementById('calc-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-[#1B6B2A] hover:bg-[#0F3D1E] text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{lang === 'ur' ? 'اقساط کا حساب لگائیں' : 'Calculate Bank Lease'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Side-by-Side Comparison Tool Section */}
      <section id="comparison-section" className="bg-[#FFFBEF] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E3D3A8] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3D3A8]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0F3D1E] text-[#FFF8E1] flex items-center justify-center shadow-xs">
              <Scale className="w-6 h-6 text-[#F2A900]" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#0B3A17]">
                {t.compareTractors}
              </h3>
              <p className="text-xs sm:text-sm text-[#3E3E3E]">
                {lang === 'ur' ? 'اہم تکنیکی خصوصیات، ہارس پاور اور قیمت کا باہمی موازنہ' : 'Compare horsepower, hydraulics, and value side-by-side'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#0B3A17] bg-white px-3 py-1 rounded-xl border border-[#E3D3A8]">
              {comparedTractors.length} / 3 {lang === 'ur' ? 'منتخب ٹریکٹرز' : 'Selected'}
            </span>
            {comparedTractors.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs text-red-700 hover:underline font-black cursor-pointer"
              >
                {lang === 'ur' ? 'تمام صاف کریں' : 'Clear All'}
              </button>
            )}
          </div>
        </div>

        {comparedTractors.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Scale className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-sm font-bold text-gray-700">
              {lang === 'ur' ? 'موازنہ کرنے کے لیے اوپر کسی بھی ٹریکٹر کے چیک باکس پر کلک کریں۔' : 'Select at least 2 tractors above to view a detailed side-by-side comparison.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#E3D3A8]">
                  <th className="p-3 text-gray-500 font-bold uppercase tracking-wider w-44 text-start">
                    {lang === 'ur' ? 'خصوصیت' : 'Specification'}
                  </th>
                  {comparedTractors.map((tr) => (
                    <th key={tr.id} className="p-3 text-center min-w-[220px]">
                      <div className="space-y-1 p-3 rounded-2xl bg-white border border-[#E3D3A8]">
                        <div className="rounded-xl overflow-hidden mb-2">
                          <TractorImage tractor={tr} frameClassName="w-full aspect-[4/3]" />
                        </div>
                        <span className="text-xs font-bold text-[#1B6B2A] block uppercase tracking-wider">
                          {tr.brand}
                        </span>
                        <span className="font-black text-sm sm:text-base text-[#1A1A1A] block">
                          {tr.name}
                        </span>
                        <span className="text-xs font-black text-[#0B3A17] block">
                          {formatPKR(tr.pricePKR)}
                        </span>
                        {isBestValue(tr) && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black bg-[#F2A900] text-[#1A1A1A] px-2 py-0.5 rounded-full mt-1">
                            <Sparkles className="w-3 h-3" /> {t.bestValue}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3D3A8]/60">
                <tr>
                  <td className="p-3 font-bold text-[#0B3A17]">{t.hp}</td>
                  {comparedTractors.map((tr) => (
                    <td key={tr.id} className="p-3 text-center font-black text-[#0B3A17] text-base">
                      {tr.horsepower} HP
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#0B3A17]">{t.engine}</td>
                  {comparedTractors.map((tr) => (
                    <td key={tr.id} className="p-3 text-center text-[#1A1A1A] font-medium">
                      {tr.engine}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#0B3A17]">{t.cylinders}</td>
                  {comparedTractors.map((tr) => (
                    <td key={tr.id} className="p-3 text-center text-[#1A1A1A] font-bold">
                      {tr.cylinders} Cylinders
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#0B3A17]">{t.liftCapacity}</td>
                  {comparedTractors.map((tr) => (
                    <td key={tr.id} className="p-3 text-center text-[#1A1A1A] font-bold">
                      {tr.liftingCapacityKg} kg
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#0B3A17]">{t.fuelTank}</td>
                  {comparedTractors.map((tr) => (
                    <td key={tr.id} className="p-3 text-center text-[#1A1A1A]">
                      {tr.fuelTankLitres} Litres
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#0B3A17]">{t.transmission}</td>
                  {comparedTractors.map((tr) => (
                    <td key={tr.id} className="p-3 text-center text-[#1A1A1A] text-xs">
                      {tr.transmission}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#0B3A17]">{t.bestFor}</td>
                  {comparedTractors.map((tr) => (
                    <td key={tr.id} className="p-3 text-center text-xs text-[#3E3E3E] leading-relaxed">
                      {lang === 'ur' ? tr.bestForUrdu : tr.bestFor}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* REQUIREMENT 8: TRUSTED BRAND TILES ON TRACTOR PAGE */}
      <TrustedBrands />

      {/* Installment & Leasing Calculator */}
      <section id="calc-section">
        <TractorInstallmentCalc tractors={tractors} defaultTractorId={selectedForCalc} />
      </section>

    </div>
  );
};
