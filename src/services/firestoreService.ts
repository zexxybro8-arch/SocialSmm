import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Service, 
  PlatformCategory, 
  Order, 
  Transaction, 
  SupportTicket, 
  TicketMessage,
  Customer,
  User,
  SystemSettings,
  Notification,
  AuditLog,
  UserRole
} from '../types/database';

export const INITIAL_CATEGORIES: PlatformCategory[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    iconName: 'Instagram',
    color: '#E1306C',
    bgColor: 'rgba(225, 48, 108, 0.12)',
    description: 'Meta Graph API compliant Instagram optimization, strategy & management',
    order: 1,
    status: 'active'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    iconName: 'Youtube',
    color: '#FF0000',
    bgColor: 'rgba(255, 0, 0, 0.12)',
    description: 'Channel audits, CTR thumbnail kits, script blueprints & SEO indexing',
    order: 2,
    status: 'active'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    iconName: 'Send',
    color: '#229ED9',
    bgColor: 'rgba(34, 158, 217, 0.12)',
    description: 'Broadcast channel structuring, community moderation & newsletter strategy',
    order: 3,
    status: 'active'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    iconName: 'Facebook',
    color: '#1877F2',
    bgColor: 'rgba(24, 119, 242, 0.12)',
    description: 'Meta Business Suite page setup, ad creative consulting & group moderation',
    order: 4,
    status: 'active'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    iconName: 'Music2',
    color: '#00F2FE',
    bgColor: 'rgba(0, 242, 254, 0.12)',
    description: 'Short-form trend scouting, hook scripting & sound pacing blueprints',
    order: 5,
    status: 'active'
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    iconName: 'Twitter',
    color: '#1DA1F2',
    bgColor: 'rgba(29, 161, 242, 0.12)',
    description: 'Thought leadership thread crafting, header branding & profile indexing',
    order: 6,
    status: 'active'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    iconName: 'Disc',
    color: '#1DB954',
    bgColor: 'rgba(29, 185, 84, 0.12)',
    description: 'Artist profile optimization, Canvas looping video production & playlist pitching',
    order: 7,
    status: 'active'
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    iconName: 'Radio',
    color: '#FF5500',
    bgColor: 'rgba(255, 85, 0, 0.12)',
    description: 'Track metadata, banner visual branding & release scheduling checklists',
    order: 8,
    status: 'active'
  },
  {
    id: 'other',
    name: 'Other Services',
    iconName: 'Layers',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    description: 'Cross-platform brand guidelines, executive consulting & custom packages',
    order: 9,
    status: 'active'
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv_ig_views_1',
    serviceId: 309,
    name: 'Instagram Views | HQ Instant | Start: 0-1h',
    category: 'instagram',
    categoryName: 'Instagram',
    serviceType: 'Instagram Views',
    shortDescription: 'High quality instant views for reels and videos with high retention.',
    description: 'Instant start views delivered smoothly without drops. Supports Reels, IGTV, and regular feed video posts.',
    price: 0.45,
    ratePer1k: 0.45,
    deliveryTime: 'Instant (0-15m)',
    speed: '1M per day',
    speedTier: 'Fast',
    refill: '30 Days Refill',
    linkType: 'Instagram Video Link',
    location: 'Global',
    startTime: '0-2 Minutes',
    videoFormat: 'All Link | Video + Reels + IGTV',
    features: ['No drops', 'Guarantee', 'Real', 'Cancel button', 'Speed 1M per day'],
    minQuantity: 100,
    maxQuantity: 1000000,
    unitLabel: 'per 1,000',
    status: 'active',
    deliverables: ['Start: Instant', 'Speed: 1M/Day', 'Reels & Videos supported', 'Non-drop guaranteed'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv_ig_views_2',
    serviceId: 310,
    name: 'Instagram Views | Real + High Retention | Explore Boost',
    category: 'instagram',
    categoryName: 'Instagram',
    serviceType: 'Instagram Views',
    shortDescription: 'Algorithm optimizing views with real impression data to push onto Explore.',
    description: 'Delivered with real impressions and reach metrics that trigger Instagram recommendation algorithms.',
    price: 0.85,
    ratePer1k: 0.85,
    deliveryTime: '0-30 min',
    speed: '500k/day',
    speedTier: 'Fast',
    refill: 'Guaranteed No Drop',
    linkType: 'Instagram Video Link',
    location: 'Global',
    startTime: '0-5 Minutes',
    videoFormat: 'All Link | Video + Reels + IGTV',
    features: ['Real impressions', 'High retention 85%+', 'Explore page trigger', 'Cancel button', 'Speed 500k per day'],
    minQuantity: 100,
    maxQuantity: 500000,
    unitLabel: 'per 1,000',
    status: 'active',
    deliverables: ['Real Accounts Impressions', 'Watch time retention 85%+', 'Explore page algorithmic trigger'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv_ig_views_3',
    serviceId: 311,
    name: 'Instagram Reels Views | Viral Push Algorithm Optimizer',
    category: 'instagram',
    categoryName: 'Instagram',
    serviceType: 'Instagram Views',
    shortDescription: 'Ultra fast reel views engineered for maximum trending velocity.',
    description: 'Rapid velocity reels views designed for new uploads to jumpstart the algorithm.',
    price: 1.20,
    ratePer1k: 1.20,
    deliveryTime: 'Instant',
    speed: '2M per day',
    speedTier: 'Fast',
    refill: 'Lifetime Refill',
    linkType: 'Instagram Video Link',
    location: 'Global',
    startTime: 'Instant (0-1m)',
    videoFormat: 'Reels + Shorts + Video',
    features: ['Rapid velocity start', 'Full watch duration', 'Lifetime refill', 'Cancel button', 'Speed 2M per day'],
    minQuantity: 500,
    maxQuantity: 2000000,
    unitLabel: 'per 1,000',
    status: 'active',
    deliverables: ['Rapid velocity start', '2M/day delivery speed', 'Full reel watch duration'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv_ig_followers_1',
    serviceId: 320,
    name: 'Instagram Followers | HQ Real | 30D Refill Guarantee',
    category: 'instagram',
    categoryName: 'Instagram',
    serviceType: 'Instagram Followers',
    shortDescription: 'High quality followers with real profile avatars, posts, and bios.',
    description: 'Stable high-tier followers that preserve natural account aesthetics. Comes with 30-day automatic refill.',
    price: 2.40,
    ratePer1k: 2.40,
    deliveryTime: '0-1 Hour',
    speed: '10k/day',
    speedTier: 'Fast',
    refill: '30 Days Auto-Refill',
    linkType: 'Instagram Profile Link',
    location: 'Global',
    startTime: '0-1 Hour',
    videoFormat: 'Profile URL Only',
    features: ['Profiles with bios & avatars', '30D Auto-Refill', 'Cancel button', 'Natural drip delivery', 'Speed 10k per day'],
    minQuantity: 50,
    maxQuantity: 50000,
    unitLabel: 'per 1,000',
    status: 'active',
    deliverables: ['Profiles with bios & avatars', 'Gradual natural delivery', '30D Auto Refill button enabled'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv_ig_followers_2',
    serviceId: 321,
    name: 'Instagram Followers | Active Profiles | Non-Drop VIP',
    category: 'instagram',
    categoryName: 'Instagram',
    serviceType: 'Instagram Followers',
    shortDescription: 'Premium organic-looking followers with active stories and history.',
    description: 'Our top-tier follower network with 0% drop rate and realistic engagement activity.',
    price: 4.80,
    ratePer1k: 4.80,
    deliveryTime: '1-2 Hours',
    speed: '5k/day Organic',
    speedTier: 'Medium',
    refill: 'Guaranteed 0% Drop',
    linkType: 'Instagram Profile Link',
    location: 'Global',
    startTime: '1-2 Hours',
    videoFormat: 'Profile URL Only',
    features: ['Active accounts with stories', 'Guaranteed 0% Drop', 'Instant priority queue', 'Speed 5k per day'],
    minQuantity: 100,
    maxQuantity: 25000,
    unitLabel: 'per 1,000',
    status: 'active',
    deliverables: ['Active accounts with stories', 'Guaranteed 0% Drop', 'Instant priority queue'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv_ig_likes_1',
    serviceId: 330,
    name: 'Instagram Likes | High Quality Real Accounts | Fast',
    category: 'instagram',
    categoryName: 'Instagram',
    serviceType: 'Instagram Likes',
    shortDescription: 'Instant high retention likes from real profiles with profile pictures.',
    description: 'Instant delivery likes for posts, reels, and carousel media. Improves engagement velocity immediately.',
    price: 0.35,
    ratePer1k: 0.35,
    deliveryTime: 'Instant (0-5m)',
    speed: '100k/day',
    speedTier: 'Fast',
    refill: 'Lifetime Guarantee',
    linkType: 'Instagram Post/Reel Link',
    location: 'Global',
    startTime: '0-1 Minute',
    videoFormat: 'Post / Reel / Carousel URL',
    features: ['Start: Instant (0-1m)', 'Lifetime Guarantee', 'Cancel button', 'Split likes across posts', 'Speed 100k per day'],
    minQuantity: 50,
    maxQuantity: 100000,
    unitLabel: 'per 1,000',
    status: 'active',
    deliverables: ['Start: Instant (0-1m)', 'Real profile likers', 'Lifetime Guarantee'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const seedCatalogIfEmpty = async () => {
  try {
    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
    }

    const srvSnap = await getDocs(collection(db, 'services'));
    if (srvSnap.empty) {
      for (const srv of INITIAL_SERVICES) {
        await setDoc(doc(db, 'services', srv.id), srv);
      }
    }
  } catch (err) {
    console.warn('Catalog seeding notice:', err);
  }
};

// CATEGORIES
export const getCategoriesFromFirestore = async (): Promise<PlatformCategory[]> => {
  try {
    const catSnap = await getDocs(collection(db, 'categories'));
    if (!catSnap.empty) {
      const list = catSnap.docs.map(d => d.data() as PlatformCategory);
      return list.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  } catch (e) {
    console.warn('Fetching categories fallback:', e);
  }
  return INITIAL_CATEGORIES;
};

export const createCategoryInFirestore = async (data: Partial<PlatformCategory>): Promise<PlatformCategory> => {
  const id = data.id || `cat_${Date.now()}`;
  const category: PlatformCategory = {
    id,
    name: data.name || 'New Category',
    iconName: data.iconName || 'Layers',
    color: data.color || '#E1306C',
    bgColor: data.bgColor || 'rgba(225, 48, 108, 0.12)',
    description: data.description || '',
    order: data.order || 99,
    status: data.status || 'active'
  };
  await setDoc(doc(db, 'categories', id), category);
  return category;
};

export const updateCategoryInFirestore = async (id: string, data: Partial<PlatformCategory>): Promise<PlatformCategory> => {
  const ref = doc(db, 'categories', id);
  const snap = await getDoc(ref);
  const current = snap.exists() ? (snap.data() as PlatformCategory) : { id, name: '' } as PlatformCategory;
  const updated = { ...current, ...data };
  await setDoc(ref, updated, { merge: true });
  return updated;
};

export const deleteCategoryInFirestore = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'categories', id));
};

// SERVICES
export const getServicesFromFirestore = async (): Promise<Service[]> => {
  try {
    const srvSnap = await getDocs(collection(db, 'services'));
    if (!srvSnap.empty) {
      return srvSnap.docs.map(d => d.data() as Service);
    }
  } catch (e) {
    console.warn('Fetching services fallback:', e);
  }
  return INITIAL_SERVICES;
};

export const createServiceInFirestore = async (data: Partial<Service>): Promise<Service> => {
  const id = data.id || `srv_${Date.now()}`;
  const now = new Date().toISOString();
  const service: Service = {
    id,
    serviceId: data.serviceId || Math.floor(100 + Math.random() * 900),
    name: data.name || 'New Service',
    category: data.category || 'instagram',
    categoryName: data.categoryName || 'Instagram',
    serviceType: data.serviceType || 'Engagement',
    shortDescription: data.shortDescription || '',
    description: data.description || '',
    price: data.price || data.ratePer1k || 1.0,
    ratePer1k: data.ratePer1k || data.price || 1.0,
    deliveryTime: data.deliveryTime || 'Instant',
    speed: data.speed || '100k/day',
    speedTier: data.speedTier || 'Fast',
    refill: data.refill || 'Guaranteed',
    linkType: data.linkType || 'URL',
    location: data.location || 'Global',
    startTime: data.startTime || 'Instant',
    videoFormat: data.videoFormat || 'All Format',
    features: data.features || ['Fast', 'Guaranteed'],
    minQuantity: data.minQuantity || 100,
    maxQuantity: data.maxQuantity || 100000,
    unitLabel: data.unitLabel || 'per 1,000',
    status: data.status || 'active',
    deliverables: data.deliverables || ['Instant Start'],
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, 'services', id), service);
  return service;
};

export const updateServiceInFirestore = async (id: string, data: Partial<Service>): Promise<Service> => {
  const ref = doc(db, 'services', id);
  const snap = await getDoc(ref);
  const current = snap.exists() ? (snap.data() as Service) : { id } as Service;
  const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
  await setDoc(ref, updated, { merge: true });
  return updated;
};

export const deleteServiceInFirestore = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'services', id));
};

