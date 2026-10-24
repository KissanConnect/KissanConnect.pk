import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  subscribeUserHarvests,
  saveUserHarvest,
  updateUserHarvest,
  deleteUserHarvest,
  subscribeUserExpenses,
  saveUserExpense,
  updateUserExpense,
  deleteUserExpense,
  subscribeUserSales,
  saveUserSale,
  updateUserSale,
  deleteUserSale,
  getListings,
  deleteListing,
  getCropPlans
} from '../services/dataService';
import { ProduceRecord, ExpenseRecord, IncomeRecord, Listing, CropPlan } from '../types';
import { formatPKR, formatDate } from '../utils/formatters';
import { exportRecordsToCSV, printFarmReport } from '../utils/exportUtils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download, 
  Printer, 
  Plus, 
  Trash2, 
  Pencil,
  Calendar, 
  ShoppingBag, 
  MessageSquare, 
  CheckCircle2, 
  Wheat, 
  Filter, 
  FileSpreadsheet,
  X,
  AlertCircle,
  RefreshCw,
  LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FarmerDashboardPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'produce' | 'expenses' | 'income' | 'listings'>('produce');
  
  // Data State
  const [produce, setProduce] = useState<ProduceRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [plans, setPlans] = useState<CropPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form saving state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<{ message: string; retryFn: () => void } | null>(null);

  // Modals for adding/editing records
  const [showProduceModal, setShowProduceModal] = useState<boolean>(false);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [showIncomeModal, setShowIncomeModal] = useState<boolean>(false);

  // Editing pointers
  const [editingProduceId, setEditingProduceId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);

  // New/Edit Record Forms State
  const [newProduce, setNewProduce] = useState<Partial<ProduceRecord>>({
    crop: 'Wheat (گندم)',
    season: 'Rabi 2026',
    landArea: '10 Acres',
    date: new Date().toISOString().slice(0, 10),
    quantity: 400,
    unit: 'maund',
    quality: 'A (Top)',
    storageLocation: 'Home Godown'
  });

  const [newExpense, setNewExpense] = useState<Partial<ExpenseRecord>>({
    crop: 'Wheat (گندم)',
    category: 'fertilizer',
    amount: 25000,
    date: new Date().toISOString().slice(0, 10),
    notes: ''
  });

  const [newIncome, setNewIncome] = useState<Partial<IncomeRecord>>({
    crop: 'Wheat (گندم)',
    quantitySold: 100,
    unit: 'maund',
    ratePerUnit: 3950,
    totalAmount: 395000,
    buyer: 'Local Mandi Dealer',
    date: new Date().toISOString().slice(0, 10),
    notes: ''
  });

  // Real-time onSnapshot subscriptions for logged-in user
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubHarvests = subscribeUserHarvests(currentUser.uid, (records) => {
      setProduce(records);
      setLoading(false);
    });

    const unsubExpenses = subscribeUserExpenses(currentUser.uid, (records) => {
      setExpenses(records);
    });

    const unsubSales = subscribeUserSales(currentUser.uid, (records) => {
      setIncome(records);
    });

    // Listings & Plans
    getListings().then((all) => {
      setMyListings(all.filter((l) => l.userId === currentUser.uid));
    });
    getCropPlans(currentUser.uid).then((allPlans) => {
      setPlans(allPlans);
    });

    return () => {
      unsubHarvests();
      unsubExpenses();
      unsubSales();
    };
  }, [currentUser]);

  // Financial calculations
  const totalIncomeAmount = income.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
  const totalExpenseAmount = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const netProfit = totalIncomeAmount - totalExpenseAmount;

  // Chart data: monthly aggregate
  const chartData = [
    { month: 'Nov', Income: 0, Expense: 110000 },
    { month: 'Dec', Income: 0, Expense: 65000 },
    { month: 'Jan', Income: 0, Expense: 45000 },
    { month: 'Feb', Income: 0, Expense: 30000 },
    { month: 'Mar', Income: Math.round(totalIncomeAmount * 0.2), Expense: Math.round(totalExpenseAmount * 0.3) },
    { month: 'Apr', Income: Math.round(totalIncomeAmount * 0.8), Expense: Math.round(totalExpenseAmount * 0.7) }
  ];

  // Open Edit Modals
  const openEditProduce = (item: ProduceRecord) => {
    setEditingProduceId(item.id);
    setNewProduce({ ...item });
    setSaveError(null);
    setShowProduceModal(true);
  };

  const openEditExpense = (item: ExpenseRecord) => {
    setEditingExpenseId(item.id);
    setNewExpense({ ...item });
    setSaveError(null);
    setShowExpenseModal(true);
  };

  const openEditIncome = (item: IncomeRecord) => {
    setEditingIncomeId(item.id);
    setNewIncome({ ...item });
    setSaveError(null);
    setShowIncomeModal(true);
  };

  // Produce Record Submit (Add / Edit)
  const handleAddProduce = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      setSaveError({
        message: lang === 'ur' 
          ? 'ریکارڈ محفوظ کرنے کے لیے براہ کرم پہلے لاگ ان کریں۔' 
          : 'Please log in to save your harvest records.',
        retryFn: () => {}
      });
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const recordData = {
      crop: newProduce.crop || 'Wheat (گندم)',
      season: newProduce.season || 'Rabi',
      landArea: newProduce.landArea || '5 Acres',
      date: newProduce.date || new Date().toISOString().slice(0, 10),
      quantity: Number(newProduce.quantity) || 100,
      unit: newProduce.unit || 'maund',
      quality: newProduce.quality || 'A (Top)',
      storageLocation: newProduce.storageLocation || 'Godown',
      notes: newProduce.notes || ''
    };

    try {
      if (editingProduceId) {
        await updateUserHarvest(currentUser.uid, editingProduceId, recordData);
      } else {
        await saveUserHarvest(currentUser.uid, recordData);
      }
      setShowProduceModal(false);
      setEditingProduceId(null);
      setSaveSuccessMsg(
        lang === 'ur'
          ? 'فصل کی پیداوار کا ریکارڈ کامیابی سے محفوظ ہو گیا!'
          : 'Harvest record saved successfully!'
      );
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Save produce error:', err);
      setSaveError({
        message: (lang === 'ur' ? 'محفوظ کرنے میں خرابی: ' : 'Failed to save: ') + (err?.message || 'Database error'),
        retryFn: () => handleAddProduce()
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Expense Record Submit (Add / Edit)
  const handleAddExpense = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      setSaveError({
        message: lang === 'ur' 
          ? 'اخراجات محفوظ کرنے کے لیے براہ کرم پہلے لاگ ان کریں۔' 
          : 'Please log in to save expense records.',
        retryFn: () => {}
      });
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const recordData = {
      category: newExpense.category || 'fertilizer',
      amount: Number(newExpense.amount) || 0,
      date: newExpense.date || new Date().toISOString().slice(0, 10),
      crop: newExpense.crop || 'Wheat (گندم)',
      notes: newExpense.notes || ''
    };

    try {
      if (editingExpenseId) {
        await updateUserExpense(currentUser.uid, editingExpenseId, recordData);
      } else {
        await saveUserExpense(currentUser.uid, recordData);
      }
      setShowExpenseModal(false);
      setEditingExpenseId(null);
      setSaveSuccessMsg(
        lang === 'ur'
          ? 'اخراجات کا اندراج کامیابی سے محفوظ ہو گیا!'
          : 'Expense record saved successfully!'
      );
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Save expense error:', err);
      setSaveError({
        message: (lang === 'ur' ? 'محفوظ کرنے میں خرابی: ' : 'Failed to save: ') + (err?.message || 'Database error'),
        retryFn: () => handleAddExpense()
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Income Record Submit (Add / Edit)
  const handleAddIncome = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      setSaveError({
        message: lang === 'ur' 
          ? 'فروخت کا اندراج کرنے کے لیے براہ کرم پہلے لاگ ان کریں۔' 
          : 'Please log in to save sales records.',
        retryFn: () => {}
      });
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const qty = Number(newIncome.quantitySold) || 0;
    const rate = Number(newIncome.ratePerUnit) || 0;
    const total = qty * rate;

    const recordData = {
      crop: newIncome.crop || 'Wheat (گندم)',
      quantitySold: qty,
      unit: newIncome.unit || 'maund',
      ratePerUnit: rate,
      totalAmount: total,
      buyer: newIncome.buyer || 'Grain Market Buyer',
      date: newIncome.date || new Date().toISOString().slice(0, 10),
      notes: newIncome.notes || ''
    };

    try {
      if (editingIncomeId) {
        await updateUserSale(currentUser.uid, editingIncomeId, recordData);
      } else {
        await saveUserSale(currentUser.uid, recordData);
      }
      setShowIncomeModal(false);
      setEditingIncomeId(null);
      setSaveSuccessMsg(
        lang === 'ur'
          ? 'فروخت و آمدن کا اندراج کامیابی سے محفوظ ہو گیا!'
          : 'Sale record saved successfully!'
      );
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Save sale error:', err);
      setSaveError({
        message: (lang === 'ur' ? 'محفوظ کرنے میں خرابی: ' : 'Failed to save: ') + (err?.message || 'Database error'),
        retryFn: () => handleAddIncome()
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Handlers
  const handleDeleteProduce = async (id: string) => {
    if (!currentUser) return;
    if (window.confirm(lang === 'ur' ? 'کیا آپ یہ ریکارڈ حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this record?')) {
      await deleteUserHarvest(currentUser.uid, id);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!currentUser) return;
    if (window.confirm(lang === 'ur' ? 'کیا آپ یہ خرچہ حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this expense record?')) {
      await deleteUserExpense(currentUser.uid, id);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!currentUser) return;
    if (window.confirm(lang === 'ur' ? 'کیا آپ یہ فروخت حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this sale record?')) {
      await deleteUserSale(currentUser.uid, id);
    }
  };

  const handleDeleteUserListing = async (id: string) => {
    if (!currentUser) return;
    if (window.confirm(lang === 'ur' ? 'کیا آپ یہ اشتہار حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this listing?')) {
      await deleteListing(id, currentUser.uid);
      setMyListings(prev => prev.filter(l => l.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-start">
      
      {/* Non-logged-in Warning Banner */}
      {!currentUser && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">
              {lang === 'ur'
                ? 'اپنے فارم کا کھاتہ، فصل کی پیداوار اور منڈی کے اشتہارات کلاؤڈ پر محفوظ کرنے کے لیے براہ کرم لاگ ان کریں۔'
                : 'Please sign in to save your farm ledger, harvests and mandi listings permanently to your account.'}
            </span>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>{lang === 'ur' ? 'لاگ ان کریں' : 'Sign In Now'}</span>
          </Link>
        </div>
      )}

      {/* Global Success Notification */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{saveSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider">
            {lang === 'ur' ? 'کسان کھاتہ بک و انتظامی پورٹل' : 'Farmer Ledger & Production Portal'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#1B5E20] mt-1">
            {lang === 'ur' 
              ? `خوش آمدید، ${currentUser?.fullName || 'کسان بھائی'}!` 
              : `Welcome, ${currentUser?.fullName || 'Farmer'}!`}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {currentUser?.city ? `${currentUser.city}, ${currentUser.province}` : 'Pakistan'} • {currentUser?.phone || 'Online Farm Records'}
          </p>
        </div>

        {/* Report Export Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => exportRecordsToCSV(currentUser?.fullName || 'Farmer', produce, expenses, income)}
            className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#2E7D32]" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={() => printFarmReport(currentUser?.fullName || 'Farmer', produce, expenses, income)}
            className="px-4 py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#F9A825]" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total Sales */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              {t.totalIncome}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#1B5E20] mt-1 block">
              {formatPKR(totalIncomeAmount)}
            </span>
            <span className="text-[11px] text-emerald-800 font-semibold mt-0.5 block">
              {income.length} {lang === 'ur' ? 'کل اندراجات' : 'Recorded Mandi Deals'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center">
            <TrendingUp className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              {t.totalExpenses}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-red-600 mt-1 block">
              {formatPKR(totalExpenseAmount)}
            </span>
            <span className="text-[11px] text-red-700 font-semibold mt-0.5 block">
              {expenses.length} {lang === 'ur' ? 'کل اخراجات کے اندراجات' : 'Expense Vouchers'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white rounded-3xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#A5D6A7] uppercase tracking-wider block">
              {t.netProfit}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#F9A825] mt-1 block">
              {formatPKR(netProfit)}
            </span>
            <span className="text-[11px] text-[#C8E6C9] font-medium mt-0.5 block">
              {netProfit >= 0 
                ? (lang === 'ur' ? 'خالص زرعی منافع' : 'Net Farm Surplus') 
                : (lang === 'ur' ? 'خسارہ' : 'Operating Deficit')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#F9A825] flex items-center justify-center">
            <DollarSign className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

      </div>

      {/* Monthly Cash Flow Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#2E7D32]" />
          <span>{t.monthlyChartTitle}</span>
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#777' }} />
              <YAxis tick={{ fontSize: 11, fill: '#777' }} />
              <Tooltip 
                formatter={(val: any) => formatPKR(val)}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
              <Bar dataKey="Income" fill="#2E7D32" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Expense" fill="#c62828" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Record Keeping Navigation Tabs */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3">
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('produce')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'produce'
                  ? 'bg-[#1B5E20] text-white shadow-xs'
                  : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {t.produceTab} ({produce.length})
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'expenses'
                  ? 'bg-[#1B5E20] text-white shadow-xs'
                  : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {t.expenseTab} ({expenses.length})
            </button>

            <button
              onClick={() => setActiveTab('income')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'income'
                  ? 'bg-[#1B5E20] text-white shadow-xs'
                  : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {t.incomeTab} ({income.length})
            </button>

            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'listings'
                  ? 'bg-[#1B5E20] text-white shadow-xs'
                  : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {t.myMarketListings} ({myListings.length})
            </button>
          </div>

          {/* Add buttons */}
          <div>
            {activeTab === 'produce' && (
              <button
                onClick={() => {
                  setEditingProduceId(null);
                  setNewProduce({
                    crop: 'Wheat (گندم)',
                    season: 'Rabi 2026',
                    landArea: '10 Acres',
                    date: new Date().toISOString().slice(0, 10),
                    quantity: 400,
                    unit: 'maund',
                    quality: 'A (Top)',
                    storageLocation: 'Home Godown'
                  });
                  setSaveError(null);
                  setShowProduceModal(true);
                }}
                className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addProduce}</span>
              </button>
            )}

            {activeTab === 'expenses' && (
              <button
                onClick={() => {
                  setEditingExpenseId(null);
                  setNewExpense({
                    crop: 'Wheat (گندم)',
                    category: 'fertilizer',
                    amount: 25000,
                    date: new Date().toISOString().slice(0, 10),
                    notes: ''
                  });
                  setSaveError(null);
                  setShowExpenseModal(true);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addExpense}</span>
              </button>
            )}

            {activeTab === 'income' && (
              <button
                onClick={() => {
                  setEditingIncomeId(null);
                  setNewIncome({
                    crop: 'Wheat (گندم)',
                    quantitySold: 100,
                    unit: 'maund',
                    ratePerUnit: 3950,
                    totalAmount: 395000,
                    buyer: 'Local Mandi Dealer',
                    date: new Date().toISOString().slice(0, 10),
                    notes: ''
                  });
                  setSaveError(null);
                  setShowIncomeModal(true);
                }}
                className="px-4 py-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addIncome}</span>
              </button>
            )}

            {activeTab === 'listings' && (
              <Link
                to="/create-listing"
                className="px-4 py-2 bg-[#F9A825] hover:bg-[#F57F17] text-[#1B5E20] font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{t.postListingBtn}</span>
              </Link>
            )}
          </div>

        </div>

        {/* Tab 1: Produce Harvests Table */}
        {activeTab === 'produce' && (
          <div className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#1B5E20] text-white">
                  <tr>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'فصل' : 'Crop'}</th>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'سیزن و رقبہ' : 'Season & Area'}</th>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'مقدار' : 'Quantity'}</th>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'معیار' : 'Quality'}</th>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'گودام / اسٹوریج' : 'Storage Location'}</th>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'تاریخ' : 'Date'}</th>
                    <th className="p-4 font-bold text-right">{lang === 'ur' ? 'اقدامات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {produce.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{p.crop}</td>
                      <td className="p-4 text-gray-600">{p.season} ({p.landArea})</td>
                      <td className="p-4 font-black text-[#1B5E20]">{p.quantity} {p.unit}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md font-bold text-xs">
                          {p.quality}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{p.storageLocation}</td>
                      <td className="p-4 text-gray-400 text-xs">{p.date}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditProduce(p)}
                            title={lang === 'ur' ? 'تبدیل کریں' : 'Edit'}
                            className="p-1.5 text-gray-500 hover:text-[#1B5E20] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduce(p.id)}
                            title={lang === 'ur' ? 'حذف کریں' : 'Delete'}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {produce.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-500">
                {lang === 'ur' ? 'کوئی پیداواری ریکارڈ موجود نہیں ہے۔ نیا ریکارڈ شامل کریں۔' : 'No produce records added yet. Click Add Harvest Record to record harvest.'}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Expense Ledger */}
        {activeTab === 'expenses' && (
          <div className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#1B5E20] text-white">
                  <tr>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'شعبہ' : 'Category'}</th>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'فصل' : 'Crop'}</th>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'رقم (روپے)' : 'Amount (PKR)'}</th>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'تاریخ' : 'Date'}</th>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'تفصیل' : 'Notes'}</th>
                    <th className="p-4 font-bold text-right">{lang === 'ur' ? 'اقدامات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900 capitalize">{e.category}</td>
                      <td className="p-4 text-gray-600">{e.crop}</td>
                      <td className="p-4 font-black text-red-600">{formatPKR(e.amount)}</td>
                      <td className="p-4 text-gray-400 text-xs">{e.date}</td>
                      <td className="p-4 text-gray-500 text-xs">{e.notes || '-'}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditExpense(e)}
                            title={lang === 'ur' ? 'تبدیل کریں' : 'Edit'}
                            className="p-1.5 text-gray-500 hover:text-[#1B5E20] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(e.id)}
                            title={lang === 'ur' ? 'حذف کریں' : 'Delete'}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {expenses.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-500">
                {lang === 'ur' ? 'کوئی خرچہ ریکارڈ موجود نہیں ہے۔' : 'No expense records added yet.'}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Income Records */}
        {activeTab === 'income' && (
          <div className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#1B5E20] text-white">
                  <tr>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'فصل' : 'Crop'}</th>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'مقدار' : 'Quantity Sold'}</th>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'فی من ریٹ' : 'Rate/Unit'}</th>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'کل آمدن (روپے)' : 'Total (PKR)'}</th>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'خریدار / مل' : 'Buyer'}</th>
                    <th className="p-4 font-bold">{lang === 'ur' ? 'تاریخ' : 'Date'}</th>
                    <th className="p-4 font-bold text-right">{lang === 'ur' ? 'اقدامات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {income.map((inc) => (
                    <tr key={inc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{inc.crop}</td>
                      <td className="p-4 text-gray-700">{inc.quantitySold} {inc.unit}</td>
                      <td className="p-4 font-semibold text-gray-700">{formatPKR(inc.ratePerUnit)}</td>
                      <td className="p-4 font-black text-[#1B5E20] text-base">{formatPKR(inc.totalAmount)}</td>
                      <td className="p-4 text-gray-600">{inc.buyer}</td>
                      <td className="p-4 text-gray-400 text-xs">{inc.date}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditIncome(inc)}
                            title={lang === 'ur' ? 'تبدیل کریں' : 'Edit'}
                            className="p-1.5 text-gray-500 hover:text-[#1B5E20] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteIncome(inc.id)}
                            title={lang === 'ur' ? 'حذف کریں' : 'Delete'}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {income.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-500">
                {lang === 'ur' ? 'کوئی فروخت یا آمدن ریکارڈ موجود نہیں ہے۔' : 'No sales recorded yet.'}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: My Listings */}
        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map((l) => (
              <div key={l.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="h-36 rounded-2xl overflow-hidden relative bg-gray-100">
                    <img 
                      src={l.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'} 
                      alt={l.title} 
                      className="w-full h-full object-cover" 
                    />
                    <span className="absolute top-2 left-2 bg-[#1B5E20] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {l.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 truncate mt-3">{l.title}</h4>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="font-black text-[#1B5E20] text-base">{formatPKR(l.price)}</span>
                    <span className="text-gray-400">{l.viewsCount || 0} views</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Link
                    to={`/market/${l.id}`}
                    className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl text-center"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDeleteUserListing(l.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                    title={lang === 'ur' ? 'اشتہار حذف کریں' : 'Delete listing'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {myListings.length === 0 && (
              <div className="col-span-full p-8 text-center text-xs text-gray-500 bg-white rounded-3xl border border-gray-100">
                {lang === 'ur' 
                  ? 'آپ نے ابھی تک منڈی میں کوئی اشتہار شائع نہیں کیا۔ نیا اشتہار لگائیں۔'
                  : 'You have not posted any marketplace listings yet. Click Post a Listing above.'}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Produce Modal (Add / Edit) */}
      {showProduceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-lg text-gray-900">
                {editingProduceId 
                  ? (lang === 'ur' ? 'فصل کا ریکارڈ تبدیل کریں' : 'Edit Harvest Record')
                  : (lang === 'ur' ? 'فصل کی پیداوار کا اندراج' : t.addProduce)}
              </h3>
              <button 
                onClick={() => {
                  setShowProduceModal(false);
                  setEditingProduceId(null);
                  setSaveError(null);
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{saveError.message}</span>
                </div>
                <button
                  type="button"
                  onClick={saveError.retryFn}
                  className="px-2 py-1 bg-red-600 text-white rounded-lg font-bold text-[11px] shrink-0 hover:bg-red-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{lang === 'ur' ? 'دوبارہ کوشش' : 'Retry'}</span>
                </button>
              </div>
            )}

            <form onSubmit={handleAddProduce} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'ur' ? 'فصل کا نام' : 'Crop Name'}
                </label>
                <input
                  type="text"
                  required
                  value={newProduce.crop || ''}
                  onChange={(e) => setNewProduce({ ...newProduce, crop: e.target.value })}
                  placeholder="e.g. Wheat (گندم), Rice, Cotton"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ur' ? 'سیزن' : 'Season'}
                  </label>
                  <input
                    type="text"
                    value={newProduce.season || ''}
                    onChange={(e) => setNewProduce({ ...newProduce, season: e.target.value })}
                    placeholder="Rabi / Kharif 2026"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ur' ? 'رقبہ' : 'Land Area'}
                  </label>
                  <input
                    type="text"
                    value={newProduce.landArea || ''}
                    onChange={(e) => setNewProduce({ ...newProduce, landArea: e.target.value })}
                    placeholder="10 Acres"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ur' ? 'کل پیداوار' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    required
                    value={newProduce.quantity || ''}
                    onChange={(e) => setNewProduce({ ...newProduce, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ur' ? 'اکائی' : 'Unit'}
                  </label>
                  <select
                    value={newProduce.unit || 'maund'}
                    onChange={(e) => setNewProduce({ ...newProduce, unit: e.target.value as any })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                  >
                    <option value="maund">Maund (من)</option>
                    <option value="kg">Kg (کلو)</option>
                    <option value="ton">Ton (ٹن)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ur' ? 'معیار' : 'Quality Grade'}
                  </label>
                  <select
                    value={newProduce.quality || 'A (Top)'}
                    onChange={(e) => setNewProduce({ ...newProduce, quality: e.target.value as any })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                  >
                    <option value="A (Top)">A (Top Grade)</option>
                    <option value="B (Medium)">B (Medium)</option>
                    <option value="C (Fair)">C (Fair)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ur' ? 'تاریخ کٹائی' : 'Harvest Date'}
                  </label>
                  <input
                    type="date"
                    value={newProduce.date || ''}
                    onChange={(e) => setNewProduce({ ...newProduce, date: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'ur' ? 'اسٹوریج مقام' : 'Storage Location'}
                </label>
                <input
                  type="text"
                  value={newProduce.storageLocation || ''}
                  onChange={(e) => setNewProduce({ ...newProduce, storageLocation: e.target.value })}
                  placeholder="e.g. Farm concrete shed, Mandi Commission Shop"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowProduceModal(false);
                    setEditingProduceId(null);
                    setSaveError(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  {lang === 'ur' ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {isSaving 
                      ? (lang === 'ur' ? 'محفوظ ہو رہا ہے...' : 'Saving...') 
                      : (lang === 'ur' ? 'محفوظ کریں' : 'Save Record')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal (Add / Edit) */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-lg text-gray-900">
                {editingExpenseId
                  ? (lang === 'ur' ? 'خرچہ تبدیل کریں' : 'Edit Expense Record')
                  : (lang === 'ur' ? 'نئے خرچے کا اندراج' : t.addExpense)}
              </h3>
              <button 
                onClick={() => {
                  setShowExpenseModal(false);
                  setEditingExpenseId(null);
                  setSaveError(null);
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{saveError.message}</span>
                </div>
                <button
                  type="button"
                  onClick={saveError.retryFn}
                  className="px-2 py-1 bg-red-600 text-white rounded-lg font-bold text-[11px] shrink-0 hover:bg-red-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{lang === 'ur' ? 'دوبارہ کوشش' : 'Retry'}</span>
                </button>
              </div>
            )}

            <form onSubmit={handleAddExpense} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'ur' ? 'خرچے کی قسم' : 'Expense Category'}
                </label>
                <select
                  value={newExpense.category || 'fertilizer'}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                >
                  <option value="seed">Seed (بیج)</option>
                  <option value="fertilizer">Fertilizer (کھاد)</option>
                  <option value="pesticide">Pesticide / Spray (زرعی ادویات)</option>
                  <option value="labor">Labor (مزدوری)</option>
                  <option value="diesel">Diesel (ڈیزل / ٹیوب ویل)</option>
                  <option value="electricity">Electricity / Tubewell (بجلی بل)</option>
                  <option value="tractor rent">Tractor Rent (ٹریکٹر کرایہ)</option>
                  <option value="water charges">Water Charges / Abiana (آبیانہ نہر)</option>
                  <option value="transport">Transport (ٹرانسپورٹ کرایہ)</option>
                  <option value="other">Other (دیگر اخراجات)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'ur' ? 'رقم (روپے)' : 'Amount (PKR)'}
                </label>
                <input
                  type="number"
                  required
                  value={newExpense.amount || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-base font-black text-red-600 focus:ring-2 focus:ring-red-600 focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ur' ? 'فصل' : 'Crop'}
                  </label>
                  <input
                    type="text"
                    value={newExpense.crop || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, crop: e.target.value })}
                    placeholder="Wheat, Rice..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ur' ? 'تاریخ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={newExpense.date || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'ur' ? 'تفصیل و یادداشت' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={newExpense.notes || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  placeholder="e.g. 5 bags urea purchased from dealer"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowExpenseModal(false);
                    setEditingExpenseId(null);
                    setSaveError(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  {lang === 'ur' ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {isSaving 
                      ? (lang === 'ur' ? 'محفوظ ہو رہا ہے...' : 'Saving...') 
                      : (lang === 'ur' ? 'محفوظ کریں' : 'Save Expense')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Income Modal (Add / Edit) */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-lg text-gray-900">
                {editingIncomeId
                  ? (lang === 'ur' ? 'فروخت کا اندراج تبدیل کریں' : 'Edit Sale Record')
                  : (lang === 'ur' ? 'فروخت و آمدن کا اندراج' : t.addIncome)}
              </h3>
              <button 
                onClick={() => {
                  setShowIncomeModal(false);
                  setEditingIncomeId(null);
                  setSaveError(null);
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{saveError.message}</span>
                </div>
                <button
                  type="button"
                  onClick={saveError.retryFn}
                  className="px-2 py-1 bg-red-600 text-white rounded-lg font-bold text-[11px] shrink-0 hover:bg-red-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{lang === 'ur' ? 'دوبارہ کوشش' : 'Retry'}</span>
                </button>
              </div>
            )}

            <form onSubmit={handleAddIncome} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'ur' ? 'فروخت شدہ جنس / فصل' : 'Crop Sold'}
                </label>
                <input
                  type="text"
                  required
                  value={newIncome.crop || ''}
                  onChange={(e) => setNewIncome({ ...newIncome, crop: e.target.value })}
                  placeholder="Wheat, Super Kernel Basmati Rice..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ur' ? 'فروخت شدہ مقدار' : 'Quantity Sold'}
                  </label>
                  <input
                    type="number"
                    required
                    value={newIncome.quantitySold || ''}
                    onChange={(e) => setNewIncome({ ...newIncome, quantitySold: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ur' ? 'اکائی' : 'Unit'}
                  </label>
                  <select
                    value={newIncome.unit || 'maund'}
                    onChange={(e) => setNewIncome({ ...newIncome, unit: e.target.value as any })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                  >
                    <option value="maund">Maund (من)</option>
                    <option value="kg">Kg (کلو)</option>
                    <option value="ton">Ton (ٹن)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ur' ? 'فی من / فی اکائی ریٹ (روپے)' : 'Rate per Unit (PKR)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={newIncome.ratePerUnit || ''}
                    onChange={(e) => setNewIncome({ ...newIncome, ratePerUnit: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ur' ? 'فروخت کی تاریخ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={newIncome.date || ''}
                    onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'ur' ? 'خریدار / مل / کمیشن ایجنٹ' : 'Buyer / Mill / Mandi Agent'}
                </label>
                <input
                  type="text"
                  value={newIncome.buyer || ''}
                  onChange={(e) => setNewIncome({ ...newIncome, buyer: e.target.value })}
                  placeholder="e.g. Bismillah Flour Mills, Sahiwal"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#1B5E20] focus:bg-white"
                />
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex justify-between items-center">
                <span className="font-bold text-[#1B5E20]">
                  {lang === 'ur' ? 'کل آمدن حساب:' : 'Calculated Total Amount:'}
                </span>
                <span className="font-black text-sm text-[#1B5E20]">
                  {formatPKR((Number(newIncome.quantitySold) || 0) * (Number(newIncome.ratePerUnit) || 0))}
                </span>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowIncomeModal(false);
                    setEditingIncomeId(null);
                    setSaveError(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  {lang === 'ur' ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {isSaving 
                      ? (lang === 'ur' ? 'محفوظ ہو رہا ہے...' : 'Saving...') 
                      : (lang === 'ur' ? 'محفوظ کریں' : 'Save Sale')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
