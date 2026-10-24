import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { fetchAgriNews, LiveNewsArticle } from '../utils/rssNewsService';
import { 
  Newspaper, 
  RefreshCw, 
  Clock, 
  ExternalLink, 
  Search,
  CheckCircle2
} from 'lucide-react';

export const NewsPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const [news, setNews] = useState<LiveNewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isUsingCached, setIsUsingCached] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAgriNews(lang);
      setNews(res.articles);
      setLastUpdated(res.lastUpdated);
      setIsUsingCached(res.isCached);
    } catch (e) {
      console.warn('News page fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    loadNews();

    // Auto-refresh every 15 minutes as required
    const interval = setInterval(() => {
      loadNews();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadNews]);

  const filteredNews = news.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-start">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E3D3A8]">
        <div>
          <div className="flex items-center gap-2 text-[#0B3A17] font-bold text-xs uppercase tracking-wider mb-1">
            <Newspaper className="w-4 h-4 text-[#1B6B2A]" />
            <span>{lang === 'ur' ? 'گوگل نیوز آر ایس ایس فیڈ (پاکستان)' : 'Google News RSS Aggregator (Pakistan)'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#0B3A17]">
            {t.newsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#3E3E3E] mt-1">
            {t.newsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-[#FFFBEF] px-3 py-2 rounded-xl border border-[#E3D3A8] shadow-xs font-bold">
              <Clock className="w-4 h-4 text-[#1B6B2A]" />
              <span>{t.lastUpdated}: {lastUpdated}</span>
            </div>
          )}

          <button
            onClick={loadNews}
            disabled={loading}
            className="px-3.5 py-2 bg-[#1B6B2A] hover:bg-[#0F3D1E] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? (lang === 'ur' ? 'اپ ڈیٹ ہو رہا ہے...' : 'Refreshing...') : t.refresh}</span>
          </button>
        </div>
      </div>

      {/* Auto-refresh Notice */}
      <div className="p-4 bg-[#FFFBEF] border border-[#E3D3A8] rounded-2xl flex items-center justify-between gap-3 text-xs text-[#1A1A1A]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#F2A900] shrink-0" />
          <span>{t.autoRefreshNote}</span>
        </div>
        {isUsingCached && (
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
            {lang === 'ur' ? 'آف لائن کیش' : 'Offline Cache'}
          </span>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-[#FFFBEF] rounded-3xl p-4 sm:p-5 shadow-sm border border-[#E3D3A8]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ur' ? 'خبروں میں تلاش کریں (مثلاً گندم، کھاد، کپاس، سبسیڈی)...' : 'Search news by keyword (wheat, urea, DAP, cotton, subsidy)...'}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E3D3A8] rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1B6B2A]"
          />
        </div>
      </div>

      {/* News Cards Grid */}
      {loading && news.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#FFFBEF] rounded-3xl p-5 border border-[#E3D3A8] animate-pulse space-y-3 h-48">
              <div className="h-4 bg-gray-200 rounded-md w-1/3"></div>
              <div className="h-5 bg-gray-200 rounded-md w-full"></div>
              <div className="h-12 bg-gray-200 rounded-md w-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#FFFBEF] rounded-3xl p-5 sm:p-6 border border-[#E3D3A8] shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span className="font-bold text-[#0B3A17] bg-[#FFF3D6] px-2.5 py-0.5 rounded-full border border-[#E3D3A8]">
                    {item.source}
                  </span>
                  <span>{new Date(item.pubDate).toLocaleDateString()}</span>
                </div>

                <h3 className="text-base font-black text-[#1A1A1A] leading-snug">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-xs text-[#3E3E3E] line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Requirement: Every live news card must open its article in a new tab. Add a visible "Read full story" button */}
              <div className="mt-5 pt-4 border-t border-[#E3D3A8]/60 flex items-center justify-between">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1B6B2A] hover:bg-[#0F3D1E] text-white rounded-xl text-xs font-black inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-105"
                >
                  <span>{t.readFullStory}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#F2A900]" />
                </a>
                <span className="text-[10px] text-gray-400 font-semibold">Google News</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
