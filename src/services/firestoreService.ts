import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Service, PlatformCategory, Order, Transaction, SupportTicket } from '../types/database';

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

// Seed Firestore with services and categories if not present
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
    // If permission or network prevents seeding, client fallback is used
    console.warn('Catalog seeding notice (will use client fallback if needed):', err);
  }
};

// -------------------------------------------------------------
// CATEGORIES
// -------------------------------------------------------------
export const getCategoriesFromFirestore = async (): Promise<PlatformCategory[]> => {
  try {
    const catSnap = await getDocs(collection(db, 'categories'));
    if (!catSnap.empty) {
      const list = catSnap.docs.map(d => d.data() as PlatformCategory);
      return list.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  } catch (e) {
    console.warn('Fetching categories from Firestore fallback:', e);
  }
  return INITIAL_CATEGORIES;
};

// -------------------------------------------------------------
// SERVICES
// -------------------------------------------------------------
export const getServicesFromFirestore = async (): Promise<Service[]> => {
  try {
    const srvSnap = await getDocs(collection(db, 'services'));
    if (!srvSnap.empty) {
      return srvSnap.docs.map(d => d.data() as Service);
    }
  } catch (e) {
    console.warn('Fetching services from Firestore fallback:', e);
  }
  return INITIAL_SERVICES;
};

// -------------------------------------------------------------
// ORDERS
// -------------------------------------------------------------
export const getOrdersForUser = async (userId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    const orders = snap.docs.map(d => d.data() as Order);
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error('Error fetching orders for user:', e);
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
    amount: orderData.price,
    totalPrice: orderData.totalPrice || orderData.price,
    finalAmount: orderData.totalPrice || orderData.price,
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

  // Additional fields for user order collection
  const orderDocData = {
    ...newOrder,
    userId: orderData.userId,
    link: orderData.link,
    price: orderData.price,
  };

  const orderRef = doc(db, 'orders', orderId);
  await setDoc(orderRef, orderDocData);

  return newOrder;
};

// -------------------------------------------------------------
// TRANSACTIONS
// -------------------------------------------------------------
export const getTransactionsForUser = async (userId: string): Promise<Transaction[]> => {
  try {
    const txRef = collection(db, 'transactions');
    const q = query(txRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    const txs = snap.docs.map(d => d.data() as Transaction);
    return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error('Error fetching transactions:', e);
    return [];
  }
};
