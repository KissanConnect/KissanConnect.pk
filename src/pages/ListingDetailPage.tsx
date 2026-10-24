import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getListings, saveListing, deleteListing, reportListing } from '../services/dataService';
import { Listing, ReportedListing } from '../types';
import { formatPKR, formatDate } from '../utils/formatters';
import { ChatModal } from '../components/ChatModal';
import { WholesalerRatingBadge } from '../components/WholesalerRatingBadge';
import { WholesalerReviewModal } from '../components/WholesalerReviewModal';
import { recordWholesalerContact } from '../services/reviewService';
import { 
  Phone, 
  MessageCircle, 
  MessageSquare,
  Share2, 
  Flag, 
  Bookmark, 
  MapPin, 
  ShieldCheck, 
  ArrowLeft, 
  Calendar, 
  Eye, 
  Tag, 
  User, 
  CheckCircle,
  X,
  AlertTriangle,
  Edit,
  Trash2,
  Star
} from 'lucide-react';

export const ListingDetailPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { currentUser } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  // Modals
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('Incorrect Price / Fraud');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    getListings().then((all) => {
      const found = all.find((l) => l.id === listingId);
      if (found) {
        setListing(found);
      }
      setLoading(false);
    });
  }, [listingId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <p className="text-sm font-semibold text-gray-500">{t.loading}</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Listing Not Found</h2>
        <p className="text-sm text-gray-500">This listing may have been sold or removed by the owner.</p>
        <Link to="/market" className="px-5 py-2.5 bg-[#1B5E20] text-white rounded-xl text-sm font-bold inline-block">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = currentUser?.uid === listing.userId;
  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80'];

  // WhatsApp prefilled message
  const whatsappUrl = `https://wa.me/${listing.sellerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Assalam-o-Alaikum, I saw your listing on Kissan Connect: "${listing.title}" for Rs. ${listing.price.toLocaleString()}. Is this still available?`
  )}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out ${listing.title} on Kissan Connect Mandi!`,
        url: window.location.href
      }).catch(() => null);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const report: ReportedListing = {
      id: 'rep_' + Date.now(),
      listingId: listing.id,
      listingTitle: listing.title,
      reportedBy: currentUser?.email || 'Anonymous Visitor',
      reason: reportReason,
      details: reportDetails,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    await reportListing(report);
    setReportSuccess(true);
    setTimeout(() => {
      setIsReportOpen(false);
      setReportSuccess(false);
      setReportDetails('');
    }, 2000);
  };

  const handleMarkSold = async () => {
    const updated = { ...listing, isSold: !listing.isSold };
    await saveListing(updated);
    setListing(updated);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this listing?')) {
      await deleteListing(listing.id);
      navigate('/market');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1B5E20] hover:text-[#2E7D32] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ur' ? 'مارکیٹ کی طرف واپس' : 'Back to Market'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Photo Gallery */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Photo */}
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl relative aspect-4/3 group">
            <img
              src={images[selectedPhotoIndex] || images[0]}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
            />

            {listing.isSold && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-red-600 text-white px-6 py-2 rounded-2xl font-black text-lg uppercase tracking-wider">
                  SOLD OUT (فروخت شدہ)
                </span>
              </div>
            )}

            <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-xs font-semibold">
              {selectedPhotoIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedPhotoIndex === idx
                      ? 'border-[#1B5E20] ring-2 ring-[#1B5E20]/20'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-4">
            <h3 className="text-lg sm:text-xl font-black text-[#1B5E20]">
              {t.descriptionLabel}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

        </div>

        {/* Right Column: Listing Details & Seller Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
            
            {/* Category & Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-[#E8F5E9] text-[#1B5E20] rounded-xl">
                {listing.category}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                Posted {formatDate(listing.createdAt, lang === 'ur')}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
              {listing.title}
            </h1>

            {/* Price */}
            <div className="p-4 bg-[#FFFDF5] rounded-2xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-500 block uppercase">
                  {lang === 'ur' ? 'طلب کردہ قیمت' : 'Asking Price'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#1B5E20]">
                  {formatPKR(listing.price)}
                </span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-amber-300 text-amber-900">
                {listing.isNegotiable ? t.negotiable : t.fixedPrice}
              </span>
            </div>

            {/* Specs Table */}
            <div className="space-y-2.5 text-xs sm:text-sm border-t border-b border-gray-100 py-4">
              <div className="flex justify-between items-center text-gray-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-[#2E7D32]" />
                  <span>{t.city} / Location</span>
                </span>
                <span className="font-bold text-gray-900">{listing.sellerCity}, {listing.sellerProvince}</span>
              </div>

              {listing.quantity && (
                <div className="flex justify-between items-center text-gray-600">
                  <span className="font-medium">Quantity</span>
                  <span className="font-bold text-gray-900">{listing.quantity}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-gray-600">
                <span className="font-medium">{t.condition}</span>
                <span className="font-bold text-gray-900 capitalize">{listing.condition}</span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <span className="font-medium">Views</span>
                <span className="font-bold text-gray-900">{listing.viewsCount || 1} views</span>
              </div>
            </div>

            {/* Seller Contact Big Action Buttons */}
            <div className="space-y-3 pt-2">
              
              {/* Call Now Button */}
              <a
                href={`tel:${listing.sellerPhone}`}
                onClick={() => {
                  if (currentUser?.uid && listing.userId) {
                    recordWholesalerContact(currentUser.uid, listing.userId);
                  }
                }}
                className="w-full py-4 px-6 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black text-sm sm:text-base rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <Phone className="w-5 h-5 text-[#81C784]" />
                <span>{t.callNow} ({listing.sellerPhone})</span>
              </a>

              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  if (currentUser?.uid && listing.userId) {
                    recordWholesalerContact(currentUser.uid, listing.userId);
                  }
                }}
                className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-sm sm:text-base rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>{lang === 'ur' ? 'واٹس ایپ پر رابطہ کریں' : 'Chat on WhatsApp'}</span>
              </a>

              {/* In-App Messaging Button */}
              <button
                onClick={() => {
                  if (currentUser?.uid && listing.userId) {
                    recordWholesalerContact(currentUser.uid, listing.userId);
                  }
                  setIsChatOpen(true);
                }}
                className="w-full py-3.5 px-6 bg-[#FFF8E7] hover:bg-[#FFE082] text-[#1B5E20] font-bold text-sm rounded-2xl border border-[#F9A825] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-[#F9A825]" />
                <span>{t.chatNow}</span>
              </button>

            </div>

            {/* Seller Info Card with Wholesaler Rating & Review Modal trigger */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#81C784] text-[#1B5E20] flex items-center justify-center font-bold text-lg">
                  {listing.sellerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-gray-900 truncate">{listing.sellerName}</h4>
                    {listing.isVerifiedPhone && (
                      <span title="Phone Verified">
                        <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 capitalize">
                    {listing.sellerRole === 'wholesaler' ? 'تاجر / ڈیلر' : 'کسان / زمیندار'} • {listing.sellerCity}
                  </p>
                </div>
              </div>

              {/* Wholesaler Rating & Review trigger */}
              {listing.sellerRole === 'wholesaler' && (
                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                  <WholesalerRatingBadge 
                    wholesalerUid={listing.userId} 
                    onClick={() => setIsReviewModalOpen(true)}
                  />
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="text-xs font-bold text-[#1B5E20] hover:text-[#2E7D32] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 text-[#F2A900] fill-[#F2A900]" />
                    <span>{lang === 'ur' ? 'ریٹنگ اور جائزے دیکھیں' : 'Reviews & Ratings'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions Bar (Share, Report, Save) */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-semibold cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? (lang === 'ur' ? 'لنک کاپی ہو گیا!' : 'Copied!') : t.shareListing}</span>
              </button>

              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`flex items-center gap-1.5 font-semibold cursor-pointer ${
                  isSaved ? 'text-[#1B5E20]' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={() => setIsReportOpen(true)}
                className="flex items-center gap-1.5 text-red-600 hover:text-red-700 font-semibold cursor-pointer"
              >
                <Flag className="w-4 h-4" />
                <span>{t.reportListing}</span>
              </button>
            </div>

            {/* Owner Controls (Edit, Mark Sold, Delete) */}
            {isOwner && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                <span className="text-xs font-bold text-amber-900 block">
                  {lang === 'ur' ? 'آپ اس اشتہار کے مالک ہیں:' : 'Owner Controls:'}
                </span>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleMarkSold}
                    className="px-3.5 py-1.5 bg-[#1B5E20] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {listing.isSold ? 'Mark Active' : 'Mark as Sold (فروخت شدہ)'}
                  </button>

                  <button
                    onClick={handleDelete}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>{t.reportListing}</span>
              </h3>
              <button onClick={() => setIsReportOpen(false)} className="text-gray-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-[#2E7D32] mx-auto" />
                <h4 className="font-bold text-gray-900">Report Submitted</h4>
                <p className="text-xs text-gray-500">Thank you. Our moderation team will review this listing.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="Incorrect Price / Fraud">Fraud or unrealistically low price</option>
                    <option value="Spam / Duplicate">Spam / duplicate advertisement</option>
                    <option value="Invalid Phone Number">Invalid or unreachable phone number</option>
                    <option value="Wrong Category">Wrong category</option>
                    <option value="Offensive Content">Inappropriate content or photo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Additional details (Optional)</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe the issue..."
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* In-App Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        listing={listing}
      />

      {/* Wholesaler Review & Ratings Modal */}
      {listing.sellerRole === 'wholesaler' && (
        <WholesalerReviewModal
          wholesalerUid={listing.userId}
          wholesalerName={listing.sellerName}
          wholesalerCity={listing.sellerCity}
          wholesalerPhone={listing.sellerPhone}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}

    </div>
  );
};