// ORDERS
export const getOrdersForUser = async (userId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('customerId', '==', userId));
    const snap = await getDocs(q);
    let orders = snap.docs.map(d => d.data() as Order);
    if (orders.length === 0) {
      const q2 = query(ordersRef, where('userId', '==', userId));
      const snap2 = await getDocs(q2);
      orders = snap2.docs.map(d => d.data() as Order);
    }
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error('Error fetching orders for user:', e);
    return [];
  }
};

export const getAllOrdersFromFirestore = async (): Promise<Order[]> => {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    const orders = snap.docs.map(d => d.data() as Order);
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error('Error fetching all orders:', e);
    return [];
  }
};

export const createOrderInFirestore = async (orderData: {
  userId: string;
  customerName?: string;
  customerEmail?: string;
  serviceId: string;
  serviceName: string;
  serviceCategory?: string;
  link: string;
  targetUrl?: string;
  targetAccount?: string;
  quantity: number;
  price: number;
  totalPrice?: number;
  customerNotes?: string;
}): Promise<Order> => {
  const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();
  const cost = orderData.totalPrice || orderData.price;

  const newOrder: Order = {
    id: orderId,
    customerId: orderData.userId,
    customerName: orderData.customerName || 'Customer',
    customerEmail: orderData.customerEmail || '',
    serviceId: orderData.serviceId,
    serviceName: orderData.serviceName,
    serviceCategory: orderData.serviceCategory || 'Instagram',
    targetAccount: orderData.targetAccount || orderData.link || '@user',
    targetUrl: orderData.targetUrl || orderData.link,
    quantity: orderData.quantity,
    amount: cost,
    totalPrice: cost,
    finalAmount: cost,
    discountApplied: 0,
    customerNotes: orderData.customerNotes || '',
    requirements: {},
    status: 'processing',
    timeline: [
      {
        id: `tl_${Date.now()}`,
        status: 'processing',
        title: 'Order Dispatched',
        description: 'Order registered in high-speed fulfillment pipeline.',
        timestamp: now,
        updatedBy: 'system',
      }
    ],
    createdAt: now,
    updatedAt: now,
  };

  const orderDocData = {
    ...newOrder,
    userId: orderData.userId,
    link: orderData.link,
    price: cost,
  };

  await setDoc(doc(db, 'orders', orderId), orderDocData);

  // Update user wallet balance & spent
  try {
    const userRef = doc(db, 'users', orderData.userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const currentBal = userData.walletBalance || 0;
      const currentSpent = userData.spent || 0;
      await updateDoc(userRef, {
        walletBalance: Math.max(0, currentBal - cost),
        spent: currentSpent + cost,
        updatedAt: now
      });
    }
  } catch (e) {
    console.warn('Wallet balance update notice:', e);
  }

  // Transaction record
  try {
    const txId = `TX-${Math.floor(100000 + Math.random() * 900000)}`;
    const tx: Transaction = {
      id: txId,
      customerId: orderData.userId,
      type: 'order_payment',
      amount: cost,
      balanceAfter: 0,
      description: `Order #${orderId} - ${orderData.serviceName}`,
      status: 'completed',
      createdAt: now,
    };
    await setDoc(doc(db, 'transactions', txId), tx);
  } catch (e) {
    console.warn('Transaction record notice:', e);
  }

  return newOrder;
};

