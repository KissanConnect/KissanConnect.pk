import React, { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Lightbulb, 
  PhoneCall
} from 'lucide-react';

export const FORMSPREE_FORM_ID = 'xzeebpvb';

export const SuggestionPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const isUrdu = lang === 'ur';
  const { currentUser } = useAuth();

  const [state, handleSubmit, reset] = useForm(FORMSPREE_FORM_ID);

  const [name, setName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [category, setCategory] = useState<'idea' | 'problem' | 'complaint' | 'other'>('idea');
  const [message, setMessage] = useState('');

  const handleReset = () => {
    setMessage('');
    if (typeof reset === 'function') {
      reset();
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir={isUrdu ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pb-6 border-b border-[#E3D3A8]">
        <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] text-[#1B6B2A] flex items-center justify-center mx-auto shadow-sm">
          <MessageSquare className="w-7 h-7 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#0B3A17]">
          {t.suggestionTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#3E3E3E] leading-relaxed">
          {t.suggestionSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="md:col-span-7 bg-[#FFFBEF] rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E3D3A8]">
          
          {state.succeeded ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#1B6B2A] border border-[#A5D6A7] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black text-[#0B3A17]">
                {isUrdu ? 'شکریہ! آپ کی رائے موصول ہو گئی ہے' : 'Thank You! Feedback Received'}
              </h3>
              <p className="text-xs sm:text-sm text-[#3E3E3E] max-w-sm mx-auto leading-relaxed">
                {t.feedbackSuccess}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 px-6 py-2.5 bg-[#1B6B2A] hover:bg-[#0B3A17] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'ایک اور پیغام بھیجیں' : 'Send Another Message'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              
              {state.errors && state.errors.getFormErrors().length > 0 && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <ValidationError errors={state.errors} />
                </div>
              )}

              {/* Formspree metadata */}
              <input type="hidden" name="_source" value="Kissan Connect - Suggestion Box" />

              {/* Name */}
              <div>
                <label htmlFor="suggestion-name" className="block text-xs font-bold text-[#0B3A17] uppercase tracking-wider mb-1.5">
                  {t.fullName} <span className="text-red-500">*</span>
                </label>
                <input
                  id="suggestion-name"
                  type="text"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Malik Muhammad Afzal"
                  className="w-full px-4 py-3 bg-white border border-[#E3D3A8] rounded-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B6B2A]"
                />
                <ValidationError prefix="Name" field="name" errors={state.errors} className="text-red-600 text-xs mt-1" />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="suggestion-email" className="block text-xs font-bold text-[#0B3A17] uppercase tracking-wider mb-1.5">
                    {t.email} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="suggestion-email"
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@example.com"
                    className="w-full px-4 py-3 bg-white border border-[#E3D3A8] rounded-xl font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B6B2A]"
                  />
                  <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-600 text-xs mt-1" />
                </div>

                <div>
                  <label htmlFor="suggestion-phone" className="block text-xs font-bold text-[#0B3A17] uppercase tracking-wider mb-1.5">
                    {t.phone} ({isUrdu ? 'اختیاری' : 'Optional'})
                  </label>
                  <input
                    id="suggestion-phone"
                    type="tel"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+923001234567"
                    className="w-full px-4 py-3 bg-white border border-[#E3D3A8] rounded-xl font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B6B2A]"
                  />
                  <ValidationError prefix="Phone" field="phone" errors={state.errors} className="text-red-600 text-xs mt-1" />
                </div>
              </div>

              {/* Feedback Category */}
              <div>
                <label htmlFor="suggestion-category" className="block text-xs font-bold text-[#0B3A17] uppercase tracking-wider mb-1.5">
                  {t.suggestionCategory} <span className="text-red-500">*</span>
                </label>
                <select
                  id="suggestion-category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-3 bg-white border border-[#E3D3A8] rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B6B2A]"
                >
                  <option value="idea">{isUrdu ? 'نیا مشورہ یا آئیڈیا (New Idea)' : 'New Idea / Feature Suggestion'}</option>
                  <option value="problem">{isUrdu ? 'تکنیکی مسئلہ یا خرابی (Bug / Issue)' : 'Technical Bug / Issue Report'}</option>
                  <option value="complaint">{isUrdu ? 'منڈی ریٹ یا فراڈ شکایت (Complaint)' : 'Market Rate / Fraud Complaint'}</option>
                  <option value="other">{isUrdu ? 'دیگر عمومی بات (Other)' : 'General Inquiry / Other'}</option>
                </select>
                <ValidationError prefix="Category" field="category" errors={state.errors} className="text-red-600 text-xs mt-1" />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="suggestion-message" className="block text-xs font-bold text-[#0B3A17] uppercase tracking-wider mb-1.5">
                  {t.suggestionMessage} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="suggestion-message"
                  name="message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isUrdu
                      ? 'کسان کنیکٹ کے بارے میں اپنی رائے، منڈی ریٹس یا ایپ میں کسی نئے فیچر کی ضرورت کی تفصیل یہاں لکھیں...'
                      : 'Please describe your suggestions, mandi experiences, or any agricultural tools you would like us to add...'
                  }
                  className="w-full p-4 bg-white border border-[#E3D3A8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6B2A]"
                />
                <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-600 text-xs mt-1" />
              </div>

              <button
                type="submit"
                disabled={state.submitting}
                className="w-full py-3.5 bg-[#1B6B2A] hover:bg-[#0B3A17] disabled:opacity-60 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                {state.submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{isUrdu ? 'ارسال ہو رہا ہے...' : 'Submitting to Formspree...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-emerald-200" />
                    <span>{t.sendFeedback}</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

        {/* Right Column: Direct Info & Helplines */}
        <div className="md:col-span-5 space-y-4">
          
          <div className="p-6 bg-[#FFFBEF] rounded-3xl border border-[#E3D3A8] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#0B3A17] font-bold text-sm">
              <Lightbulb className="w-5 h-5 text-[#B8860B]" />
              <span>{isUrdu ? 'کسانوں کی آواز' : 'Farmer Community Voice'}</span>
            </div>
            <p className="text-xs text-[#3E3E3E] leading-relaxed">
              {isUrdu
                ? 'کسان کنیکٹ آپ کے فیڈ بیک پر بنتا ہے۔ آپ کے مشورے فارمسپری کے محفوظ چینل کے ذریعے براہِ راست ہماری ایگری ٹیم اور ڈویلپرز کے پاس جاتے ہیں۔'
                : 'Every suggestion from our growers and mandi wholesalers is delivered directly to our product and agricultural team via Formspree.'}
            </p>
          </div>

          <div className="p-6 bg-[#FFFBEF] rounded-3xl border border-[#E3D3A8] shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-[#0B3A17] flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#1B6B2A]" />
              <span>Official Government Agriculture Contact</span>
            </h4>
            <div className="text-xs text-[#3E3E3E] space-y-1">
              <p><strong>Punjab Extension Helpline:</strong> 0800-17000 (Toll Free)</p>
              <p><strong>Sindh Agriculture Directorate:</strong> 022-9200124</p>
              <p><strong>ZTBL Farmer Support:</strong> 051-111-303-030</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
