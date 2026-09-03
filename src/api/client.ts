import { 
  User, 
  Customer, 
  Service, 
  Order, 
  Transaction, 
  SupportTicket, 
  TicketMessage, 
  Notification, 
  InstagramAccount, 
  SystemSettings,
  AuditLog,
  PlatformCategory
} from '../types/database';
import { auth } from '../config/firebase';
import { 
  getCategoriesFromFirestore,
  createCategoryInFirestore,
  updateCategoryInFirestore,
  deleteCategoryInFirestore,
  getServicesFromFirestore, 
  createServiceInFirestore,
  updateServiceInFirestore,
  deleteServiceInFirestore,
  getOrdersForUser, 
  getAllOrdersFromFirestore,
  createOrderInFirestore, 
  updateOrderStatusInFirestore,
  refundOrderInFirestore,
  getTransactionsForUser,
  getAllTransactionsFromFirestore,
  topUpBalanceInFirestore,
  getCustomersFromFirestore,
  createCustomerInFirestore,
  updateCustomerInFirestore,
  getTicketsFromFirestore,
  createTicketInFirestore,
  replyTicketInFirestore,
  updateTicketStatusInFirestore,
  getAdminStatsFromFirestore,
  getNotificationsFromFirestore,
  getSettingsFromFirestore,
  updateSettingsInFirestore,
  INITIAL_SERVICES 
} from '../services/firestoreService';

class ApiClient {
  // Categories (Pure Client-side Firestore)
  async getCategories(): Promise<PlatformCategory[]> {
    return getCategoriesFromFirestore();
  }

  async createCategory(data: Partial<PlatformCategory>): Promise<PlatformCategory> {
    return createCategoryInFirestore(data);
  }

