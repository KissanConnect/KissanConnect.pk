import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { auth, db, isFirebaseConfigured } from '../firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { cleanData } from '../services/dataService';

export interface PendingGoogleUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  errorCode?: string;
  isProfileSaveFailure?: boolean;
  needsProfile?: boolean;
  pendingGoogleUser?: PendingGoogleUser;
}

export interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  signUp: (data: {
    fullName: string;
    email: string;
    pass: string;
    phone: string;
    role: UserRole;
    province: string;
    city: string;
    businessName?: string;
  }) => Promise<AuthResponse>;
  loginWithGoogle: (defaultRole?: UserRole) => Promise<AuthResponse>;
  saveGoogleProfile: (data: {
    uid: string;
    email: string;
    fullName: string;
    phone: string;
    role: UserRole;
    province: string;
    city: string;
    photoURL?: string;
    businessName?: string;
  }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  demoLogin: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'kissan_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(LOCAL_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isFirebaseConfigured() && auth && db) {
      const activeDb = db;
      // Handle redirect result if user was redirected for Google login
      getRedirectResult(auth)
        .then(async (result) => {
          if (result && result.user) {
            let userDoc = null;
            try {
              userDoc = await getDoc(doc(activeDb, 'users', result.user.uid));
            } catch (err) {
              console.warn('Redirect getDoc failed (offline):', err);
            }
            if (!userDoc || !userDoc.exists()) {
              const newProf: UserProfile = {
                uid: result.user.uid,
                fullName: result.user.displayName || 'Google Farmer',
                email: result.user.email || '',
                phone: result.user.phoneNumber || '+923001234567',
                role: 'farmer',
                province: 'Punjab',
                city: 'Multan',
                photoURL: result.user.photoURL || undefined,
                createdAt: new Date().toISOString()
              };
              try {
                await setDoc(doc(activeDb, 'users', result.user.uid), newProf, { merge: true });
              } catch (setErr) {
                console.warn('Redirect setDoc failed:', setErr);
              }
              setCurrentUser(newProf);
              localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newProf));
            }
          }
        })
        .catch((err) => {
          console.warn('Redirect sign-in error:', err);
        });

      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          try {
            let profile: UserProfile | null = null;
            // Wrap getDoc in try/catch and continue instead of failing if offline
            try {
              const userDoc = await getDoc(doc(activeDb, 'users', fbUser.uid));
              if (userDoc && userDoc.exists()) {
                profile = userDoc.data() as UserProfile;
              }
            } catch (docErr) {
              console.warn('getDoc failed in onAuthStateChanged (continuing):', docErr);
            }

            if (profile) {
              setCurrentUser(profile);
              localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
            } else {
              // Check local storage for saved profile
              const saved = localStorage.getItem(LOCAL_USER_KEY);
              let localProfile: UserProfile | null = null;
              if (saved) {
                try {
                  const p = JSON.parse(saved);
                  if (p && p.uid === fbUser.uid) {
                    localProfile = p;
                  }
                } catch {}
              }

              if (localProfile) {
                setCurrentUser(localProfile);
              } else {
                // New user without a profile: do NOT let them in without completing their profile!
                setCurrentUser(null);
                localStorage.removeItem(LOCAL_USER_KEY);
              }
            }
          } catch (e) {
            console.error('Error in onAuthStateChanged handler:', e);
          }
        } else {
          // If logged out from Firebase, check if local storage had demo user, otherwise null
          const saved = localStorage.getItem(LOCAL_USER_KEY);
          if (saved) {
            try {
              const u = JSON.parse(saved);
              if (u.uid && !u.uid.startsWith('demo-')) {
                setCurrentUser(null);
                localStorage.removeItem(LOCAL_USER_KEY);
              }
            } catch {
              setCurrentUser(null);
            }
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local mode
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<AuthResponse> => {
    if (isFirebaseConfigured() && auth && db) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        let profile: UserProfile | null = null;
        try {
          const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
          if (userDoc && userDoc.exists()) {
            profile = userDoc.data() as UserProfile;
          }
        } catch (fetchErr) {
          console.warn('getDoc in login failed (offline/unavailable):', fetchErr);
        }

        if (!profile) {
          const saved = localStorage.getItem(LOCAL_USER_KEY);
          if (saved) {
            try {
              const p = JSON.parse(saved);
              if (p && p.uid === cred.user.uid) profile = p;
            } catch {}
          }
        }

        if (!profile) {
          profile = {
            uid: cred.user.uid,
            fullName: cred.user.displayName || email.split('@')[0],
            email: cred.user.email || email,
            phone: cred.user.phoneNumber || '+923001234567',
            role: 'farmer',
            province: 'Punjab',
            city: 'Multan',
            createdAt: new Date().toISOString()
          };
          try {
            await setDoc(doc(db, 'users', cred.user.uid), profile, { merge: true });
          } catch (e) {
            console.warn('Fallback profile save skipped in login:', e);
          }
        }

        setCurrentUser(profile);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
        return { success: true };
      } catch (err: any) {
        return { 
          success: false, 
          errorCode: err?.code,
          error: err.message || 'Login failed. Please check credentials.' 
        };
      }
    }

    // Local simulation login
    const usersStr = localStorage.getItem('kissan_registered_users');
    const registered: any[] = usersStr ? JSON.parse(usersStr) : [];
    const found = registered.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (found) {
      if (found.password && found.password !== pass) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
      const profile: UserProfile = {
        uid: found.uid,
        fullName: found.fullName,
        email: found.email,
        phone: found.phone || '+923001234567',
        role: found.role || 'farmer',
        province: found.province || 'Punjab',
        city: found.city || 'Multan',
        businessName: found.businessName,
        createdAt: found.createdAt || new Date().toISOString()
      };
      setCurrentUser(profile);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
      return { success: true };
    }

    // Default simulated user if not registered yet
    const fallbackProfile: UserProfile = {
      uid: 'user-' + Date.now(),
      fullName: email.split('@')[0],
      email: email,
      phone: '+923001234567',
      role: 'farmer',
      province: 'Punjab',
      city: 'Multan',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(fallbackProfile);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fallbackProfile));
    return { success: true };
  };

  const signUp = async (data: {
    fullName: string;
    email: string;
    pass: string;
    phone: string;
    role: UserRole;
    province: string;
    city: string;
    businessName?: string;
  }): Promise<AuthResponse> => {
    if (isFirebaseConfigured() && auth && db) {
      let createdUser: FirebaseUser | null = null;
      try {
        const cred = await createUserWithEmailAndPassword(auth, data.email, data.pass);
        createdUser = cred.user;

        const profile: UserProfile = {
          uid: cred.user.uid,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          role: data.role,
          province: data.province,
          city: data.city,
          businessName: data.businessName,
          createdAt: new Date().toISOString()
        };

        // Use setDoc to create the user profile directly without calling getDoc first
        await setDoc(doc(db, 'users', cred.user.uid), profile);

        setCurrentUser(profile);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
        return { success: true };
      } catch (err: any) {
        // If email is already in use, check if the credentials match to sign in and complete profile sync
        if (err?.code === 'auth/email-already-in-use') {
          try {
            const existingCred = await signInWithEmailAndPassword(auth, data.email, data.pass);
            if (existingCred.user) {
              const profile: UserProfile = {
                uid: existingCred.user.uid,
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                role: data.role,
                province: data.province,
                city: data.city,
                businessName: data.businessName,
                createdAt: new Date().toISOString()
              };
              try {
                await setDoc(doc(db, 'users', existingCred.user.uid), profile, { merge: true });
              } catch (mergeErr) {
                console.warn('Profile sync on existing user skipped/offline:', mergeErr);
              }
              setCurrentUser(profile);
              localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
              return { success: true };
            }
          } catch (signInErr) {
            console.warn('Account exists with different password or requires manual sign-in:', data.email);
            return {
              success: false,
              errorCode: 'auth/email-already-in-use',
              error: 'This email is already registered. Please sign in instead.'
            };
          }
        }

        // If user was created in Auth but saving profile to Firestore failed:
        if (createdUser) {
          // Delete incomplete account so user can retry cleanly without getting auth/email-already-in-use
          try {
            await createdUser.delete();
          } catch (delErr) {
            console.warn('Could not roll back incomplete auth user:', delErr);
            try {
              await fbSignOut(auth);
            } catch {}
          }
          return {
            success: false,
            isProfileSaveFailure: true,
            errorCode: 'profile-save-failed',
            error: err?.message || 'Failed to save profile to database.'
          };
        }

        console.warn('Registration failed:', err?.code, err?.message);
        return { 
          success: false, 
          errorCode: err?.code,
          error: err.message || 'Registration failed.' 
        };
      }
    }

    // Local simulation sign-up
    const usersStr = localStorage.getItem('kissan_registered_users');
    const registered: any[] = usersStr ? JSON.parse(usersStr) : [];
    if (registered.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'Email already registered. Please sign in.' };
    }

    const newUid = 'usr_' + Date.now();
    const newProfile: UserProfile = {
      uid: newUid,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      province: data.province,
      city: data.city,
      businessName: data.businessName,
      createdAt: new Date().toISOString()
    };
    registered.push({ ...newProfile, password: data.pass });
    localStorage.setItem('kissan_registered_users', JSON.stringify(registered));
    setCurrentUser(newProfile);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newProfile));
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<AuthResponse> => {
    if (isFirebaseConfigured() && auth && db) {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        let cred;
        try {
          cred = await signInWithPopup(auth, provider);
        } catch (popupErr: any) {
          if (popupErr?.code === 'auth/popup-blocked') {
            console.warn('Popup blocked, attempting redirect sign-in...');
            await signInWithRedirect(auth, provider);
            return { success: true };
          }
          if (popupErr?.code === 'auth/popup-closed-by-user' || popupErr?.code === 'auth/cancelled-popup-request') {
            return {
              success: false,
              errorCode: popupErr.code,
              error: 'Sign-in window was closed. Please try again or use email sign-in.'
            };
          }
          throw popupErr;
        }

        let existingProfile: UserProfile | null = null;
        try {
          const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
          if (userDoc && userDoc.exists()) {
            existingProfile = userDoc.data() as UserProfile;
          }
        } catch (docErr) {
          console.warn('Google sign-in getDoc failed (offline/continuing):', docErr);
        }

        if (!existingProfile) {
          const saved = localStorage.getItem(LOCAL_USER_KEY);
          if (saved) {
            try {
              const p = JSON.parse(saved);
              if (p && p.uid === cred.user.uid) existingProfile = p;
            } catch {}
          }
        }

        if (existingProfile) {
          setCurrentUser(existingProfile);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(existingProfile));
          return { success: true, needsProfile: false };
        } else {
          // If someone signs in with Google and has no profile yet, do not let them into the site without one!
          return {
            success: true,
            needsProfile: true,
            pendingGoogleUser: {
              uid: cred.user.uid,
              email: cred.user.email || '',
              displayName: cred.user.displayName || 'Google User',
              photoURL: cred.user.photoURL || undefined
            }
          };
        }
      } catch (err: any) {
        console.error('Firebase Google sign-in error:', err);
        return { 
          success: false, 
          errorCode: err?.code,
          error: err?.message || 'Google Sign-in failed.' 
        };
      }
    }

    // Local simulation Google login
    const usersStr = localStorage.getItem('kissan_registered_users');
    const registered: any[] = usersStr ? JSON.parse(usersStr) : [];
    const found = registered.find(u => u.isGoogleUser || u.email.toLowerCase().includes('google'));

    if (found) {
      setCurrentUser(found);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(found));
      return { success: true, needsProfile: false };
    }

    // New Google user in simulated mode: needs profile completion
    return {
      success: true,
      needsProfile: true,
      pendingGoogleUser: {
        uid: 'google-sim-' + Date.now(),
        email: 'user.google@gmail.com',
        displayName: 'Google Demo User',
        photoURL: undefined
      }
    };
  };

  const saveGoogleProfile = async (data: {
    uid: string;
    email: string;
    fullName: string;
    phone: string;
    role: UserRole;
    province: string;
    city: string;
    photoURL?: string;
    businessName?: string;
  }): Promise<AuthResponse> => {
    const profile: UserProfile = {
      uid: data.uid,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      province: data.province,
      city: data.city,
      photoURL: data.photoURL,
      businessName: data.role === 'wholesaler' ? data.businessName : undefined,
      createdAt: new Date().toISOString()
    };

    const cleaned = cleanData(profile) as UserProfile;

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'users', data.uid), cleaned, { merge: true });
      } catch (err: any) {
        console.warn('Failed to save Google profile to Firestore:', err);
      }
    }

    const usersStr = localStorage.getItem('kissan_registered_users');
    const registered: any[] = usersStr ? JSON.parse(usersStr) : [];
    const existingIdx = registered.findIndex(u => u.uid === data.uid || u.email.toLowerCase() === data.email.toLowerCase());
    if (existingIdx >= 0) {
      registered[existingIdx] = { ...registered[existingIdx], ...cleaned, isGoogleUser: true };
    } else {
      registered.push({ ...cleaned, isGoogleUser: true });
    }
    localStorage.setItem('kissan_registered_users', JSON.stringify(registered));

    setCurrentUser(cleaned);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(cleaned));
    return { success: true };
  };

  const logout = async (): Promise<void> => {
    if (isFirebaseConfigured() && auth) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        console.warn('Firebase signout error:', e);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (isFirebaseConfigured() && auth) {
      try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Could not send reset link.' };
      }
    }
    // Simulated reset email
    return { success: true };
  };

  const demoLogin = (role: UserRole) => {
    let profile: UserProfile;
    if (role === 'farmer') {
      profile = {
        uid: 'demo-farmer-sahiwal',
        fullName: 'Chaudhry Riaz Gujjar',
        email: 'riaz.farmer@kissanconnect.pk',
        phone: '+923007654321',
        role: 'farmer',
        province: 'Punjab',
        city: 'Sahiwal',
        bio: 'Growing Basmati rice, wheat and maize on 25 acres in Chichawatni.',
        createdAt: new Date().toISOString()
      };
    } else if (role === 'wholesaler') {
      profile = {
        uid: 'demo-wholesaler-multan',
        fullName: 'Mian Tariq Bashir',
        email: 'tariq.agri@multanmandi.pk',
        phone: '+923214567890',
        role: 'wholesaler',
        province: 'Punjab',
        city: 'Multan',
        businessName: 'Tariq Grain & Fertilizer Traders (Shop #14, Grain Market)',
        bio: 'Wholesale buyer of Wheat, Cotton, Mustard and distributor of FFC fertilizers.',
        createdAt: new Date().toISOString()
      };
    } else {
      profile = {
        uid: 'demo-admin-system',
        fullName: 'Kissan Connect Admin',
        email: 'admin@kissanconnect.pk',
        phone: '+923000000000',
        role: 'admin',
        province: 'Punjab',
        city: 'Lahore',
        createdAt: new Date().toISOString()
      };
    }
    setCurrentUser(profile);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) return;
    const updated: UserProfile = { ...currentUser, ...updates };
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true });
      } catch (e) {
        console.warn('Firestore update profile error:', e);
      }
    }
    setCurrentUser(updated);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        signUp,
        loginWithGoogle,
        saveGoogleProfile,
        logout,
        resetPassword,
        demoLogin,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
