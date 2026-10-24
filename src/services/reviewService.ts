import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebaseConfig';
import { WholesalerReview, ReportedReview, ReviewRatings } from '../types';
import { cleanData } from './dataService';
import { dbStatus } from './dbStatus';

const REVIEWS_STORAGE_KEY = 'kissan_wholesaler_reviews';
const REPORTED_REVIEWS_KEY = 'kissan_reported_reviews';
const CONTACTS_KEY_PREFIX = 'kissan_wholesaler_contacts_';

// Seed sample reviews so wholesale buyers have credible social proof
const INITIAL_REVIEWS: WholesalerReview[] = [
  {
    id: 'rev-seed-1',
    wholesalerUid: 'demo-wholesaler-multan',
    wholesalerName: 'Tariq Grain & Fertilizer Traders (Shop #14, Grain Market)',
    farmerUid: 'farmer-ali-1',
    farmerName: 'Chaudhry Bashir Ahmed',
    farmerCity: 'Khanewal',
    ratings: {
      honesty: 5,
      paymentSpeed: 5,
      behavior: 5,
      overall: 5.0
    },
    comment: 'ماشاءاللہ بہت ایماندار تاجر ہیں۔ 400 من گندم کی ڈلیوری کے فوری بعد بنک ٹرانسفر کے ذریعے مکمل رقم ادا کی۔ تول بالکل درست تھا بغیر کسی ناجائز کٹوتی کے۔',
    dealType: 'wheat',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    wholesalerReply: {
      text: 'شکریہ چوہدری صاحب! آپ کا مال ہمیشہ معیاری ہوتا ہے، اللہ آپ کے رزق میں برکت دے۔',
      repliedAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  },
  {
    id: 'rev-seed-2',
    wholesalerUid: 'demo-wholesaler-multan',
    wholesalerName: 'Tariq Grain & Fertilizer Traders (Shop #14, Grain Market)',
    farmerUid: 'farmer-imran-2',
    farmerName: 'Malik Imran Raza',
    farmerCity: 'Multan',
    ratings: {
      honesty: 5,
      paymentSpeed: 4,
      behavior: 5,
      overall: 4.7
    },
    comment: 'Fair rate given according to current mandi rate. Fast weighing at the gate. Very polite staff and honest business dealing.',
    dealType: 'fertilizer',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    id: 'rev-seed-3',
    wholesalerUid: 'demo-wholesaler-multan',
    wholesalerName: 'Tariq Grain & Fertilizer Traders (Shop #14, Grain Market)',
    farmerUid: 'farmer-sajjad-3',
    farmerName: 'Sardar Sajjad Khan',
    farmerCity: 'Lodhran',
    ratings: {
      honesty: 4,
      paymentSpeed: 5,
      behavior: 4,
      overall: 4.3
    },
    comment: 'Super Kernel Basmati deal completed smoothly. Cash received on spot. Highly recommended buyer in Multan grain market.',
    dealType: 'rice',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
  }
];

function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw) as T;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new Event('kissan_storage_update_' + key));
  } catch (err) {
    console.error('Error saving local reviews:', err);
  }
}

// Track farmer interactions (Call, WhatsApp, Chat, or Completed Deal)
export function recordWholesalerContact(farmerUid: string, wholesalerUid: string): void {
  if (!farmerUid || !wholesalerUid) return;
  const key = CONTACTS_KEY_PREFIX + farmerUid;
  const current = getLocal<string[]>(key, []);
  if (!current.includes(wholesalerUid)) {
    current.push(wholesalerUid);
    setLocal(key, current);
  }
}

export function hasFarmerContactedWholesaler(farmerUid: string, wholesalerUid: string): boolean {
  if (!farmerUid || !wholesalerUid) return false;
  const key = CONTACTS_KEY_PREFIX + farmerUid;
  const list = getLocal<string[]>(key, []);
  return list.includes(wholesalerUid);
}

// Fetch all reviews for a wholesaler
export async function getWholesalerReviews(wholesalerUid: string): Promise<WholesalerReview[]> {
  const localList = getLocal<WholesalerReview[]>(REVIEWS_STORAGE_KEY, INITIAL_REVIEWS);
  const matchingLocal = localList.filter((r) => r.wholesalerUid === wholesalerUid && !r.hidden);

  if (isFirebaseConfigured() && db) {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('wholesalerUid', '==', wholesalerUid)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const firestoreList: WholesalerReview[] = [];
        snap.forEach((d) => {
          const item = { id: d.id, ...d.data() } as WholesalerReview;
          if (!item.hidden) {
            firestoreList.push(item);
          }
        });
        // Sort newest first
        firestoreList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return firestoreList;
      }
    } catch (e: any) {
      console.warn('Firestore reviews fetch error:', e);
      dbStatus.reportFailure(e);
    }
  }

  return matchingLocal.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Subscribe to live reviews
