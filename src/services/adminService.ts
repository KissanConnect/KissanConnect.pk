import { 
  UserProfile, 
  Listing, 
  WholesalerReview, 
  FertilizerPrice, 
  Tractor, 
  ReportedListing, 
  ReportedReview,
  AdminLog 
} from '../types';
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
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { cleanData } from './dataService';

const ADMIN_LOGS_KEY = 'kissan_admin_logs';

function getLocalLogs(): AdminLog[] {
  try {
    const raw = localStorage.getItem(ADMIN_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLog(log: AdminLog): void {
  try {
    const existing = getLocalLogs();
    existing.unshift(log);
    localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch (e) {
    console.error('Failed to save local admin log:', e);
  }
}

/**
 * Log an administrative action to Firestore `adminLogs` collection and local storage
 */
export async function logAdminAction(
  adminUser: { uid: string; fullName?: string; email?: string },
  action: string,
  targetType: AdminLog['targetType'],
  targetId: string,
  details?: string,
  reason?: string
): Promise<void> {
  const logEntry: AdminLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    adminUid: adminUser.uid,
    adminName: adminUser.fullName || 'Admin',
    adminEmail: adminUser.email || '',
    action,
    targetType,
    targetId,
    details: details || '',
    reason: reason || '',
    timestamp: new Date().toISOString()
  };

  saveLocalLog(logEntry);

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'adminLogs', logEntry.id), cleanData(logEntry));
    } catch (err) {
      console.warn('Failed to write admin log to Firestore (continuing):', err);
    }
  }
}

/**
 * Get recent admin logs
 */
export async function getAdminLogs(): Promise<AdminLog[]> {
  const local = getLocalLogs();
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'), limit(100));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const remoteLogs: AdminLog[] = [];
        snap.forEach((d) => remoteLogs.push({ id: d.id, ...d.data() } as AdminLog));
        return remoteLogs;
      }
    } catch (e) {
      console.warn('Failed to fetch admin logs from Firestore:', e);
    }
  }
  return local;
}

/**
 * Fetch all users for admin review (Firestore + local simulation)
 */
export async function getAllUsersAdmin(): Promise<UserProfile[]> {
  const userMap = new Map<string, UserProfile>();

  // Check local users
  try {
    const localRegistered = localStorage.getItem('kissan_registered_users');
    if (localRegistered) {
      const list: UserProfile[] = JSON.parse(localRegistered);
      list.forEach((u) => userMap.set(u.uid, u));
    }
    const current = localStorage.getItem('kissan_current_user');
    if (current) {
      const u: UserProfile = JSON.parse(current);
      userMap.set(u.uid, u);
    }
  } catch {}

  // Fetch Firestore users
  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDocs(collection(db, 'users'));
      snap.forEach((d) => {
        const u = { uid: d.id, ...d.data() } as UserProfile;
        userMap.set(u.uid, u);
      });
    } catch (err) {
      console.warn('Failed to fetch users from Firestore:', err);
    }
  }

  return Array.from(userMap.values());
}

/**
 * Suspend user account
 */
export async function suspendUserAdmin(
  userId: string,
  reason: string,
  adminUser: UserProfile
): Promise<void> {
  const now = new Date().toISOString();
  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        suspended: true,
        suspendedReason: reason,
        suspendedAt: now
      });
    } catch (err) {
      console.warn('Failed to suspend user in Firestore:', err);
    }
  }

  // Update local storage
  try {
    const raw = localStorage.getItem('kissan_registered_users');
    if (raw) {
      const list: UserProfile[] = JSON.parse(raw);
      const updated = list.map((u) =>
        u.uid === userId ? { ...u, suspended: true, suspendedReason: reason, suspendedAt: now } : u
      );
      localStorage.setItem('kissan_registered_users', JSON.stringify(updated));
    }
    const cur = localStorage.getItem('kissan_current_user');
    if (cur) {
      const u: UserProfile = JSON.parse(cur);
      if (u.uid === userId) {
        localStorage.setItem(
          'kissan_current_user',
          JSON.stringify({ ...u, suspended: true, suspendedReason: reason, suspendedAt: now })
        );
      }
    }
  } catch {}

  await logAdminAction(adminUser, 'suspend_user', 'user', userId, `Suspended user ${userId}`, reason);
}

