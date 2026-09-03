import { 
  User, 
  Customer, 
  Admin, 
  Service, 
  Order, 
  Payment, 
  Transaction, 
  SupportTicket, 
  TicketMessage, 
  Notification, 
  InstagramAccount, 
  AuditLog, 
  SystemSettings,
  PlatformCategory
} from '../types/database';

class InMemoryDatabase {
  users: Map<string, User> = new Map();
  userPasswords: Map<string, string> = new Map(); // Secure hashed/stored passwords
  userFavorites: Map<string, Set<string>> = new Map(); // userId -> Set of service IDs
  customers: Map<string, Customer> = new Map();
  admins: Map<string, Admin> = new Map();
  categories: Map<string, PlatformCategory> = new Map();
  services: Map<string, Service> = new Map();
  orders: Map<string, Order> = new Map();
  payments: Map<string, Payment> = new Map();
  transactions: Map<string, Transaction> = new Map();
  supportTickets: Map<string, SupportTicket> = new Map();
  ticketMessages: Map<string, TicketMessage[]> = new Map();
  notifications: Map<string, Notification[]> = new Map();
  instagramAccounts: Map<string, InstagramAccount> = new Map();
  auditLogs: AuditLog[] = [];
  settings: SystemSettings;

  constructor() {
    this.settings = {
      id: 'SET-DEFAULT',
      siteName: 'Instagram SMM Panel',
      supportEmail: 'support@instasmm.com',
      currency: 'USD',
      currencySymbol: '$',
      minDepositAmount: 10.0,
      maxDepositAmount: 5000.0,
      allowSelfRegistration: false,
      maintenanceMode: false,
      metaGraphApiVersion: 'v19.0',
      stripeEnabled: true,
      testMode: false,
      updatedAt: new Date().toISOString(),
    };

    this.seedInitialData();
  }