export function subscribeWholesalerReviews(
  wholesalerUid: string,
  callback: (reviews: WholesalerReview[]) => void
): () => void {
  const localList = getLocal<WholesalerReview[]>(REVIEWS_STORAGE_KEY, INITIAL_REVIEWS);
  const fallback = localList.filter((r) => r.wholesalerUid === wholesalerUid && !r.hidden)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isFirebaseConfigured() && db) {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('wholesalerUid', '==', wholesalerUid)
      );
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          dbStatus.reportSuccess();
          if (!snap.empty) {
            const list: WholesalerReview[] = [];
            snap.forEach((d) => {
              const item = { id: d.id, ...d.data() } as WholesalerReview;
              if (!item.hidden) {
                list.push(item);
              }
            });
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            callback(list);
          } else {
            callback(fallback);
          }
        },
        (error) => {
          console.warn('Reviews snapshot error:', error);
          dbStatus.reportFailure(error);
          callback(fallback);
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn('Firestore review subscription failed:', e);
    }
  }

  callback(fallback);
  const handleUpdate = () => {
    const fresh = getLocal<WholesalerReview[]>(REVIEWS_STORAGE_KEY, INITIAL_REVIEWS);
    callback(fresh.filter((r) => r.wholesalerUid === wholesalerUid && !r.hidden));
  };
  window.addEventListener('kissan_storage_update_' + REVIEWS_STORAGE_KEY, handleUpdate);
  return () => {
    window.removeEventListener('kissan_storage_update_' + REVIEWS_STORAGE_KEY, handleUpdate);
  };
}

// Save or Update review
export async function saveWholesalerReview(
  review: Omit<WholesalerReview, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<string> {
  const overall = Number(
    ((review.ratings.honesty + review.ratings.paymentSpeed + review.ratings.behavior) / 3).toFixed(1)
  );

  const fullData: WholesalerReview = {
    ...review,
    id: review.id || 'rev_' + Date.now(),
    ratings: {
      ...review.ratings,
      overall
    },
    createdAt: review.createdAt || new Date().toISOString()
  };

  const cleaned = cleanData(fullData);

  if (isFirebaseConfigured() && db) {
    try {
      if (review.id && !review.id.startsWith('rev_local_') && !review.id.startsWith('rev-seed')) {
        const docRef = doc(db, 'reviews', review.id);
        await setDoc(docRef, {
          ...cleaned,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        const colRef = collection(db, 'reviews');
        const docRef = await addDoc(colRef, {
          ...cleaned,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        fullData.id = docRef.id;
      }
      dbStatus.reportSuccess();
    } catch (e: any) {
      console.error('Firestore saveWholesalerReview error:', e);
      dbStatus.reportFailure(e);
      throw e;
    }
  }

  // Update local storage
  const current = getLocal<WholesalerReview[]>(REVIEWS_STORAGE_KEY, INITIAL_REVIEWS);
  const existingIdx = current.findIndex(
    (r) => r.id === fullData.id || (r.farmerUid === fullData.farmerUid && r.wholesalerUid === fullData.wholesalerUid)
  );
  if (existingIdx >= 0) {
    current[existingIdx] = fullData;
  } else {
    current.unshift(fullData);
  }
  setLocal(REVIEWS_STORAGE_KEY, current);

  return fullData.id;
}

// Wholesaler public reply
export async function replyToWholesalerReview(
  reviewId: string,
  wholesalerUid: string,
  replyText: string
): Promise<void> {
  const reply = {
    text: replyText.trim(),
    repliedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'reviews', reviewId);
      await updateDoc(docRef, {
        wholesalerReply: reply,
        updatedAt: serverTimestamp()
      });
      dbStatus.reportSuccess();
    } catch (e: any) {
      console.warn('Firestore replyToWholesalerReview error:', e);
      dbStatus.reportFailure(e);
    }
  }

  const current = getLocal<WholesalerReview[]>(REVIEWS_STORAGE_KEY, INITIAL_REVIEWS);
  const idx = current.findIndex((r) => r.id === reviewId);
  if (idx >= 0) {
    current[idx].wholesalerReply = reply;
    setLocal(REVIEWS_STORAGE_KEY, current);
  }
}

// Report Review for abuse
export async function reportWholesalerReview(
  reportData: Omit<ReportedReview, 'id' | 'timestamp' | 'status'>
): Promise<string> {
  const report: ReportedReview = {
    ...reportData,
    id: 'rep_rev_' + Date.now(),
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'reportedReviews');
      await addDoc(colRef, {
        ...cleanData(report),
        createdAt: serverTimestamp()
      });
      dbStatus.reportSuccess();
    } catch (e: any) {
      console.warn('Firestore reportWholesalerReview error:', e);
      dbStatus.reportFailure(e);
    }
  }

  const current = getLocal<ReportedReview[]>(REPORTED_REVIEWS_KEY, []);
  current.unshift(report);
  setLocal(REPORTED_REVIEWS_KEY, current);
  return report.id;
}

export async function getReportedReviews(): Promise<ReportedReview[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'reportedReviews');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReportedReview));
      }
    } catch (e: any) {
      console.warn('Firestore getReportedReviews error:', e);
    }
  }
  return getLocal<ReportedReview[]>(REPORTED_REVIEWS_KEY, [
    {
      id: 'rep-seed-1',
      reviewId: 'rev-fake-sample',
      wholesalerUid: 'demo-wholesaler-multan',
      farmerUid: 'anonymous',
      farmerName: 'Anonymous User',
      reviewComment: 'Unfair low price complaint without verifying grade.',
      reportedBy: 'Tariq Grain Traders',
      reason: 'False information / Competitor attack',
      details: 'This person never did any business with us.',
      timestamp: new Date().toISOString(),
      status: 'pending'
    }
  ]);
}

