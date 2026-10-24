import { 
  UserProfile, 
  FertilizerPrice, 
  Tractor, 
  Listing, 
  ProduceRecord, 
  ExpenseRecord, 
  IncomeRecord, 
  CropPlan, 
  ChatMessage, 
  Conversation,
  ReportedListing 
} from '../types';
import { INITIAL_FERTILIZER_PRICES } from '../data/fertilizersData';
import { TRACTORS_DATA } from '../data/tractorsData';
import { INITIAL_LISTINGS } from '../data/marketInitialData';
import { db, isFirebaseConfigured } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  serverTimestamp,
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { dbStatus } from './dbStatus';

// Keys for local simulation fallback
const STORAGE_KEYS = {
  USERS: 'kissan_users',
  FERTILIZERS: 'kissan_fertilizer_prices',
  TRACTORS: 'kissan_tractors',
  LISTINGS: 'kissan_listings',
  PRODUCE: 'kissan_produce_records',
  EXPENSES: 'kissan_expense_records',
  INCOME: 'kissan_income_records',
  PLANS: 'kissan_crop_plans',
  MESSAGES: 'kissan_chat_messages',
  REPORTS: 'kissan_reported_listings'
};

// Seed initial storage helper
function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(data) as T;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new Event('kissan_storage_update_' + key));
  } catch (err) {
    console.error('Local storage save error:', err);
  }
}

// Recursively strips undefined fields to prevent Firestore serialization errors
export function cleanData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Date) &&
        typeof (value as any)?.toDate !== 'function'
      ) {
        result[key] = cleanData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// ----------------- FERTILIZERS -----------------
export async function getFertilizerPrices(): Promise<FertilizerPrice[]> {
  // Always begin with baseline local dataset so page is never empty
  const priceMap = new Map<string, FertilizerPrice>();
  for (const item of INITIAL_FERTILIZER_PRICES) {
    priceMap.set(item.id, { ...item });
  }

  // Merge any locally stored modifications
  const localItems = getLocal<FertilizerPrice[]>(STORAGE_KEYS.FERTILIZERS, []);
  for (const item of localItems) {
    if (item && item.id) {
      priceMap.set(item.id, { ...priceMap.get(item.id), ...item });
    }
  }

  // Attempt Firestore merge if configured
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'fertilizerPrices');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        snap.docs.forEach((d) => {
          const remote = { id: d.id, ...d.data() } as FertilizerPrice;
          priceMap.set(remote.id, { ...priceMap.get(remote.id), ...remote });
        });
      }
    } catch (e) {
      console.warn('Firestore fertilizer fetch fallback to local:', e);
    }
  }

  const result = Array.from(priceMap.values());
  setLocal(STORAGE_KEYS.FERTILIZERS, result);
  return result;
}

export async function updateFertilizerPrice(price: FertilizerPrice): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'fertilizerPrices', price.id), price, { merge: true });
    } catch (e) {
      console.warn('Firestore update fertilizer price error:', e);
    }
  }
  const current = getLocal<FertilizerPrice[]>(STORAGE_KEYS.FERTILIZERS, INITIAL_FERTILIZER_PRICES);
  const idx = current.findIndex(p => p.id === price.id);
  if (idx >= 0) {
    current[idx] = price;
  } else {
    current.push(price);
  }
  setLocal(STORAGE_KEYS.FERTILIZERS, current);
}

// ----------------- TRACTORS -----------------
export async function getTractors(): Promise<Tractor[]> {
  // Always start with local dataset of all 16 tractors so compare & gallery never render empty
  const tractorMap = new Map<string, Tractor>();
  for (const t of TRACTORS_DATA) {
    tractorMap.set(t.id, { ...t });
  }

  // Merge locally stored changes
  const localTractors = getLocal<Tractor[]>(STORAGE_KEYS.TRACTORS, []);
  for (const t of localTractors) {
    if (t && t.id) {
      tractorMap.set(t.id, { ...tractorMap.get(t.id), ...t });
    }
  }

  // Attempt Firestore merge
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'tractors');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        snap.docs.forEach((d) => {
          const remote = { id: d.id, ...d.data() } as Tractor;
          tractorMap.set(remote.id, { ...tractorMap.get(remote.id), ...remote });
        });
      }
    } catch (e) {
      console.warn('Firestore tractor fetch fallback to local:', e);
    }
  }

  const result = Array.from(tractorMap.values());
  setLocal(STORAGE_KEYS.TRACTORS, result);
  return result;
}