export const updateOrderStatusInFirestore = async (id: string, status: string, note?: string): Promise<Order> => {
  const ref = doc(db, 'orders', id);
  const snap = await getDoc(ref);
  const now = new Date().toISOString();

  if (!snap.exists()) {
    throw new Error('Order not found');
  }

  const order = snap.data() as Order;
  const updatedTimeline = [
    ...(order.timeline || []),
    {
      id: `tl_${Date.now()}`,
      status: status as any,
      title: `Status set to ${status}`,
      description: note || `Order status updated to ${status}.`,
      timestamp: now,
      updatedBy: 'admin',
    }
  ];

  const updatedOrder: Order = {
    ...order,
    status: status as any,
    timeline: updatedTimeline,
    updatedAt: now,
  };

  await setDoc(ref, updatedOrder, { merge: true });
  return updatedOrder;
};

export const refundOrderInFirestore = async (id: string, reason?: string): Promise<{ order: Order; refundedAmount: number }> => {
  const ref = doc(db, 'orders', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Order not found');

  const order = snap.data() as Order;
  const refundAmt = order.amount || order.totalPrice || 0;
  const now = new Date().toISOString();

  const updatedOrder = await updateOrderStatusInFirestore(id, 'refunded', reason || 'Refund issued by operator.');

  if (order.customerId || (order as any).userId) {
    const uid = order.customerId || (order as any).userId;
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const u = userSnap.data();
        await updateDoc(userRef, {
          walletBalance: (u.walletBalance || 0) + refundAmt,
          updatedAt: now
        });
      }

      const txId = `TX-${Math.floor(100000 + Math.random() * 900000)}`;
      const tx: Transaction = {
        id: txId,
        customerId: uid,
        type: 'refund',
        amount: refundAmt,
        balanceAfter: (userSnap?.data()?.walletBalance || 0) + refundAmt,
        description: `Refund for Order #${id}: ${reason || 'Operator Refund'}`,
        status: 'completed',
        createdAt: now
      };
      await setDoc(doc(db, 'transactions', txId), tx);
    } catch (e) {
      console.warn('Refund credit error:', e);
    }
  }

  return { order: updatedOrder, refundedAmount: refundAmt };
};