  async updateCategory(id: string, data: Partial<PlatformCategory>): Promise<PlatformCategory> {
    return updateCategoryInFirestore(id, data);
  }

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    await deleteCategoryInFirestore(id);
    return { success: true, message: 'Category deleted' };
  }

  // Services (Pure Client-side Firestore)
  async getServices(): Promise<Service[]> {
    return getServicesFromFirestore();
  }

  async getService(id: string): Promise<Service> {
    const services = await this.getServices();
    const found = services.find(s => s.id === id || String(s.serviceId) === id);
    if (found) return found;
    return INITIAL_SERVICES[0];
  }

  async getFavorites(): Promise<string[]> {
    try {
      const key = `favs_${auth.currentUser?.uid || 'guest'}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return [];
  }

  async toggleFavorite(serviceId: string): Promise<{ isFavorite: boolean; favorites: string[] }> {
    const key = `favs_${auth.currentUser?.uid || 'guest'}`;
    let current: string[] = [];
    try {
      current = JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      current = [];
    }

    let next: string[];
    let isFav = false;
    if (current.includes(serviceId)) {
      next = current.filter(id => id !== serviceId);
    } else {
      next = [...current, serviceId];
      isFav = true;
    }
    localStorage.setItem(key, JSON.stringify(next));
    return { isFavorite: isFav, favorites: next };
  }

  async createService(data: Partial<Service>): Promise<Service> {
    return createServiceInFirestore(data);
  }

  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    return updateServiceInFirestore(id, data);
  }

  async deleteService(id: string): Promise<void> {
    await deleteServiceInFirestore(id);
  }

  // Orders (Pure Client-side Firestore)
  async getOrders(): Promise<Order[]> {
    if (auth.currentUser) {
      return getOrdersForUser(auth.currentUser.uid);
    }
    return [];
  }

  async getAdminOrders(): Promise<Order[]> {
    return getAllOrdersFromFirestore();
  }

  async getOrder(id: string): Promise<Order> {
    const orders = await getAllOrdersFromFirestore();
    const match = orders.find(o => o.id === id);
    if (match) return match;
    throw new Error('Order not found');
  }

  async createOrder(data: {
    serviceId: string;
    targetAccount?: string;
    targetUrl?: string;
    quantity?: number;
    customerNotes?: string;
    requirements?: Record<string, string>;
    paymentMethod?: 'balance' | 'stripe' | 'card';
  }): Promise<Order> {
    const services = await this.getServices();
    const service = services.find(s => s.id === data.serviceId || String(s.serviceId) === data.serviceId) || INITIAL_SERVICES[0];
    const qty = data.quantity || 1000;
    const rate = service.ratePer1k || service.price || 0.45;
    const calcPrice = Math.round(((rate * qty) / 1000) * 100) / 100;

    const uid = auth.currentUser?.uid || 'demo_user';
    const name = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Customer';
    const email = auth.currentUser?.email || 'customer@example.com';

    return createOrderInFirestore({
      userId: uid,
      customerName: name,
      customerEmail: email,
      serviceId: service.id,
      serviceName: service.name,
      serviceCategory: service.categoryName || service.category,
      link: data.targetUrl || data.targetAccount || '@user',
      targetUrl: data.targetUrl || data.targetAccount || '@user',
      targetAccount: data.targetAccount || data.targetUrl || '@user',
      quantity: qty,
      price: calcPrice,
      totalPrice: calcPrice,
      customerNotes: data.customerNotes || '',
    });
  }

  async updateOrderStatus(id: string, status: string, note?: string): Promise<Order> {
    return updateOrderStatusInFirestore(id, status, note);
  }

  async refundOrder(id: string, reason?: string): Promise<{ order: Order; refundedAmount: number }> {
    return refundOrderInFirestore(id, reason);
  }

  // Payments / Wallet Top-Up
  async createCheckoutSession(amount: number, purpose: string, orderId?: string) {
    return {
      success: true,
      sessionId: `cs_test_${Date.now()}`,
      url: window.location.href,
      amount,
      purpose,
      orderId,
    };
  }

  async topUpBalance(amount: number, method: string = 'stripe'): Promise<{ newBalance: number; transaction: Transaction }> {
    const uid = auth.currentUser?.uid || 'demo_user';
    return topUpBalanceInFirestore(uid, amount, method);
  }

  async createPayment(amount: number, method: string = 'card', currency: string = 'USD'): Promise<{ success: boolean; transaction: Transaction; newBalance: number }> {
    const res = await this.topUpBalance(amount, method);
    return { success: true, transaction: res.transaction, newBalance: res.newBalance };
  }

  async getTransactions(): Promise<Transaction[]> {
    if (auth.currentUser) {
      return getTransactionsForUser(auth.currentUser.uid);
    }
    return getAllTransactionsFromFirestore();
  }

  // Customers (Admin)
  async getCustomers(): Promise<Array<{ user: User; profile: Customer; ordersCount: number; lastOrder: Order | null }>> {
    return getCustomersFromFirestore();
  }

  async getAdminCustomers(): Promise<Customer[]> {
    const items = await getCustomersFromFirestore();
    return items.map(item => ({
      ...item.profile,
      fullName: item.user.fullName,
      email: item.user.email,
      status: item.user.status || 'active',
    }));
  }

  async createCustomer(data: {
    email: string;
    password?: string;
    fullName: string;
    phone?: string;
    companyName?: string;
    initialBalance?: number;
    customDiscountPercent?: number;
    instagramHandle?: string;
    notes?: string;
  }): Promise<{ user: User; customerProfile: Customer }> {
    const res = await createCustomerInFirestore({
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      initialBalance: data.initialBalance,
    });
    return { user: res.user, customerProfile: res.profile };
  }

  async updateCustomer(
    id: string, 
    data: Partial<Customer & { fullName?: string; balanceAdjustment?: number; adjustmentReason?: string; status?: string }>
  ): Promise<{ user: User; profile: Customer }> {
    return updateCustomerInFirestore(id, data);
  }

  async setCustomerStatus(id: string, status: 'active' | 'disabled'): Promise<{ user: User }> {
    const res = await updateCustomerInFirestore(id, { status });
    return { user: res.user };
  }

  async resetCustomerPassword(id: string, newPassword?: string): Promise<{ message: string }> {
    return { message: 'Password reset instructions dispatched' };
  }

  // Support Tickets
  async getTickets(): Promise<SupportTicket[]> {
    const uid = auth.currentUser?.uid;
    return getTicketsFromFirestore(uid, false);
  }

  async getTicketDetail(id: string): Promise<{ ticket: SupportTicket; messages: TicketMessage[] }> {
    const tickets = await getTicketsFromFirestore(undefined, true);
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    return { ticket, messages: ticket.messages || [] };
  }

  async createTicket(data: {
    subject: string;
    category: string;
    priority: string;
    message: string;
    relatedOrderId?: string;
  }): Promise<{ ticket: SupportTicket; message: TicketMessage }> {
    const uid = auth.currentUser?.uid || 'guest';
    const name = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Customer';
    const email = auth.currentUser?.email || '';

    return createTicketInFirestore({
      userId: uid,
      userName: name,
      userEmail: email,
      subject: data.subject,
      category: data.category,
      priority: data.priority,
      message: data.message,
      relatedOrderId: data.relatedOrderId,
    });
  }

  async replyTicket(id: string, message: string): Promise<{ ticket: SupportTicket; message: TicketMessage }> {
    const uid = auth.currentUser?.uid || 'system';
    const name = auth.currentUser?.displayName || 'Operator';
    return replyTicketInFirestore(id, uid, name, 'customer', message);
  }

  async addTicketReply(id: string, message: string): Promise<SupportTicket> {
    const res = await this.replyTicket(id, message);
    return res.ticket;
  }

  async updateTicketStatus(id: string, status: string): Promise<{ ticket: SupportTicket }> {
    const ticket = await updateTicketStatusInFirestore(id, status);
    return { ticket };
  }

  // Instagram Integration (Frontend State)
  async getInstagramAuthUrl(): Promise<{ authUrl: string; configured: boolean; requiredScopes: string[] }> {
    return {
      authUrl: window.location.href,
      configured: true,
      requiredScopes: ['instagram_basic', 'instagram_manage_insights']
    };
  }

  async getInstagramStatus(): Promise<{ connected: boolean; account: InstagramAccount | null }> {
    try {
      const stored = localStorage.getItem('ig_account_connected');
      if (stored) {
        return { connected: true, account: JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return { connected: false, account: null };
  }

  async disconnectInstagram(): Promise<void> {
    localStorage.removeItem('ig_account_connected');
  }

  async connectDemoInstagram(username: string): Promise<{ account: InstagramAccount }> {
    const handle = username.replace('@', '').trim() || 'smm_brand_official';
    const now = new Date().toISOString();
    const account: InstagramAccount = {
      id: `ig_${Date.now()}`,
      customerId: auth.currentUser?.uid || 'guest',
      instagramUserId: '17841400000000001',
      username: handle,
      name: `${handle.charAt(0).toUpperCase() + handle.slice(1)} Official`,
      profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      followersCount: 48920,
      followingCount: 620,
      mediaCount: 142,
      accountType: 'BUSINESS',
      connectedFacebookPage: 'FB Brand Page',
      authorizedPermissions: ['instagram_basic', 'instagram_manage_insights'],
      accessTokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      isConnected: true,
      lastSyncedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    localStorage.setItem('ig_account_connected', JSON.stringify(account));
    return { account };
  }

  async getInstagramAnalytics(): Promise<any> {
    const status = await this.getInstagramStatus();
    const handle = status.account?.username || 'brand';

    return {
      overview: {
        totalFollowers: status.account?.followersCount || 48920,
        followersGrowth: 12.4,
        averageEngagementRate: 4.85,
        totalReach: 184200,
        totalImpressions: 412000,
        profileViews: 18450,
      },
      chartData: [
        { date: 'Mon', followers: 47200, reach: 24000, engagement: 4.2 },
        { date: 'Tue', followers: 47550, reach: 28500, engagement: 4.5 },
        { date: 'Wed', followers: 47900, reach: 31000, engagement: 4.7 },
        { date: 'Thu', followers: 48200, reach: 29800, engagement: 4.6 },
        { date: 'Fri', followers: 48500, reach: 36200, engagement: 5.1 },
        { date: 'Sat', followers: 48750, reach: 41000, engagement: 5.4 },
        { date: 'Sun', followers: 48920, reach: 39500, engagement: 5.0 },
      ],
      topPosts: [
        {
          id: 'p_1',
          caption: `Exclusive Strategy Reel for @${handle} #SMM #Growth`,
          likes: 4280,
          comments: 312,
          shares: 580,
          saved: 920,
          type: 'REEL',
          url: 'https://instagram.com'
        }
      ]
    };
  }

  // Admin Stats
  async getAdminStats(): Promise<{
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
  }> {
    return getAdminStatsFromFirestore();
  }

  async getAdminAuditLogs(): Promise<AuditLog[]> {
    const res = await getAdminStatsFromFirestore();
    return res.recentAuditLogs;
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const uid = auth.currentUser?.uid || 'guest';
    return getNotificationsFromFirestore(uid);
  }

  async markNotificationRead(id: string): Promise<void> {
    try {
      const key = `read_notif_${id}`;
      localStorage.setItem(key, 'true');
    } catch {
      // Fallback
    }
  }

  async markAllNotificationsRead(): Promise<void> {
    try {
      localStorage.setItem('all_notifs_read', 'true');
    } catch {
      // Fallback
    }
  }

  // System Settings
  async getSettings(): Promise<SystemSettings> {
    return getSettingsFromFirestore();
  }

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    return updateSettingsInFirestore(data);
  }
}

export const api = new ApiClient();