export async function updateTractor(tractor: Tractor): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'tractors', tractor.id), tractor, { merge: true });
    } catch (e) {
      console.warn('Firestore tractor update error:', e);
    }
  }
  const current = getLocal<Tractor[]>(STORAGE_KEYS.TRACTORS, TRACTORS_DATA);
  const idx = current.findIndex(t => t.id === tractor.id);
  if (idx >= 0) {
    current[idx] = tractor;
  } else {
    current.push(tractor);
  }
  setLocal(STORAGE_KEYS.TRACTORS, current);
}

// ----------------- LISTINGS -----------------
export async function getListings(): Promise<Listing[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'listings');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Listing));
      }
      for (const l of INITIAL_LISTINGS) {
        await setDoc(doc(db, 'listings', l.id), l);
      }
      return INITIAL_LISTINGS;
    } catch (e) {
      console.warn('Firestore listings fetch fallback:', e);
    }
  }
  return getLocal<Listing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
}

export function subscribeToListings(callback: (listings: Listing[]) => void): () => void {
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'listings');
      const unsubscribe = onSnapshot(colRef, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Listing));
          callback(list);
        } else {
          callback(INITIAL_LISTINGS);
        }
      }, (err) => {
        console.warn('Listing snapshot error:', err);
        callback(getLocal<Listing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS));
      });
      return unsubscribe;
    } catch (e) {
      console.warn('Firestore onSnapshot failed, using local events:', e);
    }
  }

  // Fallback to local custom event subscription
  const handleUpdate = () => {
    callback(getLocal<Listing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS));
  };
  window.addEventListener('kissan_storage_update_' + STORAGE_KEYS.LISTINGS, handleUpdate);
  // initial load
  callback(getLocal<Listing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS));
  return () => {
    window.removeEventListener('kissan_storage_update_' + STORAGE_KEYS.LISTINGS, handleUpdate);
  };
}

export async function saveListing(listing: Listing): Promise<void> {
  const cleaned = cleanData(listing);
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'listings', listing.id), {
        ...cleaned,
        updatedAt: serverTimestamp()
      }, { merge: true });
      if (listing.userId) {
        await setDoc(doc(db, 'users', listing.userId, 'listings', listing.id), {
          ...cleaned,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      dbStatus.reportSuccess();
    } catch (e: any) {
      console.warn('Firestore save listing error:', e);
      dbStatus.reportFailure(e);
      throw e;
    }
  }
  const current = getLocal<Listing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
  const idx = current.findIndex(l => l.id === listing.id);
  if (idx >= 0) {
    current[idx] = listing;
  } else {
    current.unshift(listing);
  }
  setLocal(STORAGE_KEYS.LISTINGS, current);
}

export async function deleteListing(listingId: string, userId?: string): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'listings', listingId));
      if (userId) {
        await deleteDoc(doc(db, 'users', userId, 'listings', listingId));
      }
      dbStatus.reportSuccess();
    } catch (e: any) {
      console.warn('Firestore delete listing error:', e);
      dbStatus.reportFailure(e);
      throw e;
    }
  }
  const current = getLocal<Listing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
  const filtered = current.filter(l => l.id !== listingId);
  setLocal(STORAGE_KEYS.LISTINGS, filtered);
}

export async function incrementListingView(listingId: string): Promise<void> {
  const current = getLocal<Listing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
  const idx = current.findIndex(l => l.id === listingId);
  if (idx >= 0) {
    current[idx].viewsCount = (current[idx].viewsCount || 0) + 1;
    setLocal(STORAGE_KEYS.LISTINGS, current);
  }
}

// ----------------- PRODUCE / HARVESTS (users/{uid}/harvests) -----------------
export const DEFAULT_PRODUCE_RECORDS = (userId: string): ProduceRecord[] => [
  {
    id: 'prod-1',
    userId: userId,
    crop: 'Wheat (گندم)',
    season: 'Rabi 2025-26',
    landArea: '10 Acres',
    date: '2026-04-15',
    quantity: 420,
    unit: 'maund',
    quality: 'A (Top)',
    storageLocation: 'Farm Concrete Shed Room 1',
    notes: 'Harvested with combine harvester, moisture 12.5%, Akbar-2019 variety.'
  },
  {
    id: 'prod-2',
    userId: userId,
    crop: 'Basmati Rice (چاول)',
    season: 'Kharif 2025',
    landArea: '6 Acres',
    date: '2025-11-05',
    quantity: 260,
    unit: 'maund',
    quality: 'A (Top)',
    storageLocation: 'Mandi Commission Shop Godown',
    notes: 'Super Kernel Basmati, 43.3 maunds/acre average.'
  }
];

