import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AGRI_SCHEMES, AgriScheme } from '../data/schemesData';
import { fetchAgriNews, LiveNewsArticle } from '../utils/rssNewsService';
import { 
  Landmark, 
  Award, 
  ShieldCheck, 
  Phone, 
  ExternalLink, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  X,
  ListOrdered,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const SchemesPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const [selectedScheme, setSelectedScheme] = useState<AgriScheme | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [schemeNews, setSchemeNews] = useState<LiveNewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState<boolean>(true);
  const [lastUpdatedNews, setLastUpdatedNews] = useState<string>('');

  const loadSubsidyNews = async () => {
    setLoadingNews(true);
    try {
      const query = lang === 'ur' 
        ? 'کسان کارڈ سبسیڈی زراعت پاکستان' 
        : 'Kissan Card OR "Kissan Package" OR "agriculture subsidy" Pakistan';
      const res = await fetchAgriNews(lang, query);
      setSchemeNews(res.articles.slice(0, 6));
      setLastUpdatedNews(res.lastUpdated);
    } catch (e) {
      console.warn('Failed to fetch scheme news:', e);
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    loadSubsidyNews();

    // Auto-refresh every 15 minutes as requested
    const interval = setInterval(() => {
      loadSubsidyNews();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [lang]);

  const openSchemeModal = (scheme: AgriScheme) => {
    setSelectedScheme(scheme);
    setModalOpen(true);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 text-start">
      
      {/* Header */}
      <div className="pb-6 border-b border-[#E3D3A8]">
        <div className="flex items-center gap-2 text-[#0B3A17] font-bold text-xs uppercase tracking-wider mb-1">
          <Landmark className="w-4 h-4 text-[#1B6B2A]" />
          <span>{lang === 'ur' ? 'حکومتی زرعی ریلیف و کسان فلاح' : 'Official Farmer Welfare & Subsidies'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#0B3A17]">
          {t.schemesTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#3E3E3E] mt-1 max-w-3xl">
          {t.schemesSubtitle}
        </p>

        {/* Verification Note */}
        <div className="mt-4 p-4 bg-[#FFFBEF] border border-[#E3D3A8] rounded-2xl flex items-center gap-2.5 text-xs text-[#1A1A1A]">
          <AlertCircle className="w-4 h-4 text-[#F2A900] shrink-0" />
          <span className="font-semibold">{t.govtDisclaimer}</span>
        </div>
      </div>

      {/* Section 1: "Know the Schemes" Cards */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-[#0B3A17] flex items-center gap-2">
            <Award className="w-6 h-6 text-[#F2A900]" />
            <span>{lang === 'ur' ? 'اہم حکومتی زرعی سکیمیں' : 'Primary Agricultural Schemes'}</span>
          </h2>
          <span className="text-xs text-[#1B6B2A] font-bold bg-[#FFFBEF] px-3 py-1 rounded-full border border-[#E3D3A8]">
            {AGRI_SCHEMES.length} {lang === 'ur' ? 'سکیمیں دستیاب' : 'Schemes verified'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGRI_SCHEMES.map((scheme) => (
            <div
              key={scheme.id}
              onClick={() => openSchemeModal(scheme)}
              className="p-6 rounded-3xl border border-[#E3D3A8] bg-[#FFFBEF] hover:bg-white shadow-md hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#0F3D1E] text-[#FFF8E1]">
                    {lang === 'ur' ? scheme.badgeUr : scheme.badgeEn}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold">Official Govt</span>
                </div>

                <h3 className="text-lg font-black text-[#1A1A1A] group-hover:text-[#1B6B2A] transition-colors leading-snug">
                  {lang === 'ur' ? scheme.titleUr : scheme.titleEn}
                </h3>

                <p className="text-xs text-[#1B6B2A] font-bold">
                  {lang === 'ur' ? scheme.authorityUr : scheme.authorityEn}
                </p>

                <p className="text-xs text-[#3E3E3E] line-clamp-3 leading-relaxed">
                  {lang === 'ur' ? scheme.summaryUr : scheme.summaryEn}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E3D3A8]/60 flex items-center justify-between text-xs font-black text-[#0B3A17]">
                <span>{lang === 'ur' ? 'اہلیت، کاغذات و طریقہ کار دیکھیں' : 'View Full Details & Documents'}</span>
                <span className="w-8 h-8 rounded-full bg-[#1B6B2A] text-white flex items-center justify-center group-hover:bg-[#0F3D1E] transition-colors">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FULL DETAIL MODAL (Opens on scheme card click) */}
      {modalOpen && selectedScheme && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFBEF] rounded-3xl max-w-3xl w-full p-6 sm:p-8 border-2 border-[#1B6B2A] shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E3D3A8]">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#0F3D1E] px-3 py-1 bg-[#F2A900] rounded-full inline-block">
                  {lang === 'ur' ? selectedScheme.badgeUr : selectedScheme.badgeEn}
                </span>
                <h3 className="text-2xl font-black text-[#0B3A17] mt-2">
                  {lang === 'ur' ? selectedScheme.titleUr : selectedScheme.titleEn}
                </h3>
                <p className="text-xs text-[#3E3E3E] font-bold mt-1">
                  {lang === 'ur' ? selectedScheme.authorityUr : selectedScheme.authorityEn}
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-gray-500 hover:text-black hover:bg-white rounded-full transition-colors cursor-pointer shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* What it is */}
            <div className="bg-white p-5 rounded-2xl border border-[#E3D3A8] space-y-2">
              <h4 className="font-black text-[#0B3A17] text-sm">
                {lang === 'ur' ? 'سکیم کا تعارف و مقصد' : 'Overview & Purpose'}
              </h4>
              <p className="text-xs sm:text-sm text-[#1A1A1A] leading-relaxed">
                {lang === 'ur' ? selectedScheme.summaryUr : selectedScheme.summaryEn}
              </p>
            </div>

            {/* Grid: Eligibility & Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Who is eligible */}
              <div className="bg-white p-5 rounded-2xl border border-[#E3D3A8] space-y-3">
                <h4 className="font-black text-[#0B3A17] text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1B6B2A]" />
                  <span>{t.eligibility}</span>
                </h4>
                <ul className="space-y-2 text-xs text-[#3E3E3E]">
                  {(lang === 'ur' ? selectedScheme.eligibilityUr : selectedScheme.eligibilityEn).map((el, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#1B6B2A] font-black">•</span>
                      <span>{el}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Documents Needed */}
              <div className="bg-white p-5 rounded-2xl border border-[#E3D3A8] space-y-3">
                <h4 className="font-black text-[#0B3A17] text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1B6B2A]" />
                  <span>{t.documentsNeeded}</span>
                </h4>
                <ul className="space-y-2 text-xs text-[#3E3E3E]">
                  {(lang === 'ur' ? selectedScheme.documentsUr : selectedScheme.documentsEn).map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#F2A900] font-black">•</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Benefits */}
            <div className="bg-white p-5 rounded-2xl border border-[#E3D3A8] space-y-3">
              <h4 className="font-black text-[#0B3A17] text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1B6B2A]" />
                <span>{t.benefits}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#3E3E3E]">
                {(lang === 'ur' ? selectedScheme.benefitsUr : selectedScheme.benefitsEn).map((b, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-[#FFF3D6] p-2.5 rounded-xl border border-[#E3D3A8]">
                    <span className="text-[#1B6B2A] font-black">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step How to Apply */}
            <div className="bg-[#FFF3D6] p-5 rounded-2xl border border-[#E3D3A8] space-y-3">
              <h4 className="font-black text-[#0B3A17] text-sm flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-[#1B6B2A]" />
                <span>{t.howToApply}</span>
              </h4>
              <div className="space-y-2 text-xs text-[#1A1A1A]">
                {(lang === 'ur' ? selectedScheme.stepsUr : selectedScheme.stepsEn).map((step, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-[#E3D3A8] flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1B6B2A] text-white flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Helpline and Official Website Links */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E3D3A8]">
              {selectedScheme.helpline && (
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B3A17]">
                  <Phone className="w-4 h-4 text-[#F2A900]" />
                  <span>{t.officialHelpline}: {selectedScheme.helpline}</span>
                </div>
              )}

              <a
                href={selectedScheme.officialSite}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#1B6B2A] hover:bg-[#0F3D1E] text-white rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>{t.visitOfficialPortal}</span>
                <ExternalLink className="w-4 h-4 text-[#F2A900]" />
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Section 2: Live Subsidy News Feed with Dual-Proxy & 15-min auto-refresh */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3D3A8]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0B3A17]">
              {t.subsidyNewsTitle}
            </h2>
            <p className="text-xs text-[#3E3E3E]">
              {t.autoRefreshNote}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdatedNews && (
              <span className="text-xs text-gray-500 font-bold bg-[#FFFBEF] px-3 py-1 rounded-xl border border-[#E3D3A8]">
                {t.lastUpdated}: {lastUpdatedNews}
              </span>
            )}
            <button
              onClick={loadSubsidyNews}
              disabled={loadingNews}
              className="p-2 bg-[#1B6B2A] hover:bg-[#0F3D1E] text-white rounded-xl cursor-pointer"
              title="Refresh News Feed"
            >
              <RefreshCw className={`w-4 h-4 ${loadingNews ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {schemeNews.map((newsItem, index) => (
            <div
              key={index}
              className="bg-[#FFFBEF] rounded-3xl p-5 border border-[#E3D3A8] shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span className="font-bold text-[#0B3A17] bg-[#FFF3D6] px-2.5 py-0.5 rounded-full border border-[#E3D3A8]">
                    {newsItem.source}
                  </span>
                  <span>{new Date(newsItem.pubDate).toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm font-black text-[#1A1A1A] leading-snug line-clamp-3">
                  {newsItem.title}
                </h4>
                {newsItem.description && (
                  <p className="text-xs text-[#3E3E3E] line-clamp-2 leading-relaxed">
                    {newsItem.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E3D3A8]/60 flex items-center justify-between">
                <a
                  href={newsItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-[#1B6B2A] hover:bg-[#0F3D1E] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{t.readFullStory}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#F2A900]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
