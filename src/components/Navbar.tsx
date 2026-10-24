import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Sprout, 
  CloudSun, 
  ShoppingBag, 
  TrendingUp, 
  Truck, 
  BookOpen, 
  CalendarDays, 
  Landmark, 
  Newspaper, 
  MessageSquare,
  Globe, 
  User, 
  LogOut, 
  Menu, 
  X, 
  PlusCircle, 
  LayoutDashboard,
  ShieldCheck,
  Phone,
  Search
} from 'lucide-react';
import { VoiceSearchNav } from './VoiceSearchNav';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { lang, toggleLanguage, t } = useLanguage();
  const { currentUser, logout, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  // Requirement: Put 'Mandi' FIRST in navbar as highlighted pill button
  const navLinks = [
    { to: '/market', label: t.navMarket, icon: ShoppingBag, isMandiPill: true },
    { to: '/', label: t.navHome, icon: Sprout },
    { to: '/fertilizer', label: t.navFertilizer, icon: TrendingUp },
    { to: '/tractors', label: t.navTractors, icon: Truck },
    { to: '/schemes', label: t.navSchemes, icon: Landmark },
    { to: '/weather', label: t.navWeather, icon: CloudSun },
    { to: '/news', label: t.navNews, icon: Newspaper },
    { to: '/calendar', label: t.navCalendar, icon: CalendarDays },
    { to: '/learn', label: t.navLearn, icon: BookOpen },
    { to: '/suggestions', label: t.navSuggestions, icon: MessageSquare }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'wholesaler') return '/wholesaler-dashboard';
    if (currentUser.role === 'admin') return '/admin';
    return '/farmer-dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0F3D1E] text-[#FFF8E1] shadow-lg border-b border-[#1B6B2A]/40">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <img 
              src="/assets/aistudio/Kisan_Connect_Agricultural_Emblem_4927b7a8.png" 
              alt="Kissan Connect Logo" 
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform border border-[#F2A900]/70 bg-white" 
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-white flex items-center gap-1.5">
                {lang === 'ur' ? 'کسان کنیکٹ' : 'Kissan Connect'}
                <span className="text-[10px] bg-[#F2A900] text-[#1A1A1A] px-1.5 py-0.5 rounded-sm font-black uppercase">
                  PK
                </span>
              </span>
              <span className="text-[10px] sm:text-xs text-[#FFF8E1]/80 font-normal hidden xs:block">
                {lang === 'ur' ? 'پاکستانی کسان و تاجر نیٹ ورک' : 'Grow Smarter. Sell Better.'}
              </span>
            </div>
          </Link>

          {/* Desktop Voice-to-Text Search Bar */}
          <div className="hidden lg:block flex-1 max-w-xs xl:max-w-sm 2xl:max-w-md mx-3">
            <VoiceSearchNav />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const active = isActive(link.to);

              if (link.isMandiPill) {
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 bg-[#F2A900] hover:bg-[#d89600] text-[#1A1A1A] shadow-md hover:scale-105 mr-1"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#1A1A1A]" />
                    <span>{link.label}</span>
                    <span className="text-[9px] bg-[#0F3D1E] text-[#FFF8E1] px-1.5 py-0.2 rounded-full uppercase font-black">
                      LIVE
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 relative ${
                    active
                      ? 'bg-[#1B6B2A] text-white shadow-xs'
                      : 'text-[#FFF8E1] hover:bg-[#1B6B2A]/60 hover:text-white'
                  }`}
                >
                  <link.icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Switcher Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#1B6B2A] hover:bg-[#2E7D32] text-[#FFF8E1] font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 border border-[#E3D3A8]/30 shadow-xs cursor-pointer"
              title="Switch Language / زبان تبدیل کریں"
            >
              <Globe className="w-4 h-4 text-[#F2A900]" />
              <span>{t.switchLang}</span>
            </button>

            {/* Post Listing Quick CTA (Desktop) */}
            <Link
              to="/create-listing"
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F2A900] hover:bg-[#d89600] text-[#1A1A1A] font-extrabold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#1A1A1A]" />
              <span>{t.postFreeListing}</span>
            </Link>

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#1B6B2A] hover:bg-[#2E7D32] transition-colors border border-[#E3D3A8]/30 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F2A900] text-[#1A1A1A] flex items-center justify-center font-black text-sm">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-white leading-tight max-w-[120px] truncate">
                      {currentUser.fullName}
                    </span>
                    <span className="text-[10px] text-[#F2A900] capitalize">
                      {currentUser.role === 'wholesaler' ? 'تاجر' : currentUser.role === 'admin' ? 'ایڈمن' : 'کسان'}
                    </span>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className={`absolute ${lang === 'ur' ? 'left-0' : 'right-0'} mt-2 w-56 rounded-2xl bg-[#FFFBEF] shadow-2xl py-2 text-[#1A1A1A] border border-[#E3D3A8] z-50 animate-in fade-in zoom-in-95 duration-150`}>
                    <div className="px-4 py-2 border-b border-[#E3D3A8]">
                      <p className="text-sm font-bold text-[#0B3A17] truncate">{currentUser.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#FFF3D6] text-[#0B3A17] uppercase">
                        {currentUser.role}
                      </span>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-[#FFF3D6] text-[#0B3A17]"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#1B6B2A]" />
                      <span>{currentUser.role === 'wholesaler' ? t.navWholesalerDashboard : t.navFarmerDashboard}</span>
                    </Link>

                    <Link
                      to={currentUser.role === 'wholesaler' ? '/wholesaler-dashboard' : '/farmer-dashboard'}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-[#FFF3D6] text-[#0B3A17]"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#1B6B2A]" />
                      <span>{lang === 'ur' ? 'میرے اشتہارات' : 'My Listings'}</span>
                    </Link>

                    {currentUser.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-[#FFF3D6] text-amber-800"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>{t.navAdmin}</span>
                      </Link>
                    )}

                    <Link
                      to="/calendar"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-[#FFF3D6] text-gray-700"
                    >
                      <CalendarDays className="w-4 h-4 text-gray-500" />
                      <span>{t.navCalendar}</span>
                    </Link>

                    <div className="border-t border-[#E3D3A8] my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50 text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.navLogout}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : authLoading ? (
              <div className="w-16 h-8 bg-white/10 rounded-xl animate-pulse" />
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#FFF8E1] hover:bg-[#1B6B2A] transition-colors"
                >
                  {t.navLogin}
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#F2A900] hover:bg-[#d89600] text-[#1A1A1A] font-extrabold text-xs sm:text-sm transition-all shadow-sm"
                >
                  {t.navSignUp}
                </Link>
              </div>
            )}

            {/* Mobile Voice Search Toggle Button - 44px tap target */}
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className="lg:hidden min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-xl bg-[#1B6B2A] hover:bg-[#2E7D32] text-[#FFF8E1] transition-all cursor-pointer border border-[#E3D3A8]/30 shadow-xs"
              aria-label={lang === 'ur' ? 'آواز سے تلاش کریں' : 'Search by voice'}
              title={lang === 'ur' ? 'آواز سے تلاش کریں' : 'Search by voice'}
            >
              <Search className="w-5 h-5 text-[#F2A900]" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (mobileSearchOpen) setMobileSearchOpen(false);
              }}
              className="xl:hidden p-2 rounded-xl bg-[#1B6B2A] text-white hover:bg-[#2E7D32] focus:outline-hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Mobile Search Bar with Voice-to-Text */}
      {mobileSearchOpen && (
        <div className="lg:hidden bg-[#0F3D1E] border-t border-[#1B6B2A] px-4 py-3 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <VoiceSearchNav 
                isMobileModal={true} 
                onCloseMobile={() => setMobileSearchOpen(false)} 
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-xl bg-[#1B6B2A] text-[#FFF8E1] hover:bg-[#2E7D32] shrink-0 cursor-pointer"
              aria-label={lang === 'ur' ? 'تلاش بند کریں' : 'Close search'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0F3D1E] border-t border-[#1B6B2A] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-2">
            <Link
              to="/create-listing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#F2A900] text-[#1A1A1A] font-extrabold text-sm shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.postFreeListing}</span>
            </Link>

            <button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1B6B2A] text-[#FFF8E1] font-bold text-sm"
            >
              <Globe className="w-4 h-4 text-[#F2A900]" />
              <span>{t.switchLang}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl flex items-center gap-2 ${
                  link.isMandiPill 
                    ? 'bg-[#F2A900] text-[#1A1A1A] font-black col-span-2 text-center justify-center'
                    : isActive(link.to)
                      ? 'bg-[#1B6B2A] text-white font-bold'
                      : 'bg-[#0B3A17] text-[#FFF8E1] hover:bg-[#1B6B2A]'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User Section in Drawer */}
          <div className="pt-3 border-t border-[#1B6B2A] flex items-center justify-between text-xs">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-bold text-[#F2A900] flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>{currentUser.fullName} ({t.navDashboard})</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-400 font-bold hover:underline"
                >
                  {t.navLogout}
                </button>
              </div>
            ) : (
              <div className="flex gap-2 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-[#1B6B2A] rounded-xl font-bold text-[#FFF8E1]"
                >
                  {t.navLogin}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-[#F2A900] rounded-xl font-black text-[#1A1A1A]"
                >
                  {t.navSignUp}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