  private seedInitialData() {
    const now = new Date();
    const isoNow = now.toISOString();

    // 1. Seed Fixed Admin User
    const adminUsername = process.env.ADMIN_USERNAME || 'ADMIN551';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ADMIN@ADMIN1';

    const adminUser: User = {
      id: 'usr_admin_01',
      email: 'admin@apexsmm.io',
      username: adminUsername,
      role: 'admin',
      fullName: 'System Administrator',
      phone: '+1 (555) 123-4567',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: isoNow,
      updatedAt: isoNow,
    };
    this.users.set(adminUser.id, adminUser);
    this.userPasswords.set(adminUser.id, adminPassword);

    const adminProfile: Admin = {
      id: 'adm_01',
      userId: adminUser.id,
      department: 'System Operations',
      permissions: ['all', 'manage_services', 'manage_orders', 'manage_customers', 'manage_finances'],
      createdAt: isoNow,
    };
    this.admins.set(adminProfile.id, adminProfile);

    // 2. Seed Customer Users
    const customerUser1: User = {
      id: 'usr_cust_01',
      email: 'alex@creatorbrand.io',
      username: 'alexmorgan',
      role: 'customer',
      fullName: 'Alex Morgan',
      phone: '+1 (555) 234-8901',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
      updatedAt: isoNow,
    };
    this.users.set(customerUser1.id, customerUser1);
    this.userPasswords.set(customerUser1.id, 'Customer@123456');

    const customerProfile1: Customer = {
      id: customerUser1.id,
      userId: customerUser1.id,
      username: 'alexmorgan',
      balance: 0.00,
      spent: 0.00,
      instagramHandle: '@alexmorgan.fit',
      customDiscountPercent: 0.0,
      phone: '+1 (555) 234-8901',
      companyName: 'Morgan Athletics LLC',
      notes: 'Active member account.',
      createdAt: customerUser1.createdAt,
      updatedAt: isoNow,
    };
    this.customers.set(customerProfile1.id, customerProfile1);

    const customerUser2: User = {
      id: 'usr_cust_02',
      email: 'elena@velvetstudio.co',
      username: 'elenarostova',
      role: 'customer',
      fullName: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
      updatedAt: isoNow,
    };
    this.users.set(customerUser2.id, customerUser2);
    this.userPasswords.set(customerUser2.id, 'Customer@123456');

    const customerProfile2: Customer = {
      id: customerUser2.id,
      userId: customerUser2.id,
      username: 'elenarostova',
      balance: 0.00,
      spent: 0.00,
      instagramHandle: '@velvetstudio.co',
      customDiscountPercent: 0.0,
      phone: '+1 (555) 432-8765',
      companyName: 'Velvet Media Lab',
      notes: 'Active member account.',
      createdAt: customerUser2.createdAt,
      updatedAt: isoNow,
    };
    this.customers.set(customerProfile2.id, customerProfile2);

    // 3. Seed Platform Categories
    const initialCategories: PlatformCategory[] = [
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

    initialCategories.forEach(c => this.categories.set(c.id, c));

    // 4. Seed SMM Services & Packages
    const initialServices: Service[] = [
      // --- INSTAGRAM SERVICES ---
      // 1. Instagram Views
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
        createdAt: isoNow,
        updatedAt: isoNow,
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
        createdAt: isoNow,
        updatedAt: isoNow,
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
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // 2. Instagram Followers
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
        createdAt: isoNow,
        updatedAt: isoNow,
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
        features: ['High-activity profiles', 'Zero drop guarantee', 'Safe organic drip cadence', 'Cancel button'],
        minQuantity: 100,
        maxQuantity: 20000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['High-activity profiles', 'Zero drop guarantee', 'Safe organic drip cadence'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // 3. Instagram Likes
      {
        id: 'srv_ig_likes_1',
        serviceId: 330,
        name: 'Instagram Likes | HQ Instant | Start: 0-5m',
        category: 'instagram',
        categoryName: 'Instagram',
        serviceType: 'Instagram Likes',
        shortDescription: 'Lightning fast likes dispatched within seconds of placing order.',
        description: 'Instant likes for posts and reels from clean profile accounts. Safe for brand and creator accounts.',
        price: 0.65,
        ratePer1k: 0.65,
        deliveryTime: 'Instant',
        speed: '50k/day',
        speedTier: 'Fast',
        refill: 'Non-Drop',
        linkType: 'Instagram Post/Reel Link',
        location: 'Global',
        startTime: '0-5 Minutes',
        videoFormat: 'All Link | Post + Reels + IGTV',
        features: ['Start: 0-5 minutes', 'Safe for all accounts', 'Instant delivery', 'Cancel button', 'Speed 50k per day'],
        minQuantity: 50,
        maxQuantity: 50000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Start: 0-5 minutes', 'Safe for all accounts', 'Instant notification delivery'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'srv_ig_likes_2',
        serviceId: 331,
        name: 'Instagram Likes | Real Active Accounts + Impressions',
        category: 'instagram',
        categoryName: 'Instagram',
        serviceType: 'Instagram Likes',
        shortDescription: 'Real likes with post impressions, reach, and profile visits bundled.',
        description: 'Boost engagement rate and impressions simultaneously with high authority active accounts.',
        price: 1.35,
        ratePer1k: 1.35,
        deliveryTime: '0-15 min',
        speed: '15k/day',
        speedTier: 'Medium',
        refill: '30 Days Refill',
        linkType: 'Instagram Post/Reel Link',
        location: 'Global',
        startTime: '0-15 Minutes',
        videoFormat: 'All Link | Post + Reels + IGTV',
        features: ['Likes + Reach + Impressions', 'Elevates post reach', 'Organic engagement ratio', 'Cancel button'],
        minQuantity: 50,
        maxQuantity: 25000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Likes + Reach + Impressions', 'Elevates post reach', 'Organic engagement ratio'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // 4. Instagram Comments
      {
        id: 'srv_ig_comments_1',
        name: 'Instagram Random Positive Comments [Real Emojis]',
        category: 'instagram',
        categoryName: 'Instagram',
        serviceType: 'Instagram Comments',
        shortDescription: 'Natural encouraging positive comments with emojis from realistic profiles.',
        description: 'Contextually relevant positive comments (e.g. "Amazing post! 🔥", "Love this content!") from active looking accounts.',
        price: 12.50,
        ratePer1k: 12.50,
        deliveryTime: '0-1 Hour',
        speed: '500/day',
        refill: 'Non-Drop',
        minQuantity: 10,
        maxQuantity: 2000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Positive engaging copy', 'Realistic profiles with pictures', 'Spread evenly across post'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'srv_ig_comments_2',
        name: 'Instagram Custom Relevant Comments [Niche Specific]',
        category: 'instagram',
        categoryName: 'Instagram',
        serviceType: 'Instagram Comments',
        shortDescription: 'Custom text comments provided by you (one per line).',
        description: 'Specify your exact comments in order notes or let our system generate hyper-niche discussions.',
        price: 18.00,
        ratePer1k: 18.00,
        deliveryTime: '0-2 Hours',
        speed: '300/day',
        refill: 'Lifetime Refill',
        minQuantity: 5,
        maxQuantity: 1000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Custom text line by line', 'Native English / Multilingual', 'High authority comments'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // 5. Instagram Comment Likes
      {
        id: 'srv_ig_comm_likes_1',
        name: 'Instagram Top Comment Likes / Upvotes [Rank Booster]',
        category: 'instagram',
        categoryName: 'Instagram',
        serviceType: 'Instagram Comment Likes',
        shortDescription: 'Pin and push any comment to the very top of the comment section.',
        description: 'Upvotes directly targeted at a specific comment link or username comment to make it top ranked.',
        price: 3.20,
        ratePer1k: 3.20,
        deliveryTime: 'Instant',
        speed: '2k/day',
        refill: 'Non-Drop',
        minQuantity: 25,
        maxQuantity: 5000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Pushes comment to rank #1', 'High conversion for pinned promos', 'Direct comment target'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // 6. Instagram Story Views
      {
        id: 'srv_ig_story_1',
        name: 'Instagram Story Views [Instant All Stories + Swipe Ups]',
        category: 'instagram',
        categoryName: 'Instagram',
        serviceType: 'Instagram Story Views',
        shortDescription: 'Instant views across all currently active stories on your profile.',
        description: 'Increases story engagement metrics and viewer list counts immediately for current 24-hour stories.',
        price: 0.70,
        ratePer1k: 0.70,
        deliveryTime: 'Instant',
        speed: '50k/day',
        refill: 'Active Stories Only',
        minQuantity: 100,
        maxQuantity: 100000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Covers all active 24h stories', 'Instant delivery within 5 minutes', 'Increases story reach'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // 7. Instagram Shares
      {
        id: 'srv_ig_shares_1',
        name: 'Instagram Post & Reel Shares [Explore Push]',
        category: 'instagram',
        categoryName: 'Instagram',
        serviceType: 'Instagram Shares',
        shortDescription: 'Shares to Direct Messages and external apps to maximize algorithmic score.',
        description: 'The share button is the highest weighted algorithmic signal on Instagram reels. Boost your share count.',
        price: 1.10,
        ratePer1k: 1.10,
        deliveryTime: '0-15 min',
        speed: '25k/day',
        refill: 'Non-Drop',
        minQuantity: 50,
        maxQuantity: 50000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['DM and External Share signals', 'Triggers viral discovery', 'Safe for all accounts'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // 8. Instagram Saves
      {
        id: 'srv_ig_saves_1',
        name: 'Instagram Post Saves & Bookmarks [Algorithm Rank]',
        category: 'instagram',
        categoryName: 'Instagram',
        serviceType: 'Instagram Saves',
        shortDescription: 'High authority saves and collection bookmarks for feed posts.',
        description: 'Saves signal valuable reference content to Meta algorithms, increasing longevity in the feed.',
        price: 0.95,
        ratePer1k: 0.95,
        deliveryTime: '0-15 min',
        speed: '20k/day',
        refill: 'Non-Drop',
        minQuantity: 50,
        maxQuantity: 50000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Permanent collection saves', 'Boosts search discovery', 'Works on Carousels & Reels'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // 9. Instagram Live
      {
        id: 'srv_ig_live_1',
        name: 'Instagram Live Stream Viewers [30 Minutes Duration]',
        category: 'instagram',
        categoryName: 'Instagram',
        serviceType: 'Instagram Live',
        shortDescription: 'Live concurrent viewers holding presence during your live broadcast.',
        description: 'Maintain high concurrent viewer counts while you stream. Viewers join within 2 minutes of going live.',
        price: 6.50,
        ratePer1k: 6.50,
        deliveryTime: 'Instant Start',
        speed: 'Instant Concurrent',
        refill: '30 Min Duration',
        minQuantity: 20,
        maxQuantity: 5000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Instant join within 2 minutes', 'Holds for 30 minutes', 'Increases live explore visibility'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // 10. Instagram Poll Votes
      {
        id: 'srv_ig_poll_1',
        name: 'Instagram Story Poll & Quiz Votes [Custom Option]',
        category: 'instagram',
        categoryName: 'Instagram',
        serviceType: 'Instagram Poll Votes',
        shortDescription: 'Targeted votes on any story poll, slider, or multiple choice question.',
        description: 'Specify which option (e.g. Option 1, Option A, or 100% on slider) you want the votes delivered to.',
        price: 2.80,
        ratePer1k: 2.80,
        deliveryTime: '0-15 min',
        speed: '5k/day',
        refill: 'Story Lifetime',
        minQuantity: 50,
        maxQuantity: 10000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Choose Option A/B/C/D', 'Natural voting spread', 'Real account profiles'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // --- YOUTUBE SERVICES ---
      {
        id: 'srv_yt_views_1',
        name: 'YouTube High Retention Views [Speed: 20k/day] [Monetizable]',
        category: 'youtube',
        categoryName: 'YouTube',
        serviceType: 'YouTube Views',
        shortDescription: 'Monetization-safe views with 5-10+ minute retention duration.',
        description: 'Safe for AdSense monetized videos. Sourced from external embeds and search keywords.',
        price: 1.85,
        ratePer1k: 1.85,
        deliveryTime: '0-2 Hours',
        speed: '20k/day',
        refill: 'Lifetime Guarantee',
        minQuantity: 500,
        maxQuantity: 500000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Retention 5-10+ minutes', 'AdSense safe', 'Non-drop guaranteed'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'srv_yt_subs_1',
        name: 'YouTube Real Subscribers [Non-Drop - 30D Refill]',
        category: 'youtube',
        categoryName: 'YouTube',
        serviceType: 'YouTube Subscribers',
        shortDescription: 'High quality channel subscribers that stick and count towards 1k partner requirement.',
        description: 'Helps reach the YouTube Partner Program 1,000 subscribers requirement safely.',
        price: 18.50,
        ratePer1k: 18.50,
        deliveryTime: '1-3 Hours',
        speed: '200-500/day',
        refill: '30 Days Refill',
        minQuantity: 50,
        maxQuantity: 10000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Real channel subscribers', 'Safe organic drip rate', 'Counts toward Partner Program'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'srv_yt_likes_1',
        name: 'YouTube Video Likes [Instant Start - Safe]',
        category: 'youtube',
        categoryName: 'YouTube',
        serviceType: 'YouTube Likes',
        shortDescription: 'Positive thumbs up on any video to boost CTR and engagement score.',
        description: 'Instant delivery likes from diverse geographic accounts. 100% permanent.',
        price: 3.50,
        ratePer1k: 3.50,
        deliveryTime: 'Instant',
        speed: '10k/day',
        refill: 'Permanent Non-Drop',
        minQuantity: 50,
        maxQuantity: 25000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Instant start', 'Permanent likes', 'AdSense friendly'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // --- TELEGRAM SERVICES ---
      {
        id: 'srv_tg_members_1',
        name: 'Telegram Channel Members [HQ Global - 0% Drop]',
        category: 'telegram',
        categoryName: 'Telegram',
        serviceType: 'Telegram Channel Members',
        shortDescription: 'Fast, stable channel and group members that do not drop over time.',
        description: 'Boost social proof and credibility of any public or private Telegram broadcast channel.',
        price: 2.20,
        ratePer1k: 2.20,
        deliveryTime: '0-15 min',
        speed: '15k/day',
        refill: '60 Days Refill',
        minQuantity: 100,
        maxQuantity: 50000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Works on Public & Private links', 'Non-drop guarantee', 'Fast join speed'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'srv_tg_views_1',
        name: 'Telegram Post Views [Instant Delivery]',
        category: 'telegram',
        categoryName: 'Telegram',
        serviceType: 'Telegram Post Views',
        shortDescription: 'Instant eye-views on your recent channel posts.',
        description: 'Match your post view count to your member base for authentic community presentation.',
        price: 0.25,
        ratePer1k: 0.25,
        deliveryTime: 'Instant',
        speed: '50k/day',
        refill: 'Non-Drop',
        minQuantity: 100,
        maxQuantity: 200000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Instant delivery', 'Select single or multiple posts', 'High view velocity'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // --- FACEBOOK SERVICES ---
      {
        id: 'srv_fb_likes_1',
        name: 'Facebook Page Likes & Followers [HQ Global]',
        category: 'facebook',
        categoryName: 'Facebook',
        serviceType: 'Facebook Page Likes',
        shortDescription: 'Real page likes and followers that appear on your business page profile.',
        description: 'Build enterprise brand credibility on your official Meta business page.',
        price: 4.50,
        ratePer1k: 4.50,
        deliveryTime: '1-2 Hours',
        speed: '3k/day',
        refill: '30 Days Refill',
        minQuantity: 100,
        maxQuantity: 25000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Followers + Likes', 'HQ profiles with avatars', 'Non-drop guarantee'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // --- TIKTOK SERVICES ---
      {
        id: 'srv_tt_views_1',
        name: 'TikTok Video Views [Super Fast 500k/day]',
        category: 'tiktok',
        categoryName: 'TikTok',
        serviceType: 'TikTok Views',
        shortDescription: 'Ultra rapid views designed to push new TikToks onto the FYP algorithm.',
        description: 'High velocity view delivery with high completion rates for TikTok algorithms.',
        price: 0.20,
        ratePer1k: 0.20,
        deliveryTime: 'Instant',
        speed: '500k/day',
        refill: 'Lifetime Guarantee',
        minQuantity: 500,
        maxQuantity: 5000000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Instant 0-1 min start', 'FYP boost signals', 'Full duration watch time'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'srv_tt_followers_1',
        name: 'TikTok Followers [HQ Real Accounts - Safe]',
        category: 'tiktok',
        categoryName: 'TikTok',
        serviceType: 'TikTok Followers',
        shortDescription: 'Unlock LIVE streaming capability by reaching 1,000+ followers.',
        description: 'Quality profile followers with videos and avatars to unlock TikTok creator features.',
        price: 3.80,
        ratePer1k: 3.80,
        deliveryTime: '0-1 Hour',
        speed: '5k/day',
        refill: '30 Days Refill',
        minQuantity: 100,
        maxQuantity: 50000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Unlocks TikTok LIVE requirement', 'Zero drop rate', 'Natural organic pacing'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // --- TWITTER / X SERVICES ---
      {
        id: 'srv_tw_followers_1',
        name: 'Twitter / X Followers [HQ Profiles with Avatars]',
        category: 'twitter',
        categoryName: 'Twitter / X',
        serviceType: 'Twitter Followers',
        shortDescription: 'Established profiles with header photos and organic tweet history.',
        description: 'Solidify authority on X with high quality profile followers.',
        price: 8.50,
        ratePer1k: 8.50,
        deliveryTime: '1-2 Hours',
        speed: '2k/day',
        refill: '30 Days Refill',
        minQuantity: 50,
        maxQuantity: 20000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Profiles with bios & tweets', 'Natural growth pace', 'Refill protection'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'srv_tw_retweets_1',
        name: 'Twitter / X Retweets & Reposts [Instant Start]',
        category: 'twitter',
        categoryName: 'Twitter / X',
        serviceType: 'Twitter Retweets',
        shortDescription: 'Spreads your tweets and threads across the algorithm.',
        description: 'Drive high algorithmic impressions and feed distribution for important announcements.',
        price: 4.20,
        ratePer1k: 4.20,
        deliveryTime: 'Instant',
        speed: '5k/day',
        refill: 'Non-Drop',
        minQuantity: 50,
        maxQuantity: 10000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Instant start', 'Increases thread reach', 'High quality retweeters'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // --- SPOTIFY SERVICES ---
      {
        id: 'srv_sp_plays_1',
        name: 'Spotify Track Plays [Royalty Eligible - US/Global]',
        category: 'spotify',
        categoryName: 'Spotify',
        serviceType: 'Spotify Plays',
        shortDescription: 'Royalty eligible streams with 90+ second playback duration.',
        description: 'Organic algorithm pitching streams that count toward chart ranks and Spotify for Artists stats.',
        price: 1.60,
        ratePer1k: 1.60,
        deliveryTime: '0-2 Hours',
        speed: '10k/day',
        refill: 'Lifetime Guarantee',
        minQuantity: 1000,
        maxQuantity: 1000000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Royalty eligible streams', '90s+ average duration', 'Reflects in Spotify for Artists'],
        createdAt: isoNow,
        updatedAt: isoNow,
      },

      // --- SOUNDCLOUD SERVICES ---
      {
        id: 'srv_sc_plays_1',
        name: 'SoundCloud Track Plays [HQ Worldwide]',
        category: 'soundcloud',
        categoryName: 'SoundCloud',
        serviceType: 'SoundCloud Plays',
        shortDescription: 'High quality continuous track plays for music producers and DJs.',
        description: 'Instant play velocity on your new tracks to attract playlist curators.',
        price: 0.90,
        ratePer1k: 0.90,
        deliveryTime: 'Instant',
        speed: '20k/day',
        refill: 'Non-Drop',
        minQuantity: 500,
        maxQuantity: 500000,
        unitLabel: 'per 1,000',
        status: 'active',
        deliverables: ['Instant playback start', 'Supports private and public tracks', 'High engagement'],
        createdAt: isoNow,
        updatedAt: isoNow,
      }
    ];

    initialServices.forEach(s => this.services.set(s.id, s));

    // 4. Seed Connected Instagram Account (Alex Morgan)
    const igAccount: InstagramAccount = {
      id: 'iga_01',
      customerId: customerUser1.id,
      instagramUserId: '17841405829281726',
      username: 'alexmorgan.fit',
      name: 'Alex Morgan | High Performance Coaching',
      profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      followersCount: 48920,
      followingCount: 684,
      mediaCount: 412,
      accountType: 'BUSINESS',
      connectedFacebookPage: 'Morgan Fitness Official',
      authorizedPermissions: [
        'instagram_basic',
        'instagram_content_publish',
        'instagram_manage_insights',
        'pages_show_list'
      ],
      accessTokenExpiresAt: new Date(now.getTime() + 60 * 86400000).toISOString(), // 60-day long-lived token
      isConnected: true,
      lastSyncedAt: new Date(now.getTime() - 15 * 60000).toISOString(),
      createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
      updatedAt: isoNow,
    };
    this.instagramAccounts.set(igAccount.id, igAccount);

    // 5. Seed SMM Orders
    const order1: Order = {
      id: 'ORD-9842',
      customerId: customerUser1.id,
      customerName: customerUser1.fullName,
      customerEmail: customerUser1.email,
      serviceId: 'srv_ig_views_1',
      serviceName: 'Instagram Views [HQ Instant] [Start: 0-1h] [Speed: 100k/D]',
      serviceCategory: 'instagram',
      targetAccount: 'https://www.instagram.com/reel/C3x918Lpz/',
      targetUrl: 'https://www.instagram.com/reel/C3x918Lpz/',
      quantity: 5000,
      totalPrice: 2.25,
      requirements: {},
      amount: 2.25,
      discountApplied: 0,
      finalAmount: 2.25,
      status: 'completed',
      paymentId: 'PAY-8910',
      timeline: [
        {
          id: 'tl_1',
          status: 'pending',
          title: 'Order Placed',
          description: '5,000 views queued for reel URL.',
          timestamp: new Date(now.getTime() - 4 * 86400000).toISOString(),
          updatedBy: 'customer'
        },
        {
          id: 'tl_2',
          status: 'paid',
          title: 'Payment Debited',
          description: '$2.25 paid from account balance.',
          timestamp: new Date(now.getTime() - 4 * 86400000 + 120000).toISOString(),
          updatedBy: 'system'
        },
        {
          id: 'tl_3',
          status: 'processing',
          title: 'Delivery In Progress',
          description: 'High velocity dispatch initiated at 100k/day rate.',
          timestamp: new Date(now.getTime() - 3 * 86400000).toISOString(),
          updatedBy: 'system'
        },
        {
          id: 'tl_4',
          status: 'completed',
          title: 'Order Completed',
          description: '5,000 / 5,000 views successfully delivered.',
          timestamp: new Date(now.getTime() - 2 * 86400000).toISOString(),
          updatedBy: 'system'
        }
      ],
      notes: 'Delivered in under 15 minutes.',
      createdAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
    };
    this.orders.set(order1.id, order1);

    const order2: Order = {
      id: 'ORD-9884',
      customerId: customerUser1.id,
      customerName: customerUser1.fullName,
      customerEmail: customerUser1.email,
      serviceId: 'srv_ig_followers_1',
      serviceName: 'Instagram Followers [HQ Real - 30D Refill Guarantee]',
      serviceCategory: 'instagram',
      targetAccount: 'https://instagram.com/alexmorgan.fit',
      targetUrl: 'https://instagram.com/alexmorgan.fit',
      quantity: 1000,
      totalPrice: 2.40,
      requirements: {},
      amount: 2.40,
      discountApplied: 0,
      finalAmount: 2.40,
      status: 'processing',
      paymentId: 'PAY-8945',
      timeline: [
        {
          id: 'tl_2_1',
          status: 'pending',
          title: 'Order Placed',
          description: '1,000 followers queued for @alexmorgan.fit.',
          timestamp: new Date(now.getTime() - 1 * 86400000).toISOString(),
          updatedBy: 'customer'
        },
        {
          id: 'tl_2_2',
          status: 'paid',
          title: 'Payment Debited',
          description: '$2.40 deducted from balance.',
          timestamp: new Date(now.getTime() - 1 * 86400000 + 60000).toISOString(),
          updatedBy: 'system'
        },
        {
          id: 'tl_2_3',
          status: 'processing',
          title: 'Dispatching Followers',
          description: 'Delivering naturally with 30D refill tracking active.',
          timestamp: new Date(now.getTime() - 18 * 3600000).toISOString(),
          updatedBy: 'system'
        }
      ],
      notes: '780 / 1000 delivered so far.',
      createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
      updatedAt: isoNow,
    };
    this.orders.set(order2.id, order2);

    const order3: Order = {
      id: 'ORD-9892',
      customerId: customerUser2.id,
      customerName: customerUser2.fullName,
      customerEmail: customerUser2.email,
      serviceId: 'srv_yt_views_1',
      serviceName: 'YouTube High Retention Views [Speed: 20k/day] [Monetizable]',
      serviceCategory: 'youtube',
      targetAccount: 'https://youtu.be/dQw4w9WgXcQ',
      targetUrl: 'https://youtu.be/dQw4w9WgXcQ',
      quantity: 2000,
      totalPrice: 3.70,
      requirements: {},
      amount: 3.70,
      discountApplied: 0,
      finalAmount: 3.70,
      status: 'pending',
      timeline: [
        {
          id: 'tl_3_1',
          status: 'pending',
          title: 'Order Received',
          description: 'Queued in delivery dispatcher.',
          timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
          updatedBy: 'customer'
        }
      ],
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    };
    this.orders.set(order3.id, order3);

    // 6. Seed Transactions and Payments
    const txn1: Transaction = {
      id: 'TXN-101',
      customerId: customerUser1.id,
      type: 'deposit',
      amount: 500.00,
      balanceAfter: 500.00,
      description: 'Funds Added via Stripe Payment (Card ending in 4242)',
      referenceId: 'pi_3MtwLwLkdIwHu7ix28a3tq5W',
      status: 'completed',
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    };
    this.transactions.set(txn1.id, txn1);

    const txn2: Transaction = {
      id: 'TXN-102',
      customerId: customerUser1.id,
      type: 'order_payment',
      amount: -84.55,
      balanceAfter: 415.45,
      description: 'Order Payment: ORD-9842 (Profile Audit)',
      referenceId: 'ORD-9842',
      status: 'completed',
      createdAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
    };
    this.transactions.set(txn2.id, txn2);

    const txn3: Transaction = {
      id: 'TXN-103',
      customerId: customerUser1.id,
      type: 'deposit',
      amount: 366.10,
      balanceAfter: 781.55,
      description: 'Balance Top-Up via Stripe Checkout Session',
      referenceId: 'pi_3MtwLwLkdIwHu7ix28a4zp9K',
      status: 'completed',
      createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
    };
    this.transactions.set(txn3.id, txn3);

    const txn4: Transaction = {
      id: 'TXN-104',
      customerId: customerUser1.id,
      type: 'order_payment',
      amount: -331.55,
      balanceAfter: 450.00,
      description: 'Order Payment: ORD-9884 (Organic Strategy)',
      referenceId: 'ORD-9884',
      status: 'completed',
      createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
    };
    this.transactions.set(txn4.id, txn4);

    // 7. Seed Support Tickets
    const ticket1: SupportTicket = {
      id: 'TCK-401',
      customerId: customerUser1.id,
      customerName: customerUser1.fullName,
      customerEmail: customerUser1.email,
      subject: 'Inquiry regarding custom Reels audio syncing',
      category: 'technical_support',
      priority: 'medium',
      status: 'open',
      relatedOrderId: 'ORD-9884',
      createdAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      lastReplyAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    };
    this.supportTickets.set(ticket1.id, ticket1);

    this.ticketMessages.set(ticket1.id, [
      {
        id: 'msg_1',
        ticketId: ticket1.id,
        senderId: customerUser1.id,
        senderName: customerUser1.fullName,
        senderRole: 'customer',
        message: 'Hi team! For the 20 posts in ORD-9884, do we have the ability to pre-specify commercial Instagram audio library tracks, or does the Meta API restrict commercial audio when scheduled automatically?',
        createdAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
      },
      {
        id: 'msg_2',
        ticketId: ticket1.id,
        senderId: adminUser.id,
        senderName: 'Sarah Vance',
        senderRole: 'admin',
        message: 'Hello Alex! Great question. Meta Content Publishing API allows automatic scheduling with native original audio or saved royalty-free tracks from Meta Sound Collection. If you want to use trending commercial music, we provide the draft directly in your Instagram Creator Studio for 1-click audio attachment!',
        createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      }
    ]);

    // 8. Seed Notifications
    this.notifications.set(customerUser1.id, [
      {
        id: 'notif_1',
        userId: customerUser1.id,
        title: 'Order Status Updated',
        message: 'Your order ORD-9884 has moved to Processing.',
        type: 'info',
        link: '/orders/ORD-9884',
        read: false,
        createdAt: new Date(now.getTime() - 18 * 3600000).toISOString(),
      },
      {
        id: 'notif_2',
        userId: customerUser1.id,
        title: 'Support Ticket Reply',
        message: 'Sarah Vance replied to ticket TCK-401.',
        type: 'success',
        link: '/support/TCK-401',
        read: false,
        createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      },
      {
        id: 'notif_3',
        userId: customerUser1.id,
        title: 'Official Meta Token Active',
        message: 'Your connected Instagram account @alexmorgan.fit is healthy and synced.',
        type: 'success',
        link: '/instagram',
        read: true,
        createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
      }
    ]);

    // 9. Seed Audit Logs
    this.auditLogs = [
      {
        id: 'aud_1',
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        actorRole: 'admin',
        action: 'SERVICE_CREATED',
        entityType: 'service',
        entityId: 'srv_reels_calendar',
        details: 'Created service: Reels Content Strategy & Scriptwriting Kit ($199.00)',
        ipAddress: '192.168.1.42',
        createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      },
      {
        id: 'aud_2',
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        actorRole: 'admin',
        action: 'ORDER_STATUS_CHANGED',
        entityType: 'order',
        entityId: 'ORD-9842',
        details: 'Status changed from processing to completed',
        ipAddress: '192.168.1.42',
        createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      },
      {
        id: 'aud_3',
        actorId: customerUser1.id,
        actorEmail: customerUser1.email,
        actorRole: 'customer',
        action: 'ORDER_PLACED',
        entityType: 'order',
        entityId: 'ORD-9884',
        details: 'Customer placed order with balance debit ($331.55)',
        ipAddress: '72.14.201.88',
        createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
      }
    ];
  }

  // Helper methods for transactions and orders
  logAudit(actorId: string, actorEmail: string, actorRole: 'admin' | 'customer', action: string, entityType: 'order' | 'service' | 'customer' | 'payment' | 'system', entityId: string, details: string, ip: string = '127.0.0.1') {
    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      actorId,
      actorEmail,
      actorRole,
      action,
      entityType,
      entityId,
      details,
      ipAddress: ip,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }

  addNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error', link?: string) {
    const list = this.notifications.get(userId) || [];
    const notif: Notification = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId,
      title,
      message,
      type,
      link,
      read: false,
      createdAt: new Date().toISOString(),
    };
    list.unshift(notif);
    this.notifications.set(userId, list);
  }
}

export const db = new InMemoryDatabase();
