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
      throw err;
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
