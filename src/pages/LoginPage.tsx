import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth, PendingGoogleUser } from '../context/AuthContext';
import { UserRole } from '../types';
import { Sprout, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, User, Phone, MapPin, Building2, X } from 'lucide-react';
import { UnauthorizedDomainAlert } from '../components/UnauthorizedDomainAlert';

export const LoginPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { login, loginWithGoogle, saveGoogleProfile, logout, resetPassword, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const paramEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(paramEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Google profile completion state for new users
  const [showGoogleProfileModal, setShowGoogleProfileModal] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<PendingGoogleUser | null>(null);
  const [googleRole, setGoogleRole] = useState<UserRole>('farmer');
  const [googlePhone, setGooglePhone] = useState('+92');
  const [googleProvince, setGoogleProvince] = useState('Punjab');
  const [googleCity, setGoogleCity] = useState('');
  const [googleBusinessName, setGoogleBusinessName] = useState('');
  const [googleFormError, setGoogleFormError] = useState('');
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  // If a logged-in user opens the Login page, redirect them to their own dashboard
  useEffect(() => {
    if (!authLoading && currentUser) {
      if (redirect) {
        navigate(redirect, { replace: true });
      } else if (currentUser.role === 'wholesaler') {
        navigate('/wholesaler-dashboard', { replace: true });
      } else if (currentUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/farmer-dashboard', { replace: true });
      }
    }
  }, [authLoading, currentUser, navigate, redirect]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setErrorMsg('');
    setIsUnauthorizedDomain(false);

    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success) {
      if (redirect) {
        navigate(redirect);
      } else {
        navigate('/');
      }
    } else {
      setErrorMsg(
        res.error || (lang === 'ur' ? 'غلط ای میل یا پاس ورڈ۔ براہ کرم دوبارہ کوشش کریں۔' : 'Incorrect email or password. Please try again.')
      );
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    setIsUnauthorizedDomain(false);
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success) {
      if (res.needsProfile && res.pendingGoogleUser) {
        setPendingGoogleUser(res.pendingGoogleUser);
        setShowGoogleProfileModal(true);
      } else {
        if (redirect) navigate(redirect);
        else if (currentUser?.role === 'wholesaler') navigate('/wholesaler-dashboard');
        else navigate('/farmer-dashboard');
      }
    } else {
      if (res.errorCode === 'auth/unauthorized-domain' || (res.error && res.error.toLowerCase().includes('unauthorized-domain'))) {
        setIsUnauthorizedDomain(true);
      } else {
        setErrorMsg(res.error || 'Google login failed.');
      }
    }
  };

  const handleGoogleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingGoogleUser) return;
    if (!googlePhone.trim() || !googleCity.trim()) {
      setGoogleFormError(lang === 'ur' ? 'براہ کرم تمام مطلوبہ خانے پر کریں۔' : 'Please fill all required fields.');
      return;
    }

    setGoogleSubmitting(true);
    setGoogleFormError('');

    const res = await saveGoogleProfile({
      uid: pendingGoogleUser.uid,
      email: pendingGoogleUser.email,
      fullName: pendingGoogleUser.displayName || 'Google User',
      phone: googlePhone.trim(),
      role: googleRole,
      province: googleProvince,
      city: googleCity.trim(),
      photoURL: pendingGoogleUser.photoURL,
      businessName: googleRole === 'wholesaler' ? googleBusinessName.trim() : undefined
    });

    setGoogleSubmitting(false);

    if (res.success) {
      setShowGoogleProfileModal(false);
      if (redirect) {
        navigate(redirect);
      } else if (googleRole === 'wholesaler') {
        navigate('/wholesaler-dashboard');
      } else {
        navigate('/farmer-dashboard');
      }
    } else {
      setGoogleFormError(res.error || 'Failed to save profile. Please try again.');
    }
  };

  const handleCancelGoogleProfile = async () => {
    await logout();
    setShowGoogleProfileModal(false);
    setPendingGoogleUser(null);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    await resetPassword(forgotEmail);
    setResetSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setResetSuccess(false);
    }, 2500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-[#FFFBEF] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E3D3A8] space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <img 
            src="/assets/aistudio/Kisan_Connect_Agricultural_Emblem_4927b7a8.png" 
            alt="Kissan Connect Logo" 
            className="w-16 h-16 rounded-full mx-auto shadow-md border-2 border-[#1B6B2A]/40 bg-white object-cover" 
          />
          <h2 className="text-2xl font-black text-[#0B3A17]">
            {t.loginTitle}
          </h2>
          <p className="text-xs text-gray-700">
            {lang === 'ur'
              ? 'اپنے فارم کھاتہ اور منڈی اکاؤنٹ میں داخل ہوں'
              : 'Sign in to access your ledger, planner, and marketplace listings'}
          </p>
        </div>

        {isUnauthorizedDomain && (
          <UnauthorizedDomainAlert onDismiss={() => setIsUnauthorizedDomain(false)} />
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              {t.email}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.pk"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E3D3A8] rounded-xl text-gray-900 focus:ring-2 focus:ring-[#1B6B2A]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                {t.password}
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-[#1B6B2A] hover:underline font-bold"
              >
                {t.forgotPassword}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E3D3A8] rounded-xl text-gray-900 focus:ring-2 focus:ring-[#1B6B2A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1B6B2A] hover:bg-[#0F3D1E] disabled:opacity-60 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            <span>{loading ? 'Signing In...' : t.navLogin}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Google Sign-in */}
        <div className="space-y-3 pt-2">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E3D3A8] w-full"></div>
            <span className="bg-[#FFFBEF] px-3 text-xs text-gray-500 uppercase font-semibold">
              Or
            </span>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-3 bg-white hover:bg-amber-50/50 border border-[#E3D3A8] text-gray-800 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-2">
          <Link
            to={redirect ? `/signup?redirect=${redirect}` : '/signup'}
            className="text-xs text-[#1B6B2A] hover:text-[#0B3A17] underline font-bold"
          >
            {t.dontHaveAccount}
          </Link>
        </div>

      </div>

      {/* Google Profile Completion Modal */}
      {showGoogleProfileModal && pendingGoogleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <div className="bg-[#FFFBEF] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-[#1B6B2A] space-y-4 animate-in zoom-in-95 duration-200 text-start">
            <div className="flex items-start justify-between pb-2 border-b border-[#E3D3A8]">
              <div>
                <h3 className="font-black text-lg text-[#0B3A17]">
                  {lang === 'ur' ? 'پروفائل مکمل کریں' : 'Complete Your Profile'}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {lang === 'ur'
                    ? 'گوگل سائن ان مکمل کرنے کے لیے اپنا کردار اور شہر درج کریں۔'
                    : 'Select your role and location to complete Google registration.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelGoogleProfile}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Google Account Tag */}
            <div className="p-3 bg-white rounded-2xl border border-[#E3D3A8] flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#1B6B2A] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {pendingGoogleUser.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate">{pendingGoogleUser.displayName}</p>
                <p className="text-[11px] text-gray-500 truncate">{pendingGoogleUser.email}</p>
              </div>
            </div>

            {googleFormError && (
              <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{googleFormError}</span>
              </div>
            )}

            <form onSubmit={handleGoogleProfileSubmit} className="space-y-3.5 text-xs">
              {/* Role Selection */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {lang === 'ur' ? 'آپ کا کردار منتخب کریں *' : 'Select Your Role *'}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGoogleRole('farmer')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      googleRole === 'farmer'
                        ? 'bg-[#1B5E20] text-white border-[#1B5E20] shadow-sm font-black'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300 font-bold'
                    }`}
                  >
                    <span>{lang === 'ur' ? 'کسان / زمیندار' : 'Farmer (Grower)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoogleRole('wholesaler')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      googleRole === 'wholesaler'
                        ? 'bg-[#1B5E20] text-white border-[#1B5E20] shadow-sm font-black'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300 font-bold'
                    }`}
                  >
                    <span>{lang === 'ur' ? 'تاجر / آڑھتی' : 'Wholesaler (Trader)'}</span>
                  </button>
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {lang === 'ur' ? 'موبائل نمبر *' : 'Mobile Number *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={googlePhone}
                    onChange={(e) => setGooglePhone(e.target.value)}
                    placeholder="+923001234567"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Province & City */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {lang === 'ur' ? 'صوبہ *' : 'Province *'}
                  </label>
                  <select
                    value={googleProvince}
                    onChange={(e) => setGoogleProvince(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-xl font-semibold"
                  >
                    <option value="Punjab">Punjab (پنجاب)</option>
                    <option value="Sindh">Sindh (سندھ)</option>
                    <option value="KPK">KPK (کے پی کے)</option>
                    <option value="Balochistan">Balochistan (بلوچستان)</option>
                    <option value="Islamabad">Islamabad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {lang === 'ur' ? 'شہر / ضلع *' : 'City / District *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={googleCity}
                    onChange={(e) => setGoogleCity(e.target.value)}
                    placeholder="e.g. Sahiwal"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-semibold"
                  />
                </div>
              </div>

              {/* Business name if wholesaler */}
              {googleRole === 'wholesaler' && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {lang === 'ur' ? 'کاروبار یا دکان کا نام' : 'Business / Shop Name (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={googleBusinessName}
                    onChange={(e) => setGoogleBusinessName(e.target.value)}
                    placeholder="e.g. Madina Grain Traders"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-semibold"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelGoogleProfile}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  {lang === 'ur' ? 'منسوخ کریں' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={googleSubmitting}
                  className="px-5 py-2 bg-[#1B6B2A] hover:bg-[#0F3D1E] disabled:opacity-60 text-white font-black rounded-xl shadow-md cursor-pointer transition-all"
                >
                  {googleSubmitting 
                    ? (lang === 'ur' ? 'محفوظ کیا جا رہا ہے...' : 'Saving...')
                    : (lang === 'ur' ? 'مکمل کریں اور جاری رکھیں' : 'Complete & Continue')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="font-black text-lg text-gray-900">{t.forgotPassword}</h3>
            <p className="text-xs text-gray-500 mt-1">
              Enter your email address and we'll send you a password recovery link.
            </p>

            {resetSuccess ? (
              <div className="p-4 mt-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>{t.resetPasswordEmailSent}</span>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="mt-4 space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.pk"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 bg-gray-100 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#1B5E20] text-white rounded-xl text-xs font-bold"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