/**
 * Unsuspend user account
 */
export async function unsuspendUserAdmin(
  userId: string,
  adminUser: UserProfile
): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        suspended: false,
        suspendedReason: '',
        suspendedAt: ''
      });
    } catch (err) {
      console.warn('Failed to unsuspend user in Firestore:', err);
    }
  }

  try {
    const raw = localStorage.getItem('kissan_registered_users');
    if (raw) {
      const list: UserProfile[] = JSON.parse(raw);
      const updated = list.map((u) =>
        u.uid === userId ? { ...u, suspended: false, suspendedReason: undefined, suspendedAt: undefined } : u
      );
      localStorage.setItem('kissan_registered_users', JSON.stringify(updated));
    }
  } catch {}

  await logAdminAction(adminUser, 'unsuspend_user', 'user', userId, `Unsuspended user ${userId}`);
}

/**
 * Fetch all listings for admin panel (including hidden & removed)
 */
export async function getAllListingsAdmin(): Promise<Listing[]> {
  const map = new Map<string, Listing>();

  // Local storage
  try {
    const raw = localStorage.getItem('kissan_listings');
    if (raw) {
      const items: Listing[] = JSON.parse(raw);
      items.forEach((l) => map.set(l.id, l));
    }
  } catch {}

  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDocs(collection(db, 'listings'));
      snap.forEach((d) => {
        map.set(d.id, { id: d.id, ...d.data() } as Listing);
      });
    } catch (e) {
      console.warn('Failed to fetch listings from Firestore:', e);
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Toggle hide listing
 */
export async function hideListingAdmin(
  listingId: string,
  hidden: boolean,
  adminUser: UserProfile
): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, 'listings', listingId), { hidden });
    } catch (err) {
      console.warn('Failed to update listing hidden status in Firestore:', err);
    }
  }

  try {
    const raw = localStorage.getItem('kissan_listings');
    if (raw) {
      const list: Listing[] = JSON.parse(raw);
      const updated = list.map((l) => (l.id === listingId ? { ...l, hidden } : l));
      localStorage.setItem('kissan_listings', JSON.stringify(updated));
      window.dispatchEvent(new Event('kissan_storage_update_kissan_listings'));
    }
  } catch {}

  await logAdminAction(
    adminUser,
    hidden ? 'hide_listing' : 'unhide_listing',
    'listing',
    listingId,
    `Listing ${listingId} set to hidden=${hidden}`
  );
}

/**
 * Mark listing as removed by admin with a reason
 */
export async function removeListingByAdmin(
  listingId: string,
  reason: string,
  adminUser: UserProfile
): Promise<void> {
  const updates = {
    isRemovedByAdmin: true,
    hidden: true,
    adminRemovalReason: reason
  };

  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, 'listings', listingId), updates);
    } catch (err) {
      console.warn('Failed to mark listing as removed in Firestore:', err);
    }
  }

  try {
    const raw = localStorage.getItem('kissan_listings');
    if (raw) {
      const list: Listing[] = JSON.parse(raw);
      const updated = list.map((l) => (l.id === listingId ? { ...l, ...updates } : l));
      localStorage.setItem('kissan_listings', JSON.stringify(updated));
      window.dispatchEvent(new Event('kissan_storage_update_kissan_listings'));
    }
  } catch {}

  await logAdminAction(
    adminUser,
    'remove_listing_with_reason',
    'listing',
    listingId,
    `Listing marked as removed by admin`,
    reason
  );
}

/**
 * Delete listing permanently by admin
 */