export function subscribeUserHarvests(
  userId: string,
  callback: (records: ProduceRecord[]) => void,
  onError?: (err: any) => void
): () => void {
  const fallback = getLocal<ProduceRecord[]>(`${STORAGE_KEYS.PRODUCE}_${userId}`, DEFAULT_PRODUCE_RECORDS(userId));

  if (isFirebaseConfigured() && db && userId) {
    try {
      const colRef = collection(db, 'users', userId, 'harvests');
      const unsubscribe = onSnapshot(
        colRef,
        (snap) => {
          dbStatus.reportSuccess();
          if (!snap.empty) {
            const list: ProduceRecord[] = snap.docs.map(d => ({
              id: d.id,
              userId,
              ...d.data()
            } as ProduceRecord));
            setLocal(`${STORAGE_KEYS.PRODUCE}_${userId}`, list);
            callback(list);
          } else {
            callback(fallback);
          }
        },
        (error) => {
          console.warn('Firestore harvests onSnapshot error:', error);
          dbStatus.reportFailure(error);
          if (onError) onError(error);
          callback(getLocal<ProduceRecord[]>(`${STORAGE_KEYS.PRODUCE}_${userId}`, fallback));
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn('Firestore subscribe harvests init failed:', e);
    }
  }

  callback(fallback);
  const handleUpdate = () => {
    callback(getLocal<ProduceRecord[]>(`${STORAGE_KEYS.PRODUCE}_${userId}`, fallback));
  };
  window.addEventListener(`kissan_storage_update_${STORAGE_KEYS.PRODUCE}_${userId}`, handleUpdate);
  return () => {
    window.removeEventListener(`kissan_storage_update_${STORAGE_KEYS.PRODUCE}_${userId}`, handleUpdate);
  };
}

export async function saveUserHarvest(
  userId: string,
  record: Partial<ProduceRecord> & { id?: string }
): Promise<string> {
  const cleaned = cleanData(record);
  let recordId = record.id;

  if (isFirebaseConfigured() && db && userId) {
    try {
      if (recordId && !recordId.startsWith('prod_local_') && !recordId.startsWith('prod-')) {
        const docRef = doc(db, 'users', userId, 'harvests', recordId);
        await setDoc(docRef, {
          ...cleaned,
          userId,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        const colRef = collection(db, 'users', userId, 'harvests');
        const docRef = await addDoc(colRef, {
          ...cleaned,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        recordId = docRef.id;
      }
      dbStatus.reportSuccess();
    } catch (e: any) {
      console.error('Firestore saveUserHarvest error:', e);
      dbStatus.reportFailure(e);
      throw e;
    }
  }

  if (!recordId) {
    recordId = 'prod_local_' + Date.now();
  }

  const current = getLocal<ProduceRecord[]>(`${STORAGE_KEYS.PRODUCE}_${userId}`, DEFAULT_PRODUCE_RECORDS(userId));
  const idx = current.findIndex(r => r.id === recordId);
  const item: ProduceRecord = { ...cleaned, id: recordId, userId } as ProduceRecord;
  if (idx >= 0) {
    current[idx] = item;
  } else {
    current.unshift(item);
  }
  setLocal(`${STORAGE_KEYS.PRODUCE}_${userId}`, current);
  return recordId;
}

export async function updateUserHarvest(
  userId: string,
  recordId: string,
  updates: Partial<ProduceRecord>
): Promise<void> {
  const cleaned = cleanData(updates);
  if (isFirebaseConfigured() && db && userId) {
    try {
      const docRef = doc(db, 'users', userId, 'harvests', recordId);
      await updateDoc(docRef, {
        ...cleaned,
        updatedAt: serverTimestamp()
      });
      dbStatus.reportSuccess();
    } catch (e: any) {
      console.error('Firestore updateUserHarvest error:', e);
      dbStatus.reportFailure(e);
      throw e;
    }
  }

  const current = getLocal<ProduceRecord[]>(`${STORAGE_KEYS.PRODUCE}_${userId}`, []);
  const idx = current.findIndex(r => r.id === recordId);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...cleaned };
    setLocal(`${STORAGE_KEYS.PRODUCE}_${userId}`, current);
  }
}

export async function deleteUserHarvest(userId: string, recordId: string): Promise<void> {
  if (isFirebaseConfigured() && db && userId) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'harvests', recordId));
      dbStatus.reportSuccess();
    } catch (e: any) {
      console.error('Firestore deleteUserHarvest error:', e);
      dbStatus.reportFailure(e);
      throw e;
    }
  }

  const current = getLocal<ProduceRecord[]>(`${STORAGE_KEYS.PRODUCE}_${userId}`, []);
  setLocal(`${STORAGE_KEYS.PRODUCE}_${userId}`, current.filter(r => r.id !== recordId));
}

