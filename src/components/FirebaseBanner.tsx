import React, { useState } from 'react';
import { isFirebaseConfigured } from '../firebaseConfig';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Info, X, ExternalLink, Key } from 'lucide-react';

export const FirebaseBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { lang, t } = useLanguage();

  // If already configured with real Firebase keys, do not show setup banner
  if (isFirebaseConfigured() || dismissed) {
    return null;
  }

  return (
    <>
      <div className="bg-[#E8F5E9] border-b border-[#C8E6C9] text-[#1B5E20] px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs z-30 relative">
        <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
          <Info className="w-4 h-4 text-[#2E7D32] shrink-0" />
          <span>
            {lang === 'ur' ? (
              <>
                <strong>ڈیمو موڈ فعال ہے:</strong> تمام فیچرز (لاگ ان، منڈی اشتہارات، کھاد ریٹ، فارم کھاتہ) بغیر کسی رکاوٹ کے چل رہے ہیں۔ مستقل ڈیٹا محفوظ کرنے کے لیے{' '}
                <button 
                  onClick={() => setShowModal(true)} 
                  className="underline font-bold text-[#1B5E20] hover:text-[#2E7D32] cursor-pointer inline-flex items-center gap-1"
                >
                  فائر بیس سیٹ اپ گائیڈ دیکھیں <ExternalLink className="w-3 h-3" />
                </button>
              </>
            ) : (
              <>
                <strong>Demo Mode Active:</strong> All features (Auth, Marketplace, Ledgers, Planner) work smoothly out of the box with sample data. To connect your cloud Firestore:{' '}
                <button 
                  onClick={() => setShowModal(true)} 
                  className="underline font-bold text-[#1B5E20] hover:text-[#2E7D32] cursor-pointer inline-flex items-center gap-1"
                >
                  View Firebase Setup Guide <ExternalLink className="w-3 h-3" />
                </button>
              </>
            )}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#2E7D32] hover:text-[#1B5E20] p-1 rounded-md transition-colors cursor-pointer"
          title={lang === 'ur' ? 'چھپائیں' : 'Dismiss'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#1B5E20]">
                  {lang === 'ur' ? 'فائر بیس کنفیگریشن گائیڈ' : 'Firebase Configuration Guide'}
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-gray-700 leading-relaxed">
              <p>
                {lang === 'ur'
                  ? 'کسان کنیکٹ مکمل طور پر فائر بیس آتھنٹیکیشن اور کلاؤڈ فائر سٹور کے ساتھ مربوط ہے۔ آپ کے پروجیکٹ کے کریڈنشلز درج ذیل فائل میں لگائے جا سکتے ہیں:'
                  : 'Kissan Connect is pre-wired for Firebase Authentication and Cloud Firestore. You can connect your live database anytime in:'}
              </p>

              <div className="p-3 bg-gray-900 text-green-400 font-mono text-xs rounded-lg select-all">
                src/firebaseConfig.ts
              </div>

              <ol className="list-decimal pl-5 space-y-1.5 text-xs text-gray-600">
                <li>Create a free project at <span className="font-semibold text-gray-800">console.firebase.google.com</span></li>
                <li>Enable <strong>Email/Password</strong> and <strong>Google Sign-in</strong> under Authentication</li>
                <li>Create a <strong>Cloud Firestore</strong> database in production or test mode</li>
                <li>Copy the Web App config keys and paste into <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">src/firebaseConfig.ts</span></li>
                <li>Detailed instructions are also provided in <span className="font-semibold text-gray-800">SETUP.md</span></li>
              </ol>

              <div className="p-3 bg-[#FFF8E7] border border-[#FFE082] rounded-xl text-xs text-[#825300] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F9A825] shrink-0 mt-0.5" />
                <span>
                  {lang === 'ur'
                    ? 'آپ ابھی بغیر کسی کی کے بھی تمام فنکشنز (لاگ ان، فارم کھاتہ، فصل پلانر، اشتہار بازی) ٹیسٹ کر سکتے ہیں۔'
                    : 'Until you enter your keys, everything is safely saved in your browser so you can test all features right away.'}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-medium rounded-xl text-sm transition-all shadow-md cursor-pointer"
              >
                {lang === 'ur' ? 'سمجھ گیا، شکریہ' : 'Got it, thanks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
