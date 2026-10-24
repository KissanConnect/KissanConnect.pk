import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CROPS_DATA } from '../data/cropsData';
import { CropImage } from '../components/CropImage';
import { 
  ArrowLeft, 
  CalendarDays, 
  Droplet, 
  Sprout, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Bug, 
  Thermometer, 
  Compass,
  TrendingUp,
  MapPin
} from 'lucide-react';

export const CropDetailPage: React.FC = () => {
  const { cropId } = useParams<{ cropId: string }>();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const crop = CROPS_DATA.find((c) => c.id === cropId) || CROPS_DATA[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/learn')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1B5E20] hover:text-[#2E7D32] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ur' ? 'تمام فصلوں کی فہرست کی طرف واپس' : 'Back to Crop Guides'}</span>
        </button>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-[#A5D6A7] text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              <span>{crop.season} Season</span> • <span>{crop.category}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              {lang === 'ur' ? crop.nameUr : crop.nameEn}
            </h1>

            <p className="text-sm sm:text-base text-[#C8E6C9] max-w-xl leading-relaxed">
              {crop.temperature}
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to={`/calendar?crop=${crop.id}`}
                className="px-6 py-3.5 rounded-2xl bg-[#F9A825] hover:bg-[#F57F17] text-[#1B5E20] font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <CalendarDays className="w-4 h-4 text-[#1B5E20]" />
                <span>{lang === 'ur' ? 'اس فصل کا شیڈول پلانر بنائیں' : 'Create Crop Schedule'}</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 h-full min-h-[300px] p-4 flex items-center justify-center">
            <CropImage crop={crop} frameClassName="w-full aspect-[16/10] shadow-xl rounded-2xl" />
          </div>

        </div>
      </div>

      {/* Provincial Sowing Windows */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-4">
        <h3 className="text-lg sm:text-xl font-black text-[#1B5E20] flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#F9A825]" />
          <span>{t.sowingWindow} ({lang === 'ur' ? 'صوبائی شیڈول' : 'By Province'})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-amber-200">
            <span className="text-xs font-black text-emerald-900 uppercase block mb-1">
              Punjab (پنجاب)
            </span>
            <p className="text-xs text-gray-700 font-semibold leading-relaxed">
              {crop.sowingWindow.punjab}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-amber-200">
            <span className="text-xs font-black text-emerald-900 uppercase block mb-1">
              Sindh (سندھ)
            </span>
            <p className="text-xs text-gray-700 font-semibold leading-relaxed">
              {crop.sowingWindow.sindh}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-amber-200">
            <span className="text-xs font-black text-emerald-900 uppercase block mb-1">
              KPK (خیبر پختونخوا)
            </span>
            <p className="text-xs text-gray-700 font-semibold leading-relaxed">
              {crop.sowingWindow.kpk}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-amber-200">
            <span className="text-xs font-black text-emerald-900 uppercase block mb-1">
              Balochistan (بلوچستان)
            </span>
            <p className="text-xs text-gray-700 font-semibold leading-relaxed">
              {crop.sowingWindow.balochistan}
            </p>
          </div>
        </div>
      </section>

      {/* Scientific Requirements Table */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
        <h3 className="text-lg sm:text-xl font-black text-[#1B5E20] flex items-center gap-2">
          <Sprout className="w-5 h-5 text-[#2E7D32]" />
          <span>{lang === 'ur' ? 'فصل کے سائنسی تقاضے' : 'Crop Agronomic Requirements'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
          
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <span className="text-gray-400 font-bold block uppercase text-[10px]">{t.soilType}</span>
            <span className="font-bold text-gray-900 mt-1 block">{crop.soilType}</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <span className="text-gray-400 font-bold block uppercase text-[10px]">{t.phRange}</span>
            <span className="font-bold text-gray-900 mt-1 block">{crop.phRange}</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <span className="text-gray-400 font-bold block uppercase text-[10px]">{t.seedRate}</span>
            <span className="font-bold text-[#1B5E20] mt-1 block">{crop.seedRatePerAcre}</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <span className="text-gray-400 font-bold block uppercase text-[10px]">{t.waterReq}</span>
            <span className="font-bold text-gray-900 mt-1 block">{crop.waterRequirement}</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <span className="text-gray-400 font-bold block uppercase text-[10px]">Labor Input</span>
            <span className="font-bold text-gray-900 mt-1 block">{crop.laborInput}</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <span className="text-gray-400 font-bold block uppercase text-[10px]">Temperature Zone</span>
            <span className="font-bold text-gray-900 mt-1 block">{crop.temperature}</span>
          </div>

        </div>
      </section>

      {/* Fertilizer Schedule */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-4">
        <h3 className="text-lg sm:text-xl font-black text-[#1B5E20] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#F9A825]" />
          <span>{t.fertilizerSchedule}</span>
        </h3>

        <div className="space-y-3">
          {crop.fertilizerSchedule.map((sched, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#FFFDF5] border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <span className="text-xs font-black text-[#1B5E20] uppercase tracking-wide block">
                  {sched.stage}
                </span>
                <span className="text-sm font-bold text-gray-900 mt-0.5 block">
                  {sched.fertilizer}
                </span>
              </div>
              <span className="text-xs text-gray-500 font-medium sm:text-right max-w-sm">
                {sched.notes}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Two columns: Common Mistakes vs Expert Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Common Mistakes */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-red-100 space-y-4">
          <h3 className="text-lg font-black text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>{t.commonMistakesTitle}</span>
          </h3>

          <ul className="space-y-3 text-xs sm:text-sm text-gray-700">
            {crop.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50/60 border border-red-100">
                <span className="text-red-600 font-black mt-0.5">✕</span>
                <span className="leading-relaxed">{mistake}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Step-by-Step Tips */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-100 space-y-4">
          <h3 className="text-lg font-black text-[#1B5E20] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
            <span>{t.stepByStepTipsTitle}</span>
          </h3>

          <ul className="space-y-3 text-xs sm:text-sm text-gray-700">
            {crop.stepByStepTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[#2E7D32] font-black mt-0.5">✓</span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Common Pests & Diseases */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-4">
        <h3 className="text-lg sm:text-xl font-black text-[#1B5E20] flex items-center gap-2">
          <Bug className="w-5 h-5 text-amber-600" />
          <span>{t.commonPestsTitle}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {crop.commonPests.map((pest, idx) => (
            <div key={idx} className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-800">
              🐛 {pest}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
