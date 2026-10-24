import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getListings, saveListing, deleteListing } from '../services/dataService';
import { Listing } from '../types';
import { formatPKR, formatDate } from '../utils/formatters';
import { 
  Building2, 
  ShoppingBag, 
  PlusCircle, 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  Trash2, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Save, 
  Edit3,
  X,
  AlertCircle
} from 'lucide-react';

export const WholesalerDashboardPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { currentUser, updateProfile } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Business Profile Form
  const [shopName, setShopName] = useState(currentUser?.businessName || 'Tariq Grain & Fertilizer Traders');
  const [bio, setBio] = useState(currentUser?.bio || 'Authorized dealer in Wheat, Basmati Rice Paddy, and FFC/Engro fertilizers.');
  const [city, setCity] = useState(currentUser?.city || 'Multan');
  const [phone, setPhone] = useState(currentUser?.phone || '+923214567890');
  const [profileSaved, setProfileSaved] = useState(false);

  // Buy Request quick modal
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyCrop, setBuyCrop] = useState('Wheat (گندم)');
  const [buyQty, setBuyQty] = useState('500 Maunds');
  const [buyTargetPrice, setBuyTargetPrice] = useState('3950');
  const [buyDescription, setBuyDescription] = useState('Urgent requirement for mill processing. Immediate cash payment on grain market scale.');

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    const all = await getListings();
    setListings(all.filter((l) => l.userId === currentUser.uid));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      businessName: shopName,
      bio,
      city,
      phone
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleCreateBuyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newReq: Listing = {
      id: 'req_' + Date.now(),
      userId: currentUser.uid,
      sellerName: shopName || currentUser.fullName,
      sellerRole: 'wholesaler',
      sellerPhone: phone,
      sellerCity: city,
      sellerProvince: currentUser.province || 'Punjab',
      title: `BUY REQUEST: Looking for ${buyQty} ${buyCrop} in ${city}`,
      category: 'Buy Requests',
      price: Number(buyTargetPrice) || 4000,
      isNegotiable: true,
      quantity: buyQty,
      condition: 'new',
      description: buyDescription,
      images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'],
      isVerifiedPhone: true,
      isSold: false,
      viewsCount: 1,
      inquiriesCount: 0,
      createdAt: new Date().toISOString()
    };

    await saveListing(newReq);
    setShowBuyModal(false);
    loadData();
  };

  const handleMarkSold = async (item: Listing) => {
    const updated = { ...item, isSold: !item.isSold };
    await saveListing(updated);
    loadData();
  };

  const handleDeleteListing = async (id: string) => {
    if (confirm('Are you sure you want to remove this listing?')) {
      await deleteListing(id);
      loadData();
    }
  };

  const totalViews = listings.reduce((sum, item) => sum + (item.viewsCount || 0), 0);
  const totalInquiries = listings.reduce((sum, item) => sum + (item.inquiriesCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold text-[#F9A825] bg-[#FFF8E7] px-3 py-1 rounded-full border border-[#FFE082] uppercase tracking-wider inline-block">
            {t.wholesalerPortal}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#1B5E20] mt-2">
            {shopName || currentUser?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {city}, Pakistan • Grain Dealer & Agricultural Wholesaler
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowBuyModal(true)}
            className="px-5 py-3 bg-[#F9A825] hover:bg-[#F57F17] text-[#1B5E20] font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-[#1B5E20]" />
            <span>{t.postBuyRequest}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              {t.activeListings}
            </span>
            <span className="text-3xl font-black text-gray-900 mt-1 block">
              {listings.length}
            </span>
            <span className="text-xs text-emerald-800 font-semibold mt-0.5 block">
              Active on Mandi Network
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              {t.totalViews}
            </span>
            <span className="text-3xl font-black text-[#1B5E20] mt-1 block">
              {totalViews}
            </span>
            <span className="text-xs text-gray-500 font-semibold mt-0.5 block">
              Direct Farmer Impressions
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Eye className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              {t.totalInquiries}
            </span>
            <span className="text-3xl font-black text-[#F9A825] mt-1 block">
              {totalInquiries}
            </span>
            <span className="text-xs text-amber-800 font-semibold mt-0.5 block">
              Farmer Calls & Chats
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F9A825] flex items-center justify-center">
            <MessageSquare className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Business Profile Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-gray-100 space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <Building2 className="w-5 h-5 text-[#2E7D32]" />
            <h3 className="font-black text-lg text-gray-900">{t.businessProfile}</h3>
          </div>

          {profileSaved && (
            <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              <span>Business Profile Saved!</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Business / Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Mandi Market City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Official Mobile / WhatsApp Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Products Dealt In / Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </form>
        </div>

        {/* Right: Manage Listings & Buy Requests */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900">{t.activeListings}</h3>
            <Link
              to="/create-listing"
              className="text-xs font-bold text-[#1B5E20] hover:underline"
            >
              + Post New Product
            </Link>
          </div>

          <div className="space-y-4">
            {listings.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
                    <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-sm text-gray-900 mt-1 line-clamp-1">{item.title}</h4>
                    <p className="text-xs font-black text-[#1B5E20]">{formatPKR(item.price)}</p>
                    <span className="text-[11px] text-gray-400">
                      {item.viewsCount || 0} views • {item.inquiriesCount || 0} inquiries
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleMarkSold(item)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    {item.isSold ? 'Active' : 'Mark Sold'}
                  </button>
                  <Link
                    to={`/market/${item.id}`}
                    className="px-3 py-1.5 bg-[#1B5E20] text-white text-xs font-bold rounded-xl"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDeleteListing(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {listings.length === 0 && (
              <div className="p-8 text-center bg-white rounded-3xl border border-gray-200 text-xs text-gray-500 space-y-3">
                <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
                <p>No active listings or buy requests posted yet.</p>
                <button
                  onClick={() => setShowBuyModal(true)}
                  className="px-4 py-2 bg-[#F9A825] text-[#1B5E20] font-bold rounded-xl text-xs"
                >
                  Post First Buy Request
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Quick Buy Request Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-lg text-gray-900">{t.postBuyRequest}</h3>
              <button onClick={() => setShowBuyModal(false)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateBuyRequest} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Crop / Commodity Desired</label>
                <input
                  type="text"
                  required
                  value={buyCrop}
                  onChange={(e) => setBuyCrop(e.target.value)}
                  placeholder="e.g. Kainat 1121 Basmati Paddy"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity Needed</label>
                  <input
                    type="text"
                    required
                    value={buyQty}
                    onChange={(e) => setBuyQty(e.target.value)}
                    placeholder="e.g. 500 Maunds"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Rate (PKR / Maund)</label>
                  <input
                    type="number"
                    required
                    value={buyTargetPrice}
                    onChange={(e) => setBuyTargetPrice(e.target.value)}
                    placeholder="e.g. 3950"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-[#1B5E20]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Purchase Terms & Quality Spec</label>
                <textarea
                  rows={3}
                  value={buyDescription}
                  onChange={(e) => setBuyDescription(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBuyModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F9A825] hover:bg-[#F57F17] text-[#1B5E20] font-black rounded-xl shadow-md"
                >
                  Broadcast Buy Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
