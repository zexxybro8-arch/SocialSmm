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
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
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
  try {
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

    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, profile);
    return profile;
  } catch (error) {
    console.error('Error creating user profile in Firestore:', error);
    throw error;
  }
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(userDocRef, updateData);
  } catch (error) {
    console.error('Error updating user profile in Firestore:', error);
    throw error;
  }
};