export async function updateReportedReviewStatus(
  reportId: string,
  status: 'pending' | 'reviewed' | 'dismissed'
): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'reportedReviews', reportId);
      await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
    } catch (e) {
      console.warn('Update reported review status error:', e);
    }
  }
  const current = getLocal<ReportedReview[]>(REPORTED_REVIEWS_KEY, []);
  const idx = current.findIndex((r) => r.id === reportId);
  if (idx >= 0) {
    current[idx].status = status;
    setLocal(REPORTED_REVIEWS_KEY, current);
  }
}

export async function deleteReviewByAdmin(reviewId: string): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (e) {
      console.warn('Delete review error:', e);
    }
  }
  const current = getLocal<WholesalerReview[]>(REVIEWS_STORAGE_KEY, INITIAL_REVIEWS);
  setLocal(REVIEWS_STORAGE_KEY, current.filter((r) => r.id !== reviewId));
}

// Compute ratings statistics & badges
export interface WholesalerStats {
  averageRating: number;
  reviewCount: number;
  categoryAverages: {
    honesty: number;
    paymentSpeed: number;
    behavior: number;
  };
  starBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  badge: 'trusted' | 'new' | 'none';
}

export function computeWholesalerStats(reviews: WholesalerReview[]): WholesalerStats {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      reviewCount: 0,
      categoryAverages: { honesty: 0, paymentSpeed: 0, behavior: 0 },
      starBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      badge: 'new'
    };
  }

  let totalHonesty = 0;
  let totalPayment = 0;
  let totalBehavior = 0;
  let totalOverall = 0;

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  for (const r of reviews) {
    totalHonesty += Number(r.ratings.honesty) || 0;
    totalPayment += Number(r.ratings.paymentSpeed) || 0;
    totalBehavior += Number(r.ratings.behavior) || 0;
    const roundedOverall = Math.round(Number(r.ratings.overall) || 0);
    const starBucket = Math.max(1, Math.min(5, roundedOverall)) as 1 | 2 | 3 | 4 | 5;
    breakdown[starBucket] = (breakdown[starBucket] || 0) + 1;
    totalOverall += Number(r.ratings.overall) || 0;
  }

  const count = reviews.length;
  const avg = Number((totalOverall / count).toFixed(1));
  const avgHonesty = Number((totalHonesty / count).toFixed(1));
  const avgPayment = Number((totalPayment / count).toFixed(1));
  const avgBehavior = Number((totalBehavior / count).toFixed(1));

  let badge: 'trusted' | 'new' | 'none' = 'none';
  if (count >= 10 && avg >= 4.5) {
    badge = 'trusted';
  } else if (count < 3) {
    badge = 'new';
  }

  return {
    averageRating: avg,
    reviewCount: count,
    categoryAverages: {
      honesty: avgHonesty,
      paymentSpeed: avgPayment,
      behavior: avgBehavior
    },
    starBreakdown: breakdown,
    badge
  };
}
