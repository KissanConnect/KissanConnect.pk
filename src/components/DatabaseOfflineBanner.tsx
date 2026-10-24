import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { dbStatus } from '../services/dbStatus';
import { WifiOff, RefreshCw, X } from 'lucide-react';

export const DatabaseOfflineBanner: React.FC = () => {
  const { lang } = useLanguage();
  const [isOffline, setIsOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only subscribe to real read/write failures; NEVER ping or test connection on page load
    const unsubscribe = dbStatus.subscribe((offline) => {
      setIsOffline(offline);
      if (!offline) {
        setDismissed(false);
      }
    });

    const handleOnline = () => {
      dbStatus.reportSuccess();
    };

    const handleOffline = () => {
      dbStatus.reportFailure(new Error('client is offline'));
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await dbStatus.retry();
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isOffline || dismissed) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-[#FFF3CD] border-b border-[#FFE69C] text-[#856404] px-3.5 py-2 text-xs font-medium z-40 relative shadow-xs"
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
          <p className="truncate sm:whitespace-normal leading-tight text-[11px] sm:text-xs">
            <strong className="font-bold me-1">
              {lang === 'ur' ? 'ڈیٹا بیس آف لائن ہے:' : 'Database Offline:'}
            </strong>
            <span>
              {lang === 'ur'
                ? 'ڈیٹا بیس سے رابطہ منقطع ہے۔ عارضی آف لائن موڈ فعال ہے اور محفوظ شدہ ڈیٹا دکھایا جا رہا ہے۔'
                : 'Connection to database is down. Temporary offline mode is active with cached data.'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{lang === 'ur' ? 'دوبارہ کوشش' : 'Retry'}</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-800 hover:text-amber-950 p-1 rounded-md transition-colors cursor-pointer"
            title={lang === 'ur' ? 'چھپائیں' : 'Dismiss'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