// TRANSACTIONS
export const getTransactionsForUser = async (userId: string): Promise<Transaction[]> => {
  try {
    const txRef = collection(db, 'transactions');
    const q = query(txRef, where('customerId', '==', userId));
    const snap = await getDocs(q);
    let txs = snap.docs.map(d => d.data() as Transaction);
    if (txs.length === 0) {
      const q2 = query(txRef, where('userId', '==', userId));
      const snap2 = await getDocs(q2);
      txs = snap2.docs.map(d => d.data() as Transaction);
    }
    return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error('Error fetching transactions:', e);
    return [];
  }
};

export const getAllTransactionsFromFirestore = async (): Promise<Transaction[]> => {
  try {
    const snap = await getDocs(collection(db, 'transactions'));
    const txs = snap.docs.map(d => d.data() as Transaction);
    return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error('Error fetching all transactions:', e);
    return [];
  }
};

export const topUpBalanceInFirestore = async (userId: string, amount: number, method: string = 'card'): Promise<{ newBalance: number; transaction: Transaction }> => {
  const now = new Date().toISOString();
  let newBalance = amount;

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const u = userSnap.data();
    newBalance = (u.walletBalance || 0) + amount;
    await updateDoc(userRef, {
      walletBalance: newBalance,
      updatedAt: now
    });
  }

  const txId = `TX-${Math.floor(100000 + Math.random() * 900000)}`;
  const transaction: Transaction = {
    id: txId,
    customerId: userId,
    type: 'deposit',
    amount,
    balanceAfter: newBalance,
    description: `Wallet top-up via ${method.toUpperCase()}`,
    status: 'completed',
    createdAt: now
  };

  await setDoc(doc(db, 'transactions', txId), transaction);
  return { newBalance, transaction };
};