export async function getProduceRecords(userId: string): Promise<ProduceRecord[]> {
  if (isFirebaseConfigured() && db && userId) {
    try {
      const colRef = collection(db, 'users', userId, 'harvests');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, userId, ...d.data() } as ProduceRecord));
      }
    } catch (e) {
      console.warn('Firestore getProduceRecords subcollection error:', e);
    }
  }
  return getLocal<ProduceRecord[]>(`${STORAGE_KEYS.PRODUCE}_${userId}`, DEFAULT_PRODUCE_RECORDS(userId));
}

export async function saveProduceRecord(record: ProduceRecord): Promise<void> {
  await saveUserHarvest(record.userId, record);
}

export async function deleteProduceRecord(recordId: string, userId?: string): Promise<void> {
  if (userId) {
    await deleteUserHarvest(userId, recordId);
  } else {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'produceRecords', recordId));
      } catch {}
    }
    const all = getLocal<ProduceRecord[]>(STORAGE_KEYS.PRODUCE, []);
    setLocal(STORAGE_KEYS.PRODUCE, all.filter(r => r.id !== recordId));
  }
}

// ----------------- EXPENSES (users/{uid}/expenses) -----------------
export const DEFAULT_EXPENSE_RECORDS = (userId: string): ExpenseRecord[] => [
  {
    id: 'exp-1',
    userId: userId,
    category: 'seed',
    amount: 48000,
    date: '2025-11-02',
    crop: 'Wheat (گندم)',
    notes: '10 bags certified Akbar-2019 seed from Punjab Seed Corp'
  },
  {
    id: 'exp-2',
    userId: userId,
    category: 'fertilizer',
    amount: 185000,
    date: '2025-11-05',
    crop: 'Wheat (گندم)',
    notes: '15 bags FFC DAP and 10 bags Sona Urea'
  },
  {
    id: 'exp-3',
    userId: userId,
    category: 'diesel',
    amount: 65000,
    date: '2025-12-10',
    crop: 'Wheat (گندم)',
    notes: 'Tubewell running fuel during canal closure'
  },
  {
    id: 'exp-4',
    userId: userId,
    category: 'labor',
    amount: 72000,
    date: '2026-04-18',
    crop: 'Wheat (گندم)',
    notes: 'Harvesting, loading and bag stitching labor'
  }
];

