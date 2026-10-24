import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getFertilizerPrices } from '../services/dataService';
import { INITIAL_FERTILIZER_PRICES } from '../data/fertilizersData';
import { FertilizerPrice } from '../types';
import { formatPKR } from '../utils/formatters';
import { TrustedBrands } from '../components/TrustedBrands';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  ShieldAlert, 
  Clock, 
  RefreshCw,
  Sparkles,
  Tag
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FertilizerPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { currentUser } = useAuth();
  
  // Baseline local dataset ensures page is NEVER empty
  const [prices, setPrices] = useState<FertilizerPrice[]>(INITIAL_FERTILIZER_PRICES);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('October 2026');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('price-asc');

  const loadPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFertilizerPrices();
      if (data && data.length > 0) {
        setPrices(data);
      }
      setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err: any) {
      console.warn('Fertilizer load failed, keeping fallback dataset:', err);
      setError(lang === 'ur' ? 'ڈیٹا حاصل کرنے میں تاخیر، محفوظ شدہ ریٹس دکھائے جا رہے ہیں۔' : 'Showing verified baseline rates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, []);

  const brands = ['All', 'FFC', 'Engro', 'Fatima', 'Agritech', 'FFBL'];
  const types = ['All', 'Urea', 'DAP', 'CAN', 'NP', 'Nitrophos', 'Potash', 'SSP'];

  const filtered = prices
    .filter((item) => {
      if (selectedBrand !== 'All' && !item.brand.toLowerCase().includes(selectedBrand.toLowerCase())) {
        return false;
      }
      if (selectedType !== 'All' && item.type !== selectedType) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.nameUrdu.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.currentPrice - b.currentPrice;
      if (sortBy === 'price-desc') return b.currentPrice - a.currentPrice;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-start">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E3D3A8]">
        <div>
          <div className="flex items-center gap-2 text-[#0B3A17] font-bold text-xs uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-[#1B6B2A] shrink-0" />
            <span>{lang === 'ur' ? 'پاکستان کھاد انڈیکس و مروجہ نرخ' : 'Pakistan Mandi Fertilizer Index'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#0B3A17]">
            {t.fertilizerTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#3E3E3E] mt-1">
            {t.fertilizerSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Card / Table Toggle */}
          <div className="flex items-center bg-[#FFFBEF] p-1 rounded-2xl border border-[#E3D3A8] shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#0F3D1E] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-[#0F3D1E] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={loadPrices}
            disabled={loading}
            className="px-3.5 py-2 bg-[#1B6B2A] hover:bg-[#0F3D1E] disabled:opacity-50 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? (lang === 'ur' ? 'اپ ڈیٹ ہو رہا ہے...' : 'Updating...') : t.refresh}</span>
          </button>
        </div>
      </div>

      {/* Indicative Notice Bar with Last Updated & Retry */}
      <div className="p-4 bg-[#FFFBEF] border border-[#E3D3A8] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#1A1A1A]">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-[#F2A900] shrink-0" />
          <span className="font-semibold">{t.indicativePricesDisclaimer}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-gray-600 font-bold">
            <Clock className="w-4 h-4 text-[#1B6B2A] shrink-0" />
            <span>{t.lastUpdated}: {lastUpdatedTime}</span>
          </div>
          {error && (
            <button
              onClick={loadPrices}
              className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-bold"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters with BrandLogo Quick Chips */}
      <div className="bg-[#FFFBEF] rounded-3xl p-5 sm:p-6 shadow-md border border-[#E3D3A8] space-y-4">
        {/* BrandLogo Interactive Filter Chips */}
        <div>
          <span className="text-xs font-bold text-[#0B3A17] block mb-2">
            {lang === 'ur' ? 'برانڈ کے لحاظ سے فلٹر کریں:' : 'Filter by Manufacturer:'}
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedBrand('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedBrand === 'All'
                  ? 'bg-[#0F3D1E] text-white shadow-xs'
                  : 'bg-white border border-[#E3D3A8] text-[#1A1A1A] hover:border-[#1B6B2A]'
              }`}
            >
              {lang === 'ur' ? 'تمام برانڈز' : 'All Brands'}
            </button>
            {['FFC', 'Engro', 'FFBL', 'Fatima', 'Agritech'].map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedBrand === b
                    ? 'bg-[#0F3D1E] text-white shadow-xs ring-2 ring-[#F2A900]'
                    : 'bg-white border border-[#E3D3A8] text-[#1A1A1A] hover:border-[#1B6B2A]'
                }`}
              >
                <span>{b}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center pt-2 border-t border-[#E3D3A8]/40">
          
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ur' ? 'کھاد کا نام یا برانڈ تلاش کریں...' : 'Search fertilizer name, brand (e.g. Sona Urea, DAP)...'}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E3D3A8] rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1B6B2A]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#E3D3A8] rounded-2xl text-xs sm:text-sm font-semibold focus:outline-hidden"
            >
              <option value="All">{lang === 'ur' ? 'تمام برانڈز' : 'All Manufacturers'}</option>
              <option value="FFC">FFC (Fauji Fertilizer)</option>
              <option value="Engro">Engro Fertilizers</option>
              <option value="Fatima">Fatima / Sarsabz</option>
              <option value="Agritech">Agritech (Tara)</option>
              <option value="FFBL">FFBL (Bin Qasim)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#E3D3A8] rounded-2xl text-xs sm:text-sm font-semibold focus:outline-hidden"
            >
              <option value="All">{lang === 'ur' ? 'تمام اقسام' : 'All Nutrient Types'}</option>
              <option value="Urea">Urea (46% Nitrogen)</option>
              <option value="DAP">DAP (Phosphate Booster)</option>
              <option value="CAN">CAN (Gowara / Calcium)</option>
              <option value="NP">NP (Nitrophos)</option>
              <option value="Potash">Potash (SOP / MOP)</option>
              <option value="SSP">SSP (Single Super Phosphate)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Grid or Table Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const diff = item.currentPrice - item.previousPrice;
            return (
              <div
                key={item.id}
                className="bg-[#FFFBEF] rounded-3xl p-5 border border-[#E3D3A8] shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4 h-full"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-[#1B6B2A] uppercase tracking-wider truncate">
                      {item.brand}
                    </span>
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white border border-[#E3D3A8] text-[#0B3A17]">
                      {item.type}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-[#1A1A1A] leading-snug">
                    {lang === 'ur' ? item.nameUrdu : item.name}
                  </h3>

                  <div className="pt-2 border-t border-[#E3D3A8]/60 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">
                        {lang === 'ur' ? '50 کلو بوری ریٹ' : 'Current Rate (50kg Bag)'}
                      </span>
                      <span className="text-2xl font-black text-[#0B3A17]">
                        {formatPKR(item.currentPrice)}
                      </span>
                    </div>

                    {/* Price delta */}
                    <div className="text-right">
                      {diff > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+{diff}</span>
                        </span>
                      ) : diff < 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>{diff}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                          <Minus className="w-3.5 h-3.5" />
                          <span>{lang === 'ur' ? 'مستحکم' : 'Stable'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-[#3E3E3E] leading-relaxed pt-1">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E3D3A8]/60 flex items-center justify-between text-[11px] text-gray-500">
                  <span>{t.bagWeight}: 50 kg</span>
                  <span>{t.lastUpdated}: {item.lastUpdated}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-[#FFFBEF] rounded-3xl overflow-hidden border border-[#E3D3A8] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FFF3D6] border-b border-[#E3D3A8]">
                <tr>
                  <th className="p-4 font-black text-[#0B3A17] uppercase tracking-wider">{lang === 'ur' ? 'برانڈ' : 'Manufacturer'}</th>
                  <th className="p-4 font-black text-[#0B3A17] uppercase tracking-wider">{lang === 'ur' ? 'کھاد کا نام' : 'Product Name'}</th>
                  <th className="p-4 font-black text-[#0B3A17] uppercase tracking-wider">{lang === 'ur' ? 'قسم' : 'Nutrient'}</th>
                  <th className="p-4 font-black text-[#0B3A17] uppercase tracking-wider text-right">{lang === 'ur' ? 'نرخ فی بوری' : 'Price (50kg)'}</th>
                  <th className="p-4 font-black text-[#0B3A17] uppercase tracking-wider text-center">{t.priceChange}</th>
                  <th className="p-4 font-black text-[#0B3A17] uppercase tracking-wider">{t.lastUpdated}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3D3A8]/60">
                {filtered.map((item) => {
                  const diff = item.currentPrice - item.previousPrice;
                  return (
                    <tr key={item.id} className="hover:bg-white transition-colors">
                      <td className="p-4 font-bold text-[#1A1A1A]">
                        {item.brand}
                      </td>
                      <td className="p-4 font-black text-[#1A1A1A]">
                        {lang === 'ur' ? item.nameUrdu : item.name}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white border border-[#E3D3A8] text-[#0B3A17]">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-base text-[#0B3A17]">
                        {formatPKR(item.currentPrice)}
                      </td>
                      <td className="p-4 text-center">
                        {diff > 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>+{diff}</span>
                          </span>
                        ) : diff < 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span>{diff}</span>
                          </span>
                        ) : (
                          <span className="text-gray-500 font-bold">—</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500 font-mono text-xs">
                        {item.lastUpdated}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REQUIREMENT 8: TRUSTED BRAND TILES ON FERTILIZER PAGE */}
      <TrustedBrands />

    </div>
  );
};
