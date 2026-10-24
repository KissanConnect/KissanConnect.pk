import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Sparkles } from 'lucide-react';
import { getWholesalerReviews, computeWholesalerStats, WholesalerStats } from '../services/reviewService';
import { useLanguage } from '../context/LanguageContext';

interface WholesalerRatingBadgeProps {
  wholesalerUid: string;
  onClick?: () => void;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const WholesalerRatingBadge: React.FC<WholesalerRatingBadgeProps> = ({
  wholesalerUid,
  onClick,
  showBadge = true,
  size = 'sm'
}) => {
  const { lang } = useLanguage();
  const [stats, setStats] = useState<WholesalerStats>({
    averageRating: 0,
    reviewCount: 0,
    categoryAverages: { honesty: 0, paymentSpeed: 0, behavior: 0 },
    starBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    badge: 'new'
  });

  useEffect(() => {
    let isMounted = true;
    getWholesalerReviews(wholesalerUid).then((revs) => {
      if (isMounted) {
        setStats(computeWholesalerStats(revs));
      }
    });

    const handleUpdate = () => {
      getWholesalerReviews(wholesalerUid).then((revs) => {
        if (isMounted) {
          setStats(computeWholesalerStats(revs));
        }
      });
    };
    window.addEventListener('kissan_storage_update_kissan_wholesaler_reviews', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('kissan_storage_update_kissan_wholesaler_reviews', handleUpdate);
    };
  }, [wholesalerUid]);

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
    >
      {/* Star + Score + Count */}
      <div className="flex items-center gap-1 bg-[#FFF3D6] border border-[#E3D3A8] px-2 py-0.5 rounded-lg">
        <Star className="w-3.5 h-3.5 fill-[#F2A900] text-[#F2A900]" />
        <span className="font-black text-xs text-[#0B3A17]">
          {stats.reviewCount > 0 ? stats.averageRating : (lang === 'ur' ? 'نیا' : 'New')}
        </span>
        {stats.reviewCount > 0 && (
          <span className="text-[10px] text-gray-500 font-semibold">
            ({stats.reviewCount})
          </span>
        )}
      </div>

      {/* Trust Badges */}
      {showBadge && (
        <>
          {stats.badge === 'trusted' && (
            <span 
              className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-lg text-[10px] font-black"
              title="Average 4.5+ with 10+ farmer reviews"
            >
              <ShieldCheck className="w-3 h-3 text-[#2E7D32]" />
              <span>{lang === 'ur' ? 'قابل اعتماد خریدار' : 'Trusted Buyer'}</span>
            </span>
          )}

          {stats.badge === 'new' && (
            <span 
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-lg text-[10px] font-semibold"
              title="Fewer than 3 reviews"
            >
              <span>{lang === 'ur' ? 'نیا تاجر' : 'New Seller'}</span>
            </span>
          )}
        </>
      )}
    </div>
  );
};
