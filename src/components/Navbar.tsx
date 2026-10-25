import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  CloudSun, 
  ShoppingBag, 
  TrendingUp, 
  Truck, 
  BookOpen, 
  CalendarDays, 
  Landmark, 
  Newspaper, 
  MessageSquare,
  LogOut, 
  Menu, 
  X, 
  PlusCircle, 
  LayoutDashboard,
  ShieldCheck, 
  Phone,
  Search,
  ChevronDown,
  Info,
  Tractor,
  Scale,
  FileSpreadsheet,
  Calculator,
  Bookmark,
  MessageCircle,
  HelpCircle,
  FileCheck,
  FileText
} from 'lucide-react';
import { VoiceSearchNav } from './VoiceSearchNav';

interface MenuItem {
  to?: string;
  onClick?: () => void;
  labelEn: string;
  labelUr: string;
  icon: React.ElementType;
}

interface MenuGroup {
  key: string;
  titleEn: string;
  titleUr: string;
  requiresAuth?: boolean;
  items: MenuItem[];
}

export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    market: true,
    prices: true,
    info: true,
    tools: true,
    account: true,
    help: true
  });

  const { lang, setLanguage, t } = useLanguage();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // Close menu on outside click or on Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(e.target as Node) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'wholesaler') return '/wholesaler-dashboard';
    if (currentUser.role === 'admin') return '/admin';
    return '/farmer-dashboard';
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Structured menu groups covering EVERY feature, page and portal of Kissan Connect
  const menuGroups: MenuGroup[] = [
    {
      key: 'market',
      titleEn: 'Market',
      titleUr: 'مارکیٹ',
      items: [
        { to: '/market', labelEn: 'Kissan Mandi', labelUr: 'کسان منڈی', icon: ShoppingBag },
        { to: '/market?category=Farm%20Machinery', labelEn: 'Transport Board', labelUr: 'ٹرانسپورٹ بورڈ', icon: Truck },
        { to: '/market?category=Buy%20Requests', labelEn: 'Buy Requests', labelUr: 'خریداروں کی طلب', icon: FileText },
        { to: '/create-listing', labelEn: 'Post a Free Listing', labelUr: 'مفت اشتہار لگائیں', icon: PlusCircle }
      ]
    },
    {
      key: 'prices',
      titleEn: 'Prices',
      titleUr: 'قیمتیں و ریٹس',
      items: [
        { to: '/fertilizer', labelEn: 'Fertilizer Rates', labelUr: 'کھاد کے ریٹ', icon: TrendingUp },
        { to: '/tractors', labelEn: 'Tractors (Prices, Compare & Installments)', labelUr: 'ٹریکٹرز اور اقساط', icon: Tractor },
        { to: '/market?category=Crops%2FProduce', labelEn: 'Mandi Rates', labelUr: 'منڈی ریٹس', icon: Scale }
      ]
    },
    {
      key: 'info',
      titleEn: 'Information',
      titleUr: 'معلومات و رہنمائی',
      items: [
        { to: '/weather', labelEn: 'Weather', labelUr: 'موسمی حالات', icon: CloudSun },
        { to: '/news', labelEn: 'Agri News', labelUr: 'زرعی خبریں', icon: Newspaper },
        { to: '/schemes', labelEn: 'Govt Schemes', labelUr: 'حکومتی اسکیمیں', icon: Landmark },
        { to: '/learn', labelEn: 'Learn (Crop Guides)', labelUr: 'زرعی رہنمائی', icon: BookOpen }
      ]
    },
    {
      key: 'tools',
      titleEn: 'Farm Tools',
      titleUr: 'زرعی ٹولز',
      items: [
        { to: '/calendar', labelEn: 'Crop Planner (Calendar)', labelUr: 'فصل کیلنڈر', icon: CalendarDays },
        { to: '/farmer-dashboard', labelEn: 'Records (Produce, Expenses, Income)', labelUr: 'فارم کھاتہ ریکارڈز', icon: FileSpreadsheet },
        { to: '/farmer-dashboard', labelEn: 'Profit Calculator', labelUr: 'منافع کیلکولیٹر', icon: Calculator }
      ]
    },
    {
      key: 'account',
      titleEn: 'My Account',
      titleUr: 'میرا اکاؤنٹ',
      requiresAuth: true,
      items: [
        { to: getDashboardPath(), labelEn: 'My Dashboard', labelUr: 'میرا ڈیش بورڈ', icon: LayoutDashboard },
        { to: getDashboardPath(), labelEn: 'My Listings', labelUr: 'میرے اشتہارات', icon: ShoppingBag },
        { to: getDashboardPath(), labelEn: 'Messages', labelUr: 'پیغامات', icon: MessageSquare },
        { to: '/market', labelEn: 'Saved Items', labelUr: 'محفوظ شدہ اشیاء', icon: Bookmark },
        { onClick: handleLogout, labelEn: 'Logout', labelUr: 'لاگ آؤٹ', icon: LogOut }
      ]
    },
    {
      key: 'help',
      titleEn: 'Help',
      titleUr: 'مدد اور رہنمائی',
      items: [
        { to: '/suggestions', labelEn: 'Suggestion Box', labelUr: 'تجاویز باکس', icon: MessageCircle },
        { to: '/about', labelEn: 'FAQ', labelUr: 'عام سوالات', icon: HelpCircle },
        { to: '/about', labelEn: 'About Us', labelUr: 'ہمارے بارے میں', icon: Info },
        { to: '/contact', labelEn: 'Contact Us (Helpline and Office)', labelUr: 'رابطہ و ہیلپ لائن', icon: Phone },
        { to: '/privacy', labelEn: 'Privacy Policy', labelUr: 'پرائیویسی پالیسی', icon: ShieldCheck },
        { to: '/terms', labelEn: 'Terms of Use', labelUr: 'شرائط و ضوابط', icon: FileCheck }
      ]
    }
  ];

  // 2 columns for the desktop dropdown panel
  const col1Groups = menuGroups.filter(g => g.key === 'market' || g.key === 'prices' || g.key === 'tools');
  const col2Groups = menuGroups.filter(g => {
    if (g.key === 'info' || g.key === 'help') return true;
    if (g.key === 'account' && currentUser) return true;
    return false;
  });

  return (
    <header 
      className="sticky top-0 z-50 bg-[#0F3D1E] text-[#FFF8E1] border-b border-[#1B6B2A]/50 h-[72px] w-full"
      style={{ overflowX: 'clip' }}
    >
      {/* Container: max-width 1280px, centered, equal padding (24px desktop, 16px mobile/tablet) */}
      <div className="max-w-[1280px] w-full mx-auto px-4 min-[1025px]:px-6 h-full flex items-center justify-between gap-4 text-base font-medium relative">
        
        {/* ========================================================= */}
        {/* GROUP 1: LEFT - LOGO, "Kissan Connect" & "PK" BADGE        */}
        {/* ========================================================= */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <img 
            src="/assets/aistudio/Kisan_Connect_Agricultural_Emblem_4927b7a8.png" 
            alt="Kissan Connect Logo" 
            className="w-10 h-10 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform border border-[#F2A900]/80 bg-white" 
          />
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white whitespace-nowrap">
              {lang === 'ur' ? 'کسان کنیکٹ' : 'Kissan Connect'}
            </span>
            <span className="text-[10px] bg-[#F2A900] text-[#1A1A1A] px-1.5 py-0.5 rounded-sm font-black uppercase tracking-wider">
              PK
            </span>
          </div>
        </Link>

        {/* ========================================================= */}
        {/* GROUP 2: CENTER (DESKTOP) - ONLY "HOME" & "KISSAN MANDI"  */}
        {/* ========================================================= */}
        <nav className="hidden min-[1025px]:flex items-center justify-center gap-4 whitespace-nowrap text-base font-medium flex-1">
          {/* 1. Home */}
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl transition-all ${
              location.pathname === '/'
                ? 'bg-[#1B6B2A] text-[#F2A900] font-bold shadow-xs'
                : 'text-[#FFF8E1] hover:text-white hover:bg-[#1B6B2A]/60'
            }`}
          >
            {lang === 'ur' ? 'ہوم' : 'Home'}
          </Link>

          {/* 2. Kissan Mandi (Gold Highlighted Pill Button) */}
          <Link
            to="/market"
            className="px-4 py-2 rounded-full text-sm font-black transition-all flex items-center gap-2 bg-[#F2A900] hover:bg-[#d89600] text-[#1A1A1A] shadow-md hover:scale-105"
          >
            <ShoppingBag className="w-4 h-4 text-[#1A1A1A]" />
            <span>{lang === 'ur' ? 'کسان منڈی' : 'Kissan Mandi'}</span>
          </Link>
        </nav>

        {/* ========================================================= */}
        {/* GROUP 3: RIGHT - SEARCH, LANG TOGGLE, ONE MENU BUTTON    */}
        {/* flex-shrink: 0, equal 12px gaps, on ALL screen sizes      */}
        {/* ========================================================= */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* 1. Search Icon Button (44px) */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className={`min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-xl transition-all cursor-pointer border shadow-xs shrink-0 ${
              searchOpen
                ? 'bg-[#F2A900] text-[#1A1A1A] border-[#F2A900]'
                : 'bg-[#1B6B2A] hover:bg-[#2E7D32] text-[#F2A900] border-[#E3D3A8]/30'
            }`}
            aria-label={lang === 'ur' ? 'آواز اور متن سے تلاش کریں' : 'Search by voice and text'}
            title={lang === 'ur' ? 'تلاش کریں (آواز اور متن)' : 'Search (Voice & Text)'}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* 2. Clear Pill Urdu/English Toggle: "اردو | EN" */}
          <div className="flex items-center bg-[#0B3A17] border border-[#E3D3A8]/40 rounded-full p-0.5 shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => setLanguage('ur')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                lang === 'ur'
                  ? 'bg-[#F2A900] text-[#1A1A1A] shadow-xs'
                  : 'text-[#FFF8E1]/80 hover:text-white'
              }`}
              title="اردو میں دیکھیں"
            >
              اردو
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#F2A900] text-[#1A1A1A] shadow-xs'
                  : 'text-[#FFF8E1]/80 hover:text-white'
              }`}
              title="View in English"
            >
              EN
            </button>
          </div>

          {/* 3. The One Three-Line Menu Button (44px) on ALL screen sizes */}
          <button
            ref={menuBtnRef}
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-xl transition-all cursor-pointer border shadow-xs shrink-0 ${
              menuOpen
                ? 'bg-[#F2A900] text-[#1A1A1A] border-[#F2A900]'
                : 'bg-[#1B6B2A] hover:bg-[#2E7D32] text-white border-[#E3D3A8]/30'
            }`}
            aria-expanded={menuOpen}
            aria-label={lang === 'ur' ? 'مینو کھولیں' : 'Open menu'}
            title={lang === 'ur' ? 'مینو' : 'Menu'}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

        {/* ========================================================= */}
        {/* DESKTOP & TABLET MENU PANEL (>= 768px)                    */}
        {/* Aligned to end edge, never cut off, max-height 80vh       */}
        {/* ========================================================= */}
        {menuOpen && (
          <div 
            ref={menuRef}
            className="hidden min-[768px]:block absolute end-4 min-[1025px]:end-6 top-[72px] mt-2.5 w-[92vw] max-w-[620px] rounded-3xl bg-[#FFFBEF] shadow-2xl p-5 sm:p-6 text-[#1A1A1A] border-2 border-[#1B6B2A] z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[80vh] overflow-y-auto"
            dir={lang === 'ur' ? 'rtl' : 'ltr'}
          >
            {/* TOP OF PANEL */}
            {currentUser ? (
              <div className="p-3.5 bg-white rounded-2xl border border-[#E3D3A8] shadow-xs mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#F2A900] text-[#1A1A1A] flex items-center justify-center font-black text-base shrink-0 shadow-xs">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-[#0B3A17] truncate leading-tight">
                      {currentUser.fullName}
                    </p>
                    <p className="text-xs text-[#1B6B2A] font-semibold mt-0.5">
                      {currentUser.role === 'wholesaler' 
                        ? (lang === 'ur' ? 'تاجر / آڑھتی' : 'Wholesaler') 
                        : currentUser.role === 'admin' 
                          ? (lang === 'ur' ? 'ایڈمن' : 'Admin') 
                          : (lang === 'ur' ? 'کسان / کاشتکار' : 'Farmer')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 border border-red-200"
                  title={lang === 'ur' ? 'لاگ آؤٹ' : 'Logout'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{lang === 'ur' ? 'لاگ آؤٹ' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-4 mb-5 border-b border-[#E3D3A8]">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-sm font-bold text-[#0F3D1E] border-2 border-[#1B6B2A] hover:bg-[#1B6B2A] hover:text-[#FFF8E1] transition-all text-center shadow-xs min-h-[44px] flex items-center justify-center cursor-pointer"
                >
                  {t.navLogin}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-sm font-black bg-[#F2A900] hover:bg-[#d89600] text-[#1A1A1A] transition-all text-center shadow-md hover:scale-[1.02] min-h-[44px] flex items-center justify-center cursor-pointer"
                >
                  {t.navSignUp}
                </Link>
              </div>
            )}

            {/* 2-COLUMN GROUPED LINKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Column 1: Market, Prices, Farm Tools */}
              <div className="space-y-5">
                {col1Groups.map((group) => (
                  <div key={group.key} className="space-y-1.5">
                    <div className="text-xs font-black uppercase text-[#0B3A17] tracking-wider pb-1 border-b border-[#E3D3A8]/80 flex items-center gap-1.5">
                      <span>{lang === 'ur' ? group.titleUr : group.titleEn}</span>
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((item, idx) => (
                        <Link
                          key={idx}
                          to={item.to!}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl hover:bg-[#FFF3D6] text-gray-800 hover:text-[#0B3A17] transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#E3D3A8]/40 group-hover:bg-[#1B6B2A] text-[#1B6B2A] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                            <item.icon className="w-4 h-4 shrink-0" />
                          </div>
                          <span className="text-[15px] sm:text-base font-semibold leading-tight group-hover:font-bold">
                            {lang === 'ur' ? item.labelUr : item.labelEn}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 2: Information, My Account (if logged in), Help */}
              <div className="space-y-5">
                {col2Groups.map((group) => (
                  <div key={group.key} className="space-y-1.5">
                    <div className="text-xs font-black uppercase text-[#0B3A17] tracking-wider pb-1 border-b border-[#E3D3A8]/80 flex items-center gap-1.5">
                      <span>{lang === 'ur' ? group.titleUr : group.titleEn}</span>
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((item, idx) => {
                        if (item.onClick) {
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                item.onClick!();
                                setMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-2.5 py-1.5 px-2 rounded-xl hover:bg-red-50 text-red-700 hover:text-red-800 transition-colors group text-start cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-lg bg-red-100 group-hover:bg-red-600 text-red-700 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                <item.icon className="w-4 h-4 shrink-0" />
                              </div>
                              <span className="text-[15px] sm:text-base font-bold leading-tight">
                                {lang === 'ur' ? item.labelUr : item.labelEn}
                              </span>
                            </button>
                          );
                        }
                        return (
                          <Link
                            key={idx}
                            to={item.to!}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl hover:bg-[#FFF3D6] text-gray-800 hover:text-[#0B3A17] transition-colors group"
                          >
                            <div className="w-7 h-7 rounded-lg bg-[#E3D3A8]/40 group-hover:bg-[#1B6B2A] text-[#1B6B2A] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                              <item.icon className="w-4 h-4 shrink-0" />
                            </div>
                            <span className="text-[15px] sm:text-base font-semibold leading-tight group-hover:font-bold">
                              {lang === 'ur' ? item.labelUr : item.labelEn}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* SLIDE-DOWN FULL-WIDTH SEARCH BAR (VOICE & TEXT)           */}
      {/* ========================================================= */}
      {searchOpen && (
        <div className="absolute top-[72px] inset-x-0 bg-[#0B3A17] border-b-2 border-[#1B6B2A] py-3.5 px-4 sm:px-6 shadow-2xl z-40 animate-in slide-from-top-2 duration-150">
          <div className="max-w-[1280px] mx-auto flex items-center gap-2.5 sm:gap-3">
            <div className="flex-1">
              <VoiceSearchNav 
                isMobileModal={true} 
                onCloseMobile={() => setSearchOpen(false)} 
              />
            </div>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-xl bg-[#1B6B2A] text-[#FFF8E1] hover:bg-[#2E7D32] hover:text-white shrink-0 cursor-pointer transition-colors shadow-xs"
              aria-label={lang === 'ur' ? 'تلاش بند کریں' : 'Close search'}
              title={lang === 'ur' ? 'تلاش بند کریں' : 'Close search'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PHONE FULL-HEIGHT SIDE MENU (< 768px)                     */}
      {/* ========================================================= */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 min-[768px]:hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
          />

          {/* Full-Height Side Drawer */}
          <div 
            className="fixed inset-y-0 start-0 w-[85vw] max-w-sm bg-[#0F3D1E] text-[#FFF8E1] shadow-2xl flex flex-col justify-between overflow-y-auto z-50 border-e border-[#1B6B2A]"
            dir={lang === 'ur' ? 'rtl' : 'ltr'}
          >
            {/* Top Bar with Logo & Close */}
            <div className="p-4 border-b border-[#1B6B2A] flex items-center justify-between">
              <Link 
                to="/" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <img 
                  src="/assets/aistudio/Kisan_Connect_Agricultural_Emblem_4927b7a8.png" 
                  alt="Kissan Connect" 
                  className="w-9 h-9 rounded-full object-cover border border-[#F2A900] bg-white" 
                />
                <span className="font-extrabold text-lg text-white">
                  {lang === 'ur' ? 'کسان کنیکٹ' : 'Kissan Connect'}
                </span>
                <span className="text-[9px] bg-[#F2A900] text-[#1A1A1A] px-1 rounded-sm font-black uppercase">
                  PK
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-xl bg-[#1B6B2A] text-white hover:bg-[#2E7D32] cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              
              {/* TOP OF SIDE MENU: LOGIN & REGISTER (or Profile Section) */}
              <div className="p-3.5 bg-[#0B3A17] rounded-2xl border border-[#1B6B2A] space-y-3">
                {currentUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F2A900] text-[#1A1A1A] flex items-center justify-center font-black text-base shrink-0">
                        {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-white truncate">{currentUser.fullName}</p>
                        <p className="text-xs text-[#F2A900] capitalize">
                          {currentUser.role === 'wholesaler' ? (lang === 'ur' ? 'تاجر / آڑھتی' : 'Wholesaler') : currentUser.role === 'admin' ? (lang === 'ur' ? 'ایڈمن' : 'Admin') : (lang === 'ur' ? 'کسان / کاشتکار' : 'Farmer')}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1B6B2A]">
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setMenuOpen(false)}
                        className="min-h-[44px] flex items-center justify-center py-2.5 px-3 bg-[#1B6B2A] hover:bg-[#2E7D32] text-white rounded-xl text-center text-xs font-bold"
                      >
                        {lang === 'ur' ? 'میرا ڈیش بورڈ' : 'Dashboard'}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="min-h-[44px] flex items-center justify-center py-2.5 px-3 bg-red-950/80 hover:bg-red-900 text-red-200 rounded-xl text-center text-xs font-bold cursor-pointer"
                      >
                        {lang === 'ur' ? 'لاگ آؤٹ' : 'Logout'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-xs text-[#FFF8E1]/80 text-center font-medium">
                      {lang === 'ur' ? 'اپنے اکاؤنٹ میں داخل ہوں یا نیا بنائیں' : 'Sign in to access Mandi and farm ledger'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        className="min-h-[44px] flex items-center justify-center py-2.5 px-3 bg-[#0F3D1E] border border-[#FFF8E1]/80 hover:bg-[#FFF8E1] hover:text-[#0F3D1E] text-[#FFF8E1] rounded-xl text-center text-sm font-bold transition-all shadow-xs"
                      >
                        {t.navLogin}
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMenuOpen(false)}
                        className="min-h-[44px] flex items-center justify-center py-2.5 px-3 bg-[#F2A900] hover:bg-[#d89600] text-[#1A1A1A] rounded-xl text-center text-sm font-black shadow-md transition-all"
                      >
                        {t.navSignUp}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* POST FREE LISTING CTA */}
              <Link
                to="/create-listing"
                onClick={() => setMenuOpen(false)}
                className="min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 bg-[#F2A900] text-[#1A1A1A] font-black text-sm rounded-xl shadow-md hover:bg-[#d89600] transition-colors"
              >
                <PlusCircle className="w-5 h-5 text-[#1A1A1A]" />
                <span>{t.postFreeListing}</span>
              </Link>

              {/* EXPANDABLE SECTIONS FOR ALL NAVIGATION GROUPS */}
              <div className="space-y-2.5 pt-1">
                {menuGroups.map((group) => {
                  if (group.requiresAuth && !currentUser) return null;
                  const isExpanded = !!expandedGroups[group.key];
                  return (
                    <div key={group.key} className="rounded-2xl border border-[#1B6B2A]/80 overflow-hidden bg-[#0B3A17]/80">
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.key)}
                        className="w-full min-h-[44px] py-3 px-3.5 flex items-center justify-between text-start font-bold text-sm text-[#F2A900] hover:bg-[#1B6B2A]/40 transition-colors cursor-pointer"
                        aria-expanded={isExpanded}
                      >
                        <span className="text-[15px]">{lang === 'ur' ? group.titleUr : group.titleEn}</span>
                        <ChevronDown className={`w-4 h-4 text-[#F2A900] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="px-2 pb-2 pt-1 space-y-1 bg-[#0F3D1E]/95 border-t border-[#1B6B2A]/60">
                          {group.items.map((item, idx) => {
                            if (item.onClick) {
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    item.onClick!();
                                    setMenuOpen(false);
                                  }}
                                  className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-red-300 hover:bg-red-950/60 transition-colors text-start cursor-pointer"
                                >
                                  <item.icon className="w-5 h-5 text-red-400 shrink-0" />
                                  <span>{lang === 'ur' ? item.labelUr : item.labelEn}</span>
                                </button>
                              );
                            }
                            return (
                              <Link
                                key={idx}
                                to={item.to!}
                                onClick={() => setMenuOpen(false)}
                                className={`min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                                  isActive(item.to!)
                                    ? 'bg-[#1B6B2A] text-[#F2A900] font-bold'
                                    : 'text-[#FFF8E1] hover:bg-[#1B6B2A]/60'
                                }`}
                              >
                                <item.icon className="w-5 h-5 text-[#81C784] shrink-0" />
                                <span>{lang === 'ur' ? item.labelUr : item.labelEn}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        </div>
      )}

    </header>
  );
};