export function subscribeUserExpenses(
  userId: string,
  callback: (records: ExpenseRecord[]) => void,
  onError?: (err: any) => void
): () => void {
  const fallback = getLocal<ExpenseRecord[]>(`${STORAGE_KEYS.EXPENSES}_${userId}`, DEFAULT_EXPENSE_RECORDS(userId));

  if (isFirebaseConfigured() && db && userId) {
    try {
      const colRef = collection(db, 'users', userId, 'expenses');
      const unsubscribe = onSnapshot(
        colRef,
        (snap) => {
          dbStatus.reportSuccess();
          if (!snap.empty) {
            const list: ExpenseRecord[] = snap.docs.map(d => ({
              id: d.id,
              userId,
              ...d.data()
            } as ExpenseRecord));
            setLocal(`${STORAGE_KEYS.EXPENSES}_${userId}`, list);
            callback(list);
          } else {
            callback(fallback);
          }
        },
        (error) => {
          console.warn('Firestore expenses onSnapshot error:', error);
          dbStatus.reportFailure(error);
          if (onError) onError(error);
          callback(getLocal<ExpenseRecord[]>(`${STORAGE_KEYS.EXPENSES}_${userId}`, fallback));
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn('Firestore subscribe expenses init failed:', e);
    }
  }

  callback(fallback);
  const handleUpdate = () => {
    callback(getLocal<ExpenseRecord[]>(`${STORAGE_KEYS.EXPENSES}_${userId}`, fallback));
  };
  window.addEventListener(`kissan_storage_update_${STORAGE_KEYS.EXPENSES}_${userId}`, handleUpdate);
  return () => {
    window.removeEventListener(`kissan_storage_update_${STORAGE_KEYS.EXPENSES}_${userId}`, handleUpdate);
  };
}

export async function saveUserExpense(
  userId: string,
  record: Partial<ExpenseRecord> & { id?: string }
): Promise<string> {
  const cleaned = cleanData(record);
  let recordId = record.id;

  if (isFirebaseConfigured() && db && userId) {
    try {
      if (recordId && !recordId.startsWith('exp_local_') && !recordId.startsWith('exp-')) {
        const docRef = doc(db, 'users', userId, 'expenses', recordId);
        await setDoc(docRef, {
          ...cleaned,
          userId,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        const colRef = collection(db, 'users', userId, 'expenses');
        const docRef = await addDoc(colRef, {
          ...cleaned,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        recordId = docRef.id;
      }
      dbStatus.reportSuccess();
    } catch (e: any) {
      console.error('Firestore saveUserExpense error:', e);
      dbStatus.reportFailure(e);
      throw e;
    }
  }

  if (!recordId) {
    recordId = 'exp_local_' + Date.now();
  }

  const current = getLocal<ExpenseRecord[]>(`${STORAGE_KEYS.EXPENSES}_${userId}`, DEFAULT_EXPENSE_RECORDS(userId));
  const idx = current.findIndex(r => r.id === recordId);
  const item: ExpenseRecord = { ...cleaned, id: recordId, userId } as ExpenseRecord;
  if (idx >= 0) {
    current[idx] = item;
  } else {
    current.unshift(item);
  }
  setLocal(`${STORAGE_KEYS.EXPENSES}_${userId}`, current);
  return recordId;
}

export async function updateUserExpense(
  userId: string,
  recordId: string,
  updates: Partial<ExpenseRecord>
): Promise<void> {
  const cleaned = cleanData(updates);
  if (isFirebaseConfigured() && db && userId) {
    try {
      const docRef = doc(db, 'users', userId, 'expenses', recordId);
      await updateDoc(docRef, {
        ...cleaned,
        updatedAt: serverTimestamp()
      });
      dbStatus.reportSuccess();
    } catch (e: any) {
      console.error('Firestore updateUserExpense error:', e);
      dbStatus.reportFailure(e);
      throw e;
    }
  }

  const current = getLocal<ExpenseRecord[]>(`${STORAGE_KEYS.EXPENSES}_${userId}`, []);
  const idx = current.findIndex(r => r.id === recordId);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...cleaned };
    setLocal(`${STORAGE_KEYS.EXPENSES}_${userId}`, current);
  }
}

export async function deleteUserExpense(userId: string, recordId: string): Promise<void> {
  if (isFirebaseConfigured() && db && userId) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'expenses', recordId));
      dbStatus.reportSuccess();
    } catch (e: any) {
      console.error('Firestore deleteUserExpense error:', e);
      dbStatus.reportFailure(e);
      throw e;
    }
  }

  const current = getLocal<ExpenseRecord[]>(`${STORAGE_KEYS.EXPENSES}_${userId}`, []);
  setLocal(`${STORAGE_KEYS.EXPENSES}_${userId}`, current.filter(r => r.id !== recordId));
}

export async function getExpenseRecords(userId: string): Promise<ExpenseRecord[]> {
  if (isFirebaseConfigured() && db && userId) {
    try {
      const colRef = collection(db, 'users', userId, 'expenses');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, userId, ...d.data() } as ExpenseRecord));
      }
    } catch (e) {
      console.warn('Firestore getExpenseRecords subcollection error:', e);
    }
  }
  return getLocal<ExpenseRecord[]>(`${STORAGE_KEYS.EXPENSES}_${userId}`, DEFAULT_EXPENSE_RECORDS(userId));
}

export async function saveExpenseRecord(record: ExpenseRecord): Promise<void> {
  await saveUserExpense(record.userId, record);
}

