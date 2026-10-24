import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  getFertilizerPrices, 
  updateFertilizerPrice, 
  getTractors, 
  updateTractor, 
  getReportedListings,
  updateReportStatus,
  uploadTractorPhoto,
  uploadCropPhoto
} from '../services/dataService';
import { 
  getReportedReviews, 
  updateReportedReviewStatus, 
  deleteReviewByAdmin 
} from '../services/reviewService';
import { FertilizerPrice, Tractor, ReportedListing, ReportedReview } from '../types';
import { CROPS_DATA } from '../data/cropsData';
import { formatPKR } from '../utils/formatters';
import { TractorImage } from '../components/TractorImage';
import { CropImage } from '../components/CropImage';
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
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  BookOpen,
  MessageSquare,
  Trash2,
  Star
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'fertilizer' | 'tractors' | 'crops' | 'reports' | 'reportedReviews'>('fertilizer');
  
  // Data
  const [fertilizers, setFertilizers] = useState<FertilizerPrice[]>([]);
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [reports, setReports] = useState<ReportedListing[]>([]);
  const [reportedReviews, setReportedReviews] = useState<ReportedReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Upload States
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Editing state for fertilizer
  const [editingFertId, setEditingFertId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  // New fertilizer price form
  const [showAddFert, setShowAddFert] = useState<boolean>(false);
  const [newFert, setNewFert] = useState<Partial<FertilizerPrice>>({
    name: '',
    nameUrdu: '',
    brand: 'FFC',
    brandUrdu: 'فوجی فرٹیلائزر',
    type: 'Urea',
    bagWeightKg: 50,
    currentPrice: 4650,
    previousPrice: 4650,
    lastUpdated: new Date().toISOString().slice(0, 10),
    notes: ''
  });

  const tractorFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTractorForUpload, setSelectedTractorForUpload] = useState<string | null>(null);

  const cropFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCropForUpload, setSelectedCropForUpload] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [f, tr, rep, revRep] = await Promise.all([
      getFertilizerPrices(),
      getTractors(),
      getReportedListings(),
      getReportedReviews()
    ]);
    setFertilizers(f);
    setTractors(tr);
    setReports(rep);
    setReportedReviews(revRep);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Client-side image compression to 800px width
  const compressImageTo800px = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context unavailable'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleTractorFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTractorForUpload) return;
    setUploadingId(selectedTractorForUpload);
    try {
      const compressedBase64 = await compressImageTo800px(file);
      await uploadTractorPhoto(selectedTractorForUpload, compressedBase64);
      setUploadSuccess(`Tractor photo uploaded and saved successfully!`);
      setTimeout(() => setUploadSuccess(null), 4000);
      loadData();
    } catch (err) {
      console.error('Failed to compress/upload tractor photo:', err);
      alert('Failed to process image. Please try another image file.');
    } finally {
      setUploadingId(null);
      setSelectedTractorForUpload(null);
      if (tractorFileInputRef.current) tractorFileInputRef.current.value = '';
    }
  };

  const handleCropFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCropForUpload) return;
    setUploadingId(selectedCropForUpload);
    try {
      const compressedBase64 = await compressImageTo800px(file);
      await uploadCropPhoto(selectedCropForUpload, compressedBase64);
      setUploadSuccess(`Crop photo uploaded and saved successfully!`);
      setTimeout(() => setUploadSuccess(null), 4000);
      loadData();
    } catch (err) {
      console.error('Failed to compress/upload crop photo:', err);
      alert('Failed to process image. Please try another image file.');
    } finally {
      setUploadingId(null);
      setSelectedCropForUpload(null);
      if (cropFileInputRef.current) cropFileInputRef.current.value = '';
    }
  };

  const handleSaveFertPrice = async (item: FertilizerPrice) => {
    const updated: FertilizerPrice = {
      ...item,
      previousPrice: item.currentPrice,
      currentPrice: editPrice,
      lastUpdated: new Date().toISOString().slice(0, 10)
    };
    await updateFertilizerPrice(updated);
    setEditingFertId(null);
    loadData();
  };

  const handleAddNewFert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFert.name || !newFert.currentPrice) return;
    const item: FertilizerPrice = {
      id: 'fert_' + Date.now(),
      name: newFert.name,
      nameUrdu: newFert.nameUrdu || newFert.name,
      brand: newFert.brand || 'FFC',
      brandUrdu: newFert.brandUrdu || 'ایف ایف سی',
      type: (newFert.type as any) || 'Urea',
      bagWeightKg: 50,
      currentPrice: Number(newFert.currentPrice),
      previousPrice: Number(newFert.currentPrice),
      lastUpdated: new Date().toISOString().slice(0, 10),
      notes: newFert.notes
    };
    await updateFertilizerPrice(item);
    setShowAddFert(false);
    loadData();
  };

  const handleReportAction = async (reportId: string, status: 'reviewed' | 'dismissed') => {
    await updateReportStatus(reportId, status);
    loadData();
  };

  const handleReviewReportAction = async (reportId: string, status: 'reviewed' | 'dismissed') => {
    await updateReportedReviewStatus(reportId, status);
    loadData();
  };

  const handleDeleteReportedReview = async (reviewId: string, reportId: string) => {
    if (confirm(lang === 'ur' ? 'کیا آپ اس تبصرے کو مستقل طور پر حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this reported review?')) {
      await deleteReviewByAdmin(reviewId);
      await updateReportedReviewStatus(reportId, 'reviewed');
      loadData();
    }
  };

  // Strictly restrict access to users whose Firestore profile has role 'admin'
  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6 text-start">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-8 h-8" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900">
            {lang === 'ur' ? 'ایڈمن کنٹرول پینل تک رسائی محدود ہے' : 'Restricted Admin Access'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            {lang === 'ur'
              ? 'یہ صفحہ صرف ان صارفین کے لیے مخصوص ہے جن کا فائر اسٹور پروفائل رول "admin" ہو۔'
              : 'This management console is strictly restricted to accounts with role "admin".'}
          </p>
        </div>
        <div className="flex justify-center pt-2">
          <Link
            to="/login"
            className="px-6 py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            {lang === 'ur' ? 'لاگ ان صفحہ پر جائیں' : 'Sign In With Admin Account'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-start">
      
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={tractorFileInputRef}
        accept="image/*"
        onChange={handleTractorFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={cropFileInputRef}
        accept="image/*"
        onChange={handleCropFileChange}
        className="hidden"
      />

      {/* Upload Success Banner */}
      {uploadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
            <span className="text-xs sm:text-sm font-bold">{uploadSuccess}</span>
          </div>
          <button onClick={() => setUploadSuccess(null)} className="p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            Master Data Administration
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#1B5E20] mt-1">
            {t.navAdmin}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Logged in as: {currentUser.fullName} ({currentUser.email}) • Role: <span className="font-bold uppercase text-emerald-800">Admin</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'fertilizer' && (
            <button
              onClick={() => setShowAddFert(true)}
              className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addFertilizerPrice}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('fertilizer')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'fertilizer' ? 'bg-[#1B5E20] text-white shadow-xs' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Fertilizer Rates ({fertilizers.length})
        </button>
        <button
          onClick={() => setActiveTab('tractors')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'tractors' ? 'bg-[#1B5E20] text-white shadow-xs' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Tractors & Photos ({tractors.length})
        </button>
        <button
          onClick={() => setActiveTab('crops')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'crops' ? 'bg-[#1B5E20] text-white shadow-xs' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Crop Manuals & Photos ({CROPS_DATA.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'reports' ? 'bg-[#1B5E20] text-white shadow-xs' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Reported Listings ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('reportedReviews')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'reportedReviews' ? 'bg-[#1B5E20] text-white shadow-xs' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Wholesaler Reviews ({reportedReviews.filter((r) => r.status === 'pending').length})
        </button>
      </div>

      {/* Fertilizer Price Management Tab */}
      {activeTab === 'fertilizer' && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#1B5E20] text-white">
                <tr>
                  <th className="p-4 font-bold">Fertilizer & Brand</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Current Rate</th>
                  <th className="p-4 font-bold">Previous Rate</th>
                  <th className="p-4 font-bold">Last Updated</th>
                  <th className="p-4 font-bold text-right">Quick Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fertilizers.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-900">
                      {item.name}
                      <span className="block text-xs font-normal text-gray-500">{item.brand}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md font-bold text-xs">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 font-black text-[#1B5E20] text-base">
                      {editingFertId === item.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-28 p-1.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold"
                          />
                          <button
                            onClick={() => handleSaveFertPrice(item)}
                            className="p-1.5 bg-[#2E7D32] text-white rounded-lg cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingFertId(null)}
                            className="p-1.5 bg-gray-200 text-gray-600 rounded-lg cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        formatPKR(item.currentPrice)
                      )}
                    </td>
                    <td className="p-4 text-gray-500">{formatPKR(item.previousPrice)}</td>
                    <td className="p-4 text-xs text-gray-400">{item.lastUpdated}</td>
                    <td className="p-4 text-right">
                      {editingFertId !== item.id && (
                        <button
                          onClick={() => {
                            setEditingFertId(item.id);
                            setEditPrice(item.currentPrice);
                          }}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg text-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Update</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tractors Management & Photo Upload Tab */}
      {activeTab === 'tractors' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <span>
              <strong>Upload Tractor Photo:</strong> Uploaded images are compressed to 800px width in the browser, saved in Firestore, and always take priority over automatic Wikimedia Commons search.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tractors.map((tr) => (
              <div key={tr.id} className="bg-white rounded-3xl p-5 border border-gray-200 shadow-md space-y-3 flex flex-col justify-between">
                <div>
                  <div className="rounded-2xl overflow-hidden bg-gray-100 mb-3 border border-gray-100">
                    <TractorImage tractor={tr} frameClassName="w-full aspect-[4/3]" />
                  </div>
                  <h4 className="font-bold text-base text-gray-900">{tr.name}</h4>
                  <p className="text-xs text-gray-500">{tr.horsepower} HP • {tr.cylinders} Cylinders</p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="font-black text-[#1B5E20] text-base">{formatPKR(tr.pricePKR)}</span>
                  
                  <button
                    onClick={() => {
                      setSelectedTractorForUpload(tr.id);
                      tractorFileInputRef.current?.click();
                    }}
                    disabled={uploadingId === tr.id}
                    className="px-3 py-1.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {uploadingId === tr.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-[#F9A825]" />
                    )}
                    <span>{uploadingId === tr.id ? 'Compressing...' : 'Upload photo'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crops Management & Photo Upload Tab */}
      {activeTab === 'crops' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <span>
              <strong>Upload Crop Photo:</strong> Set the exact verified photo for any crop guide. Compressed to 800px width in the browser, stored in Firestore, and takes priority everywhere (cards, details, search, calendar).
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CROPS_DATA.map((crop) => (
              <div key={crop.id} className="bg-white rounded-3xl p-5 border border-gray-200 shadow-md space-y-3 flex flex-col justify-between">
                <div>
                  <div className="rounded-2xl overflow-hidden bg-gray-100 mb-3 border border-gray-100">
                    <CropImage crop={crop} frameClassName="w-full aspect-[16/10]" />
                  </div>
                  <h4 className="font-bold text-base text-gray-900">{crop.nameEn}</h4>
                  <p className="text-xs text-gray-500">{crop.nameUr} • {crop.season} ({crop.category})</p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">{crop.id}</span>
                  
                  <button
                    onClick={() => {
                      setSelectedCropForUpload(crop.id);
                      cropFileInputRef.current?.click();
                    }}
                    disabled={uploadingId === crop.id}
                    className="px-3 py-1.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {uploadingId === crop.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-[#F9A825]" />
                    )}
                    <span>{uploadingId === crop.id ? 'Compressing...' : 'Upload crop photo'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reported Listings Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white rounded-3xl p-5 border border-red-100 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <span className="text-xs font-bold uppercase text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md">
                  {rep.reason}
                </span>
                <h4 className="font-bold text-sm text-gray-900 mt-1">Listing: {rep.listingTitle}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{rep.details || 'No additional comment provided.'}</p>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Reported by {rep.reportedBy} on {new Date(rep.timestamp).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReportAction(rep.id, 'dismissed')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleReportAction(rep.id, 'reviewed')}
                  className="px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Mark Reviewed
                </button>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-200 text-xs text-gray-500">
              No pending reports. Marketplace is healthy and clean.
            </div>
          )}
        </div>
      )}

      {/* Reported Wholesaler Reviews Tab */}
      {activeTab === 'reportedReviews' && (
        <div className="space-y-4">
          
          {/* Policy Guidance Note */}
          <div className="p-4 bg-[#FFF3D6] rounded-2xl border border-[#E3D3A8] text-xs text-[#0B3A17] flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#1B6B2A] shrink-0" />
            <div>
              <p className="font-bold">
                {lang === 'ur'
                  ? 'براہ کرم دیانت داری اور احترام سے تبصرہ کریں۔ جھوٹے یا نازیبا تبصرے فوراً ہٹا دیے جائیں گے۔'
                  : 'Please write honest, respectful reviews. Abusive or false reviews will be removed.'}
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {lang === 'ur'
                  ? 'ایڈمن پینل: مشکوک یا بلیک میلنگ پر مبنی تبصروں کا جائزہ لیں اور جعلی تبصرے حذف کریں۔'
                  : 'Moderation Console: Review reported farmer feedback and delete malicious or fake reviews.'}
              </p>
            </div>
          </div>

          {/* List of Reported Reviews */}
          <div className="space-y-4">
            {reportedReviews.map((rep) => (
              <div
                key={rep.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-red-200 shadow-md space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-md inline-block">
                      {rep.reason}
                    </span>
                    <h4 className="font-bold text-sm sm:text-base text-gray-900 mt-1.5">
                      Target Wholesaler: {rep.wholesalerName || rep.wholesalerUid}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Review written by: <strong>{rep.farmerName}</strong> • Reported by: <strong>{rep.reportedBy}</strong> on {new Date(rep.timestamp).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase ${
                    rep.status === 'pending'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {rep.status}
                  </span>
                </div>

                {/* The Reported Review Text */}
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs sm:text-sm text-gray-800 font-medium italic">
                  "{rep.reviewComment}"
                </div>

                {/* Reporter's detailed complaint */}
                {rep.details && (
                  <div className="text-xs text-red-900 bg-red-50/60 p-3 rounded-xl border border-red-100">
                    <strong>Complaint details:</strong> {rep.details}
                  </div>
                )}

                {/* Action Buttons: Dismiss, Delete Review, Mark Reviewed */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleReviewReportAction(rep.id, 'dismissed')}
                    className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Dismiss Report
                  </button>

                  <button
                    onClick={() => handleReviewReportAction(rep.id, 'reviewed')}
                    className="px-3.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Keep & Mark Reviewed
                  </button>

                  <button
                    onClick={() => handleDeleteReportedReview(rep.reviewId, rep.id)}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Offending Review</span>
                  </button>
                </div>

              </div>
            ))}

            {reportedReviews.length === 0 && (
              <div className="p-10 text-center bg-white rounded-3xl border border-gray-200 text-xs text-gray-500 space-y-1">
                <Star className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="font-bold text-gray-800">No reported reviews.</p>
                <p>All wholesaler ratings and farmer reviews are clear and verified.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Add Fertilizer Price Modal */}
      {showAddFert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-lg text-gray-900">{t.addFertilizerPrice}</h3>
              <button onClick={() => setShowAddFert(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddNewFert} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Fertilizer Name (English)</label>
                <input
                  type="text"
                  required
                  value={newFert.name}
                  onChange={(e) => setNewFert({ ...newFert, name: e.target.value })}
                  placeholder="e.g. Sona Urea (Granular)"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">نام (اردو)</label>
                <input
                  type="text"
                  value={newFert.nameUrdu}
                  onChange={(e) => setNewFert({ ...newFert, nameUrdu: e.target.value })}
                  placeholder="مثلاً سونا یوریا"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Company / Brand</label>
                  <select
                    value={newFert.brand}
                    onChange={(e) => setNewFert({ ...newFert, brand: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold"
                  >
                    <option value="FFC (Fauji Fertilizer)">FFC</option>
                    <option value="Engro Fertilizers">Engro</option>
                    <option value="Fatima Fertilizer">Fatima</option>
                    <option value="FFBL">FFBL</option>
                    <option value="Agritech (Tara)">Agritech</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Type</label>
                  <select
                    value={newFert.type}
                    onChange={(e) => setNewFert({ ...newFert, type: e.target.value as any })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold"
                  >
                    <option value="Urea">Urea</option>
                    <option value="DAP">DAP</option>
                    <option value="CAN">CAN</option>
                    <option value="NP">NP</option>
                    <option value="Nitrophos">Nitrophos</option>
                    <option value="Potash">Potash</option>
                    <option value="SSP">SSP</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Current Price per 50 kg Bag (PKR)</label>
                <input
                  type="number"
                  required
                  value={newFert.currentPrice}
                  onChange={(e) => setNewFert({ ...newFert, currentPrice: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-[#1B5E20] text-base"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFert(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Publish Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
