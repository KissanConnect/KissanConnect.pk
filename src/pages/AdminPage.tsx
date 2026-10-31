import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { NotFoundPage } from './NotFoundPage';
import { 
  FertilizerPrice, 
  Tractor, 
  Listing, 
  WholesalerReview, 
  ReportedListing, 
  ReportedReview, 
  UserProfile,
  AdminLog 
} from '../types';
import { 
  getFertilizerPrices, 
  updateFertilizerPrice, 
  getTractors, 
  updateTractor, 
  getReportedListings,
  uploadTractorPhoto 
} from '../services/dataService';
import { 
  getReportedReviews 
} from '../services/reviewService';
import {
  getAllListingsAdmin,
  hideListingAdmin,
  removeListingByAdmin,
  deleteListingAdmin,
  getAllUsersAdmin,
  suspendUserAdmin,
  unsuspendUserAdmin,
  getAllReviewsAdmin,
  hideReviewAdmin,
  deleteReviewAdmin,
  clearReportAdmin,
  getAdminLogs
} from '../services/adminService';
import { formatPKR, formatDate, timeAgo } from '../utils/formatters';
import { 
  ShieldCheck, 
  Lock, 
  TrendingUp, 
  Truck, 
  Flag, 
  Edit, 
  Save, 
  Plus, 
  Check, 
  X, 
  AlertTriangle,
  Upload,
  RefreshCw,
  MessageSquare,
  Trash2,
  Star,
  Users,
  ShoppingBag,
  Eye,
  EyeOff,
  UserX,
  UserCheck,
  Search,
  Filter,
  FileText,
  Clock,
  History,
  AlertCircle
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { currentUser } = useAuth();

  // If a non-admin opens /control-room-kc, show the normal 404 page with NO hint that an admin area exists
  if (!currentUser || currentUser.role !== 'admin') {
    return <NotFoundPage />;
  }

  // Active Tab: 6 required tabs + logs tab
  const [activeTab, setActiveTab] = useState<
    'reports' | 'listings' | 'users' | 'reviews' | 'transport' | 'prices' | 'logs'
  >('reports');

  const [loading, setLoading] = useState<boolean>(true);

  // Data states
  const [reportedListings, setReportedListings] = useState<ReportedListing[]>([]);
  const [reportedReviews, setReportedReviews] = useState<ReportedReview[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reviews, setReviews] = useState<WholesalerReview[]>([]);
  const [fertilizers, setFertilizers] = useState<FertilizerPrice[]>([]);
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);

  // Search & Filters
  const [listingSearch, setListingSearch] = useState('');
  const [listingCategoryFilter, setListingCategoryFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');
  const [reviewSearch, setReviewSearch] = useState('');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'reviewed' | 'dismissed'>('pending');

  // Reason Modals
  const [removalModalItem, setRemovalModalItem] = useState<{ id: string; title: string; type: 'listing' | 'transport' } | null>(null);
  const [removalReason, setRemovalReason] = useState('Violated market policy / Spam / Fraudulent rate');
  const [suspendModalUser, setSuspendModalUser] = useState<UserProfile | null>(null);
  const [suspendReason, setSuspendReason] = useState('Abusive behavior / Unfulfilled mandi contracts');

  // Fertilizer & Tractor Edit States
  const [editingFert, setEditingFert] = useState<FertilizerPrice | null>(null);
  const [editingTractor, setEditingTractor] = useState<Tractor | null>(null);
  const [uploadingTractorId, setUploadingTractorId] = useState<string | null>(null);
  const tractorFileRef = useRef<HTMLInputElement>(null);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [repL, repR, allL, allU, allRev, ferts, tracs, adminLogs] = await Promise.all([
        getReportedListings(),
        getReportedReviews(),
        getAllListingsAdmin(),
        getAllUsersAdmin(),
        getAllReviewsAdmin(),
        getFertilizerPrices(),
        getTractors(),
        getAdminLogs()
      ]);
      setReportedListings(repL);
      setReportedReviews(repR);
      setListings(allL);
      setUsers(allU);
      setReviews(allRev);
      setFertilizers(ferts);
      setTractors(tracs);
      setLogs(adminLogs);
    } catch (err) {
      console.error('Error loading admin moderation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Actions
  const handleToggleHideListing = async (listingId: string, currentHidden: boolean) => {
    await hideListingAdmin(listingId, !currentHidden, currentUser);
    loadAllAdminData();
  };

  const handleConfirmRemoval = async () => {
    if (!removalModalItem) return;
    await removeListingByAdmin(removalModalItem.id, removalReason, currentUser);
    setRemovalModalItem(null);
    loadAllAdminData();
  };

  const handleDeleteListing = async (listingId: string) => {
    if (confirm(lang === 'ur' ? 'کیا آپ اس اشتہار کو مستقل طور پر حذف کرنا چاہتے ہیں؟' : 'Permanently delete this listing?')) {
      await deleteListingAdmin(listingId, currentUser);
      loadAllAdminData();
    }
  };

  const handleConfirmSuspend = async () => {
    if (!suspendModalUser) return;
    await suspendUserAdmin(suspendModalUser.uid, suspendReason, currentUser);
    setSuspendModalUser(null);
    loadAllAdminData();
  };

  const handleUnsuspendUser = async (userId: string) => {
    await unsuspendUserAdmin(userId, currentUser);
    loadAllAdminData();
  };

  const handleToggleHideReview = async (reviewId: string, currentHidden: boolean) => {
    await hideReviewAdmin(reviewId, !currentHidden, currentUser);
    loadAllAdminData();
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm(lang === 'ur' ? 'کیا آپ اس تبصرے کو مستقل طور پر حذف کرنا چاہتے ہیں؟' : 'Permanently delete this review?')) {
      await deleteReviewAdmin(reviewId, currentUser);
      loadAllAdminData();
    }
  };

  const handleClearReport = async (reportId: string, type: 'listing' | 'review', status: 'reviewed' | 'dismissed') => {
    await clearReportAdmin(reportId, type, status, currentUser);
    loadAllAdminData();
  };

  const handleSaveFertilizerPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFert) return;
    await updateFertilizerPrice(editingFert);
    setEditingFert(null);
    loadAllAdminData();
  };

  const handleSaveTractor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTractor) return;
    await updateTractor(editingTractor);
    setEditingTractor(null);
    loadAllAdminData();
  };

  // Filtered Lists
  const filteredListings = listings.filter((l) => {
    if (listingCategoryFilter !== 'All' && l.category !== listingCategoryFilter) return false;
    if (listingSearch) {
      const q = listingSearch.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.sellerName.toLowerCase().includes(q) ||
        l.sellerCity.toLowerCase().includes(q) ||
        l.sellerPhone.includes(q)
      );
    }
    return true;
  });

  const transportOffers = listings.filter(
    (l) => l.category === 'Farm Machinery' || l.title.toLowerCase().includes('transport') || l.title.toLowerCase().includes('ٹرانسپورٹ')
  );

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.city.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const filteredReviews = reviews.filter((r) => {
    if (!reviewSearch) return true;
    const q = reviewSearch.toLowerCase();
    return (
      (r.wholesalerName && r.wholesalerName.toLowerCase().includes(q)) ||
      r.farmerName.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q)
    );
  });

  const filteredReportedListings = reportedListings.filter((r) => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  const filteredReportedReviews = reportedReviews.filter((r) => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  const isUrdu = lang === 'ur';

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-start" dir={isUrdu ? 'rtl' : 'ltr'}>
      
      {/* Admin Top Header Banner */}
      <div className="bg-[#0F3D1E] text-[#FFF8E1] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#1B6B2A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#F2A900] text-[#1A1A1A] uppercase tracking-wider">
              {isUrdu ? 'انتظامی کنٹرول روم' : 'Command Center'}
            </span>
            <span className="text-xs text-[#81C784]">
              {currentUser.email}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {isUrdu ? 'کسان کنیکٹ: مرکزی ایڈمن و ماڈریشن پینل' : 'Kissan Connect Moderation Control'}
          </h1>
          <p className="text-xs sm:text-sm text-[#FFF8E1]/80 max-w-2xl">
            {isUrdu
              ? 'صارفین کی معطلی، غلط اشتہارات کا اخراج، رپورٹس کی جانچ پڑتال اور مارکیٹ قیمتوں کے کنٹرول کا خفیہ مرکز۔'
              : 'Discreet system moderation: suspend malicious actors, moderate listings & reviews, clear reports, and update master rates.'}
          </p>
        </div>

        <button
          type="button"
          onClick={loadAllAdminData}
          disabled={loading}
          className="self-start md:self-auto px-4 py-2.5 bg-[#1B6B2A] hover:bg-[#2E7D32] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{isUrdu ? 'تازہ ترین معلومات لائیں' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Tabs Navigation (Exact 6 required tabs + audit logs) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 border-b border-[#E3D3A8] scrollbar-thin">
        {[
          { key: 'reports', labelEn: `Reported Items (${reportedListings.filter(r => r.status === 'pending').length + reportedReviews.filter(r => r.status === 'pending').length})`, labelUr: `رپورٹ شدہ آئٹمز (${reportedListings.filter(r => r.status === 'pending').length + reportedReviews.filter(r => r.status === 'pending').length})`, icon: Flag },
          { key: 'listings', labelEn: `All Listings (${listings.length})`, labelUr: `تمام اشتہارات (${listings.length})`, icon: ShoppingBag },
          { key: 'users', labelEn: `Users (${users.length})`, labelUr: `صارفین (${users.length})`, icon: Users },
          { key: 'reviews', labelEn: `Reviews (${reviews.length})`, labelUr: `تبصرے (${reviews.length})`, icon: MessageSquare },
          { key: 'transport', labelEn: `Transport Offers (${transportOffers.length})`, labelUr: `ٹرانسپورٹ آفرز (${transportOffers.length})`, icon: Truck },
          { key: 'prices', labelEn: 'Fertilizer & Tractor Rates', labelUr: 'کھاد و ٹریکٹر ریٹس', icon: TrendingUp },
          { key: 'logs', labelEn: `Admin Logs (${logs.length})`, labelUr: `ایڈمن لاگز (${logs.length})`, icon: History }
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#1B6B2A] text-[#F2A900] shadow-md scale-[1.02]'
                  : 'bg-[#FFFBEF] hover:bg-[#FFF3D6] text-gray-800 border border-[#E3D3A8]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{isUrdu ? tab.labelUr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: REPORTED ITEMS                                    */}
      {/* ========================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFBEF] p-4 rounded-2xl border border-[#E3D3A8]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 uppercase">{isUrdu ? 'فلٹر حیثیت:' : 'Status Filter:'}</span>
              <div className="flex items-center gap-1.5">
                {(['pending', 'reviewed', 'dismissed', 'all'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setReportFilter(st)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
                      reportFilter === st
                        ? 'bg-[#1B6B2A] text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {isUrdu ? 'مشتبہ یا نامناسب اشتہارات و تبصرے' : 'Action user reports to protect mandi integrity'}
            </p>
          </div>

          {/* Reported Listings */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-[#0B3A17] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#1B6B2A]" />
              <span>{isUrdu ? 'رپورٹ شدہ منڈی اشتہارات' : 'Reported Listings'}</span>
              <span className="text-xs font-normal text-gray-500">({filteredReportedListings.length})</span>
            </h3>

            {filteredReportedListings.length === 0 ? (
              <div className="p-8 bg-[#FFFBEF] rounded-2xl border border-[#E3D3A8] text-center text-xs text-gray-500">
                {isUrdu ? 'کوئی رپورٹ موجود نہیں ہے۔' : 'No listing reports in this view.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReportedListings.map((rep) => {
                  const targetListing = listings.find((l) => l.id === rep.listingId);
                  return (
                    <div key={rep.id} className="p-4 bg-[#FFFBEF] rounded-2xl border border-[#E3D3A8] shadow-sm space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            rep.status === 'pending' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {rep.status}
                          </span>
                          <span className="text-[11px] text-gray-500">{timeAgo(rep.timestamp, isUrdu)}</span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 leading-tight">
                          {rep.listingTitle}
                        </h4>
                        <div className="text-xs bg-red-50 text-red-900 p-2.5 rounded-xl border border-red-200 space-y-1">
                          <p className="font-bold">Reason: {rep.reason}</p>
                          {rep.details && <p className="text-[11px] text-red-800">{rep.details}</p>}
                        </div>
                        {targetListing && (
                          <div className="text-[11px] text-gray-600 bg-white p-2 rounded-xl border border-gray-200">
                            Seller: <span className="font-bold">{targetListing.sellerName}</span> ({targetListing.sellerPhone}) | Rate: {formatPKR(targetListing.price)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3D3A8]/60 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleClearReport(rep.id, 'listing', 'dismissed')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                        >
                          {isUrdu ? 'مسترد کریں' : 'Dismiss'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClearReport(rep.id, 'listing', 'reviewed')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 cursor-pointer"
                        >
                          {isUrdu ? 'حل شدہ مارک کریں' : 'Mark Reviewed'}
                        </button>
                        {targetListing && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleHideListing(targetListing.id, !!targetListing.hidden)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                            >
                              {targetListing.hidden ? (isUrdu ? 'ظاہر کریں' : 'Unhide') : (isUrdu ? 'چھپائیں' : 'Hide')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRemovalModalItem({ id: targetListing.id, title: targetListing.title, type: 'listing' })}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                            >
                              {isUrdu ? 'وجہ کے ساتھ ہٹائیں' : 'Remove (Reason)'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reported Reviews */}
          <div className="space-y-3 pt-4">
            <h3 className="text-base font-black text-[#0B3A17] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#1B6B2A]" />
              <span>{isUrdu ? 'رپورٹ شدہ تاجر تبصرے' : 'Reported Reviews'}</span>
              <span className="text-xs font-normal text-gray-500">({filteredReportedReviews.length})</span>
            </h3>

            {filteredReportedReviews.length === 0 ? (
              <div className="p-8 bg-[#FFFBEF] rounded-2xl border border-[#E3D3A8] text-center text-xs text-gray-500">
                {isUrdu ? 'کوئی تبصرہ رپورٹ موجود نہیں ہے۔' : 'No review reports in this view.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReportedReviews.map((rep) => (
                  <div key={rep.id} className="p-4 bg-[#FFFBEF] rounded-2xl border border-[#E3D3A8] shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          rep.status === 'pending' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {rep.status}
                        </span>
                        <span className="text-[11px] text-gray-500">{timeAgo(rep.timestamp, isUrdu)}</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Reviewer: <span className="font-bold text-gray-900">{rep.farmerName}</span> → Wholesaler: <span className="font-bold text-gray-900">{rep.wholesalerName || 'Dealer'}</span>
                      </p>
                      <div className="text-xs bg-white p-2.5 rounded-xl border border-gray-200 italic text-gray-800">
                        "{rep.reviewComment}"
                      </div>
                      <div className="text-xs bg-red-50 text-red-900 p-2.5 rounded-xl border border-red-200">
                        <p className="font-bold">Flagged for: {rep.reason}</p>
                        {rep.details && <p className="text-[11px] text-red-800 mt-0.5">{rep.details}</p>}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3D3A8]/60">
                      <button
                        type="button"
                        onClick={() => handleClearReport(rep.id, 'review', 'dismissed')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                      >
                        {isUrdu ? 'مسترد کریں' : 'Dismiss'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClearReport(rep.id, 'review', 'reviewed')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 cursor-pointer"
                      >
                        {isUrdu ? 'حل شدہ مارک کریں' : 'Mark Reviewed'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rep.reviewId)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                      >
                        {isUrdu ? 'تبصرہ حذف کریں' : 'Delete Review'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ALL LISTINGS                                      */}
      {/* ========================================================= */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#FFFBEF] p-4 rounded-2xl border border-[#E3D3A8]">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute start-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                placeholder={isUrdu ? 'عنوان، بیچنے والے کا نام یا فون سے تلاش کریں...' : 'Search listings by title, seller or phone...'}
                className="w-full ps-10 pe-4 py-2.5 bg-white border border-[#E3D3A8] rounded-xl text-sm"
              />
            </div>

            <div className="w-full sm:w-auto shrink-0">
              <select
                value={listingCategoryFilter}
                onChange={(e) => setListingCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2.5 bg-white border border-[#E3D3A8] rounded-xl text-sm font-semibold"
              >
                <option value="All">{isUrdu ? 'تمام کیٹیگریز' : 'All Categories'}</option>
                <option value="Crops/Produce">Crops/Produce</option>
                <option value="Seeds">Seeds</option>
                <option value="Fertilizers">Fertilizers</option>
                <option value="Tractors">Tractors</option>
                <option value="Farm Machinery">Farm Machinery</option>
                <option value="Livestock">Livestock</option>
                <option value="Buy Requests">Buy Requests</option>
              </select>
            </div>
          </div>

          {/* Listings Table / Cards */}
          <div className="bg-[#FFFBEF] rounded-2xl border border-[#E3D3A8] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm">
                <thead className="bg-[#0B3A17] text-[#FFF8E1] text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-start">Item</th>
                    <th className="py-3 px-4 text-start">Category</th>
                    <th className="py-3 px-4 text-start">Seller</th>
                    <th className="py-3 px-4 text-start">Price</th>
                    <th className="py-3 px-4 text-start">Status</th>
                    <th className="py-3 px-4 text-end">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3D3A8]/60 text-gray-800">
                  {filteredListings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        {isUrdu ? 'کوئی اشتہار نہیں ملا۔' : 'No listings found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredListings.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FFF3D6]/50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900 line-clamp-1">{item.title}</p>
                          <span className="text-[10px] text-gray-500">{timeAgo(item.createdAt, isUrdu)}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E3D3A8]/40 text-[#0B3A17]">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <p className="font-bold text-gray-900">{item.sellerName}</p>
                          <p className="text-[10px] text-gray-500">{item.sellerPhone} ({item.sellerCity})</p>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-black text-[#1B6B2A]">
                          {formatPKR(item.price)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.isRemovedByAdmin ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-900 border border-red-300">
                              Removed: {item.adminRemovalReason || 'Admin Action'}
                            </span>
                          ) : item.hidden ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              Hidden
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-end whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleHideListing(item.id, !!item.hidden)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                item.hidden
                                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              title={item.hidden ? 'Unhide Listing' : 'Hide Listing'}
                            >
                              {item.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRemovalModalItem({ id: item.id, title: item.title, type: 'listing' })}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                              title="Mark as Removed by Admin"
                            >
                              {isUrdu ? 'ہٹائیں' : 'Remove'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteListing(item.id)}
                              className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg cursor-pointer"
                              title="Permanently Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: USERS                                              */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-[#FFFBEF] p-4 rounded-2xl border border-[#E3D3A8]">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute start-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder={isUrdu ? 'صارف کا نام، ای میل، فون، شہر یا رول سے تلاش کریں...' : 'Search user by name, email, phone, city or role...'}
                className="w-full ps-10 pe-4 py-2.5 bg-white border border-[#E3D3A8] rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="bg-[#FFFBEF] rounded-2xl border border-[#E3D3A8] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm">
                <thead className="bg-[#0B3A17] text-[#FFF8E1] text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-start">User</th>
                    <th className="py-3 px-4 text-start">Role</th>
                    <th className="py-3 px-4 text-start">Location</th>
                    <th className="py-3 px-4 text-start">Account Status</th>
                    <th className="py-3 px-4 text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3D3A8]/60 text-gray-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        {isUrdu ? 'کوئی صارف نہیں ملا۔' : 'No users found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.uid} className="hover:bg-[#FFF3D6]/50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900">{user.fullName}</p>
                          <p className="text-[10px] text-gray-500">{user.email} | {user.phone}</p>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-900 border border-purple-300' 
                              : user.role === 'wholesaler' 
                                ? 'bg-amber-100 text-amber-900' 
                                : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                          {user.city}, {user.province}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {user.suspended ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-900 border border-red-300">
                              Suspended {user.suspendedReason ? `(${user.suspendedReason})` : ''}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-end whitespace-nowrap">
                          {user.role !== 'admin' && (
                            user.suspended ? (
                              <button
                                type="button"
                                onClick={() => handleUnsuspendUser(user.uid)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ms-auto cursor-pointer"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>{isUrdu ? 'بحال کریں' : 'Unsuspend'}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSuspendModalUser(user)}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ms-auto cursor-pointer"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>{isUrdu ? 'معطل کریں' : 'Suspend User'}</span>
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: REVIEWS                                            */}
      {/* ========================================================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="bg-[#FFFBEF] p-4 rounded-2xl border border-[#E3D3A8]">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute start-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                placeholder={isUrdu ? 'تاجر، کسان یا تبصرے کے متن سے تلاش کریں...' : 'Search review by wholesaler, farmer or comment...'}
                className="w-full ps-10 pe-4 py-2.5 bg-white border border-[#E3D3A8] rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReviews.length === 0 ? (
              <div className="col-span-2 p-8 bg-[#FFFBEF] rounded-2xl border border-[#E3D3A8] text-center text-xs text-gray-500">
                {isUrdu ? 'کوئی تبصرہ نہیں ملا۔' : 'No wholesaler reviews found.'}
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-[#FFFBEF] rounded-2xl border border-[#E3D3A8] shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1 text-[#F2A900]">
                        <Star className="w-4 h-4 fill-[#F2A900]" />
                        <span className="font-black text-sm text-gray-900">{rev.ratings.overall.toFixed(1)}</span>
                        <span className="text-[10px] text-gray-500">
                          (Honesty: {rev.ratings.honesty} | Pay: {rev.ratings.paymentSpeed} | Beh: {rev.ratings.behavior})
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500">{timeAgo(rev.createdAt, isUrdu)}</span>
                    </div>

                    <p className="text-xs text-gray-600">
                      Farmer: <span className="font-bold text-gray-900">{rev.farmerName}</span> → Wholesaler UID: <span className="font-mono text-[10px]">{rev.wholesalerUid.slice(0, 8)}...</span>
                    </p>

                    <p className="text-xs text-gray-800 bg-white p-2.5 rounded-xl border border-gray-200">
                      "{rev.comment}"
                    </p>

                    {rev.hidden && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Hidden from Public
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3D3A8]/60">
                    <button
                      type="button"
                      onClick={() => handleToggleHideReview(rev.id, !!rev.hidden)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                    >
                      {rev.hidden ? (isUrdu ? 'ظاہر کریں' : 'Unhide') : (isUrdu ? 'چھپائیں' : 'Hide')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(rev.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                    >
                      {isUrdu ? 'حذف کریں' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: TRANSPORT OFFERS                                   */}
      {/* ========================================================= */}
      {activeTab === 'transport' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#FFFBEF] rounded-2xl border border-[#E3D3A8] text-xs text-gray-700">
            {isUrdu
              ? 'ٹرانسپورٹ بورڈ، زرعی مشینری کرایہ اور فصل باربرداری کی لائیو پیشکشیں۔'
              : 'Active transport board and agricultural machinery hauling offers.'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transportOffers.length === 0 ? (
              <div className="col-span-3 p-8 bg-[#FFFBEF] rounded-2xl border border-[#E3D3A8] text-center text-xs text-gray-500">
                {isUrdu ? 'کوئی ٹرانسپورٹ آفر موجود نہیں ہے۔' : 'No transport offers found.'}
              </div>
            ) : (
              transportOffers.map((item) => (
                <div key={item.id} className="p-4 bg-[#FFFBEF] rounded-2xl border border-[#E3D3A8] shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1B6B2A] text-white">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-gray-500">{timeAgo(item.createdAt, isUrdu)}</span>
                    </div>

                    <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
                    <p className="text-xs text-gray-600">
                      Route / City: <span className="font-bold text-gray-800">{item.sellerCity}, {item.sellerProvince}</span>
                    </p>
                    <p className="font-black text-sm text-[#1B6B2A]">{formatPKR(item.price)}</p>
                    <p className="text-[11px] text-gray-500">Phone: {item.sellerPhone} ({item.sellerName})</p>

                    {item.isRemovedByAdmin ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-900 border border-red-300">
                        Removed: {item.adminRemovalReason || 'Admin Action'}
                      </span>
                    ) : item.hidden ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Hidden
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3D3A8]/60">
                    <button
                      type="button"
                      onClick={() => handleToggleHideListing(item.id, !!item.hidden)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                    >
                      {item.hidden ? (isUrdu ? 'ظاہر کریں' : 'Unhide') : (isUrdu ? 'چھپائیں' : 'Hide')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRemovalModalItem({ id: item.id, title: item.title, type: 'transport' })}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                    >
                      {isUrdu ? 'ہٹائیں' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: FERTILIZER AND TRACTOR PRICES                     */}
      {/* ========================================================= */}
      {activeTab === 'prices' && (
        <div className="space-y-8">
          {/* Fertilizer Rates */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-[#0B3A17] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#1B6B2A]" />
              <span>{isUrdu ? 'سرکاری و مارکیٹ کھاد قیمتیں' : 'Fertilizer Rates Master Data'}</span>
            </h3>

            <div className="bg-[#FFFBEF] rounded-2xl border border-[#E3D3A8] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs sm:text-sm">
                  <thead className="bg-[#0B3A17] text-[#FFF8E1] text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 text-start">Product</th>
                      <th className="py-3 px-4 text-start">Brand</th>
                      <th className="py-3 px-4 text-start">Bag Weight</th>
                      <th className="py-3 px-4 text-start">Current Price</th>
                      <th className="py-3 px-4 text-start">Previous</th>
                      <th className="py-3 px-4 text-start">Last Updated</th>
                      <th className="py-3 px-4 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3D3A8]/60 text-gray-800">
                    {fertilizers.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FFF3D6]/50">
                        <td className="py-3 px-4 font-bold text-gray-900">{item.name}</td>
                        <td className="py-3 px-4">{item.brand}</td>
                        <td className="py-3 px-4">{item.bagWeightKg} kg</td>
                        <td className="py-3 px-4 font-black text-[#1B6B2A]">{formatPKR(item.currentPrice)}</td>
                        <td className="py-3 px-4 text-gray-500">{formatPKR(item.previousPrice)}</td>
                        <td className="py-3 px-4 text-gray-500">{formatDate(item.lastUpdated)}</td>
                        <td className="py-3 px-4 text-end">
                          <button
                            type="button"
                            onClick={() => setEditingFert(item)}
                            className="px-3 py-1.5 bg-[#1B6B2A] hover:bg-[#0F3D1E] text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            {isUrdu ? 'قیمت تبدیل کریں' : 'Edit Price'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Tractors Prices */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-[#0B3A17] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#1B6B2A]" />
              <span>{isUrdu ? 'ٹریکٹر ماڈلز اور قیمتیں' : 'Tractor Models & Official Rates'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tractors.map((tr) => (
                <div key={tr.id} className="p-4 bg-[#FFFBEF] rounded-2xl border border-[#E3D3A8] shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-32 w-full rounded-xl overflow-hidden bg-gray-100">
                      <img src={tr.image} alt={tr.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-black text-sm text-gray-900">{tr.name} ({tr.brand})</h4>
                    <p className="text-xs text-gray-600">{tr.horsepower} HP | Engine: {tr.engine}</p>
                    <p className="font-black text-base text-[#1B6B2A]">{formatPKR(tr.pricePKR)}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3D3A8]/60">
                    <button
                      type="button"
                      onClick={() => setEditingTractor(tr)}
                      className="px-3 py-1.5 bg-[#1B6B2A] hover:bg-[#0F3D1E] text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      {isUrdu ? 'تفصیلات بدلیں' : 'Edit Specs & Price'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: ADMIN AUDIT LOGS                                   */}
      {/* ========================================================= */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-[#FFFBEF] p-4 rounded-2xl border border-[#E3D3A8] flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-[#0B3A17]">{isUrdu ? 'ایڈمن آڈٹ لاگ ریکارڈز' : 'Administrative Audit Trail'}</h3>
              <p className="text-xs text-gray-600">{isUrdu ? 'ہر ایڈمن ایکشن کا مستقل دستاویزی ثبوت' : 'Permanent immutable record of moderation events'}</p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#E3D3A8]/40 px-3 py-1 rounded-full text-gray-800">
              {logs.length} logged events
            </span>
          </div>

          <div className="bg-[#FFFBEF] rounded-2xl border border-[#E3D3A8] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-[#0B3A17] text-[#FFF8E1] text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 text-start">Timestamp</th>
                    <th className="py-2.5 px-3 text-start">Admin</th>
                    <th className="py-2.5 px-3 text-start">Action</th>
                    <th className="py-2.5 px-3 text-start">Target</th>
                    <th className="py-2.5 px-3 text-start">Reason / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3D3A8]/60 text-gray-800">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">
                        {isUrdu ? 'ابھی کوئی لاگ موجود نہیں ہے۔' : 'No audit records logged yet.'}
                      </td>
                    </tr>
                  ) : (
                    logs.map((lg) => (
                      <tr key={lg.id} className="hover:bg-[#FFF3D6]/50">
                        <td className="py-2 px-3 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                          {formatDate(lg.timestamp)}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap font-bold text-gray-900">
                          {lg.adminName} ({lg.adminEmail})
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-[#1B6B2A] text-white">
                            {lg.action}
                          </span>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap font-mono text-gray-600 text-[11px]">
                          {lg.targetType}:{lg.targetId.slice(0, 10)}
                        </td>
                        <td className="py-2 px-3 text-gray-700">
                          {lg.reason && <span className="font-bold text-red-800">[{lg.reason}] </span>}
                          {lg.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REMOVAL REASON MODAL                                      */}
      {/* ========================================================= */}
      {removalModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <div className="bg-[#FFFBEF] rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-red-600 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-2 border-b border-[#E3D3A8]">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-black text-base">
                  {isUrdu ? 'اشتہار ہٹانے کی وجہ درج کریں' : 'Specify Removal Reason'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRemovalModalItem(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-700">
              Listing: <span className="font-bold text-gray-900">{removalModalItem.title}</span>
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                {isUrdu ? 'حذف کی وجہ (Reason):' : 'Official Reason:'}
              </label>
              <textarea
                rows={3}
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                className="w-full p-3 bg-white border border-[#E3D3A8] rounded-xl text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRemovalModalItem(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                {isUrdu ? 'منسوخ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoval}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs shadow-md cursor-pointer"
              >
                {isUrdu ? 'اشتہار ہٹائیں اور لاگ کریں' : 'Confirm Removal & Log'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUSPEND USER MODAL                                        */}
      {/* ========================================================= */}
      {suspendModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <div className="bg-[#FFFBEF] rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-red-600 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-2 border-b border-[#E3D3A8]">
              <div className="flex items-center gap-2 text-red-700">
                <UserX className="w-5 h-5 shrink-0" />
                <h3 className="font-black text-base">
                  {isUrdu ? 'صارف اکاؤنٹ معطل کریں' : 'Suspend User Account'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSuspendModalUser(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs bg-red-50 text-red-950 p-3 rounded-xl border border-red-200 space-y-1">
              <p className="font-bold">User: {suspendModalUser.fullName} ({suspendModalUser.email})</p>
              <p className="text-[11px] text-red-800">
                {isUrdu
                  ? 'معطل شدہ صارف نیا اشتہار نہیں لگا سکتا، چیٹ نہیں کر سکتا اور نہ ہی ریٹنگ دے سکتا ہے۔'
                  : 'Suspended users cannot post new listings, participate in chat, or submit reviews.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                {isUrdu ? 'معطلی کی وجہ (Reason):' : 'Suspension Reason:'}
              </label>
              <textarea
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full p-3 bg-white border border-[#E3D3A8] rounded-xl text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSuspendModalUser(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                {isUrdu ? 'منسوخ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs shadow-md cursor-pointer"
              >
                {isUrdu ? 'اکاؤنٹ معطل کریں' : 'Suspend & Record Log'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT FERTILIZER PRICE MODAL                               */}
      {/* ========================================================= */}
      {editingFert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <div className="bg-[#FFFBEF] rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-[#1B6B2A] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-2 border-b border-[#E3D3A8]">
              <h3 className="font-black text-base text-[#0B3A17]">
                {isUrdu ? 'کھاد کی قیمت میں تبدیلی' : 'Update Fertilizer Rate'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingFert(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFertilizerPrice} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingFert.name}
                  onChange={(e) => setEditingFert({ ...editingFert, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E3D3A8] rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Current Price (PKR)</label>
                  <input
                    type="number"
                    required
                    value={editingFert.currentPrice}
                    onChange={(e) => setEditingFert({ ...editingFert, currentPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E3D3A8] rounded-xl font-bold text-[#1B6B2A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Previous Price (PKR)</label>
                  <input
                    type="number"
                    value={editingFert.previousPrice}
                    onChange={(e) => setEditingFert({ ...editingFert, previousPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E3D3A8] rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Market Notes / Subsidy info</label>
                <input
                  type="text"
                  value={editingFert.notes || ''}
                  onChange={(e) => setEditingFert({ ...editingFert, notes: e.target.value })}
                  placeholder="e.g. Subsidy included, Punjab official rate"
                  className="w-full px-3 py-2 bg-white border border-[#E3D3A8] rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFert(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B6B2A] hover:bg-[#0F3D1E] text-white font-black rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Save & Publish Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT TRACTOR MODAL                                        */}
      {/* ========================================================= */}
      {editingTractor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <div className="bg-[#FFFBEF] rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-[#1B6B2A] space-y-4 animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-2 border-b border-[#E3D3A8]">
              <h3 className="font-black text-base text-[#0B3A17]">
                {isUrdu ? 'ٹریکٹر کی تفصیلات و قیمت' : 'Edit Tractor Details & Rate'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTractor(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTractor} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Model Name</label>
                <input
                  type="text"
                  required
                  value={editingTractor.name}
                  onChange={(e) => setEditingTractor({ ...editingTractor, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E3D3A8] rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    required
                    value={editingTractor.pricePKR}
                    onChange={(e) => setEditingTractor({ ...editingTractor, pricePKR: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E3D3A8] rounded-xl font-black text-[#1B6B2A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Horsepower (HP)</label>
                  <input
                    type="number"
                    value={editingTractor.horsepower}
                    onChange={(e) => setEditingTractor({ ...editingTractor, horsepower: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E3D3A8] rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Photo URL</label>
                <input
                  type="text"
                  value={editingTractor.image}
                  onChange={(e) => setEditingTractor({ ...editingTractor, image: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E3D3A8] rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTractor(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B6B2A] hover:bg-[#0F3D1E] text-white font-black rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Save Tractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