export async function deleteExpenseRecord(recordId: string, userId?: string): Promise<void> {
  if (userId) {
    await deleteUserExpense(userId, recordId);
  } else {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'expenseRecords', recordId));
      } catch {}
    }
    const all = getLocal<ExpenseRecord[]>(STORAGE_KEYS.EXPENSES, []);
    setLocal(STORAGE_KEYS.EXPENSES, all.filter(r => r.id !== recordId));
  }
}

// ----------------- SALES / INCOME (users/{uid}/sales) -----------------
export const DEFAULT_INCOME_RECORDS = (userId: string): IncomeRecord[] => [
  {
    id: 'inc-1',
    userId: userId,
    crop: 'Wheat (گندم)',
    quantitySold: 350,
    unit: 'maund',
    ratePerUnit: 3950,
    totalAmount: 1382500,
    buyer: 'Bismillah Flour Mills, Sahiwal',
    date: '2026-04-25',
    notes: 'Sold on cash payment at factory gate'
  },
  {
    id: 'inc-2',
    userId: userId,
    crop: 'Basmati Rice (چاول)',
    quantitySold: 220,
    unit: 'maund',
    ratePerUnit: 4400,
    totalAmount: 968000,
    buyer: 'Chaudhry Arshad Rice Exporters',
    date: '2025-11-20',
    notes: 'Direct grain deal through Kissan Connect'
  }
];

export function subscribeUserSales(
  userId: string,
  callback: (records: IncomeRecord[]) => void,
  onError?: (err: any) => void
): () => void {
  const fallback = getLocal<IncomeRecord[]>(`${STORAGE_KEYS.INCOME}_${userId}`, DEFAULT_INCOME_RECORDS(userId));

  if (isFirebaseConfigured() && db && userId) {
    try {
      const colRef = collection(db, 'users', userId, 'sales');
      const unsubscribe = onSnapshot(
        colRef,
        (snap) => {
          dbStatus.reportSuccess();
          if (!snap.empty) {
            const list: IncomeRecord[] = snap.docs.map(d => ({
              id: d.id,
              userId,
              ...d.data()
            } as IncomeRecord));
            setLocal(`${STORAGE_KEYS.INCOME}_${userId}`, list);
            callback(list);
          } else {
            callback(fallback);
          }
        },
        (error) => {
          console.warn('Firestore sales onSnapshot error:', error);
          dbStatus.reportFailure(error);
          if (onError) onError(error);
          callback(getLocal<IncomeRecord[]>(`${STORAGE_KEYS.INCOME}_${userId}`, fallback));
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn('Firestore subscribe sales init failed:', e);
    }
  }

  callback(fallback);
  const handleUpdate = () => {
    callback(getLocal<IncomeRecord[]>(`${STORAGE_KEYS.INCOME}_${userId}`, fallback));
  };
  window.addEventListener(`kissan_storage_update_${STORAGE_KEYS.INCOME}_${userId}`, handleUpdate);
  return () => {
    window.removeEventListener(`kissan_storage_update_${STORAGE_KEYS.INCOME}_${userId}`, handleUpdate);
  };
}

export async function saveUserSale(
  userId: string,
  record: Partial<IncomeRecord> & { id?: string }
): Promise<string> {
  const cleaned = cleanData(record);
  let recordId = record.id;

  if (isFirebaseConfigured() && db && userId) {
    try {
      if (recordId && !recordId.startsWith('inc_local_') && !recordId.startsWith('inc-')) {
        const docRef = doc(db, 'users', userId, 'sales', recordId);
        await setDoc(docRef, {
          ...cleaned,
          userId,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        const colRef = collection(db, 'users', userId, 'sales');
        const docRef = await addDoc(colRef, {
          ...cleaned,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        recordId = docRef.id;
      }
      dbStatus.reportSuccess();
    } catch (e: any) {
      console.error('Firestore saveUserSale error:', e);
      dbStatus.reportFailure(e);
      throw e;
    }
  }

  if (!recordId) {
    recordId = 'inc_local_' + Date.now();
  }

  const current = getLocal<IncomeRecord[]>(`${STORAGE_KEYS.INCOME}_${userId}`, DEFAULT_INCOME_RECORDS(userId));
  const idx = current.findIndex(r => r.id === recordId);
  const item: IncomeRecord = { ...cleaned, id: recordId, userId } as IncomeRecord;
  if (idx >= 0) {
    current[idx] = item;
  } else {
    current.unshift(item);
  }
  setLocal(`${STORAGE_KEYS.INCOME}_${userId}`, current);
  return recordId;
}

export async function updateUserSale(
  userId: string,
  recordId: string,
  updates: Partial<IncomeRecord>
): Promise<void> {
  const cleaned = cleanData(updates);
  if (isFirebaseConfigured() && db && userId) {
    try {
      const docRef = doc(db, 'users', userId, 'sales', recordId);
      await updateDoc(docRef, {
        ...cleaned,
        updatedAt: serverTimestamp()
      });
      dbStatus.reportSuccess();
    } catch (e: any) {
      console.error('Firestore updateUserSale error:', e);
      dbStatus.reportFailure(e);
      throw e;
    }
  }

  const current = getLocal<IncomeRecord[]>(`${STORAGE_KEYS.INCOME}_${userId}`, []);
  const idx = current.findIndex(r => r.id === recordId);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...cleaned };
    setLocal(`${STORAGE_KEYS.INCOME}_${userId}`, current);
  }
}

export async function deleteUserSale(userId: string, recordId: string): Promise<void> {
  if (isFirebaseConfigured() && db && userId) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'sales', recordId));
      dbStatus.reportSuccess();
    } catch (e: any) {
      console.error('Firestore deleteUserSale error:', e);
      dbStatus.reportFailure(e);
      throw e;
    }
  }

  const current = getLocal<IncomeRecord[]>(`${STORAGE_KEYS.INCOME}_${userId}`, []);
  setLocal(`${STORAGE_KEYS.INCOME}_${userId}`, current.filter(r => r.id !== recordId));
}