// CUSTOMERS (Admin)
export const getCustomersFromFirestore = async (): Promise<Array<{ user: User; profile: Customer; ordersCount: number; lastOrder: Order | null }>> => {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const orders = await getAllOrdersFromFirestore();

    const results: Array<{ user: User; profile: Customer; ordersCount: number; lastOrder: Order | null }> = [];

    usersSnap.docs.forEach(d => {
      const u = d.data();
      if (u.role === 'admin') return;

      const userObj: User = {
        id: d.id,
        email: u.email || '',
        username: u.username || 'user',
        role: u.role || 'customer',
        fullName: u.fullName || u.name || 'Customer',
        phone: u.phone || u.mobile || '',
        status: u.status || 'active',
        createdAt: u.createdAt || new Date().toISOString(),
        updatedAt: u.updatedAt || new Date().toISOString(),
      };

      const custProfile: Customer = {
        id: d.id,
        userId: d.id,
        username: u.username || 'user',
        balance: u.walletBalance || 0,
        spent: u.spent || 0,
        customDiscountPercent: u.customDiscountPercent || 0,
        fullName: u.fullName || u.name,
        email: u.email,
        phone: u.phone || u.mobile,
        createdAt: u.createdAt || new Date().toISOString(),
        updatedAt: u.updatedAt || new Date().toISOString(),
      };

      const userOrders = orders.filter(o => o.customerId === d.id || (o as any).userId === d.id);
      const ordersCount = userOrders.length;
      const lastOrder = userOrders.length > 0 ? userOrders[0] : null;

      results.push({ user: userObj, profile: custProfile, ordersCount, lastOrder });
    });

    return results;
  } catch (e) {
    console.error('Error fetching customers from Firestore:', e);
    return [];
  }
};

