import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Sprout, Lock, Mail, User, Phone, MapPin, Building2, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { UnauthorizedDomainAlert } from '../components/UnauthorizedDomainAlert';

export const SignUpPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { signUp, loginWithGoogle, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'farmer';
  const redirect = searchParams.get('redirect');

  // If a logged-in user opens the Sign up page, redirect them to their own dashboard
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

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+92');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [province, setProvince] = useState('Punjab');
  const [city, setCity] = useState('');
  const [businessName, setBusinessName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProfileSaveError, setIsProfileSaveError] = useState(false);
  const [isEmailAlreadyInUse, setIsEmailAlreadyInUse] = useState(false);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password || !phone.trim() || !city.trim()) {
      setErrorMsg(lang === 'ur' ? 'براہ کرم تمام مطلوبہ خانے پر کریں۔' : 'Please fill all required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setIsProfileSaveError(false);
    setIsEmailAlreadyInUse(false);
    setIsUnauthorizedDomain(false);

    const res = await signUp({
      fullName: fullName.trim(),
      email: email.trim(),
      pass: password,
      phone: phone.trim(),
      role,
      province,
      city: city.trim(),
      businessName: role === 'wholesaler' ? businessName.trim() : undefined
    });

    setLoading(false);

    if (res.success) {
      if (redirect) {
        navigate(redirect);
      } else if (role === 'wholesaler') {
        navigate('/wholesaler-dashboard');
      } else {
        navigate('/farmer-dashboard');
      }
    } else {
      if (res.errorCode === 'auth/email-already-in-use') {
        setIsEmailAlreadyInUse(true);
      } else if (
        res.isProfileSaveFailure ||
        res.errorCode === 'profile-save-failed' ||
        (res.error && res.error.toLowerCase().includes('client is offline')) ||
        (res.error && res.error.toLowerCase().includes('failed to get document'))
      ) {
        setIsProfileSaveError(true);
      } else {
        let friendly = res.error || 'Registration failed. Please try again.';
        if (res.errorCode === 'auth/weak-password') {
          friendly = lang === 'ur'
            ? 'پاس ورڈ کم از کم 6 حروف پر مشتمل ہونا چاہیے۔'
            : 'Password should be at least 6 characters.';
        } else if (res.errorCode === 'auth/invalid-email') {
          friendly = lang === 'ur'
            ? 'براہ کرم درست ای میل پتہ درج کریں۔'
            : 'Please enter a valid email address.';
        } else if (res.errorCode === 'auth/network-request-failed') {
          friendly = lang === 'ur'
            ? 'نیٹ ورک کی خرابی۔ براہ کرم اپنا انٹرنیٹ کنکشن چیک کریں۔'
            : 'Network error. Please check your internet connection.';
        }
        setErrorMsg(friendly);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setErrorMsg('');
    setIsUnauthorizedDomain(false);
    const res = await loginWithGoogle(role);
    setLoading(false);
    if (res.success) {
      if (redirect) navigate(redirect);
      else if (role === 'wholesaler') navigate('/wholesaler-dashboard');
      else navigate('/farmer-dashboard');
    } else {
      if (res.errorCode === 'auth/unauthorized-domain' || (res.error && res.error.toLowerCase().includes('unauthorized-domain'))) {
        setIsUnauthorizedDomain(true);
      } else {
        setErrorMsg(res.error || 'Google registration failed.');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-[#FFFBEF] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E3D3A8] space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <img 
            src="/assets/aistudio/Kisan_Connect_Agricultural_Emblem_4927b7a8.png" 
            alt="Kissan Connect Logo" 
            className="w-16 h-16 rounded-full mx-auto shadow-md border-2 border-[#1B6B2A]/40 bg-white object-cover" 
          />
          <h2 className="text-2xl font-black text-[#0B3A17]">
            {t.signUpTitle}
          </h2>
          <p className="text-xs text-gray-700">
            {lang === 'ur'
              ? 'پاکستان کے ہزاروں کسانوں اور بیوپاریوں کے ساتھ مفت شامل ہوں'
              : 'Join thousands of Pakistani farmers and grain merchants with zero fees'}
          </p>
        </div>

        {isUnauthorizedDomain && (
          <UnauthorizedDomainAlert onDismiss={() => setIsUnauthorizedDomain(false)} />
        )}

        {isEmailAlreadyInUse && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <Mail className="w-5 h-5 text-[#1B6B2A] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-xs sm:text-sm text-[#0B3A17]">
                  {lang === 'ur'
                    ? 'یہ ای میل پہلے سے رجسٹرڈ ہے'
                    : 'This Email is Already Registered'}
                </p>
                <p className="text-xs text-[#2E4A32] leading-relaxed">
                  {lang === 'ur'
                    ? `ای میل (${email}) پہلے سے کسان کنیکٹ پر موجود ہے۔ براہ کرم لاگ ان کریں۔`
                    : `The email address (${email}) is already associated with an existing account. Please sign in instead.`}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end pt-1 border-t border-emerald-200/60">
              <Link
                to={redirect ? `/login?email=${encodeURIComponent(email)}&redirect=${redirect}` : `/login?email=${encodeURIComponent(email)}`}
                className="px-4 py-2 bg-[#1B6B2A] hover:bg-[#0B3A17] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{lang === 'ur' ? 'لاگ ان صفحہ پر جائیں' : 'Sign In Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {isProfileSaveError && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-xs sm:text-sm text-[#0B3A17]">
                  {lang === 'ur'
                    ? 'پروفائل محفوظ نہیں ہو سکی (ڈیٹا بیس رابطہ)'
                    : 'Unable to Save Profile to Database'}
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {lang === 'ur'
                    ? 'عارضی نیٹ ورک یا کنکشن کے مسئلے کے باعث آپ کی تفصیلات محفوظ نہیں ہو سکیں۔ ادھورا اکاؤنٹ خودکار طریقے سے صاف کر دیا گیا ہے۔ براہ کرم نیچے دیے گئے بٹن پر کلک کر کے دوبارہ کوشش کریں۔'
                    : 'A temporary network or database connection issue prevented saving your account profile. Incomplete records were cleaned up so your email is not locked. Please click Retry below to try again.'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end pt-1 border-t border-amber-200/60">
              <button
                type="button"
                onClick={() => handleSignUp()}
                disabled={loading}
                className="px-4 py-2 bg-[#1B6B2A] hover:bg-[#0F3D1E] disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{lang === 'ur' ? 'دوبارہ کوشش کریں (Retry)' : 'Retry Registration'}</span>
              </button>
            </div>
          </div>
        )}

        {errorMsg && !isProfileSaveError && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-4 text-xs sm:text-sm">
          
          {/* Role Choice Cards */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              {t.selectRole} *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  role === 'farmer'
                    ? 'bg-[#1B5E20] text-white border-[#1B5E20] shadow-md scale-[1.02]'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                <span className="block font-black text-sm">{t.farmerRoleOption}</span>
                <span className={`text-[10px] block mt-0.5 ${role === 'farmer' ? 'text-[#A5D6A7]' : 'text-gray-400'}`}>
                  Crop grower & records
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('wholesaler')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  role === 'wholesaler'
                    ? 'bg-[#1B5E20] text-white border-[#1B5E20] shadow-md scale-[1.02]'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                <span className="block font-black text-sm">{t.wholesalerRoleOption}</span>
                <span className={`text-[10px] block mt-0.5 ${role === 'wholesaler' ? 'text-[#A5D6A7]' : 'text-gray-400'}`}>
                  Trader, dealer & buyer
                </span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              {t.fullName} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Chaudhry Riaz Ahmad"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          {/* If wholesaler, business shop name */}
          {role === 'wholesaler' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Business / Commission Shop Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Bismillah Grain Traders, Grain Market"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>
            </div>
          )}

          {/* Email & Mobile Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t.email} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="riaz@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t.phone} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+923001234567"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              {t.password} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          {/* Province & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t.province} *
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold"
              >
                <option value="Punjab">Punjab (پنجاب)</option>
                <option value="Sindh">Sindh (سندھ)</option>
                <option value="KPK">Khyber Pakhtunkhwa (کے پی کے)</option>
                <option value="Balochistan">Balochistan (بلوچستان)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t.city} *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Sahiwal, Multan"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#1B6B2A] hover:bg-[#0F3D1E] disabled:opacity-60 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            <span>{loading ? 'Creating Account...' : t.navSignUp}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Google Signup */}
        <div className="space-y-3 pt-2">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E3D3A8] w-full"></div>
            <span className="bg-[#FFFBEF] px-3 text-xs text-gray-500 uppercase font-semibold">Or</span>
          </div>

          <button
            onClick={handleGoogleSignUp}
            type="button"
            className="w-full py-3 bg-white hover:bg-amber-50/50 border border-[#E3D3A8] text-gray-800 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Register with Google</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-2">
          <Link
            to={redirect ? `/login?redirect=${redirect}` : '/login'}
            className="text-xs text-[#1B6B2A] hover:text-[#0B3A17] underline font-bold"
          >
            {t.alreadyHaveAccount}
          </Link>
        </div>

      </div>
    </div>
  );
};
