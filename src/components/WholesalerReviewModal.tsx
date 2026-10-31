import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  getWholesalerReviews, 
  subscribeWholesalerReviews,
  saveWholesalerReview,
  replyToWholesalerReview,
  reportWholesalerReview,
  hasFarmerContactedWholesaler,
  recordWholesalerContact,
  computeWholesalerStats,
  WholesalerStats
} from '../services/reviewService';
import { WholesalerReview } from '../types';
import { 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  Send, 
  Flag, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ThumbsUp, 
  Clock, 
  HeartHandshake, 
  Phone,
  Building2,
  Calendar,
  Lock,
  MessageCircle,
  HelpCircle,
  Edit2,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { hideReviewAdmin, deleteReviewAdmin } from '../services/adminService';

interface WholesalerReviewModalProps {
  wholesalerUid: string;
  wholesalerName: string;
  wholesalerCity?: string;
  wholesalerPhone?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const WholesalerReviewModal: React.FC<WholesalerReviewModalProps> = ({
  wholesalerUid,
  wholesalerName,
  wholesalerCity = 'Punjab',
  wholesalerPhone = '',
  isOpen,
  onClose
}) => {
  const { lang, t } = useLanguage();
  const { currentUser } = useAuth();

  const [reviews, setReviews] = useState<WholesalerReview[]>([]);
  const [stats, setStats] = useState<WholesalerStats>({
    averageRating: 0,
    reviewCount: 0,
    categoryAverages: { honesty: 0, paymentSpeed: 0, behavior: 0 },
    starBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    badge: 'new'
  });

  // Review Form State
  const [showForm, setShowForm] = useState<boolean>(false);
  const [honestyRating, setHonestyRating] = useState<number>(5);
  const [paymentRating, setPaymentRating] = useState<number>(5);
  const [behaviorRating, setBehaviorRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [dealType, setDealType] = useState<string>('wheat');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Wholesaler Reply State
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [replySubmitting, setReplySubmitting] = useState<boolean>(false);

  // Abuse Report Modal
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('Abusive or False Information');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  // Check if current user already submitted a review
  const existingUserReview = reviews.find((r) => r.farmerUid === currentUser?.uid);
  const hasContacted = currentUser ? hasFarmerContactedWholesaler(currentUser.uid, wholesalerUid) : false;

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = subscribeWholesalerReviews(wholesalerUid, (revs) => {
      setReviews(revs);
      setStats(computeWholesalerStats(revs));
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, wholesalerUid]);

  // Pre-fill form if editing existing review
  useEffect(() => {
    if (existingUserReview) {
      setHonestyRating(existingUserReview.ratings.honesty);
      setPaymentRating(existingUserReview.ratings.paymentSpeed);
      setBehaviorRating(existingUserReview.ratings.behavior);
      setComment(existingUserReview.comment);
      setDealType(existingUserReview.dealType || 'wheat');
    }
  }, [existingUserReview]);

  if (!isOpen) return null;

  const handleAdminToggleHideReview = async (review: WholesalerReview) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      await hideReviewAdmin(review.id, !review.hidden, currentUser);
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, hidden: !r.hidden } : r));
    } catch (e) {
      console.error('Error toggling hide on review:', e);
    }
  };

  const handleAdminDeleteReview = async (review: WholesalerReview) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    const confirm = window.confirm(
      lang === 'ur'
        ? 'کیا آپ واقعی اس تبصرے کو مستقل طور پر حذف کرنا چاہتے ہیں؟'
        : 'Are you sure you want to permanently delete this review?'
    );
    if (!confirm) return;
    try {
      await deleteReviewAdmin(review.id, currentUser);
      setReviews(prev => prev.filter(r => r.id !== review.id));
    } catch (e) {
      console.error('Error deleting review:', e);
    }
  };

  // Submit Review Handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (currentUser.suspended) {
      setFormError(lang === 'ur' ? 'آپ کا اکاؤنٹ معطل ہے۔ آپ ریویو جمع نہیں کر سکتے۔' : 'Your account is suspended. You cannot submit reviews.');
      return;
    }

    if (currentUser.role === 'wholesaler') {
      setFormError(lang === 'ur' ? 'صرف کسان تاجر کو ریٹنگ دے سکتے ہیں۔' : 'Only farmers can review wholesale buyers.');
      return;
    }

    if (currentUser.uid === wholesalerUid) {
      setFormError(lang === 'ur' ? 'آپ اپنے آپ کو ریٹنگ نہیں دے سکتے۔' : 'You cannot rate yourself.');
      return;
    }

    if (!comment.trim()) {
      setFormError(lang === 'ur' ? 'براہ کرم مختصر تبصرہ لکھیں۔' : 'Please provide a short written comment.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await saveWholesalerReview({
        id: existingUserReview?.id,
        wholesalerUid,
        wholesalerName,
        farmerUid: currentUser.uid,
        farmerName: currentUser.fullName,
        farmerCity: currentUser.city,
        farmerPhone: currentUser.phone,
        ratings: {
          honesty: honestyRating,
          paymentSpeed: paymentRating,
          behavior: behaviorRating,
          overall: Number(((honestyRating + paymentRating + behaviorRating) / 3).toFixed(1))
        },
        comment: comment.slice(0, 300),
        dealType
      });

      setFormSuccess(
        lang === 'ur' 
          ? 'آپ کا تبصرہ اور ریٹنگ کامیابی سے شائع ہو گئی!' 
          : 'Your review and ratings have been posted successfully!'
      );
      setShowForm(false);
      setTimeout(() => setFormSuccess(null), 4000);
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setFormError(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Wholesaler Reply Handler
  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim() || !currentUser) return;
    setReplySubmitting(true);
    try {
      await replyToWholesalerReview(reviewId, wholesalerUid, replyText);
      setReplyingReviewId(null);
      setReplyText('');
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setReplySubmitting(false);
    }
  };

  // Report Review Handler
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingReviewId) return;

    const targetReview = reviews.find((r) => r.id === reportingReviewId);
    if (!targetReview) return;

    await reportWholesalerReview({
      reviewId: reportingReviewId,
      wholesalerUid,
      wholesalerName,
      farmerUid: targetReview.farmerUid,
      farmerName: targetReview.farmerName,
      reviewComment: targetReview.comment,
      reportedBy: currentUser?.fullName || 'Community User',
      reason: reportReason,
      details: reportDetails
    });

    setReportSuccess(true);
    setTimeout(() => {
      setReportingReviewId(null);
      setReportSuccess(false);
      setReportDetails('');
    }, 2000);
  };

  const displayedReviews = reviews.filter((r) => {
    if (currentUser?.role !== 'admin' && (r.hidden || r.isRemovedByAdmin)) {
      return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs text-start">
      <div className="bg-[#FFFBEF] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#1B6B2A] shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E3D3A8]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#1B6B2A]" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0B3A17]">
                {wholesalerName}
              </h2>
            </div>
            <p className="text-xs text-[#3E3E3E]">
              {wholesalerCity} {wholesalerPhone ? `• ${wholesalerPhone}` : ''}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Success Notification */}
        {formSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2 text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        {/* Ratings Overview Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#E3D3A8] shadow-md grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          
          {/* Big Score & Badge */}
          <div className="sm:col-span-4 text-center sm:border-r border-[#E3D3A8] sm:pe-4 space-y-2">
            <span className="text-5xl font-black text-[#0B3A17] block">
              {stats.reviewCount > 0 ? stats.averageRating : '0.0'}
            </span>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(stats.averageRating)
                      ? 'fill-[#F2A900] text-[#F2A900]'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 font-semibold block">
              {stats.reviewCount} {lang === 'ur' ? 'کسانوں کے تصدیق شدہ جائزے' : 'Verified Farmer Reviews'}
            </span>

            {stats.badge === 'trusted' && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>{lang === 'ur' ? 'قابل اعتماد خریدار' : 'Trusted Buyer'}</span>
              </span>
            )}
            {stats.badge === 'new' && (
              <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                {lang === 'ur' ? 'نیا تاجر' : 'New Seller'}
              </span>
            )}
          </div>

          {/* 3 Criteria Specific Averages */}
          <div className="sm:col-span-8 space-y-3">
            <span className="text-xs font-black uppercase text-[#0B3A17] tracking-wider block">
              {lang === 'ur' ? 'کارکردگی کی تفصیل:' : 'Performance Breakdown:'}
            </span>

            {/* Honesty */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-[#1B6B2A]" />
                  <span>{lang === 'ur' ? 'ایمانداری و تول' : 'Honesty & Weight'}</span>
                </span>
                <span className="text-[#0B3A17] font-black">{stats.categoryAverages.honesty} / 5</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#1B6B2A] h-full rounded-full transition-all duration-500"
                  style={{ width: `${(stats.categoryAverages.honesty / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Payment Speed */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#F2A900]" />
                  <span>{lang === 'ur' ? 'ادائیگی کی رفتار' : 'Payment Speed'}</span>
                </span>
                <span className="text-[#0B3A17] font-black">{stats.categoryAverages.paymentSpeed} / 5</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#F2A900] h-full rounded-full transition-all duration-500"
                  style={{ width: `${(stats.categoryAverages.paymentSpeed / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Behavior */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>{lang === 'ur' ? 'رویہ اور برتاؤ' : 'Behavior & Conduct'}</span>
                </span>
                <span className="text-[#0B3A17] font-black">{stats.categoryAverages.behavior} / 5</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#2E7D32] h-full rounded-full transition-all duration-500"
                  style={{ width: `${(stats.categoryAverages.behavior / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* If account suspended */}
        {currentUser?.suspended && (
          <div className="p-3.5 bg-red-100 rounded-2xl border border-red-300 text-xs text-red-900 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{lang === 'ur' ? 'آپ کا اکاؤنٹ معطل ہے۔ آپ ریویو نہیں لکھ سکتے۔' : 'Your account is suspended. You cannot submit reviews.'}</span>
          </div>
        )}

        {/* Action Button: Rate Wholesaler */}
        {currentUser?.role === 'farmer' && !currentUser?.suspended && (
          <div className="flex justify-between items-center bg-[#E8F5E9] p-4 rounded-2xl border border-[#C8E6C9]">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#0B3A17]">
                {existingUserReview 
                  ? (lang === 'ur' ? 'آپ اس تاجر کو پہلے ریٹنگ دے چکے ہیں' : 'You have already reviewed this wholesaler')
                  : (lang === 'ur' ? 'کیا آپ نے اس تاجر سے ڈیل کی ہے؟' : 'Have you dealt with this buyer?')}
              </h4>
              <p className="text-[11px] text-[#2E7D32]">
                {lang === 'ur' 
                  ? 'دیگر کسان بھائیوں کی رہنمائی کے لیے اپنا تجربہ شیئر کریں۔' 
                  : 'Share your genuine experience on honesty and payment promptness.'}
              </p>
            </div>

            <button
              onClick={() => {
                // If not marked contacted yet, record contact so verified farmer can review
                if (currentUser) {
                  recordWholesalerContact(currentUser.uid, wholesalerUid);
                }
                setShowForm(!showForm);
              }}
              className="px-4 py-2 bg-[#1B6B2A] hover:bg-[#2E7D32] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {existingUserReview ? <Edit2 className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5 text-[#F2A900]" />}
              <span>
                {existingUserReview 
                  ? (lang === 'ur' ? 'تبصرہ تبدیل کریں' : 'Edit My Review')
                  : (lang === 'ur' ? 'ریٹنگ اور تبصرہ لکھیں' : 'Rate Wholesaler')}
              </span>
            </button>
          </div>
        )}

        {!currentUser && (
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <span>{lang === 'ur' ? 'تاجر کو ریٹنگ دینے کے لیے کسان کے طور پر لاگ ان کریں۔' : 'Sign in as a farmer to rate and review wholesale buyers.'}</span>
            <Link to="/login" className="font-bold text-[#1B6B2A] underline">
              {lang === 'ur' ? 'لاگ ان' : 'Sign In'}
            </Link>
          </div>
        )}

        {/* Review Form Drawer/Panel */}
        {showForm && (
          <form onSubmit={handleReviewSubmit} className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-[#1B6B2A] shadow-xl space-y-4 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-black text-sm sm:text-base text-[#0B3A17] flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#F2A900] fill-[#F2A900]" />
                <span>{lang === 'ur' ? 'کسان فیڈ بیک فارم' : 'Farmer Review & Rating Form'}</span>
              </h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* 3 Interactive Star Criteria */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              
              {/* Honesty */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-1.5">
                <span className="text-xs font-bold text-gray-800 block">
                  {lang === 'ur' ? '1. ایمانداری و تول' : '1. Honesty & Weighing'}
                </span>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setHonestyRating(star)}
                      className="p-1 cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= honestyRating
                            ? 'fill-[#F2A900] text-[#F2A900]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-bold text-[#1B6B2A]">{honestyRating} / 5</span>
              </div>

              {/* Payment Speed */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-1.5">
                <span className="text-xs font-bold text-gray-800 block">
                  {lang === 'ur' ? '2. ادائیگی کی رفتار' : '2. Payment Speed'}
                </span>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPaymentRating(star)}
                      className="p-1 cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= paymentRating
                            ? 'fill-[#F2A900] text-[#F2A900]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-bold text-[#1B6B2A]">{paymentRating} / 5</span>
              </div>

              {/* Behavior */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-1.5">
                <span className="text-xs font-bold text-gray-800 block">
                  {lang === 'ur' ? '3. رویہ و اخلاق' : '3. Behavior & Conduct'}
                </span>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setBehaviorRating(star)}
                      className="p-1 cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= behaviorRating
                            ? 'fill-[#F2A900] text-[#F2A900]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-bold text-[#1B6B2A]">{behaviorRating} / 5</span>
              </div>

            </div>

            {/* Deal Type Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ur' ? 'ڈیل کی جنس / نوعیت (اختیاری):' : 'Deal Type (Optional):'}
                </label>
                <select
                  value={dealType}
                  onChange={(e) => setDealType(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold"
                >
                  <option value="wheat">Wheat (گندم)</option>
                  <option value="rice">Rice (چاول / دھان)</option>
                  <option value="cotton">Cotton (کپاس / پھٹی)</option>
                  <option value="fertilizer">Fertilizers (کھادیں)</option>
                  <option value="machinery">Machinery / Tractor (مشینری)</option>
                  <option value="other">Other (دیگر)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ur' ? 'حساب شدہ اوسط ریٹنگ:' : 'Calculated Overall Score:'}
                </label>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-black text-[#1B5E20] flex items-center justify-between">
                  <span>Overall Rating</span>
                  <span className="text-sm">{((honestyRating + paymentRating + behaviorRating) / 3).toFixed(1)} ★</span>
                </div>
              </div>
            </div>

            {/* Written Comment (up to 300 characters) */}
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                <label>{lang === 'ur' ? 'آپ کا تحریری تبصرہ (زیادہ سے زیادہ 300 حروف):' : 'Your Written Feedback (max 300 chars):'}</label>
                <span className={comment.length > 300 ? 'text-red-600' : 'text-gray-400'}>
                  {comment.length} / 300
                </span>
              </div>
              <textarea
                required
                maxLength={300}
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  lang === 'ur'
                    ? 'مثال: رقم وقت پر ملی، وزن بالکل درست تھا، یا ادائیگی میں کتنے دن لگے۔'
                    : 'e.g. Payment was cleared instantly via bank transfer, fair weight, honest dealing.'
                }
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
              />
            </div>

            {/* Abuse policy reminder */}
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                {lang === 'ur'
                  ? 'براہ کرم دیانت داری اور احترام سے تبصرہ کریں۔ جھوٹے یا نازیبا تبصرے فوراً ہٹا دیے جائیں گے۔'
                  : 'Please write honest, respectful reviews. Abusive or false reviews will be removed.'}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || comment.length === 0}
                className="px-6 py-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl text-xs font-black shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-[#F2A900]" />
                <span>{submitting ? 'Submitting...' : 'Post Review'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm sm:text-base text-[#0B3A17] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#1B6B2A]" />
              <span>{lang === 'ur' ? 'کسانوں کے تبصرے' : 'Farmer Reviews'} ({displayedReviews.length})</span>
            </h3>
          </div>

          {displayedReviews.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-[#E3D3A8] space-y-2">
              <Star className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">
                {lang === 'ur' ? 'ابھی تک کوئی تبصرہ نہیں۔ پہلا تبصرہ آپ کریں۔' : 'No reviews yet. Be the first to review.'}
              </p>
              <p className="text-xs text-gray-400">
                {lang === 'ur' ? 'اس تاجر کے ساتھ لین دین کا تجربہ شیئر کریں تاکہ دیگر کاشتکاروں کا فائدہ ہو۔' : 'Share your trade feedback to help fellow growers.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 bg-white rounded-3xl border border-[#E3D3A8] shadow-xs space-y-3"
                >
                  {/* Top Bar: Farmer Name, Deal tag, Date, Overall Stars */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs sm:text-sm text-gray-900">
                          {rev.farmerName}
                        </span>
                        {rev.farmerCity && (
                          <span className="text-[11px] text-gray-500">
                            ({rev.farmerCity})
                          </span>
                        )}
                        {rev.dealType && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full capitalize">
                            {rev.dealType} Deal
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-[#FFF3D6] px-2.5 py-1 rounded-lg border border-[#E3D3A8]">
                      <Star className="w-3.5 h-3.5 fill-[#F2A900] text-[#F2A900]" />
                      <span className="text-xs font-black text-[#0B3A17]">{rev.ratings.overall}</span>
                    </div>
                  </div>

                  {/* Criteria pill ratings */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
                    <span className="bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                      Honesty: <strong className="text-[#1B6B2A]">{rev.ratings.honesty}★</strong>
                    </span>
                    <span className="bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                      Payment Speed: <strong className="text-[#F2A900]">{rev.ratings.paymentSpeed}★</strong>
                    </span>
                    <span className="bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                      Behavior: <strong className="text-[#2E7D32]">{rev.ratings.behavior}★</strong>
                    </span>
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">
                    {rev.comment}
                  </p>

                  {/* Wholesaler Public Reply (if present) */}
                  {rev.wholesalerReply && (
                    <div className="mt-2 p-3 bg-amber-50/70 rounded-2xl border-s-4 border-[#1B6B2A] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#0B3A17]">
                          {lang === 'ur' ? 'تاجر کا عوامی جواب:' : 'Wholesaler Public Reply:'}
                        </span>
                        <span className="text-gray-400">
                          {new Date(rev.wholesalerReply.repliedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 italic">
                        "{rev.wholesalerReply.text}"
                      </p>
                    </div>
                  )}

                  {/* Footer Actions: Wholesaler Reply button & Report Review */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    
                    {/* Wholesaler Reply Action */}
                    {currentUser?.uid === wholesalerUid && !rev.wholesalerReply && (
                      <button
                        onClick={() => {
                          setReplyingReviewId(rev.id);
                          setReplyText('');
                        }}
                        className="text-[#1B6B2A] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{lang === 'ur' ? 'جواب لکھیں' : 'Reply to review'}</span>
                      </button>
                    )}

                    {/* Report Review Abuse button */}
                    <button
                      onClick={() => setReportingReviewId(rev.id)}
                      className="text-gray-400 hover:text-red-600 text-[11px] font-semibold flex items-center gap-1 ms-auto cursor-pointer"
                    >
                      <Flag className="w-3 h-3" />
                      <span>{lang === 'ur' ? 'رپورٹ کریں' : 'Report'}</span>
                    </button>
                  </div>

                  {/* Wholesaler Inline Reply Input Form */}
                  {replyingReviewId === rev.id && (
                    <div className="pt-2 space-y-2 animate-in fade-in">
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a polite public response..."
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyingReviewId(null)}
                          className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReplySubmit(rev.id)}
                          disabled={replySubmitting || !replyText.trim()}
                          className="px-4 py-1 bg-[#1B5E20] text-white rounded-lg text-xs font-bold disabled:opacity-50"
                        >
                          {replySubmitting ? 'Posting...' : 'Post Reply'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Admin Moderation Controls (Admin only) */}
                  {currentUser?.role === 'admin' && (
                    <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between gap-2 bg-amber-50/70 p-2.5 rounded-2xl text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-900 text-[10px] uppercase">Admin:</span>
                        {rev.hidden && (
                          <span className="bg-amber-600 text-white font-bold px-1.5 py-0.5 rounded-sm text-[10px]">
                            Hidden (پوشیدہ)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAdminToggleHideReview(rev)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-1"
                        >
                          {rev.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{rev.hidden ? 'Unhide' : 'Hide'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminDeleteReview(rev)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-100 border border-red-300 text-red-800 hover:bg-red-200 cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3 text-red-700" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Abuse Report Modal Dialog */}
      {reportingReviewId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-gray-200 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="font-black text-sm text-red-600 flex items-center gap-1.5">
                <Flag className="w-4 h-4" />
                <span>{lang === 'ur' ? 'تبصرہ رپورٹ کریں' : 'Report Review'}</span>
              </h4>
              <button onClick={() => setReportingReviewId(null)}><X className="w-4 h-4" /></button>
            </div>

            {reportSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-bold text-center">
                {lang === 'ur' ? 'رپورٹ ایڈمن کو موصول ہو گئی ہے۔ شکریہ۔' : 'Report submitted to moderators. Thank you.'}
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Reason for report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl"
                  >
                    <option value="Abusive or False Information">Abusive or False Information</option>
                    <option value="Fake Review / Never dealt with seller">Fake Review / Never dealt with seller</option>
                    <option value="Competitor Blackmail / Slander">Competitor Blackmail / Slander</option>
                    <option value="Inappropriate Language">Inappropriate Language</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Additional details (Optional)</label>
                  <textarea
                    rows={2}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe why this review is misleading..."
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReportingReviewId(null)}
                    className="px-3 py-1.5 bg-gray-100 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-red-600 text-white rounded-xl font-bold"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