export async function getIncomeRecords(userId: string): Promise<IncomeRecord[]> {
  if (isFirebaseConfigured() && db && userId) {
    try {
      const colRef = collection(db, 'users', userId, 'sales');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, userId, ...d.data() } as IncomeRecord));
      }
    } catch (e) {
      console.warn('Firestore getIncomeRecords subcollection error:', e);
    }
  }
  return getLocal<IncomeRecord[]>(`${STORAGE_KEYS.INCOME}_${userId}`, DEFAULT_INCOME_RECORDS(userId));
}

export async function saveIncomeRecord(record: IncomeRecord): Promise<void> {
  await saveUserSale(record.userId, record);
}

export async function deleteIncomeRecord(recordId: string, userId?: string): Promise<void> {
  if (userId) {
    await deleteUserSale(userId, recordId);
  } else {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'incomeRecords', recordId));
      } catch {}
    }
    const all = getLocal<IncomeRecord[]>(STORAGE_KEYS.INCOME, []);
    setLocal(STORAGE_KEYS.INCOME, all.filter(r => r.id !== recordId));
  }
}

// ----------------- PHOTO UPLOAD HELPERS FOR ADMIN -----------------
export async function uploadTractorPhoto(tractorId: string, base64Image: string): Promise<void> {
  localStorage.setItem(`tractor_uploaded_img_${tractorId}`, base64Image);
  if (isFirebaseConfigured() && db) {
    try {
      const tractorRef = doc(db, 'tractors', tractorId);
      await setDoc(tractorRef, { image: base64Image, updatedAt: serverTimestamp() }, { merge: true });
      dbStatus.reportSuccess();
    } catch (err) {
      console.warn('Firestore tractor image sync error:', err);
    }
  }
  window.dispatchEvent(new Event('kissan_tractor_img_updated'));
}

export async function uploadCropPhoto(cropId: string, base64Image: string): Promise<void> {
  localStorage.setItem(`crop_uploaded_img_${cropId}`, base64Image);
  if (isFirebaseConfigured() && db) {
    try {
      const cropRef = doc(db, 'crops', cropId);
      await setDoc(cropRef, { image: base64Image, updatedAt: serverTimestamp() }, { merge: true });
      dbStatus.reportSuccess();
    } catch (err) {
      console.warn('Firestore crop image sync error:', err);
    }
  }
  window.dispatchEvent(new Event('kissan_crop_img_updated'));
}

// ----------------- CROP PLANS -----------------
export async function getCropPlans(userId: string): Promise<CropPlan[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'cropPlans'), where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as CropPlan));
    } catch (e) {
      console.warn('Firestore get crop plans error:', e);
    }
  }
  const all = getLocal<CropPlan[]>(STORAGE_KEYS.PLANS, []);
  return all.filter(p => p.userId === userId);
}

