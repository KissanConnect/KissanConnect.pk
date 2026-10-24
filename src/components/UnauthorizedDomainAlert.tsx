import React, { useState } from 'react';
import { Copy, Check, ShieldAlert, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface UnauthorizedDomainAlertProps {
  onDismiss?: () => void;
}

export const UnauthorizedDomainAlert: React.FC<UnauthorizedDomainAlertProps> = ({ onDismiss }) => {
  const { lang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleCopy = async () => {
    if (!currentHostname) return;
    try {
      await navigator.clipboard.writeText(currentHostname);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = currentHostname;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-amber-400 bg-[#FFFBEF] p-4 text-xs shadow-md space-y-3">
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-black text-amber-950 text-sm">
            {lang === 'ur'
              ? 'ڈومین کی اجازت درکار ہے (Firebase Unauthorized Domain)'
              : 'Firebase Domain Authorization Required'}
          </p>
          <p className="text-gray-800 leading-relaxed">
            {lang === 'ur'
              ? 'یہ ویب سائٹ ایڈریس ابھی فائر بیس میں منظور شدہ نہیں ہے۔ برائے مہربانی نیچے دیا گیا ڈومین فائر بیس کنسول میں شامل کریں:'
              : 'This website address is not yet approved in Firebase. Please add the domain shown below in Firebase Authentication > Settings > Authorized domains.'}
          </p>
        </div>
      </div>

      {/* Copyable domain box */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-amber-300 p-2 pl-3">
        <code className="text-xs font-mono font-bold text-gray-900 select-all truncate flex-1">
          {currentHostname}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-1.5 bg-[#1B6B2A] hover:bg-[#0F3D1E] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'ur' ? 'کاپی ہو گیا!' : 'Copied!'}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>{lang === 'ur' ? 'ڈومین کاپی کریں' : 'Copy'}</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1 border-t border-amber-200">
        <span>
          {lang === 'ur'
            ? 'متبادل: آپ ای میل یا نیچے دیے گئے 1-کلک ڈیمو سے بھی لاگ ان کر سکتے ہیں۔'
            : 'You can still sign in using Email/Password or the 1-Click test accounts below.'}
        </span>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-amber-900 font-bold hover:underline cursor-pointer ml-2"
          >
            {lang === 'ur' ? 'بند کریں' : 'Dismiss'}
          </button>
        )}
      </div>
    </div>
  );
};
