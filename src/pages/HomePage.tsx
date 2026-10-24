import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getFertilizerPrices, getListings } from '../services/dataService';
import { FertilizerPrice, Listing } from '../types';
import { formatPKR } from '../utils/formatters';
import { TrustedBrands } from '../components/TrustedBrands';
import { fetchAgriNews, LiveNewsArticle } from '../utils/rssNewsService';
import { 
  Sprout, 
  ArrowRight, 
  CloudSun, 
  TrendingUp, 
  ShoppingBag, 
  BookOpen, 
  CalendarDays, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight, 
  ExternalLink,
  Users,
  Wheat,
  Clock,
  Flame,
  Award,
  Phone,
  MessageCircle,
  PlusCircle,
  Truck,
  Layers,
  MapPin,
  Tag,
  LayoutDashboard
} from 'lucide-react';

// EXACT WEATHER PRESERVATION: Do not change weather call
import { fetchCityWeather } from '../utils/pakistanCitiesWeather';

export const HomePage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { currentUser, loading: authLoading } = useAuth();
  const [fertilizers, setFertilizers] = useState<FertilizerPrice[]>([]);
  const [newsSnapshot, setNewsSnapshot] = useState<LiveNewsArticle[]>([]);
  const [weatherSnapshot, setWeatherSnapshot] = useState<{ temp: number; text: string; city: string } | null>(null);
  const [mandiListings, setMandiListings] = useState<Listing[]>([]);

  useEffect(() => {
    // 1. Load fertilizer prices
    getFertilizerPrices().then((data) => {
      setFertilizers(data.slice(0, 4));
    });

    // 2. Load 6 newest Mandi listings
    getListings().then((data) => {
      setMandiListings(data.slice(0, 6));
    });

    // 3. EXACT WEATHER FEATURE (Kept completely untouched and working)
    const city = currentUser?.city || 'Multan';
    fetchCityWeather(city)
      .then((w) => {
        setWeatherSnapshot({
          temp: w.current.temperature,
          text: w.current.temperature > 25 
            ? (lang === 'ur' ? 'گرم مطلع' : 'Warm & Sunny') 
            : (lang === 'ur' ? 'معتدل موسم' : 'Mild & Clear'),
          city: w.city
        });
      })
      .catch(() => null);

    // 4. Fetch 3 latest news using dual-proxy RSS service
    fetchAgriNews(lang).then((res) => {
      setNewsSnapshot(res.articles.slice(0, 3));
    });
  }, [currentUser, lang]);

  const MANDI_CATEGORIES = [
    { name: 'Crops/Produce', labelUrdu: 'فصلیں و اجناس', icon: Wheat, query: 'Crops/Produce', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { name: 'Tractors', labelUrdu: 'ٹریکٹرز', icon: Truck, query: 'Tractors', color: 'bg-amber-50 text-amber-900 border-amber-200' },
    { name: 'Farm Machinery', labelUrdu: 'زرعی مشینری', icon: Layers, query: 'Farm Machinery', color: 'bg-blue-50 text-blue-900 border-blue-200' },
    { name: 'Seeds', labelUrdu: 'تصدیق شدہ بیج', icon: Sprout, query: 'Seeds', color: 'bg-teal-50 text-teal-900 border-teal-200' },
    { name: 'Fertilizers', labelUrdu: 'کھادیں', icon: TrendingUp, query: 'Fertilizers', color: 'bg-green-50 text-green-900 border-green-200' },
    { name: 'Livestock', labelUrdu: 'مویشی و ڈیری', icon: Users, query: 'Livestock', color: 'bg-orange-50 text-orange-900 border-orange-200' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1B6B2A] border-t-[#F2A900] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0F3D1E] via-[#1B6B2A] to-[#0F3D1E] text-[#FFF8E1] pt-8 pb-16 sm:py-20 rounded-b-[2.5rem] shadow-2xl border-b border-[#E3D3A8]/40">
        <div 
          className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80')`
          }}
        />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-start">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B3A17]/80 border border-[#F2A900]/50 text-[#FFF8E1] text-xs sm:text-sm font-bold backdrop-blur-xs shadow-xs">
                <img 
                  src="/assets/aistudio/Kisan_Connect_Agricultural_Emblem_4927b7a8.png" 
                  alt="Kissan Connect Logo" 
                  className="w-7 h-7 rounded-full object-cover border border-[#F2A900] bg-white" 
                />
                <span>
                  {currentUser
                    ? (lang === 'ur' ? `خوش آمدید، ${currentUser.fullName}!` : `Welcome back, ${currentUser.fullName}!`)
                    : (lang === 'ur' ? 'کسان کنیکٹ — پاکستان کا باضابطہ زرعی و منڈی نیٹ ورک' : 'Kissan Connect — Pakistan’s Premier Agricultural & Mandi Network')}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
                {t.heroTitle}
              </h1>

              <p className="text-base sm:text-xl text-[#FFF8E1]/90 max-w-2xl font-normal leading-relaxed">
                {t.heroSubtitle}
              </p>

              {/* Action Buttons: Logged In vs Visitor */}
              {currentUser ? (
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                  <Link
                    to={currentUser.role === 'wholesaler' ? '/wholesaler-dashboard' : currentUser.role === 'admin' ? '/admin' : '/farmer-dashboard'}
                    className="px-6 py-3.5 rounded-2xl bg-[#F2A900] hover:bg-[#d89600] text-[#1A1A1A] font-black text-sm sm:text-base shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border border-[#E3D3A8]"
                  >
                    <LayoutDashboard className="w-5 h-5 text-[#1A1A1A]" />
                    <span>{lang === 'ur' ? 'میرے ڈیش بورڈ پر جائیں' : 'Go to My Dashboard'}</span>
                  </Link>

                  <Link
                    to="/market"
                    className="px-6 py-3.5 rounded-2xl bg-[#0F3D1E] hover:bg-[#0B3A17] text-[#FFF8E1] font-bold text-sm sm:text-base border border-[#F2A900]/60 shadow-md hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-5 h-5 text-[#F2A900]" />
                    <span>{lang === 'ur' ? 'کسان منڈی دیکھیں' : 'Browse Kissan Mandi'}</span>
                  </Link>

                  <Link
                    to={currentUser.role === 'wholesaler' ? '/create-listing?type=buy' : '/create-listing'}
                    className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-[#FFF8E1] font-bold text-sm sm:text-base backdrop-blur-xs border border-white/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-5 h-5 text-[#F2A900]" />
                    <span>
                      {currentUser.role === 'wholesaler'
                        ? (lang === 'ur' ? 'خریداری کی درخواست لگائیں' : 'Post a Buy Request')
                        : (lang === 'ur' ? 'مفت اشتہار لگائیں' : 'Post a Free Listing')}
                    </span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                  <Link
                    to="/market"
                    className="px-6 py-3.5 rounded-2xl bg-[#F2A900] hover:bg-[#d89600] text-[#1A1A1A] font-black text-sm sm:text-base shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border border-[#E3D3A8]"
                  >
                    <ShoppingBag className="w-5 h-5 text-[#1A1A1A]" />
                    <span>{t.exploreMarket}</span>
                  </Link>

                  <Link
                    to="/signup?role=farmer"
                    className="px-6 py-3.5 rounded-2xl bg-[#0F3D1E] hover:bg-[#0B3A17] text-[#FFF8E1] font-bold text-sm sm:text-base border border-[#F2A900]/60 shadow-md hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Sprout className="w-5 h-5 text-[#F2A900]" />
                    <span>{t.joinAsFarmer}</span>
                  </Link>

                  <Link
                    to="/signup?role=wholesaler"
                    className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-[#FFF8E1] font-bold text-sm sm:text-base backdrop-blur-xs border border-white/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="w-5 h-5 text-[#F2A900]" />
                    <span>{t.joinAsWholesaler}</span>
                  </Link>
                </div>
              )}

              {/* Quick stats badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-[#FFF8E1]/90 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F2A900]" />
                  <span>{lang === 'ur' ? 'مفت اشتہار / بغیر کمیشن' : 'Zero Brokerage / 100% Free'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#81C784]" />
                  <span>{lang === 'ur' ? 'تصدیق شدہ کسان و تاجر' : 'Verified Farmers & Dealers'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#F2A900]" />
                  <span>{lang === 'ur' ? 'براہ راست فون و واٹس ایپ' : 'Direct Phone & WhatsApp'}</span>
                </div>
              </div>
            </div>

            {/* Right Hero Weather & Fertilizer Snapshot */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Weather Snapshot Widget */}
              <div className="bg-[#FFFBEF] rounded-3xl p-5 text-[#1A1A1A] shadow-2xl border border-[#E3D3A8]">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3D3A8]">
                  <div className="flex items-center gap-2">
                    <CloudSun className="w-5 h-5 text-[#1B6B2A]" />
                    <span className="text-xs font-black uppercase tracking-wider text-[#0B3A17]">
                      {t.liveWeatherSnapshot}
                    </span>
                  </div>
                  <Link
                    to="/weather"
                    className="text-xs font-bold text-[#1B6B2A] hover:underline flex items-center gap-1"
                  >
                    <span>{t.viewFullWeather}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-[#0B3A17]">
                      {weatherSnapshot ? weatherSnapshot.city : 'Multan'}
                    </h3>
                    <p className="text-xs text-[#3E3E3E] mt-0.5 font-medium">
                      {weatherSnapshot ? weatherSnapshot.text : (lang === 'ur' ? 'صاف مطلع' : 'Favorable agricultural conditions')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-[#0B3A17]">
                      {weatherSnapshot ? `${weatherSnapshot.temp}°C` : '28°C'}
                    </span>
                    <span className="block text-[11px] text-[#1B6B2A] font-bold mt-0.5">
                      {lang === 'ur' ? 'سپرے کے لیے موافق' : 'Ideal for spraying'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fertilizer Quick Rate Highlight */}
              <div className="bg-[#FFFBEF] rounded-3xl p-5 shadow-xl border border-[#E3D3A8]">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3D3A8]">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#1B6B2A]" />
                    <span className="text-xs font-black uppercase tracking-wider text-[#0B3A17]">
                      {t.fertilizerHighlight}
                    </span>
                  </div>
                  <Link
                    to="/fertilizer"
                    className="text-xs font-bold text-[#1B6B2A] hover:underline flex items-center gap-1"
                  >
                    <span>{lang === 'ur' ? 'تمام ریٹ' : 'View all'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {fertilizers.slice(0, 2).map((item) => (
                    <div key={item.id} className="p-3 bg-white rounded-2xl border border-[#E3D3A8] shadow-xs flex flex-col justify-between">
                      <div className="overflow-hidden">
                        <span className="text-[11px] font-black text-[#1B6B2A] block truncate">
                          {item.brand}
                        </span>
                        <span className="text-xs font-black text-[#1A1A1A] block truncate mt-0.5">
                          {lang === 'ur' ? item.nameUrdu : item.name}
                        </span>
                        <span className="text-sm font-black text-[#0B3A17] block mt-1">
                          {formatPKR(item.currentPrice)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* REQUIREMENT 4: HIGHLIGHTED KISSAN MANDI SECTION DIRECTLY UNDER HERO */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-start">
        
        {/* Bold Cream-and-Green Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#FFFBEF] via-[#FFF3D6] to-[#FFFBEF] border-2 border-[#1B6B2A] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E3D3A8]">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F3D1E] text-[#FFF8E1] text-xs font-black uppercase tracking-wider">
                <ShoppingBag className="w-3.5 h-3.5 text-[#F2A900]" />
                <span>{lang === 'ur' ? 'کسان منڈی لائیو مارکیٹ' : 'Kissan Mandi Live Marketplace'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A17] leading-tight">
                {t.mandiBannerTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#3E3E3E]">
                {lang === 'ur'
                  ? 'ملک بھر کے آڑھتیوں، ملوں اور کسانوں کے ساتھ براہ راست رابطہ۔ کوئی رجسٹریشن فیس یا کمیشن نہیں۔'
                  : 'Direct, commission-free trading for Pakistan’s agricultural economy. Verified phone numbers & instant WhatsApp links.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/market"
                className="px-6 py-3.5 bg-[#1B6B2A] hover:bg-[#0F3D1E] text-white font-black text-sm rounded-2xl shadow-md transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#F2A900]" />
                <span>{t.browseMandi}</span>
              </Link>
              <Link
                to="/create-listing"
                className="px-6 py-3.5 bg-[#F2A900] hover:bg-[#d89600] text-[#1A1A1A] font-black text-sm rounded-2xl shadow-md transition-all hover:scale-105 flex items-center gap-2 cursor-pointer border border-[#E3D3A8]"
              >
                <PlusCircle className="w-4 h-4 text-[#1A1A1A]" />
                <span>{t.postFreeListing}</span>
              </Link>
            </div>
          </div>

          {/* Category Icon Tiles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#0B3A17]">
                {lang === 'ur' ? 'منڈی کے اہم شعبہ جات' : 'Browse by Category'}:
              </span>
              <Link to="/market" className="text-xs font-bold text-[#1B6B2A] hover:underline flex items-center gap-1">
                <span>{lang === 'ur' ? 'تمام کیٹیگریز' : 'View all'}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
              {MANDI_CATEGORIES.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/market?category=${encodeURIComponent(cat.query)}`}
                  className={`p-3 rounded-2xl border transition-all flex flex-col items-center text-center justify-center hover:scale-105 shadow-xs ${cat.color}`}
                >
                  <cat.icon className="w-6 h-6 mb-1.5" />
                  <span className="font-black text-xs block leading-tight">
                    {lang === 'ur' ? cat.labelUrdu : cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* 6 Newest Listings Grid */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-black text-[#0B3A17] flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#F2A900]" />
                <span>{lang === 'ur' ? 'منڈی میں تازہ ترین لائیو اشتہارات' : 'Latest Mandi Listings'}</span>
              </h3>
              <Link to="/market" className="text-xs font-bold text-[#1B6B2A] hover:underline flex items-center gap-1">
                <span>{lang === 'ur' ? 'تمام لسٹنگز دیکھیں' : 'See All Listings'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {mandiListings.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden border border-[#E3D3A8] shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Listing Image */}
                    <div className="h-44 w-full bg-gray-100 relative overflow-hidden">
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute top-3 left-3 bg-[#0F3D1E]/90 text-[#FFF8E1] text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                        {item.category}
                      </div>
                      <div className="absolute top-3 right-3 bg-[#F2A900] text-[#1A1A1A] text-[11px] font-black px-2.5 py-1 rounded-full shadow-md">
                        {item.condition === 'new' ? (lang === 'ur' ? 'نیا' : 'New') : (lang === 'ur' ? 'استعمال شدہ' : 'Used')}
                      </div>
                    </div>

                    {/* Listing Details */}
                    <div className="p-4 sm:p-5 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#1B6B2A] shrink-0" />
                        <span className="truncate">{item.sellerCity}, {item.sellerProvince}</span>
                      </div>

                      <h4 className="font-black text-sm sm:text-base text-[#1A1A1A] group-hover:text-[#1B6B2A] transition-colors line-clamp-1 leading-snug">
                        {item.title}
                      </h4>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">
                            {lang === 'ur' ? 'ڈیمانڈ قیمت' : 'Demand Price'}
                          </span>
                          <span className="text-lg sm:text-xl font-black text-[#0B3A17]">
                            {formatPKR(item.price)}
                          </span>
                        </div>
                        {item.quantity && (
                          <span className="text-xs bg-[#FFF3D6] text-[#0B3A17] font-bold px-2.5 py-1 rounded-lg border border-[#E3D3A8]">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${item.sellerPhone}`}
                      className="py-2.5 px-3 bg-[#0F3D1E] hover:bg-[#1B6B2A] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#F2A900]" />
                      <span>{t.callNow}</span>
                    </a>
                    <a
                      href={`https://wa.me/92${item.sellerPhone.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-black rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* REQUIREMENT 8: TRUSTED BY LEADING BRANDS SECTION */}
      <TrustedBrands />

      {/* 3 Step "How it works" */}
      <section className="bg-[#FFFBEF] py-12 sm:py-16 border-y border-[#E3D3A8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-[#0B3A17]">
              {t.howItWorksTitle}
            </h2>
            <div className="w-20 h-1 bg-[#F2A900] mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-white border border-[#E3D3A8] shadow-sm text-center h-full flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#0F3D1E] text-[#FFF8E1] flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-md">
                  1
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                  {t.step1Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#3E3E3E] leading-relaxed">
                  {t.step1Desc}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E3D3A8] shadow-sm text-center h-full flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#1B6B2A] text-white flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-md">
                  2
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                  {t.step2Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#3E3E3E] leading-relaxed">
                  {t.step2Desc}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E3D3A8] shadow-sm text-center h-full flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#F2A900] text-[#1A1A1A] flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-md">
                  3
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                  {t.step3Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#3E3E3E] leading-relaxed">
                  {t.step3Desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agriculture News Snapshot with "Read full story" button in new tab */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-start">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A17]">
              {t.latestAgriNews}
            </h2>
            <p className="text-xs sm:text-sm text-[#3E3E3E] mt-1 font-medium">
              {lang === 'ur' ? 'گوگل نیوز آر ایس ایس سے لائیو مصدقہ زرعی خبریں' : 'Live verified updates directly from national and provincial agriculture news channels'}
            </p>
          </div>
          <Link
            to="/news"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1B6B2A] hover:underline"
          >
            <span>{t.viewAllNews}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsSnapshot.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 border border-[#E3D3A8] shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span className="font-bold text-[#0B3A17] bg-[#FFF3D6] px-2.5 py-0.5 rounded-full border border-[#E3D3A8]">
                    {item.source}
                  </span>
                  <span>{new Date(item.pubDate).toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-[#1A1A1A] leading-snug line-clamp-3 pt-1">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-[#3E3E3E] line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-[#1B6B2A] hover:bg-[#0F3D1E] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{t.readFullStory}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#F2A900]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      </div>
    );
  };