export async function deleteListingAdmin(
  listingId: string,
  adminUser: UserProfile
): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'listings', listingId));
    } catch (err) {
      console.warn('Failed to delete listing from Firestore:', err);
    }
  }

  try {
    const raw = localStorage.getItem('kissan_listings');
    if (raw) {
      const list: Listing[] = JSON.parse(raw);
      const updated = list.filter((l) => l.id !== listingId);
      localStorage.setItem('kissan_listings', JSON.stringify(updated));
      window.dispatchEvent(new Event('kissan_storage_update_kissan_listings'));
    }
  } catch {}

  await logAdminAction(adminUser, 'delete_listing', 'listing', listingId, `Deleted listing permanently`);
}

/**
 * Get all reviews for admin
 */
export async function getAllReviewsAdmin(): Promise<WholesalerReview[]> {
  const map = new Map<string, WholesalerReview>();

  try {
    const raw = localStorage.getItem('kissan_wholesaler_reviews');
    if (raw) {
      const list: WholesalerReview[] = JSON.parse(raw);
      list.forEach((r) => map.set(r.id, r));
    }
  } catch {}

  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDocs(collection(db, 'reviews'));
      snap.forEach((d) => {
        map.set(d.id, { id: d.id, ...d.data() } as WholesalerReview);
      });
    } catch (e) {
      console.warn('Failed to fetch reviews from Firestore:', e);
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Toggle hide review
 */
export async function hideReviewAdmin(
  reviewId: string,
  hidden: boolean,
  adminUser: UserProfile
): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), { hidden });
    } catch (err) {
      console.warn('Failed to hide review in Firestore:', err);
    }
  }

  try {
    const raw = localStorage.getItem('kissan_wholesaler_reviews');
    if (raw) {
      const list: WholesalerReview[] = JSON.parse(raw);
      const updated = list.map((r) => (r.id === reviewId ? { ...r, hidden } : r));
      localStorage.setItem('kissan_wholesaler_reviews', JSON.stringify(updated));
    }
  } catch {}

  await logAdminAction(
    adminUser,
    hidden ? 'hide_review' : 'unhide_review',
    'review',
    reviewId,
    `Review ${reviewId} set to hidden=${hidden}`
  );
}

/**
 * Delete review by admin
 */
export async function deleteReviewAdmin(
  reviewId: string,
  adminUser: UserProfile
): Promise<void> {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (err) {
      console.warn('Failed to delete review in Firestore:', err);
    }
  }

  try {
    const raw = localStorage.getItem('kissan_wholesaler_reviews');
    if (raw) {
      const list: WholesalerReview[] = JSON.parse(raw);
      const updated = list.filter((r) => r.id !== reviewId);
      localStorage.setItem('kissan_wholesaler_reviews', JSON.stringify(updated));
    }
  } catch {}

  await logAdminAction(adminUser, 'delete_review', 'review', reviewId, `Deleted review ${reviewId}`);
}

/**
 * Clear or dismiss a reported item
 */
export async function clearReportAdmin(
  reportId: string,
  type: 'listing' | 'review',
  status: 'reviewed' | 'dismissed',
  adminUser: UserProfile
): Promise<void> {
  const colName = type === 'listing' ? 'reportedListings' : 'reportedReviews';
  const localKey = type === 'listing' ? 'kissan_reported_listings' : 'kissan_reported_reviews';

  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, colName, reportId), { status });
    } catch (err) {
      console.warn(`Failed to update ${colName} in Firestore:`, err);
    }
  }

  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      const list: any[] = JSON.parse(raw);
      const updated = list.map((r) => (r.id === reportId ? { ...r, status } : r));
      localStorage.setItem(localKey, JSON.stringify(updated));
    }
  } catch {}

  await logAdminAction(
    adminUser,
    'clear_report',
    'report',
    reportId,
    `Report ${reportId} marked as ${status}`
  );
}
