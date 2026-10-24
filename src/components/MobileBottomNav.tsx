import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Home, ShoppingBag, CloudSun, CalendarDays, User, LayoutDashboard } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { lang, t } = useLanguage();
  const { currentUser } = useAuth();

  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'wholesaler') return '/wholesaler-dashboard';
    if (currentUser.role === 'admin') return '/admin';
    return '/farmer-dashboard';
  };

  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F3D1E] text-[#FFF8E1] border-t border-[#1B6B2A] shadow-2xl safe-area-bottom">
      <div className="grid grid-cols-5 h-16 items-center px-1 relative">
        
        {/* Tab 1: Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-all ${
              isActive ? 'text-[#F2A900] font-bold' : 'text-[#FFF8E1]/80 hover:text-white'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] leading-tight mt-0.5 max-w-[64px] truncate text-center font-medium">
            {t.navHome}
          </span>
        </NavLink>

        {/* Tab 2: Weather */}
        <NavLink
          to="/weather"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-all ${
              isActive ? 'text-[#F2A900] font-bold' : 'text-[#FFF8E1]/80 hover:text-white'
            }`
          }
        >
          <CloudSun className="w-5 h-5" />
          <span className="text-[10px] leading-tight mt-0.5 max-w-[64px] truncate text-center font-medium">
            {lang === 'ur' ? 'موسم' : 'Weather'}
          </span>
        </NavLink>

        {/* Tab 3: Kissan Mandi - Large Raised Center Button */}
        <div className="flex justify-center -mt-6">
          <NavLink
            to="/market"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center transition-all group ${
                isActive ? 'scale-105' : 'hover:scale-105'
              }`
            }
          >
            <div className="w-14 h-14 rounded-full bg-[#F2A900] text-[#1A1A1A] flex items-center justify-center shadow-2xl border-4 border-[#0F3D1E] group-hover:bg-[#d89600] transition-colors">
              <ShoppingBag className="w-6 h-6 text-[#1A1A1A]" />
            </div>
            <span className="text-[10px] font-black text-[#F2A900] mt-0.5 tracking-tight">
              {lang === 'ur' ? 'کسان منڈی' : 'Mandi'}
            </span>
          </NavLink>
        </div>

        {/* Tab 4: Planner / Calendar */}
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-all ${
              isActive ? 'text-[#F2A900] font-bold' : 'text-[#FFF8E1]/80 hover:text-white'
            }`
          }
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] leading-tight mt-0.5 max-w-[64px] truncate text-center font-medium">
            {lang === 'ur' ? 'کیلنڈر' : 'Planner'}
          </span>
        </NavLink>

        {/* Tab 5: Account / Portal */}
        <NavLink
          to={getDashboardLink()}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-all ${
              isActive ? 'text-[#F2A900] font-bold' : 'text-[#FFF8E1]/80 hover:text-white'
            }`
          }
        >
          {currentUser ? <LayoutDashboard className="w-5 h-5" /> : <User className="w-5 h-5" />}
          <span className="text-[10px] leading-tight mt-0.5 max-w-[64px] truncate text-center font-medium">
            {currentUser 
              ? (lang === 'ur' ? 'پورٹل' : 'Portal') 
              : (lang === 'ur' ? 'اکاؤنٹ' : 'Account')}
          </span>
        </NavLink>

      </div>
    </div>
  );
};
