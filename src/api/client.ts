import { 
  User, 
  Customer, 
  Admin, 
  Service, 
  Order, 
  Transaction, 
  Payment, 
  SupportTicket, 
  TicketMessage, 
  Notification, 
  InstagramAccount, 
  SystemSettings,
  AuditLog,
  PlatformCategory
} from '../types/database';

const TOKEN_KEY = 'instasmm_auth_token';

class ApiClient {
  private getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public setToken(token: string | null) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {}
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data;
  }

  // Auth
  async login(emailOrLogin: string, password: string): Promise<{
    user: User;
    token: string;
    customerProfile?: Customer | null;
    adminProfile?: Admin | null;
  }> {
    const res = await this.request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: emailOrLogin, login: emailOrLogin, password })
    });
    this.setToken(res.token);
    return res;
  }

  async register(data: { 
    fullName?: string; 
    name?: string; 
    email: string; 
    username?: string; 
    password: string; 
    mobileNo?: string; 
    phone?: string; 
    instagramHandle?: string 
  }): Promise<{
    user: User;
    token: string;
    customerProfile?: Customer | null;
  }> {
    const res = await this.request<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this.setToken(res.token);
    return res;
  }

  async getMe(): Promise<{
    user: User;
    customerProfile?: Customer | null;
    adminProfile?: Admin | null;
  }> {
    return this.request('/api/auth/me');
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch {}
    this.setToken(null);
  }

  // Categories
  async getCategories(): Promise<PlatformCategory[]> {
    const res = await this.request<{ success: boolean; categories: PlatformCategory[] }>('/api/categories');
    return res.categories;
  }

  async createCategory(data: Partial<PlatformCategory>): Promise<PlatformCategory> {
    const res = await this.request<{ success: boolean; category: PlatformCategory }>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.category;
  }

  async updateCategory(id: string, data: Partial<PlatformCategory>): Promise<PlatformCategory> {
    const res = await this.request<{ success: boolean; category: PlatformCategory }>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.category;
  }

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Services
  async getServices(): Promise<Service[]> {
    const res = await this.request<{ success: boolean; services: Service[] }>('/api/services');
    return res.services;
  }

  async getService(id: string): Promise<Service> {
    const res = await this.request<{ success: boolean; service: Service }>(`/api/services/${id}`);
    return res.service;
  }

  async getFavorites(): Promise<string[]> {
    try {
      const res = await this.request<{ success: boolean; favorites: string[] }>('/api/favorites');
      return res.favorites || [];
    } catch {
      return [];
    }
  }

  async toggleFavorite(serviceId: string): Promise<{ isFavorite: boolean; favorites: string[] }> {
    return this.request<{ success: boolean; isFavorite: boolean; favorites: string[] }>(`/api/favorites/${serviceId}/toggle`, {
      method: 'POST'
    });
  }

  async createService(data: Partial<Service>): Promise<Service> {
    const res = await this.request<{ success: boolean; service: Service }>('/api/services', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.service;
  }

  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    const res = await this.request<{ success: boolean; service: Service }>(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.service;
  }

  async deleteService(id: string): Promise<void> {
    await this.request(`/api/services/${id}`, { method: 'DELETE' });
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await this.request<{ success: boolean; orders: Order[] }>('/api/orders');
    return res.orders;
  }

  async getAdminOrders(): Promise<Order[]> {
    return this.getOrders();
  }

  async getOrder(id: string): Promise<Order> {
    const res = await this.request<{ success: boolean; order: Order }>(`/api/orders/${id}`);
    return res.order;
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
    const payload = {
      serviceId: data.serviceId,
      targetAccount: data.targetAccount || data.targetUrl || '@user',
      targetUrl: data.targetUrl || data.targetAccount || '@user',
      quantity: data.quantity || 1,
      customerNotes: data.customerNotes || '',
      requirements: data.requirements || (data.customerNotes ? { notes: data.customerNotes } : {}),
      paymentMethod: data.paymentMethod || 'balance'
    };
    const res = await this.request<{ success: boolean; order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.order;
  }

  async updateOrderStatus(id: string, status: string, note?: string): Promise<Order> {
    const res = await this.request<{ success: boolean; order: Order }>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note })
    });
    return res.order;
  }

  async refundOrder(id: string, reason?: string): Promise<{ order: Order; refundedAmount: number }> {
    return this.request(`/api/orders/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // Payments
  async createCheckoutSession(amount: number, purpose: string, orderId?: string) {
    return this.request<any>('/api/payments/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ amount, purpose, orderId })
    });
  }

  async topUpBalance(amount: number, method: string = 'stripe'): Promise<{ newBalance: number; transaction: Transaction }> {
    return this.request('/api/payments/top-up-balance', {
      method: 'POST',
      body: JSON.stringify({ amount, method })
    });
  }

  async createPayment(amount: number, method: string = 'card', currency: string = 'USD'): Promise<{ success: boolean; transaction: Transaction; newBalance: number }> {
    const res = await this.topUpBalance(amount, method);
    return { success: true, transaction: res.transaction, newBalance: res.newBalance };
  }

  async getTransactions(): Promise<Transaction[]> {
    const res = await this.request<{ success: boolean; transactions: Transaction[] }>('/api/payments/transactions');
    return res.transactions;
  }

  // Customers (Admin)
  async getCustomers(): Promise<Array<{ user: User; profile: Customer; ordersCount: number; lastOrder: Order | null }>> {
    const res = await this.request<any>('/api/customers');
    return res.customers;
  }

  async getAdminCustomers(): Promise<Customer[]> {
    const res = await this.request<any>('/api/customers');
    return (res.customers || []).map((item: any) => ({
      ...item.profile,
      fullName: item.user?.fullName,
      email: item.user?.email,
      status: item.user?.status || 'active',
    }));
  }

  async createCustomer(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    companyName?: string;
    initialBalance?: number;
    customDiscountPercent?: number;
    instagramHandle?: string;
    notes?: string;
  }): Promise<{ user: User; customerProfile: Customer }> {
    return this.request('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCustomer(
    id: string, 
    data: Partial<Customer & { fullName?: string; balanceAdjustment?: number; adjustmentReason?: string; status?: string }>
  ): Promise<{ user: User; profile: Customer }> {
    return this.request(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async setCustomerStatus(id: string, status: 'active' | 'disabled'): Promise<{ user: User }> {
    return this.request(`/api/customers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async resetCustomerPassword(id: string, newPassword: string): Promise<{ message: string }> {
    return this.request(`/api/customers/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    });
  }

  // Support
  async getTickets(): Promise<SupportTicket[]> {
    const res = await this.request<{ success: boolean; tickets: SupportTicket[] }>('/api/support/tickets');
    return res.tickets;
  }

  async getTicketDetail(id: string): Promise<{ ticket: SupportTicket; messages: TicketMessage[] }> {
    return this.request(`/api/support/tickets/${id}`);
  }

  async createTicket(data: {
    subject: string;
    category: string;
    priority: string;
    message: string;
    relatedOrderId?: string;
  }): Promise<{ ticket: SupportTicket; message: TicketMessage }> {
    return this.request('/api/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async replyTicket(id: string, message: string): Promise<{ ticket: SupportTicket; message: TicketMessage }> {
    return this.request(`/api/support/tickets/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  async addTicketReply(id: string, message: string): Promise<SupportTicket> {
    const res = await this.replyTicket(id, message);
    return res.ticket;
  }

  async updateTicketStatus(id: string, status: string): Promise<{ ticket: SupportTicket }> {
    return this.request(`/api/support/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Instagram Integration
  async getInstagramAuthUrl(): Promise<{ authUrl: string; configured: boolean; requiredScopes: string[] }> {
    return this.request('/api/instagram/auth-url');
  }

  async getInstagramStatus(): Promise<{ connected: boolean; account: InstagramAccount | null }> {
    return this.request('/api/instagram/status');
  }

  async disconnectInstagram(): Promise<void> {
    await this.request('/api/instagram/disconnect', { method: 'POST' });
  }

  async connectDemoInstagram(username: string): Promise<{ account: InstagramAccount }> {
    return this.request('/api/instagram/connect-demo', {
      method: 'POST',
      body: JSON.stringify({ username })
    });
  }

  async getInstagramAnalytics(): Promise<any> {
    const res = await this.request<any>('/api/instagram/analytics');
    return res.metrics;
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
    recentAuditLogs: any[];
  }> {
    return this.request('/api/admin/stats');
  }

  async getAdminAuditLogs(): Promise<AuditLog[]> {
    const res = await this.request<any>('/api/admin/stats');
    return (res.recentAuditLogs || []).map((l: any) => ({
      ...l,
      actorName: l.actorName || 'Admin Operator',
      targetId: l.targetId || l.entityId || 'SYS',
      action: l.action || 'MUTATION',
    }));
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const res = await this.request<{ success: boolean; notifications: Notification[] }>('/api/notifications');
    return res.notifications;
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.request(`/api/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.request('/api/notifications/read-all', { method: 'PATCH' });
  }

  // Settings
  async getSettings(): Promise<SystemSettings> {
    const res = await this.request<{ success: boolean; settings: SystemSettings }>('/api/settings');
    return res.settings;
  }

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await this.request<{ success: boolean; settings: SystemSettings }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.settings;
  }
}

export const api = new ApiClient();