export const createCustomerInFirestore = async (data: {
  email: string;
  username?: string;
  fullName: string;
  phone?: string;
  initialBalance?: number;
}): Promise<{ user: User; profile: Customer }> => {
  const uid = `usr_${Date.now()}`;
  const now = new Date().toISOString();

  const userObj: User = {
    id: uid,
    email: data.email.toLowerCase().trim(),
    username: data.username || data.email.split('@')[0],
    role: 'customer',
    fullName: data.fullName,
    phone: data.phone || '',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  const custProfile: Customer = {
    id: uid,
    userId: uid,
    username: userObj.username,
    balance: data.initialBalance || 0,
    spent: 0,
    customDiscountPercent: 0,
    fullName: data.fullName,
    email: userObj.email,
    phone: data.phone,
    createdAt: now,
    updatedAt: now,
  };

  const docData = {
    uid,
    email: userObj.email,
    username: userObj.username,
    name: data.fullName,
    fullName: data.fullName,
    phone: data.phone || '',
    role: 'customer',
    walletBalance: data.initialBalance || 0,
    spent: 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'users', uid), docData);
  return { user: userObj, profile: custProfile };
};

export const updateCustomerInFirestore = async (
  id: string,
  data: Partial<Customer & { fullName?: string; balanceAdjustment?: number; adjustmentReason?: string; status?: string }>
): Promise<{ user: User; profile: Customer }> => {
  const userRef = doc(db, 'users', id);
  const snap = await getDoc(userRef);
  const now = new Date().toISOString();

  let current = snap.exists() ? snap.data() : {};
  let newBalance = current.walletBalance || 0;

  if (typeof data.balanceAdjustment === 'number' && data.balanceAdjustment !== 0) {
    newBalance = Math.max(0, newBalance + data.balanceAdjustment);
    const txId = `TX-${Math.floor(100000 + Math.random() * 900000)}`;
    const tx: Transaction = {
      id: txId,
      customerId: id,
      type: 'adjustment',
      amount: Math.abs(data.balanceAdjustment),
      balanceAfter: newBalance,
      description: data.adjustmentReason || 'Manual adjustment by operator',
      status: 'completed',
      createdAt: now
    };
    await setDoc(doc(db, 'transactions', txId), tx);
  }

  const updateFields: any = {
    updatedAt: now,
    walletBalance: newBalance,
  };

  if (data.fullName) {
    updateFields.fullName = data.fullName;
    updateFields.name = data.fullName;
  }
  if (data.status) updateFields.status = data.status;
  if (typeof data.customDiscountPercent === 'number') updateFields.customDiscountPercent = data.customDiscountPercent;

  await updateDoc(userRef, updateFields);

  const updatedSnap = await getDoc(userRef);
  const u = updatedSnap.data() || {};

  const userObj: User = {
    id,
    email: u.email || '',
    username: u.username || '',
    role: u.role || 'customer',
    fullName: u.fullName || u.name || 'Customer',
    phone: u.phone || u.mobile || '',
    status: u.status || 'active',
    createdAt: u.createdAt || now,
    updatedAt: now,
  };

  const custProfile: Customer = {
    id,
    userId: id,
    username: u.username || '',
    balance: u.walletBalance || 0,
    spent: u.spent || 0,
    customDiscountPercent: u.customDiscountPercent || 0,
    fullName: u.fullName || u.name,
    email: u.email,
    phone: u.phone,
    createdAt: u.createdAt || now,
    updatedAt: now,
  };

  return { user: userObj, profile: custProfile };
};

