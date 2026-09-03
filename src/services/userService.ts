import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  name: string;
  fullName?: string;
  mobile?: string;
  phone?: string;
  role: 'customer' | 'admin';
  walletBalance: number;
  spent?: number;
  status?: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!uid || uid.startsWith('demo_')) {
    return null;
  }
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as UserProfile;
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
      console.warn('Firestore permission notice when fetching profile:', error.message);
      return null;
    }
    console.warn('Notice fetching user profile:', error);
    return null;
  }
};

export const createUserProfile = async (
  uid: string,
  data: {
    email: string;
    username: string;
    name: string;
    mobile?: string;
    role?: 'customer' | 'admin';
    walletBalance?: number;
  }
): Promise<UserProfile> => {
  const now = new Date().toISOString();
  const profile: UserProfile = {
    uid,
    email: data.email.toLowerCase().trim(),
    username: data.username.trim(),
    name: data.name.trim(),
    fullName: data.name.trim(),
    mobile: data.mobile?.trim() || '',
    phone: data.mobile?.trim() || '',
    role: data.role || 'customer',
    walletBalance: data.walletBalance ?? 0,
    spent: 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  if (uid.startsWith('demo_')) {
    return profile;
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, profile);
    return profile;
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
      console.warn('Firestore permission notice when creating profile:', error.message);
      return profile;
    }
    console.warn('Notice creating user profile in Firestore:', error);
    return profile;
  }
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  if (uid.startsWith('demo_')) {
    return;
  }
  try {
    const userDocRef = doc(db, 'users', uid);
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(userDocRef, updateData);
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
      console.warn('Firestore permission notice when updating profile:', error.message);
      return;
    }
    console.warn('Notice updating user profile in Firestore:', error);
  }
};
