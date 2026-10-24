import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  searchAllCategories, 
  predictSearchRoute, 
  GlobalSearchResults, 
  cleanSpokenPhrase 
} from '../utils/searchSynonyms';
import { formatPKR } from '../utils/formatters';
import { 
  Search, 
  Mic, 
  MicOff, 
  X, 
  AlertCircle, 
  TrendingUp, 
  Truck, 
  ShoppingBag, 
  BookOpen, 
  Landmark, 
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface VoiceSearchNavProps {
  isMobileModal?: boolean;
  onCloseMobile?: () => void;
}

export const VoiceSearchNav: React.FC<VoiceSearchNavProps> = ({
  isMobileModal = false,
  onCloseMobile
}) => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  // Search input state
  const [queryText, setQueryText] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<GlobalSearchResults | null>(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [speechError, setSpeechError] = useState<{ code: string; messageEn: string; messageUr: string } | null>(null);

  // Spoken language preference (remembered in localStorage)
  const [voiceLang, setVoiceLang] = useState<'ur' | 'en'>(() => {
    const saved = localStorage.getItem('kissan_voice_lang');
    if (saved === 'ur' || saved === 'en') return saved;
    return lang === 'ur' ? 'ur' : 'en';
  });

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save voice lang preference
  const toggleVoiceLang = (newLang: 'ur' | 'en') => {
    setVoiceLang(newLang);
    localStorage.setItem('kissan_voice_lang', newLang);
    if (isListening) {
      stopListening();
    }
  };

  // Check browser SpeechRecognition support
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechSupported(false);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Run live categorized search whenever queryText changes
  useEffect(() => {
    if (queryText.trim().length >= 2) {
      const results = searchAllCategories(queryText);
      setSearchResults(results);
      setIsDropdownOpen(true);
    } else {
      setSearchResults(null);
      setIsDropdownOpen(false);
    }
  }, [queryText]);

  // Clean up silence timer
  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // Reset 10 second silence countdown
  const resetSilenceTimer = () => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (isListening) {
        stopListening();
      }
    }, 10000);
  };

  // Stop listening helper
  const stopListening = () => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore already stopped
      }
    }
    setIsListening(false);
  };

  // Start listening
  const startListening = () => {
    setSpeechError(null);
    clearSilenceTimer();

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognitionRef.current = recognition;

      // Select language: ur-PK for Urdu, en-PK (or en-US fallback) for English
      if (voiceLang === 'ur') {
        recognition.lang = 'ur-PK';
      } else {
        recognition.lang = 'en-PK';
      }

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        resetSilenceTimer();
      };

      recognition.onresult = (event: any) => {
        resetSilenceTimer();
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          setQueryText(currentText);
        }

        if (finalTranscript) {
          // Final result delivered: stop speech and execute route
          stopListening();
          const cleanObj = cleanSpokenPhrase(finalTranscript);
          if (cleanObj.cleaned) {
            const prediction = predictSearchRoute(finalTranscript);
            // Show results dropdown or navigate if exact high confidence
            const results = searchAllCategories(finalTranscript);
            setSearchResults(results);
            setIsDropdownOpen(true);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        clearSilenceTimer();

        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            setSpeechError({
              code: 'not-allowed',
              messageEn: 'Microphone permission denied. Please allow microphone access in your browser address bar.',
              messageUr: 'مائیکروفون کی اجازت نہیں ملی۔ براؤزر کی سیٹنگز میں مائیکروفون کی اجازت دیں۔'
            });
            break;
          case 'no-speech':
            setSpeechError({
              code: 'no-speech',
              messageEn: 'No speech detected. Please speak clearly into the microphone.',
              messageUr: 'کوئی آواز سنائی نہیں دی۔ براہ کرم مائیکروفون کے قریب ہو کر بولیں۔'
            });
            break;
          case 'audio-capture':
            setSpeechError({
              code: 'audio-capture',
              messageEn: 'No microphone was found or microphone is busy.',
              messageUr: 'مائیکروفون دستیاب نہیں ہے یا کسی دوسری ایپ میں استعمال ہو رہا ہے۔'
            });
            break;
          case 'network':
            setSpeechError({
              code: 'network',
              messageEn: 'Network connection issue for voice recognition. Text search is still available.',
              messageUr: 'انٹرنیٹ نیٹ ورک میں خرابی ہے۔ آپ کی بورڈ سے ٹائپ کر کے تلاش کر سکتے ہیں۔'
            });
            break;
          case 'language-not-supported':
            setSpeechError({
              code: 'language-not-supported',
              messageEn: 'Urdu voice recognition is not supported on this browser. Try switching to English voice.',
              messageUr: 'اس براؤزر میں اردو صوتی پہچان کی سہولت نہیں ہے۔ انگریزی میں بول کر دیکھیں۔'
            });
            break;
          default:
            setSpeechError({
              code: event.error,
              messageEn: 'Voice recognition interrupted. You can type to search.',
              messageUr: 'آواز کی تلاش میں رکاوٹ آئی۔ آپ ٹائپ کر کے تلاش کر سکتے ہیں۔'
            });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        clearSilenceTimer();
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      clearSilenceTimer();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryText.trim()) return;

    stopListening();
    setIsDropdownOpen(false);

    // Predict best matching category route
    const route = predictSearchRoute(queryText);
    navigate(route.targetUrl);
    if (onCloseMobile) onCloseMobile();
  };

  const handleResultClick = (url: string) => {
    stopListening();
    setIsDropdownOpen(false);
    navigate(url);
    if (onCloseMobile) onCloseMobile();
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full text-start">
      
      {/* Search Input Container */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        
        {/* Left Search Icon */}
        <div className="absolute start-3.5 flex items-center pointer-events-none text-[#1B6B2A] z-10">
          <Search className="w-4 h-4" />
        </div>

        {/* Input Box: min 16px text size to prevent mobile browser auto-zoom */}
        <input
          ref={inputRef}
          type="text"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          onFocus={() => {
            if (searchResults && searchResults.totalCount > 0) {
              setIsDropdownOpen(true);
            }
          }}
          placeholder={
            isListening 
              ? (voiceLang === 'ur' ? 'سن رہا ہوں... بولیں (مثلاً: یوریا کا ریٹ)' : 'Listening... speak now (e.g. Urea price)')
              : (lang === 'ur' ? 'مارکیٹ ریٹ یا منڈی تلاش کریں...' : 'Search market prices, tractors, crops...')
          }
          className={`w-full py-2.5 sm:py-2 ps-10 pe-24 sm:pe-28 rounded-2xl bg-[#FFFBEF] text-[#1A1A1A] placeholder-[#3E3E3E]/60 text-base sm:text-sm font-medium border border-[#E3D3A8] shadow-inner focus:outline-hidden focus:ring-2 focus:ring-[#F2A900] focus:border-[#F2A900] transition-all ${
            isListening ? 'ring-2 ring-red-500 bg-red-50/40' : ''
          } ${lang === 'ur' ? 'font-urdu' : 'font-english'}`}
          dir={voiceLang === 'ur' || /[\u0600-\u06FF]/.test(queryText) ? 'rtl' : 'ltr'}
        />

        {/* Right Action Tools: Language Switcher + Clear + 44px Microphone Button */}
        <div className="absolute end-1.5 flex items-center gap-1 z-10">
          
          {/* Clear text button */}
          {queryText && (
            <button
              type="button"
              onClick={() => {
                setQueryText('');
                setSearchResults(null);
                setIsDropdownOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Spoken Language Switcher Pill (اردو | EN) */}
          {speechSupported && (
            <div className="flex items-center bg-[#E8F5E9] border border-[#C8E6C9] rounded-lg p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => toggleVoiceLang('ur')}
                className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                  voiceLang === 'ur'
                    ? 'bg-[#1B6B2A] text-white shadow-xs'
                    : 'text-[#1B6B2A] hover:bg-white/60'
                }`}
                title="Speak in Urdu / اردو میں بولیں"
              >
                اردو
              </button>
              <button
                type="button"
                onClick={() => toggleVoiceLang('en')}
                className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                  voiceLang === 'en'
                    ? 'bg-[#1B6B2A] text-white shadow-xs'
                    : 'text-[#1B6B2A] hover:bg-white/60'
                }`}
                title="Speak in English"
              >
                EN
              </button>
            </div>
          )}

          {/* 44px Minimum Tap Target Microphone Button */}
          {speechSupported ? (
            <button
              type="button"
              onClick={handleMicClick}
              aria-label={lang === 'ur' ? 'آواز سے تلاش کریں' : 'Search by voice'}
              title={
                isListening 
                  ? (lang === 'ur' ? 'آواز روکیں' : 'Stop voice listening')
                  : (lang === 'ur' ? 'آواز سے تلاش کریں' : 'Search by voice')
              }
              className={`min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400'
                  : 'bg-[#1B6B2A] hover:bg-[#2E7D32] text-[#FFF8E1] hover:scale-105 shadow-sm'
              }`}
            >
              {isListening ? (
                <Mic className="w-5 h-5 text-white animate-bounce" />
              ) : (
                <Mic className="w-5 h-5 text-[#F2A900]" />
              )}
            </button>
          ) : (
            <div 
              className="p-2 text-gray-400 text-xs hidden sm:block" 
              title={lang === 'ur' ? 'صوتی تلاش کروم، ایج اور سفاری پر کام کرتی ہے' : 'Voice search works in Chrome, Edge and Safari'}
            >
              <MicOff className="w-4 h-4 text-gray-400" />
            </div>
          )}

        </div>

      </form>

      {/* Voice Status or Error Toast */}
      {speechError && (
        <div className="absolute top-full mt-2 inset-x-0 z-50 p-3 bg-red-50 border border-red-200 rounded-2xl shadow-xl text-xs text-red-900 flex items-start justify-between gap-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{lang === 'ur' ? speechError.messageUr : speechError.messageEn}</p>
              {speechError.code === 'language-not-supported' && (
                <button
                  type="button"
                  onClick={() => {
                    toggleVoiceLang('en');
                    setSpeechError(null);
                  }}
                  className="mt-1 text-xs font-bold text-[#1B6B2A] underline cursor-pointer"
                >
                  Switch to English Voice / انگریزی آواز منتخب کریں
                </button>
              )}
            </div>
          </div>
          <button onClick={() => setSpeechError(null)} className="p-1 text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Unsupported Browser Small Note (Fallback) */}
      {!speechSupported && (
        <p className="text-[11px] text-[#FFF8E1]/70 mt-1 px-1">
          {lang === 'ur' 
            ? 'نوٹ: صوتی تلاش گوگل کروم، ایج اور سفاری براؤزر پر دستیاب ہے۔' 
            : 'Voice search is supported in Chrome, Edge, and Safari.'}
        </p>
      )}

      {/* Categorized Live Search Dropdown Panel */}
      {isDropdownOpen && searchResults && (
        <div className="absolute top-full mt-2 inset-x-0 z-50 max-h-[75vh] overflow-y-auto rounded-3xl bg-[#FFFBEF] border-2 border-[#1B6B2A] shadow-2xl p-4 sm:p-5 text-[#1A1A1A] animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Header & Quick stats */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E3D3A8] text-xs text-gray-600">
            <span className="font-bold text-[#0B3A17]">
              {searchResults.totalCount > 0 
                ? (lang === 'ur' ? `${searchResults.totalCount} نتائج مل گئے` : `Found ${searchResults.totalCount} matching results`)
                : (lang === 'ur' ? 'کوئی نتیجہ نہیں ملا' : 'No results found')}
            </span>

            <button
              onClick={() => handleSearchSubmit()}
              className="font-bold text-[#1B6B2A] hover:underline flex items-center gap-1"
            >
              <span>{lang === 'ur' ? 'مکمل صفحہ کھولیں' : 'View full page'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Did you mean suggestion */}
          {searchResults.didYouMean && (
            <div className="my-2 p-2.5 bg-[#FFF3D6] rounded-xl border border-[#E3D3A8] text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F2A900] shrink-0" />
              <span>
                {lang === 'ur' ? 'کیا آپ کا مطلب تھا: ' : 'Did you mean: '}
                <button
                  type="button"
                  onClick={() => setQueryText(searchResults.didYouMean!)}
                  className="font-black text-[#0B3A17] underline hover:text-[#1B6B2A] cursor-pointer"
                >
                  {searchResults.didYouMean}
                </button>
              </span>
            </div>
          )}

          {/* Group 1: Fertilizer Prices */}
          {searchResults.fertilizers.length > 0 && (
            <div className="pt-3 pb-2 border-b border-[#E3D3A8]/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#0B3A17] flex items-center gap-1.5 uppercase tracking-wide">
                  <TrendingUp className="w-4 h-4 text-[#1B6B2A]" />
                  <span>{lang === 'ur' ? 'کھادوں کے سرکاری و تصدیق شدہ ریٹ' : 'Fertilizer Rates'}</span>
                </span>
                <button
                  onClick={() => handleResultClick(`/fertilizer?search=${encodeURIComponent(searchResults.cleanedQuery)}`)}
                  className="text-[11px] text-[#1B6B2A] font-bold hover:underline"
                >
                  {lang === 'ur' ? 'تمام کھادیں' : 'See all'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.fertilizers.slice(0, 4).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleResultClick(`/fertilizer?highlight=${f.id}`)}
                    className="p-2.5 bg-white rounded-xl border border-[#E3D3A8] hover:border-[#1B6B2A] text-left transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                  >
                    <div>
                      <span className="font-black text-xs text-gray-900 group-hover:text-[#1B6B2A] block">
                        {lang === 'ur' ? f.nameUrdu : f.name}
                      </span>
                      <span className="text-[11px] text-gray-500">{f.brand} • 50kg</span>
                    </div>
                    <span className="text-sm font-black text-[#0B3A17] bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                      {formatPKR(f.currentPrice)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group 2: Tractors & Prices */}
          {searchResults.tractors.length > 0 && (
            <div className="pt-3 pb-2 border-b border-[#E3D3A8]/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#0B3A17] flex items-center gap-1.5 uppercase tracking-wide">
                  <Truck className="w-4 h-4 text-[#1B6B2A]" />
                  <span>{lang === 'ur' ? 'ٹریکٹرز اور ماڈلز' : 'Tractors & Specs'}</span>
                </span>
                <button
                  onClick={() => handleResultClick(`/tractors?search=${encodeURIComponent(searchResults.cleanedQuery)}`)}
                  className="text-[11px] text-[#1B6B2A] font-bold hover:underline"
                >
                  {lang === 'ur' ? 'تمام ماڈلز' : 'See all'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.tractors.slice(0, 4).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleResultClick(`/tractors?highlight=${t.id}`)}
                    className="p-2.5 bg-white rounded-xl border border-[#E3D3A8] hover:border-[#1B6B2A] text-left transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                  >
                    <div>
                      <span className="font-black text-xs text-gray-900 group-hover:text-[#1B6B2A] block">
                        {t.name}
                      </span>
                      <span className="text-[11px] text-gray-500">{t.horsepower} HP • {t.brand}</span>
                    </div>
                    <span className="text-sm font-black text-[#0B3A17] bg-[#FFF3D6] px-2 py-0.5 rounded-md">
                      {formatPKR(t.pricePKR)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group 3: Kissan Mandi Live Listings */}
          {searchResults.mandiListings.length > 0 && (
            <div className="pt-3 pb-2 border-b border-[#E3D3A8]/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#0B3A17] flex items-center gap-1.5 uppercase tracking-wide">
                  <ShoppingBag className="w-4 h-4 text-[#1B6B2A]" />
                  <span>{lang === 'ur' ? 'کسان منڈی لائیو اشتہارات' : 'Mandi Marketplace Listings'}</span>
                </span>
                <button
                  onClick={() => handleResultClick(`/market?search=${encodeURIComponent(searchResults.cleanedQuery)}`)}
                  className="text-[11px] text-[#1B6B2A] font-bold hover:underline"
                >
                  {lang === 'ur' ? 'منڈی دیکھیں' : 'See all'}
                </button>
              </div>

              <div className="space-y-1.5">
                {searchResults.mandiListings.slice(0, 3).map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleResultClick(`/market/${l.id}`)}
                    className="w-full p-2.5 bg-white rounded-xl border border-[#E3D3A8] hover:border-[#1B6B2A] text-left transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-xs text-gray-900 group-hover:text-[#1B6B2A] block truncate">
                        {l.title}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {l.category} • {l.sellerCity}
                      </span>
                    </div>
                    <span className="text-xs font-black text-[#0B3A17] shrink-0 bg-[#E8F5E9] px-2 py-1 rounded-md">
                      {formatPKR(l.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group 4: Learning Center Crop Guides */}
          {searchResults.crops.length > 0 && (
            <div className="pt-3 pb-2 border-b border-[#E3D3A8]/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#0B3A17] flex items-center gap-1.5 uppercase tracking-wide">
                  <BookOpen className="w-4 h-4 text-[#1B6B2A]" />
                  <span>{lang === 'ur' ? 'پیداواری رہنمائی و زرعی معلومات' : 'Crop Production Guides'}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {searchResults.crops.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleResultClick(`/learn/${c.id}`)}
                    className="p-2 bg-white rounded-xl border border-[#E3D3A8] hover:border-[#1B6B2A] text-center transition-all group cursor-pointer shadow-xs"
                  >
                    <span className="font-black text-xs text-gray-900 group-hover:text-[#1B6B2A] block">
                      {lang === 'ur' ? c.nameUr : c.nameEn}
                    </span>
                    <span className="text-[10px] text-gray-500">{c.season}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group 5: Schemes */}
          {searchResults.schemes.length > 0 && (
            <div className="pt-3 pb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#0B3A17] flex items-center gap-1.5 uppercase tracking-wide">
                  <Landmark className="w-4 h-4 text-[#1B6B2A]" />
                  <span>{lang === 'ur' ? 'حکومتی زرعی اسکیمیں و سبسڈی' : 'Government Agri Schemes'}</span>
                </span>
              </div>

              <div className="space-y-1.5">
                {searchResults.schemes.slice(0, 2).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleResultClick(`/schemes?highlight=${s.id}`)}
                    className="w-full p-2 bg-white rounded-xl border border-[#E3D3A8] hover:border-[#1B6B2A] text-left transition-all group cursor-pointer shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-gray-900 group-hover:text-[#1B6B2A] block">
                        {lang === 'ur' ? s.titleUr : s.titleEn}
                      </span>
                      <span className="text-[10px] text-gray-500">{s.authorityEn}</span>
                    </div>
                    <span className="text-[11px] text-[#1B6B2A] font-bold">
                      {lang === 'ur' ? 'تفصیلات دیکھیں' : 'View'} →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {searchResults.totalCount === 0 && (
            <div className="py-6 text-center space-y-2">
              <p className="text-sm font-bold text-gray-700">
                {lang === 'ur'
                  ? `"${queryText}" کے لیے کوئی نتیجہ نہیں ملا۔`
                  : `No results found for "${queryText}".`}
              </p>
              <p className="text-xs text-gray-500">
                {lang === 'ur'
                  ? 'یوریا، ڈی اے پی، ٹریکٹر ماڈل، گندم یا کسان کارڈ بول کر یا لکھ کر دوبارہ کوشش کریں۔'
                  : 'Try searching or speaking words like "Urea price", "Millat 385", "Wheat rate", or "Kissan Card".'}
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
