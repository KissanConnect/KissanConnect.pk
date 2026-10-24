import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { compressImage } from '../utils/imageCompressor';
import { saveListing } from '../services/dataService';
import { Listing, ListingCategory } from '../types';
import { 
  PlusCircle, 
  Upload, 
  X, 
  Image as ImageIcon, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  Phone,
  MapPin,
  Sparkles
} from 'lucide-react';

const CATEGORIES: ListingCategory[] = [
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

export const CreateListingPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ListingCategory>('Crops/Produce');
  const [price, setPrice] = useState<number | ''>('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [quantity, setQuantity] = useState('');
  const [condition, setCondition] = useState<'new' | 'used'>('new');
  const [province, setProvince] = useState(currentUser?.province || 'Punjab');
  const [city, setCity] = useState(currentUser?.city || 'Multan');
  const [phone, setPhone] = useState(currentUser?.phone || '+923001234567');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const [compressing, setCompressing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Photo selection & compression
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      setErrorMsg(lang === 'ur' ? 'آپ زیادہ سے زیادہ 5 تصاویر لگا سکتے ہیں۔' : 'Maximum 5 photos allowed per listing.');
      return;
    }

    setCompressing(true);
    setErrorMsg('');
    try {
      const compressedList: string[] = [];
      for (const file of files) {
        const base64 = await compressImage(file, 800, 0.72);
        compressedList.push(base64);
      }
      setPhotos((prev) => [...prev, ...compressedList]);
    } catch (err) {
      console.error('Error compressing photos:', err);
      setErrorMsg('Error processing images. Please try another photo.');
    } finally {
      setCompressing(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !phone.trim() || !city.trim()) {
      setErrorMsg(lang === 'ur' ? 'براہ کرم تمام ضروری خانے پر کریں۔' : 'Please fill all required fields.');
      return;
    }

    setPublishing(true);
    setErrorMsg('');

    try {
      const newListing: Listing = {
        id: 'list_' + Date.now(),
        userId: currentUser?.uid || 'guest-seller',
        sellerName: currentUser?.fullName || (lang === 'ur' ? 'مصدقہ کاشتکار' : 'Agri Grower'),
        sellerRole: currentUser?.role || 'farmer',
        sellerPhone: phone.trim(),
        sellerCity: city.trim(),
        sellerProvince: province,
        title: title.trim(),
        category,
        price: Number(price),
        isNegotiable,
        quantity: quantity.trim() || undefined,
        condition,
        description: description.trim(),
        images: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80'],
        isVerifiedPhone: true,
        isSold: false,
        viewsCount: 1,
        inquiriesCount: 0,
        createdAt: new Date().toISOString()
      };

      await saveListing(newListing);
      navigate(`/market/${newListing.id}`);
    } catch (err) {
      console.error('Failed to post listing:', err);
      setErrorMsg('Failed to publish listing. Please try again.');
      setPublishing(false);
    }
  };

  // If not logged in, prompt user
  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#1B5E20]">
            {lang === 'ur' ? 'اشتہار لگانے کے لیے لاگ ان کریں' : 'Sign In to Post Free Listing'}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {lang === 'ur'
              ? 'خریداروں کی حفاظت اور مصدقہ رابطے کے لیے رجسٹریشن لازمی ہے۔'
              : 'Joining is free. It verifies your phone number and lets buyers reach you directly.'}
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            to="/login?redirect=/create-listing"
            className="px-6 py-3 bg-[#1B5E20] text-white font-bold rounded-xl text-sm shadow-md"
          >
            {t.navLogin}
          </Link>
          <Link
            to="/signup?redirect=/create-listing"
            className="px-6 py-3 bg-[#F9A825] text-[#1B5E20] font-black rounded-xl text-sm shadow-md"
          >
            {t.navSignUp}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-[#1B5E20] font-bold text-xs uppercase tracking-wider mb-1">
          <PlusCircle className="w-4 h-4" />
          <span>100% Free Mandi Classified</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1B5E20]">
          {t.createListingTitle}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          {lang === 'ur'
            ? 'اپنی فصل، ٹریکٹر یا بیج کی تفصیلات درج کریں اور پورے پاکستان کے خریداروں تک پہنچیں۔'
            : 'Fill in your item details below. Zero commission or listing fees.'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs sm:text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Photo Uploader Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-black text-gray-900 block">
              {t.listingPhotos}
            </label>
            <span className="text-xs text-gray-400 font-semibold">
              {photos.length} / 5 photos
            </span>
          </div>

          <p className="text-xs text-gray-500">
            {t.photoTip}
          </p>

          {/* Photos Grid & Upload Box */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {photos.map((base64, index) => (
              <div key={index} className="h-32 rounded-2xl overflow-hidden relative border border-gray-200 group">
                <img src={base64} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 bg-[#1B5E20] text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                    Cover Photo
                  </span>
                )}
              </div>
            ))}

            {photos.length < 5 && (
              <label className="h-32 border-2 border-dashed border-[#81C784] hover:border-[#1B5E20] bg-[#E8F5E9]/30 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors group">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                  disabled={compressing}
                />
                <Upload className="w-6 h-6 text-[#2E7D32] group-hover:scale-110 transition-transform mb-1" />
                <span className="text-xs font-bold text-[#1B5E20]">
                  {compressing ? 'Compressing...' : 'Add Photos'}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">JPG / PNG / WebP</span>
              </label>
            )}
          </div>
        </div>

        {/* Listing Primary Info Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-gray-100 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              {t.listingTitleLabel} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 500 Maund Grade-A Akbar 2019 Wheat Seed, Sahiwal"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-[#2E7D32]"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {t.listingCategoryLabel} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-[#2E7D32]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {t.conditionLabel}
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-[#2E7D32]"
              >
                <option value="new">New (نیا)</option>
                <option value="used">Used / Second Hand (زیرِ استعمال)</option>
              </select>
            </div>
          </div>

          {/* Price & Negotiable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {t.pricePKR} *
              </label>
              <input
                type="number"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 4500"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>

            <div className="pt-2 sm:pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="w-4 h-4 rounded-md text-[#2E7D32] focus:ring-[#2E7D32]"
                />
                <span>{t.isNegotiableCheck}</span>
              </label>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              {t.quantityLabel}
            </label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 300 Maunds, 50 Bags, or 1 Unit"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-[#2E7D32]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              {t.descriptionLabel} *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                lang === 'ur'
                  ? 'مصنوعات کا معیار، ورائٹی، فصل کا سال، ترسیل کے طریقے اور مقام کی تفصیل لکھیں...'
                  : 'Describe variety, quality grade, storage location, harvest date, and delivery/pickup terms...'
              }
              className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#2E7D32]"
            />
          </div>

        </div>

        {/* Location & Contact Info Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-gray-100 space-y-4">
          <h3 className="font-extrabold text-base text-gray-900 pb-2 border-b border-gray-100">
            {lang === 'ur' ? 'مقام اور رابطے کی تفصیلات' : 'Location & Verified Contact'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t.province} *
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="Punjab">Punjab (پنجاب)</option>
                <option value="Sindh">Sindh (سندھ)</option>
                <option value="KPK">Khyber Pakhtunkhwa (کے پی کے)</option>
                <option value="Balochistan">Balochistan (بلوچستان)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t.city} *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Sahiwal, Multan"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              {lang === 'ur' ? 'فون نمبر / واٹس ایپ (خریدار اس نمبر پر رابطہ کریں گے)' : 'Mobile / WhatsApp Number'} *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+923001234567"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-900"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={publishing || compressing}
          className="w-full py-4 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-50 text-white font-black text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
        >
          <Sparkles className="w-5 h-5 text-[#F9A825]" />
          <span>{publishing ? 'Publishing Listing...' : t.publishListingBtn}</span>
        </button>

      </form>
    </div>
  );
};