export async function saveCropPlan(plan: CropPlan): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'cropPlans', plan.id), plan, { merge: true });
    } catch (e) {
      console.warn('Firestore save crop plan error:', e);
    }
  }
  const all = getLocal<CropPlan[]>(STORAGE_KEYS.PLANS, []);
  const idx = all.findIndex(p => p.id === plan.id);
  if (idx >= 0) all[idx] = plan;
  else all.unshift(plan);
  setLocal(STORAGE_KEYS.PLANS, all);
}

export async function deleteCropPlan(planId: string): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'cropPlans', planId));
    } catch (e) {
      console.warn('Firestore delete plan error:', e);
    }
  }
  const all = getLocal<CropPlan[]>(STORAGE_KEYS.PLANS, []);
  setLocal(STORAGE_KEYS.PLANS, all.filter(p => p.id !== planId));
}

// ----------------- CHAT / MESSAGES -----------------
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'messages'), where('conversationId', '==', conversationId), orderBy('timestamp', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
    } catch (e) {
      console.warn('Firestore get messages error:', e);
    }
  }
  const all = getLocal<ChatMessage[]>(STORAGE_KEYS.MESSAGES, [
    {
      id: 'msg-seed-1',
      conversationId: conversationId,
      senderId: 'user-demo-1',
      senderName: 'Chaudhry Riaz Gujjar',
      receiverId: 'buyer-demo',
      text: 'Assalam-o-Alaikum! G bilkul, seed Akbar-2019 bilkul fresh aur certified Punjab Seed Corp ka hai.',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      read: true
    },
    {
      id: 'msg-seed-2',
      conversationId: conversationId,
      senderId: 'buyer-demo',
      senderName: 'Interested Buyer',
      receiverId: 'user-demo-1',
      text: 'Walaikum Assalam. Agar hum 50 bags lein tou kya rate mein kuch riayat mil sakti hai?',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      read: true
    }
  ]);
  return all.filter(m => m.conversationId === conversationId);
}

export async function sendMessage(msg: ChatMessage): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'messages', msg.id), msg);
    } catch (e) {
      console.warn('Firestore send message error:', e);
    }
  }
  const all = getLocal<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
  all.push(msg);
  setLocal(STORAGE_KEYS.MESSAGES, all);
}

export function subscribeToMessages(conversationId: string, callback: (msgs: ChatMessage[]) => void): () => void {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'messages'), where('conversationId', '==', conversationId), orderBy('timestamp', 'asc'));
      return onSnapshot(q, (snap) => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
        callback(msgs);
      });
    } catch (e) {
      console.warn('Firestore message listener error:', e);
    }
  }

  const handleUpdate = () => {
    const all = getLocal<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
    callback(all.filter(m => m.conversationId === conversationId));
  };
  window.addEventListener('kissan_storage_update_' + STORAGE_KEYS.MESSAGES, handleUpdate);
  handleUpdate();
  return () => {
    window.removeEventListener('kissan_storage_update_' + STORAGE_KEYS.MESSAGES, handleUpdate);
  };
}

// ----------------- REPORT LISTING -----------------
export async function reportListing(report: ReportedListing): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'reportedListings', report.id), report);
    } catch (e) {
      console.warn('Firestore report error:', e);
    }
  }
  const all = getLocal<ReportedListing[]>(STORAGE_KEYS.REPORTS, []);
  all.unshift(report);
  setLocal(STORAGE_KEYS.REPORTS, all);
}

export async function getReportedListings(): Promise<ReportedListing[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDocs(collection(db, 'reportedListings'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ReportedListing));
    } catch (e) {
      console.warn('Firestore get reports error:', e);
    }
  }
  return getLocal<ReportedListing[]>(STORAGE_KEYS.REPORTS, []);
}

export async function updateReportStatus(reportId: string, status: 'pending' | 'reviewed' | 'dismissed'): Promise<void> {
  const all = getLocal<ReportedListing[]>(STORAGE_KEYS.REPORTS, []);
  const idx = all.findIndex(r => r.id === reportId);
  if (idx >= 0) {
    all[idx].status = status;
    setLocal(STORAGE_KEYS.REPORTS, all);
  }
}
