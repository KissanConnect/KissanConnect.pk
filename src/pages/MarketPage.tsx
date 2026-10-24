import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { subscribeToListings, incrementListingView } from '../services/dataService';
import { Listing, ListingCategory } from '../types';
import { formatPKR, timeAgo } from '../utils/formatters';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  PlusCircle, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Tag, 
  SlidersHorizontal,
  Flame,
  CheckCircle,
  Eye,
  MessageSquare
} from 'lucide-react';
import { WholesalerRatingBadge } from '../components/WholesalerRatingBadge';
import { WholesalerReviewModal } from '../components/WholesalerReviewModal';

const CATEGORIES: ('All' | ListingCategory)[] = [
  'All',
  'Crops/Produce',
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Tractors',
  'Farm Machinery',
  'Equipment/Tools',
  'Livestock',
  'Land/Rent',
  'Buy Requests'
];

export const MarketPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { currentUser } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ListingCategory>('All');
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [selectedWholesalerForReview, setSelectedWholesalerForReview] = useState<{
    uid: string;
    name: string;
    city: string;
    phone?: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToListings((data) => {
      setListings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredListings = listings
    .filter((l) => {
      if (selectedCategory !== 'All' && l.category !== selectedCategory) return false;
      if (selectedProvince !== 'All' && l.sellerProvince !== selectedProvince) return false;
      if (selectedCondition !== 'All' && l.condition !== selectedCondition) return false;
      if (selectedRole !== 'All' && l.sellerRole !== selectedRole) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          l.title.toLowerCase().includes(q) ||
          l.sellerCity.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          (l.quantity && l.quantity.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-start">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-[#1B5E20] font-bold text-xs uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Pakistan’s Free Agricultural Classifieds</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#1B5E20]">
            {t.marketTitle}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
            {t.marketSubtitle}
          </p>
        </div>

        <Link
          to="/create-listing"
          className="px-6 py-3.5 bg-[#F9A825] hover:bg-[#F57F17] text-[#1B5E20] font-black text-sm rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105 self-start md:self-auto shrink-0"
        >
          <PlusCircle className="w-5 h-5 text-[#1B5E20]" />
          <span>{t.postListingBtn}</span>
        </Link>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="bg-[#FFFBEF] rounded-3xl p-5 sm:p-6 shadow-md border border-[#E3D3A8] space-y-4">
        
        {/* Main Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'ur'
                ? 'فصل، ٹریکٹر، کھاد، بیج یا شہر کا نام تلاش کریں...'
                : 'Search wheat, basmati paddy, laser leveler, tractor, or city...'
            }
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E3D3A8] rounded-2xl text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#1B6B2A]"
          />
        </div>

        {/* Category Pills Slider */}
        <div className="overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#1B6B2A] text-white shadow-xs'
                    : 'bg-white hover:bg-amber-100/60 text-gray-800 border border-[#E3D3A8]/70'
                }`}
              >
                {cat === 'All' ? (lang === 'ur' ? 'تمام کیٹیگریز' : 'All') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100 text-xs">
          
          {/* Province */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
              {t.province}
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E3D3A8] rounded-xl font-semibold text-gray-900"
            >
              <option value="All">{t.allProvinces}</option>
              <option value="Punjab">Punjab</option>
              <option value="Sindh">Sindh</option>
              <option value="KPK">Khyber Pakhtunkhwa</option>
              <option value="Balochistan">Balochistan</option>
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
              {t.condition}
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E3D3A8] rounded-xl font-semibold text-gray-900"
            >
              <option value="All">{t.all}</option>
              <option value="new">New (نیا)</option>
              <option value="used">Used (زیرِ استعمال)</option>
            </select>
          </div>

          {/* Seller Type */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
              Seller Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E3D3A8] rounded-xl font-semibold text-gray-900"
            >
              <option value="All">All Sellers</option>
              <option value="farmer">Farmer Only (کسان)</option>
              <option value="wholesaler">Wholesaler / Dealer (تاجر)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
              {t.sortBy}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-[#E3D3A8] rounded-xl font-semibold text-gray-900"
            >
              <option value="newest">{t.newestFirst}</option>
              <option value="price-asc">{t.priceLowHigh}</option>
              <option value="price-desc">{t.priceHighLow}</option>
            </select>
          </div>

        </div>

      </div>

      {/* Listings Count & Live Indicator */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
        <span>
          Showing <strong>{filteredListings.length}</strong> active agricultural listings
        </span>
        <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Mandi Feed</span>
        </span>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-72 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((item) => {
            const isBuyReq = item.category === 'Buy Requests';
            const img = item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80';

            return (
              <Link
                key={item.id}
                to={`/market/${item.id}`}
                onClick={() => incrementListingView(item.id)}
                className="group bg-[#FFFBEF] rounded-3xl overflow-hidden border border-[#E3D3A8] shadow-md hover:shadow-2xl hover:border-[#1B6B2A] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo with badges */}
                  <div className="h-48 w-full relative bg-gray-100 overflow-hidden">
                    <img
                      src={img}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                    {/* Category pill */}
                    <div className="absolute top-3 left-3 bg-[#1B5E20]/90 text-white font-bold text-[10px] px-2.5 py-1 rounded-full backdrop-blur-xs">
                      {item.category}
                    </div>

                    {isBuyReq && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow-md animate-pulse">
                        {t.buyRequestBadge}
                      </div>
                    )}

                    {item.isSold && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-1 rounded-xl font-black text-sm uppercase">
                          SOLD OUT (فروخت شدہ)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    
                    {/* Location & Time */}
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="flex items-center gap-1 font-semibold text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-[#2E7D32]" />
                        {item.sellerCity}, {item.sellerProvince}
                      </span>
                      <span>{timeAgo(item.createdAt, lang === 'ur')}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#1B5E20] transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Price in PKR */}
                    <div className="pt-1">
                      <span className="text-lg sm:text-xl font-black text-[#1B5E20]">
                        {formatPKR(item.price)}
                      </span>
                      {item.isNegotiable && (
                        <span className="text-[11px] text-gray-500 ml-1.5 font-medium">
                          ({t.negotiable})
                        </span>
                      )}
                    </div>

                    {/* Quantity or Condition */}
                    {item.quantity && (
                      <div className="text-xs text-gray-600 font-semibold bg-gray-50 px-2.5 py-1 rounded-lg inline-block">
                        Qty: {item.quantity}
                      </div>
                    )}

                    {/* Wholesaler or Buy Request Rating Badge */}
                    {(item.sellerRole === 'wholesaler' || isBuyReq) && (
                      <div 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedWholesalerForReview({
                            uid: item.userId,
                            name: item.sellerName,
                            city: item.sellerCity,
                            phone: item.sellerPhone
                          });
                        }}
                        className="pt-1"
                        title="Click to view wholesaler ratings and farmer reviews"
                      >
                        <WholesalerRatingBadge wholesalerUid={item.userId} />
                      </div>
                    )}

                  </div>
                </div>

                {/* Footer Badges */}
                <div className="p-4 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-gray-600 font-semibold truncate max-w-[150px]">
                    <span className="w-2 h-2 rounded-full bg-[#81C784]"></span>
                    <span>{item.sellerName}</span>
                  </div>

                  {item.isVerifiedPhone && (
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t.verified}</span>
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {filteredListings.length === 0 && !loading && (
        <div className="text-center py-16 bg-[#FFFBEF] rounded-3xl p-8 border border-[#E3D3A8] space-y-3">
          <ShoppingBag className="w-12 h-12 text-[#1B6B2A]/40 mx-auto" />
          <h3 className="text-base font-black text-[#0B3A17]">
            {lang === 'ur' ? 'کوئی اشتہار نہیں ملا' : 'No listings found matching your search'}
          </h3>
          <p className="text-xs text-gray-700 max-w-sm mx-auto">
            {lang === 'ur'
              ? 'اپنے فلٹرز تبدیل کر کے دوبارہ کوشش کریں یا مفت اشتہار شائع کریں۔'
              : 'Try clearing some filters or post the first listing for your area.'}
          </p>
          <Link
            to="/create-listing"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B6B2A] hover:bg-[#0F3D1E] text-white font-bold rounded-xl text-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.postListingBtn}</span>
          </Link>
        </div>
      )}

      {/* Wholesaler Review Modal */}
      {selectedWholesalerForReview && (
        <WholesalerReviewModal
          wholesalerUid={selectedWholesalerForReview.uid}
          wholesalerName={selectedWholesalerForReview.name}
          wholesalerCity={selectedWholesalerForReview.city}
          wholesalerPhone={selectedWholesalerForReview.phone}
          isOpen={Boolean(selectedWholesalerForReview)}
          onClose={() => setSelectedWholesalerForReview(null)}
        />
      )}

    </div>
  );
};