// SUPPORT TICKETS
export const getTicketsFromFirestore = async (userId?: string, isAdmin: boolean = false): Promise<SupportTicket[]> => {
  try {
    const ticketsRef = collection(db, 'tickets');
    let snap;
    if (isAdmin || !userId) {
      snap = await getDocs(ticketsRef);
    } else {
      const q = query(ticketsRef, where('customerId', '==', userId));
      snap = await getDocs(q);
    }
    const list = snap.docs.map(d => d.data() as SupportTicket);
    return list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  } catch (e) {
    console.error('Error fetching tickets:', e);
    return [];
  }
};

export const createTicketInFirestore = async (data: {
  userId: string;
  userName: string;
  userEmail?: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  relatedOrderId?: string;
}): Promise<{ ticket: SupportTicket; message: TicketMessage }> => {
  const ticketId = `TCK-${Math.floor(10000 + Math.random() * 90000)}`;
  const msgId = `MSG-${Date.now()}`;
  const now = new Date().toISOString();

  const initialMsg: TicketMessage = {
    id: msgId,
    ticketId,
    senderId: data.userId,
    senderName: data.userName,
    senderRole: 'customer',
    message: data.message,
    createdAt: now,
  };

  const ticket: SupportTicket = {
    id: ticketId,
    customerId: data.userId,
    customerName: data.userName,
    customerEmail: data.userEmail || '',
    subject: data.subject,
    category: data.category,
    priority: data.priority as any,
    status: 'open',
    relatedOrderId: data.relatedOrderId,
    messages: [initialMsg],
    createdAt: now,
    updatedAt: now,
    lastReplyAt: now,
  };

  await setDoc(doc(db, 'tickets', ticketId), ticket);
  return { ticket, message: initialMsg };
};

