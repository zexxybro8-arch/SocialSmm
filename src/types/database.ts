/**
 * Complete Database Schema Types for Instagram SMM Management Panel
 * Reflects full relational database schema for PostgreSQL / Cloud SQL / MySQL
 */

export type UserRole = 'admin' | 'customer';

export type OrderStatus = 
  | 'pending'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded';

export type PaymentMethod = 
  | 'balance'
  | 'stripe'
  | 'paypal'
  | 'bank_transfer';

export type TicketStatus = 
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ServiceCategory = string;

export interface PlatformCategory {
  id: string;
  name: string;
  iconName: string; // 'Instagram' | 'Youtube' | 'Send' | 'Facebook' | 'Music2' | 'Twitter' | 'Disc' | 'Radio' | 'Layers'
  color: string;
  bgColor: string;
  description?: string;
  order: number;
  status: 'active' | 'inactive';
  servicesCount?: number;
}

// 1. Users table (Base credentials and identity)
export interface User {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'disabled';
}

// 2. Customers table (Extends users with billing, balance & custom pricing)
export interface Customer {
  id: string; // foreign key to users.id
  userId: string;
  username?: string;
  phone?: string;
  balance: number;
  spent: number;
  instagramHandle?: string;
  customDiscountPercent: number; // e.g. 10 for 10% discount
  companyName?: string;
  notes?: string;
  fullName?: string;
  email?: string;
  status?: 'active' | 'disabled' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// 3. Admins table
export interface Admin {
  id: string;
  userId: string;
  department: string;
  permissions: string[]; // e.g. ['all', 'manage_services', 'manage_orders']
  createdAt: string;
}

// 4. Services table (SMM panel services and packages)
export interface Service {
  id: string;
  serviceId?: number | string;
  name: string;
  category: ServiceCategory;
  categoryName?: string;
  serviceType?: string; // Grouping (e.g. "Instagram Views", "Instagram Followers", "Instagram Likes")
  description: string;
  shortDescription: string;
  price: number; // Rate per 1,000 (or unit price)
  ratePer1k?: number;
  deliveryTime: string; // e.g. "Instant (0-1h)", "Speed: 50k/day"
  speed?: string; // e.g. "100k/day"
  speedTier?: 'Fast' | 'Medium' | 'Slow';
  refill?: string; // e.g. "30 Days Guarantee"
  linkType?: string; // e.g. "Instagram Video Link"
  location?: string; // e.g. "Global"
  startTime?: string; // e.g. "0-2 Minutes"
  videoFormat?: string; // e.g. "All Link | Video + Reels + IGTV"
  features?: string[];
  isFavorite?: boolean;
  status: 'active' | 'inactive';
  deliverables: string[];
  minQuantity?: number; // e.g. 100
  maxQuantity?: number; // e.g. 1000000
  unitLabel?: string; // e.g. "per 1,000", "1k"
  createdAt: string;
  updatedAt: string;
}

// 5. Orders table
export interface Order {
  id: string; // e.g. "ORD-9821"
  customerId: string;
  customerName: string;
  customerEmail: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: ServiceCategory;
  targetAccount: string; // Instagram handle (e.g. "@creatorbrand")
  targetUrl?: string;
  quantity?: number;
  totalPrice?: number;
  customerNotes?: string;
  requirements: Record<string, string>; // Special instructions, target niche, content themes
  amount: number;
  discountApplied: number;
  finalAmount: number;
  status: OrderStatus;
  paymentId?: string;
  timeline: OrderTimelineEvent[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderTimelineEvent {
  id: string;
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  updatedBy: string; // 'system' | admin name | 'customer'
}

// 6. Order Items table
export interface OrderItem {
  id: string;
  orderId: string;
  serviceId: string;
  serviceName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

// 7. Payments table (Stripe, Balance, etc.)
export interface Payment {
  id: string; // e.g. "PAY-5421"
  orderId?: string;
  customerId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  providerPaymentId?: string; // e.g. Stripe PaymentIntent "pi_..."
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 8. Transactions table (Ledger entries for balance deposits, debits, refunds)
export interface Transaction {
  id: string; // e.g. "TXN-1082"
  customerId: string;
  type: 'deposit' | 'order_payment' | 'refund' | 'adjustment';
  amount: number; // positive for credit, negative for debit
  balanceAfter: number;
  description: string;
  referenceId?: string; // orderId or paymentId
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

// 9. Support Tickets table
export interface SupportTicket {
  id: string; // e.g. "TCK-403"
  customerId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  relatedOrderId?: string;
  messages?: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  lastReplyAt: string;
}

// 10. Ticket Messages table
export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  attachments?: string[];
  createdAt: string;
}

// 11. Notifications table
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  read: boolean;
  createdAt: string;
}

// 12. Instagram Accounts table (Official Meta Graph API authorized accounts)
export interface InstagramAccount {
  id: string;
  customerId: string;
  instagramUserId: string;
  username: string;
  name: string;
  profilePictureUrl: string;
  followersCount: number;
  followingCount: number;
  mediaCount: number;
  accountType: 'BUSINESS' | 'CREATOR' | 'PERSONAL';
  connectedFacebookPage: string;
  authorizedPermissions: string[];
  accessTokenExpiresAt: string;
  isConnected: boolean;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

// 13. Audit Logs table (Security and admin actions)
export interface AuditLog {
  id: string;
  actorId: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: UserRole;
  action: string; // e.g. "SERVICE_PRICE_UPDATED", "CUSTOMER_PASSWORD_RESET"
  entityType?: 'order' | 'service' | 'customer' | 'payment' | 'system';
  entityId?: string;
  targetId?: string;
  details: any;
  ipAddress?: string;
  createdAt: string;
}

// 14. Settings table
export interface SystemSettings {
  id: string;
  siteName: string;
  supportEmail: string;
  currency: string;
  currencySymbol: string;
  minDepositAmount: number;
  maxDepositAmount: number;
  allowSelfRegistration: boolean;
  maintenanceMode: boolean;
  metaGraphApiVersion: string;
  stripeEnabled: boolean;
  testMode: boolean;
  updatedAt: string;
}
