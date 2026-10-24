import React, { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Send, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

export const FORMSPREE_FORM_ID = 'xzeebpvb';

interface ContactFormspreeProps {
  formId?: string;
  defaultCategory?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ContactFormspree: React.FC<ContactFormspreeProps> = ({
  formId = FORMSPREE_FORM_ID,
  defaultCategory = 'general',
  title,
  subtitle,
  className = ''
}) => {
  const { lang } = useLanguage();
  const isUrdu = lang === 'ur';
  const { currentUser } = useAuth();

  const [state, handleSubmit, reset] = useForm(formId);

  // Form field state for local prefill / controlled inputs
  const [name, setName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [location, setLocation] = useState(currentUser?.city || '');
  const [category, setCategory] = useState(defaultCategory);
  const [role, setRole] = useState<string>(currentUser?.role || 'farmer');
  const [message, setMessage] = useState('');

  const handleReset = () => {
    setMessage('');
    if (typeof reset === 'function') {
      reset();
    }
  };

  return (
    <div
      className={`bg-[#FFFBEF] rounded-2xl border border-[#E3D3A8] p-6 sm:p-8 shadow-sm ${className}`}
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Optional Title / Header */}
      {(title || subtitle) && (
        <div className="mb-6 pb-4 border-b border-[#E3D3A8]/70">
          {title && (
            <h2 className="text-xl sm:text-2xl font-black text-[#0B3A17]">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#3E3E3E] mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Success View */}
      {state.succeeded ? (
        <div className="py-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#1B6B2A] border border-[#A5D6A7] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-black text-[#0B3A17]">
              {isUrdu ? 'شکریہ! آپ کا پیغام موصول ہو گیا ہے' : 'Thank You! Message Received'}
            </h3>
            <p className="text-xs sm:text-sm text-[#3E3E3E] leading-relaxed">
              {isUrdu
                ? 'آپ کا پیغام فارمسپری (Formspree) کے ذریعے ہماری ٹیم کو موصول ہو گیا ہے۔ ہم جلد از جلد آپ سے رابطہ کریں گے۔'
                : 'Your submission has been securely delivered to the Kissan Connect team via Formspree. We will review and respond promptly.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B6B2A] hover:bg-[#0B3A17] text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isUrdu ? 'ایک اور پیغام بھیجیں' : 'Send Another Message'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Form View */
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* General Form-Level Error */}
          {state.errors && state.errors.getFormErrors().length > 0 && (
            <div className="p-3.5 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {isUrdu ? 'فارم بھیجنے میں مسئلہ پیش آیا:' : 'Unable to send form:'}
                </p>
                <ValidationError errors={state.errors} className="text-red-700 text-xs mt-1" />
              </div>
            </div>
          )}

          {/* Hidden metadata tags for Formspree dashboard & email notifications */}
          <input type="hidden" name="_source" value="Kissan Connect Pakistan" />
          <input type="hidden" name="_language" value={lang} />

          {/* Name & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="formspree-name" className="block text-xs font-bold text-[#0B3A17] uppercase tracking-wider mb-1.5">
                {isUrdu ? 'پورا نام' : 'Full Name'} <span className="text-red-500">*</span>
              </label>
              <input
                id="formspree-name"
                type="text"
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isUrdu ? 'مثال: ملک محمد افضل' : 'e.g. Muhammad Bilal'}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E3D3A8] rounded-xl font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B6B2A]"
              />
              <ValidationError prefix="Name" field="name" errors={state.errors} className="text-red-600 text-xs mt-1" />
            </div>

            <div>
              <label htmlFor="formspree-phone" className="block text-xs font-bold text-[#0B3A17] uppercase tracking-wider mb-1.5">
                {isUrdu ? 'فون / واٹس ایپ نمبر' : 'Phone / WhatsApp'} <span className="text-red-500">*</span>
              </label>
              <input
                id="formspree-phone"
                type="tel"
                name="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E3D3A8] rounded-xl font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B6B2A]"
              />
              <ValidationError prefix="Phone" field="phone" errors={state.errors} className="text-red-600 text-xs mt-1" />
            </div>
          </div>

          {/* Email & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="formspree-email" className="block text-xs font-bold text-[#0B3A17] uppercase tracking-wider mb-1.5">
                {isUrdu ? 'ای میل ایڈریس' : 'Email Address'} <span className="text-red-500">*</span>
              </label>
              <input
                id="formspree-email"
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E3D3A8] rounded-xl font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B6B2A]"
              />
              <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-600 text-xs mt-1" />
            </div>

            <div>
              <label htmlFor="formspree-location" className="block text-xs font-bold text-[#0B3A17] uppercase tracking-wider mb-1.5">
                {isUrdu ? 'ضلع / قریبی منڈی' : 'District / Nearest Mandi'}
              </label>
              <input
                id="formspree-location"
                type="text"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={isUrdu ? 'مثال: وہاڑی، ملتان، گوجرانوالہ' : 'e.g. Vehari, Multan, Sargodha'}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E3D3A8] rounded-xl font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B6B2A]"
              />
            </div>
          </div>

          {/* Category & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="formspree-category" className="block text-xs font-bold text-[#0B3A17] uppercase tracking-wider mb-1.5">
                {isUrdu ? 'پیغام کا موضوع / کیٹیگری' : 'Topic / Inquiry Category'}
              </label>
              <select
                id="formspree-category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E3D3A8] rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B6B2A]"
              >
                <option value="general">{isUrdu ? 'عمومی رابطہ / رہنمائی' : 'General Inquiry / Guidance'}</option>
                <option value="mandi_rates">{isUrdu ? 'منڈی ریٹ کی تصدیق یا درستگی' : 'Mandi Rate Inquiry / Correction'}</option>
                <option value="fertilizer">{isUrdu ? 'کھاد و یوریا دستیابی و ریٹس' : 'Fertilizer & Urea Availability'}</option>
                <option value="tractor">{isUrdu ? 'ٹریکٹر و زرعی مشینری' : 'Tractor & Agricultural Machinery'}</option>
                <option value="schemes">{isUrdu ? 'سرکاری سکیمیں و سبسڈیز' : 'Government Schemes & Subsidies'}</option>
                <option value="bug_or_issue">{isUrdu ? 'تکنیکی خرابی یا شکایت' : 'Technical Issue / Bug Report'}</option>
                <option value="partnership">{isUrdu ? 'اشتراک اور کاروبار' : 'Business & Partnership'}</option>
              </select>
            </div>

            <div>
              <label htmlFor="formspree-role" className="block text-xs font-bold text-[#0B3A17] uppercase tracking-wider mb-1.5">
                {isUrdu ? 'آپ کا کردار' : 'Your Role'}
              </label>
              <select
                id="formspree-role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E3D3A8] rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B6B2A]"
              >
                <option value="farmer">{isUrdu ? 'کسان / کاشتکار (Farmer)' : 'Farmer / Grower'}</option>
                <option value="wholesaler">{isUrdu ? 'بیوپاری / آڑھتی (Wholesaler)' : 'Mandi Wholesaler / Trader'}</option>
                <option value="fertilizer_dealer">{isUrdu ? 'کھاد ڈیلر (Fertilizer Dealer)' : 'Fertilizer Dealer'}</option>
                <option value="tractor_owner">{isUrdu ? 'ٹریکٹر مالک / ڈرائیور' : 'Tractor / Machinery Owner'}</option>
                <option value="student_researcher">{isUrdu ? 'طالب علم / زرعی محقق' : 'Student / Agri Researcher'}</option>
                <option value="other">{isUrdu ? 'دیگر (Other)' : 'Other'}</option>
              </select>
            </div>
          </div>

          {/* Message Area */}
          <div>
            <label htmlFor="formspree-message" className="block text-xs font-bold text-[#0B3A17] uppercase tracking-wider mb-1.5">
              {isUrdu ? 'آپ کا پیغام / تفصیل' : 'Your Message'} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="formspree-message"
              name="message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isUrdu
                  ? 'اپنا سوال، تجویز یا شکایت یہاں تفصیل سے لکھیں تاکہ ہماری ٹیم بروقت مدد کر سکے...'
                  : 'Write your questions, feedback, or suggestions in detail here...'
              }
              className="w-full p-3.5 bg-white border border-[#E3D3A8] rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B6B2A] text-xs sm:text-sm"
            />
            <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-600 text-xs mt-1" />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={state.submitting}
              className="w-full sm:w-auto px-7 py-3 bg-[#1B6B2A] hover:bg-[#0B3A17] disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
            >
              {state.submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isUrdu ? 'ارسال کیا جا رہا ہے...' : 'Sending via Formspree...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isUrdu ? 'پیغام ارسال کریں' : 'Send Message'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