export const replyTicketInFirestore = async (
  ticketId: string, 
  senderId: string, 
  senderName: string, 
  senderRole: UserRole, 
  messageText: string
): Promise<{ ticket: SupportTicket; message: TicketMessage }> => {
  const ref = doc(db, 'tickets', ticketId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Ticket not found');

  const now = new Date().toISOString();
  const ticket = snap.data() as SupportTicket;

  const newMsg: TicketMessage = {
    id: `MSG-${Date.now()}`,
    ticketId,
    senderId,
    senderName,
    senderRole,
    message: messageText,
    createdAt: now,
  };

  const updatedMessages = [...(ticket.messages || []), newMsg];
  const nextStatus = senderRole === 'admin' ? 'in_progress' : 'open';

  const updatedTicket: SupportTicket = {
    ...ticket,
    status: nextStatus as any,
    messages: updatedMessages,
    updatedAt: now,
    lastReplyAt: now,
  };

  await setDoc(ref, updatedTicket, { merge: true });
  return { ticket: updatedTicket, message: newMsg };
};

export const updateTicketStatusInFirestore = async (ticketId: string, status: string): Promise<SupportTicket> => {
  const ref = doc(db, 'tickets', ticketId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Ticket not found');

  const now = new Date().toISOString();
  const ticket = snap.data() as SupportTicket;
  const updated = { ...ticket, status: status as any, updatedAt: now };

  await setDoc(ref, updated, { merge: true });
  return updated;
};

// ADMIN STATS
export const getAdminStatsFromFirestore = async (): Promise<{
  stats: {
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
    openTickets: number;
  };
  recentTransactions: Transaction[];
  recentAuditLogs: AuditLog[];
}> => {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const totalCustomers = usersSnap.docs.filter(d => d.data().role !== 'admin').length;

    const orders = await getAllOrdersFromFirestore();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || o.totalPrice || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    const tickets = await getTicketsFromFirestore(undefined, true);
    const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

    const txs = await getAllTransactionsFromFirestore();
    const recentTransactions = txs.slice(0, 10);

    const now = new Date().toISOString();
    const mockAuditLogs: AuditLog[] = [
      {
        id: 'log_1',
        actorId: 'admin_sys',
        actorName: 'System Administrator',
        action: 'STATS_FETCH',
        entityType: 'system',
        entityId: 'dashboard',
        details: 'Live analytical dashboard metrics initialized',
        createdAt: now,
      }
    ];

    return {
      stats: {
        totalCustomers,
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingOrders,
        processingOrders,
        completedOrders,
        openTickets,
      },
      recentTransactions,
      recentAuditLogs: mockAuditLogs,
    };
  } catch (e) {
    console.error('Error fetching admin stats:', e);
    return {
      stats: {
        totalCustomers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        openTickets: 0,
      },
      recentTransactions: [],
      recentAuditLogs: [],
    };
  }
};

// NOTIFICATIONS
export const getNotificationsFromFirestore = async (userId: string): Promise<Notification[]> => {
  try {
    const ref = collection(db, 'notifications');
    const q = query(ref, where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as Notification);
    }
  } catch (e) {
    console.warn('Notifications fetch notice:', e);
  }

  return [
    {
      id: 'notif_welcome',
      userId,
      title: 'Welcome to SMM Portal',
      message: 'Your high-speed social expansion portal is active.',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    }
  ];
};

// SETTINGS
export const DEFAULT_SETTINGS: SystemSettings = {
  id: 'system',
  siteName: 'Instagram SMM Panel',
  supportEmail: 'support@smmportal.com',
  currency: 'USD',
  currencySymbol: '$',
  minDepositAmount: 5,
  maxDepositAmount: 10000,
  allowSelfRegistration: true,
  maintenanceMode: false,
  metaGraphApiVersion: 'v18.0',
  stripeEnabled: true,
  testMode: false,
  updatedAt: new Date().toISOString(),
};

export const getSettingsFromFirestore = async (): Promise<SystemSettings> => {
  try {
    const snap = await getDoc(doc(db, 'settings', 'system'));
    if (snap.exists()) {
      return snap.data() as SystemSettings;
    }
  } catch (e) {
    console.warn('Settings fetch notice:', e);
  }
  return DEFAULT_SETTINGS;
};

export const updateSettingsInFirestore = async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
  const ref = doc(db, 'settings', 'system');
  const now = new Date().toISOString();
  const current = await getSettingsFromFirestore();
  const updated = { ...current, ...data, updatedAt: now };
  await setDoc(ref, updated, { merge: true });
  return updated;
};
