import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CROPS_DATA } from '../data/cropsData';
import { CropImage } from '../components/CropImage';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Droplet, 
  Sprout, 
  Layers, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight,
  Sun,
  Leaf,
  Bug,
  Lightbulb
} from 'lucide-react';

export const LearnPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');

  const categories = ['All', 'Grains', 'Cash Crops', 'Vegetables', 'Fruits', 'Pulses', 'Oilseeds'];
  const seasons = ['All', 'Rabi', 'Kharif'];

  const filteredCrops = CROPS_DATA.filter((crop) => {
    if (selectedCategory !== 'All' && crop.category !== selectedCategory) return false;
    if (selectedSeason !== 'All' && crop.season !== selectedSeason) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        crop.nameEn.toLowerCase().includes(q) ||
        crop.nameUr.toLowerCase().includes(q) ||
        crop.soilType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const modernTopics = [
    {
      id: 'drip',
      titleEn: 'Drip & High-Efficiency Irrigation',
      titleUr: 'ڈرپ ایریگیشن اور پانی کی بچت',
      icon: Droplet,
      descEn: 'Save 50% water and 30% fertilizer by micro-dosing directly to root zones. Ideal for citrus, cotton, and vegetables in arid regions.',
      descUr: 'پودے کی جڑوں تک براہ راست قطرہ قطرہ پانی اور کھاد پہنچا کر 50 فیصد پانی اور 30 فیصد کھاد بچائیں۔'
    },
    {
      id: 'soil-test',
      titleEn: 'Scientific Soil & Water Testing',
      titleUr: 'زمین اور پانی کا لیبارٹری ٹیسٹ',
      icon: Layers,
      descEn: 'Stop guessing fertilizer bags. Test electrical conductivity (EC), organic matter, and pH at your tehsil agri lab before sowing.',
      descUr: 'کھاد ڈالنے سے پہلے اپنی زمین کی پی ایچ، نمکیات اور نامیاتی مادے کا ٹیسٹ کروائیں تاکہ درست کھاد استعمال ہو۔'
    },
    {
      id: 'ipm',
      titleEn: 'Integrated Pest Management (IPM)',
      titleUr: 'مربوط انسدادِ کیڑا (IPM)',
      icon: Bug,
      descEn: 'Combine yellow sticky cards, pheromone traps, and bio-pesticides before resorting to expensive chemical sprays.',
      descUr: 'زہریلے اور مہنگے اسپرے سے پہلے روشنی و فیرومون ٹریپس اور قدرتی دوست کیڑوں سے بیماریوں پر قابو پائیں۔'
    },
    {
      id: 'climate-smart',
      titleEn: 'Climate-Smart Agriculture',
      titleUr: 'موسمیاتی تبدیلی سے ہم آہنگ کاشتکاری',
      icon: Sun,
      descEn: 'Laser land leveling, raised-bed planting, and heat-tolerant seeds to protect your yields from sudden temperature spikes.',
      descUr: 'لیزر لیولنگ، بیڈ پلانٹنگ اور گرمی برداشت کرنے والے بیجوں کے ذریعے فصلوں کو ہیٹ ویو سے محفوظ بنائیں۔'
    },
    {
      id: 'storage',
      titleEn: 'Post-Harvest Handling & Grain Storage',
      titleUr: 'فصل کی کٹائی کے بعد محفوظ سٹوریج',
      icon: ShieldCheck,
      descEn: 'Drying grain to below 12% moisture prevents aflatoxin contamination and insect infestation during long storage in silos.',
      descUr: 'گندم اور چاول کو نمی 12 فیصد سے کم کر کے خشک گوداموں میں محفوظ کریں تاکہ گھن اور سڑاند سے بچاؤ ممکن ہو۔'
    },
    {
      id: 'better-price',
      titleEn: 'Getting Premium Mandi Prices',
      titleUr: 'غلہ منڈی میں زیادہ ریٹ حاصل کرنے کے گر',
      icon: TrendingUp,
      descEn: 'Grade your produce into clean uniform lots. Moisture-tested and dust-free grains consistently fetch Rs. 200-300 premium per maund.',
      descUr: 'فصل کو چھان کر مٹی اور کچرے سے پاک کریں۔ صاف جنس کو منڈی میں فی من 200 سے 300 روپے زائد ریٹ ملتا ہے۔'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header */}
      <div className="pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2 text-[#1B5E20] font-bold text-xs uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Scientific Farming Education & Extension</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#1B5E20]">
          {t.learnTitle}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-3xl">
          {t.learnSubtitle}
        </p>
      </div>

      {/* Modern Agri Best Practices Grid */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-[#1B5E20] flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-[#F9A825]" />
          <span>{t.topicsTitle}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modernTopics.map((topic) => (
            <div
              key={topic.id}
              className="p-6 rounded-3xl bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center">
                <topic.icon className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {lang === 'ur' ? topic.titleUr : topic.titleEn}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {lang === 'ur' ? topic.descUr : topic.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 12 Crops Manuals Section */}
      <section className="space-y-6 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1B5E20]">
              {lang === 'ur' ? 'اہم فصلوں کی پیداواری گائیڈز' : 'Complete Crop Manuals & Production Guides'}
            </h2>
            <p className="text-xs text-gray-500">
              {lang === 'ur' ? 'گندم، کپاس، چاول، کماد، آلو، مکئی، باغ بانی اور دیگر اجناس' : 'Detailed scientific protocols customized for Pakistani agro-ecological zones'}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ur' ? 'فصل تلاش کریں...' : 'Search crop name...'}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#2E7D32]"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1B5E20] text-white shadow-xs'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Crops Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCrops.map((crop) => (
            <Link
              key={crop.id}
              to={`/learn/${crop.id}`}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl hover:border-[#81C784] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-full relative overflow-hidden">
                  <CropImage crop={crop} frameClassName="w-full aspect-[16/10]" />
                  <div className="absolute top-3 left-3 bg-[#1B5E20]/90 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full backdrop-blur-xs shadow-md">
                    {crop.season} • {crop.category}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1B5E20] transition-colors leading-snug">
                    {lang === 'ur' ? crop.nameUr : crop.nameEn}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {crop.temperature}
                  </p>
                  <div className="pt-2 text-[11px] text-emerald-900 font-semibold bg-[#E8F5E9] p-2 rounded-xl">
                    <span className="block text-[10px] text-emerald-700 uppercase">{t.seedRate}:</span>
                    {crop.seedRatePerAcre}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between text-xs font-bold text-[#1B5E20] border-t border-gray-100 mt-2">
                <span>{lang === 'ur' ? 'مکمل گائیڈ ملاحظہ کریں' : 'Read Full Manual'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};
