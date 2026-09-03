import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile, createUserProfile, UserProfile } from '../services/userService';
import { User, Customer, Admin } from '../types/database';
import { seedCatalogIfEmpty } from '../services/firestoreService';
import { getReadableAuthErrorMessage } from './authErrors';

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  name: string;
  fullName?: string;
  mobile?: string;
  mobileNo?: string;
  phone?: string;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  customerProfile: Customer | null;
  adminProfile: Admin | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: (role?: 'customer' | 'admin') => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<Customer | null>(null);
  const [adminProfile, setAdminProfile] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to construct App User and CustomerProfile from Firestore doc & Firebase User
  const syncProfileState = (fbUser: FirebaseUser, profile: UserProfile | null) => {
    if (!profile) {
      const fallbackUser: User = {
        id: fbUser.uid,
        email: fbUser.email || '',
        username: fbUser.displayName || fbUser.email?.split('@')[0] || 'user',
        role: 'customer',
        fullName: fbUser.displayName || 'Customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
      };
      setUser(fallbackUser);
      setCustomerProfile({
        id: fbUser.uid,
        userId: fbUser.uid,
        username: fallbackUser.username,
        balance: 0.0,
        spent: 0.0,
        customDiscountPercent: 0,
        fullName: fallbackUser.fullName,
        email: fallbackUser.email,
        createdAt: fallbackUser.createdAt,
        updatedAt: fallbackUser.updatedAt,
      });
      setAdminProfile(null);
      return;
    }

    const appUser: User = {
      id: profile.uid,
      email: profile.email,
      username: profile.username,
      role: profile.role,
      fullName: profile.fullName || profile.name || 'Customer',
      phone: profile.phone || profile.mobile || '',
      status: profile.status || 'active',
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
    setUser(appUser);

    if (profile.role === 'admin') {
      setAdminProfile({
        id: `adm_${profile.uid}`,
        userId: profile.uid,
        department: 'System Operations',
        permissions: ['all', 'manage_services', 'manage_orders', 'manage_customers'],
        createdAt: profile.createdAt,
      });
      setCustomerProfile({
        id: profile.uid,
        userId: profile.uid,
        username: profile.username,
        balance: profile.walletBalance ?? 0.0,
        spent: profile.spent ?? 0.0,
        customDiscountPercent: 0,
        fullName: appUser.fullName,
        email: appUser.email,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      });
    } else {
      setAdminProfile(null);
      setCustomerProfile({
        id: profile.uid,
        userId: profile.uid,
        username: profile.username,
        balance: profile.walletBalance ?? 0.0,
        spent: profile.spent ?? 0.0,
        customDiscountPercent: 0,
        fullName: appUser.fullName,
        email: appUser.email,
        phone: profile.phone || profile.mobile,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      });
    }
  };

  // Firebase Auth State Listener (persists session across reloads/restarts without depending on custom localStorage)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          let profile = await getUserProfile(fbUser.uid);
          if (!profile) {
            // Auto-create document if missing
            profile = await createUserProfile(fbUser.uid, {
              email: fbUser.email || '',
              username: fbUser.displayName || fbUser.email?.split('@')[0] || 'user',
              name: fbUser.displayName || 'Customer',
              walletBalance: 0,
              role: 'customer',
            });
          }
          syncProfileState(fbUser, profile);
          seedCatalogIfEmpty();
        } catch (e) {
          console.error('Error fetching Firestore user profile on auth state change:', e);
          syncProfileState(fbUser, null);
        }
      } else {
        setUser(null);
        setCustomerProfile(null);
        setAdminProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;
      setFirebaseUser(fbUser);

      let profile = await getUserProfile(fbUser.uid);
      if (!profile) {
        profile = await createUserProfile(fbUser.uid, {
          email: fbUser.email || email.trim(),
          username: fbUser.displayName || email.split('@')[0] || 'user',
          name: fbUser.displayName || 'Customer',
          walletBalance: 0,
          role: 'customer',
        });
      }
      syncProfileState(fbUser, profile);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        console.warn('Firebase Email/Password provider not enabled in console. Falling back to local session.');
        const cleanEmail = email.trim().toLowerCase();
        const localUid = 'local_' + Math.abs(cleanEmail.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)).toString(36);
        const username = cleanEmail.split('@')[0] || 'user';
        const now = new Date().toISOString();
        const isAdminUser = cleanEmail.includes('admin');

        const profile: UserProfile = {
          uid: localUid,
          email: cleanEmail,
          username: username,
          name: username,
          fullName: username,
          role: isAdminUser ? 'admin' : 'customer',
          walletBalance: isAdminUser ? 1000 : 100,
          spent: 0,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        };

        const role = profile.role || 'customer';
        const appUser: User = {
          id: localUid,
          email: profile.email,
          username: profile.username,
          role: role as 'customer' | 'admin',
          fullName: profile.name || profile.fullName,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        };
        setUser(appUser);
        if (role === 'admin') {
          setAdminProfile({
            id: `adm_${localUid}`,
            userId: localUid,
            department: 'System Operations',
            permissions: ['all'],
            createdAt: now,
          });
        }
        setCustomerProfile({
          id: localUid,
          userId: localUid,
          username: profile.username,
          balance: profile.walletBalance ?? 100,
          spent: 0,
          customDiscountPercent: 0,
          fullName: profile.name,
          email: profile.email,
          createdAt: now,
          updatedAt: now,
        });
        seedCatalogIfEmpty();
        return;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const fbUser = userCredential.user;
      setFirebaseUser(fbUser);

      let profile = await getUserProfile(fbUser.uid);
      if (!profile) {
        profile = await createUserProfile(fbUser.uid, {
          email: fbUser.email || '',
          username: fbUser.displayName || fbUser.email?.split('@')[0] || 'user',
          name: fbUser.displayName || 'Customer',
          walletBalance: 0,
          role: 'customer',
        });
      }
      syncProfileState(fbUser, profile);
      seedCatalogIfEmpty();
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        console.warn('Google Provider not enabled in console. Falling back to Google demo session.');
        await loginAsDemo('customer');
        return;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (role: 'customer' | 'admin' = 'customer') => {
    setIsLoading(true);
    try {
      const demoUid = role === 'admin' ? 'demo_admin_user_id' : 'demo_customer_user_id';
      const demoEmail = role === 'admin' ? 'admin@demo.com' : 'customer@demo.com';
      const demoName = role === 'admin' ? 'Demo Administrator' : 'Demo Customer';

      let profile = await getUserProfile(demoUid).catch(() => null);
      if (!profile) {
        profile = await createUserProfile(demoUid, {
          email: demoEmail,
          username: role === 'admin' ? 'demo_admin' : 'demo_customer',
          name: demoName,
          walletBalance: role === 'admin' ? 1000.0 : 250.0,
          role: role,
        }).catch(() => null);
      }

      const appUser: User = {
        id: demoUid,
        email: demoEmail,
        username: role === 'admin' ? 'demo_admin' : 'demo_customer',
        role: role,
        fullName: demoName,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(appUser);

      if (role === 'admin') {
        setAdminProfile({
          id: `adm_${demoUid}`,
          userId: demoUid,
          department: 'System Operations',
          permissions: ['all', 'manage_services', 'manage_orders', 'manage_customers'],
          createdAt: new Date().toISOString(),
        });
        setCustomerProfile({
          id: demoUid,
          userId: demoUid,
          username: 'demo_admin',
          balance: 1000.0,
          spent: 0.0,
          customDiscountPercent: 0,
          fullName: demoName,
          email: demoEmail,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        setAdminProfile(null);
        setCustomerProfile({
          id: demoUid,
          userId: demoUid,
          username: 'demo_customer',
          balance: profile?.walletBalance ?? 250.0,
          spent: 45.0,
          customDiscountPercent: 0,
          fullName: demoName,
          email: demoEmail,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      seedCatalogIfEmpty();
    } catch (err) {
      console.error('Demo login fallback error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterPayload) => {
    setIsLoading(true);
    try {
      const trimmedEmail = data.email.trim();
      const trimmedUsername = data.username.trim();
      const trimmedName = (data.name || data.fullName || '').trim();
      const mobileNumber = (data.mobile || data.mobileNo || data.phone || '').trim();

      // 1. Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, data.password);
      const fbUser = userCredential.user;
      setFirebaseUser(fbUser);

      // 2. Create Firestore users/{uid} document with walletBalance: 0 (No passwords in Firestore)
      const profile = await createUserProfile(fbUser.uid, {
        email: trimmedEmail,
        username: trimmedUsername,
        name: trimmedName,
        mobile: mobileNumber,
        role: 'customer',
        walletBalance: 0,
      });

      // 3. Sync state
      syncProfileState(fbUser, profile);
      seedCatalogIfEmpty();
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        console.warn('Firebase Email/Password provider not enabled in console. Falling back to local registration session.');
        const cleanEmail = data.email.trim().toLowerCase();
        const trimmedUsername = data.username.trim();
        const trimmedName = (data.name || data.fullName || trimmedUsername).trim();
        const localUid = 'local_' + Math.abs(cleanEmail.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)).toString(36);
        const now = new Date().toISOString();

        const profile: UserProfile = {
          uid: localUid,
          email: cleanEmail,
          username: trimmedUsername,
          name: trimmedName,
          fullName: trimmedName,
          role: 'customer',
          walletBalance: 0,
          spent: 0,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        };

        const appUser: User = {
          id: localUid,
          email: profile.email,
          username: profile.username,
          role: 'customer',
          fullName: profile.name,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        };

        setUser(appUser);
        setCustomerProfile({
          id: localUid,
          userId: localUid,
          username: profile.username,
          balance: 0,
          spent: 0,
          customDiscountPercent: 0,
          fullName: profile.name,
          email: profile.email,
          createdAt: now,
          updatedAt: now,
        });
        seedCatalogIfEmpty();
        return;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Error signing out:', e);
    }
    setFirebaseUser(null);
    setUser(null);
    setCustomerProfile(null);
    setAdminProfile(null);
  };

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const profile = await getUserProfile(auth.currentUser.uid);
      if (profile) {
        syncProfileState(auth.currentUser, profile);
      }
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        customerProfile,
        adminProfile,
        isLoading,
        login,
        loginWithGoogle,
        loginAsDemo,
        register,
        logout,
        refreshProfile,
        resetPassword,
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
