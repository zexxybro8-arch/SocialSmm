import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ToastProvider, useToast } from './components/Toast';
import { api } from './api/client';
import { PlatformCategory, Service, Order, Customer } from './types/database';
import { BRANDING } from './config/branding';

// Mobile-First Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CreateAccountPage } from './pages/CreateAccountPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { CategoryServicesPage } from './pages/CategoryServicesPage';
import { CreateOrderPage } from './pages/CreateOrderPage';
import { PaymentPage } from './pages/PaymentPage';
import { OrdersPage } from './pages/OrdersPage';
import { MenuPage } from './pages/MenuPage';
import { BottomNav } from './components/BottomNav';
import { TopUpModal } from './components/TopUpModal';

// Admin Pages
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/AdminDashboard';
import { CategoryManagement } from './admin/CategoryManagement';
import { ServiceManagement } from './admin/ServiceManagement';
import { OrderManagement } from './admin/OrderManagement';
import { CustomerManagement } from './admin/CustomerManagement';
import { FinanceLedger } from './admin/FinanceLedger';
import { AdminSupportQueue } from './admin/AdminSupportQueue';
import { AdminSettingsView } from './admin/AdminSettingsView';

// Subviews & Modals
import { SupportTicketsView } from './customer/SupportTicketsView';
import { BillingView } from './customer/BillingView';
import { Modal } from './components/Modal';
import { Bell, CheckCircle2, ShieldCheck, X } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, customerProfile, isLoading, logout, refreshProfile } = useAuth();
  const { toast } = useToast();

  // Non-logged-in Screen State: 'landing' | 'login' | 'register'
  const [authScreen, setAuthScreen] = useState<'landing' | 'login' | 'register'>('landing');

  // Customer Navigation State
  const [activeTab, setActiveTab] = useState<'orders' | 'create' | 'menu'>('create');

  // Order Flow State (under 'create' tab)
  const [selectedCategory, setSelectedCategory] = useState<PlatformCategory | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [orderDraft, setOrderDraft] = useState<{
    service: Service;
    targetUrl: string;
    quantity: number;
    totalPrice: number;
    customerNotes: string;
  } | null>(null);

  // Admin View State
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Modals & Panels
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [isBillingOpen, setIsBillingOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Live Data State
  const [categories, setCategories] = useState<PlatformCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Sync admin view if user logs in as admin
  useEffect(() => {
    if (user?.role === 'admin') {
      setIsAdminView(true);
    } else {
      setIsAdminView(false);
    }
  }, [user]);

  // Load app data
  const loadData = async () => {
    if (!user) return;
    try {
      setDataLoading(true);
      const [cats, srvs, ords] = await Promise.all([
        api.getCategories(),
        api.getServices(),
        api.getOrders(),
      ]);
      setCategories(cats);
      setServices(srvs);
      setOrders(ords);

      // Check if URL specifies an order route
      const hash = window.location.hash;
      if (hash.startsWith('#/order/')) {
        const parts = hash.replace('#/order/', '').split('/');
        const srvParam = parts[1] || parts[0];
        const matchingSrv = srvs.find(
          s => String(s.serviceId) === srvParam || s.id === srvParam || s.id === `srv_${srvParam}` || s.id.endsWith(srvParam)
        );
        if (matchingSrv) {
          const matchingCat = cats.find(c => c.id === matchingSrv.category || c.name.toLowerCase() === (parts[0] || '').toLowerCase()) || cats[0];
          setSelectedCategory(matchingCat);
          setSelectedService(matchingSrv);
          setActiveTab('create');
        }
      }
    } catch (e) {
      console.error('Failed to load initial data:', e);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/order/') && services.length > 0) {
        const parts = hash.replace('#/order/', '').split('/');
        const srvParam = parts[1] || parts[0];
        const matchingSrv = services.find(
          s => String(s.serviceId) === srvParam || s.id === srvParam || s.id === `srv_${srvParam}` || s.id.endsWith(srvParam)
        );
        if (matchingSrv) {
          const matchingCat = categories.find(c => c.id === matchingSrv.category || c.name.toLowerCase() === (parts[0] || '').toLowerCase()) || categories[0];
          setSelectedCategory(matchingCat);
          setSelectedService(matchingSrv);
          setActiveTab('create');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [services, categories]);

  // Handlers
  const handleSelectCategory = (cat: PlatformCategory) => {
    setSelectedCategory(cat);
    setSelectedService(null);
    setOrderDraft(null);
  };

  const handleSelectService = (srv: Service) => {
    setSelectedService(srv);
    setOrderDraft(null);
    const catId = srv.category || 'instagram';
    const srvParam = srv.serviceId ? String(srv.serviceId) : srv.id.replace('srv_', '');
    window.location.hash = `/order/${catId}/${srvParam}`;
  };

  const handleProceedToPayment = (draft: {
    service: Service;
    targetUrl: string;
    quantity: number;
    totalPrice: number;
    customerNotes: string;
  }) => {
    setOrderDraft(draft);
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    // Reset order flow and go to Orders tab
    setSelectedCategory(null);
    setSelectedService(null);
    setOrderDraft(null);
    setActiveTab('orders');
    toast('success', `Order #${newOrder.id.replace('ord_', '')} placed successfully!`);
  };

  const resetCreateFlow = () => {
    setSelectedCategory(null);
    setSelectedService(null);
    setOrderDraft(null);
  };

  const handleTabChange = (tab: 'orders' | 'create' | 'menu') => {
    if (tab === 'create' && activeTab === 'create') {
      // If tapping Create while already in Create, reset to Category list
      resetCreateFlow();
    }
    setActiveTab(tab);
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center space-y-4 text-zinc-100">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center font-black text-zinc-950 text-xl shadow-xl shadow-emerald-950 animate-pulse">
          {BRANDING.BRAND_NAME.slice(0, 2).toUpperCase()}
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Loading {BRANDING.BRAND_NAME}...
        </p>
      </div>
    );
  }

  // Unauthenticated Views
  if (!user) {
    if (authScreen === 'login') {
      return (
        <LoginPage
          onBackToLanding={() => setAuthScreen('landing')}
          onGoToRegister={() => setAuthScreen('register')}
          onLoginSuccess={(role) => {
            if (role === 'admin') setIsAdminView(true);
            loadData();
          }}
        />
      );
    }

    if (authScreen === 'register') {
      return (
        <CreateAccountPage
          onBackToLanding={() => setAuthScreen('landing')}
          onGoToLogin={() => setAuthScreen('login')}
          onRegisterSuccess={() => loadData()}
        />
      );
    }

    return (
      <LandingPage
        onGoToLogin={() => setAuthScreen('login')}
        onGoToRegister={() => setAuthScreen('register')}
      />
    );
  }

  // ADMIN VIEW
  if (user.role === 'admin' && isAdminView) {
    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={(tab) => setAdminTab(tab)}
        onSwitchToCustomerView={() => setIsAdminView(false)}
        onLogout={logout}
      >
        {adminTab === 'dashboard' && <AdminDashboard onNavigate={(v) => setAdminTab(v.replace('admin-', ''))} />}
        {adminTab === 'categories' && (
          <CategoryManagement
            categories={categories}
            onRefreshCategories={loadData}
          />
        )}
        {adminTab === 'services' && <ServiceManagement />}
        {adminTab === 'orders' && <OrderManagement />}
        {adminTab === 'customers' && <CustomerManagement />}
        {adminTab === 'payments' && <FinanceLedger />}
        {adminTab === 'support' && <AdminSupportQueue />}
        {adminTab === 'settings' && <AdminSettingsView />}
      </AdminLayout>
    );
  }

  // CUSTOMER / CLIENT VIEW (MOBILE-FIRST)
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
      {/* Active Tab View Rendering */}
      {activeTab === 'create' && (
        <>
          {orderDraft ? (
            <PaymentPage
              orderData={orderDraft}
              customerProfile={customerProfile}
              onBack={() => setOrderDraft(null)}
              onOrderSuccess={handleOrderSuccess}
              onRefreshProfile={refreshProfile}
              onOpenTicket={() => setIsSupportOpen(true)}
            />
          ) : selectedService ? (
            <CreateOrderPage
              service={selectedService}
              customerProfile={customerProfile}
              onBack={() => {
                setSelectedService(null);
                if (window.location.hash.startsWith('#/order/')) {
                  window.location.hash = '';
                }
              }}
              onProceedToPayment={handleProceedToPayment}
              onOrderSuccess={handleOrderSuccess}
              onRefreshBalance={refreshProfile}
              onOpenTicket={() => setIsSupportOpen(true)}
            />
          ) : selectedCategory ? (
            <CategoryServicesPage
              category={selectedCategory}
              services={services}
              onBack={() => setSelectedCategory(null)}
              onSelectService={handleSelectService}
              onOpenTicket={() => setIsSupportOpen(true)}
            />
          ) : (
            <CustomerDashboard
              user={user}
              customerProfile={customerProfile}
              categories={categories}
              services={services}
              orders={orders}
              onSelectCategory={handleSelectCategory}
              onSelectService={(srv) => {
                const parentCat = categories.find((c) => c.id === srv.category) || categories[0];
                setSelectedCategory(parentCat);
                setSelectedService(srv);
              }}
              onNavigateToOrders={() => setActiveTab('orders')}
              onRefreshProfile={refreshProfile}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenTicket={() => setIsSupportOpen(true)}
              onSwitchRole={user.role === 'admin' ? () => setIsAdminView(true) : undefined}
            />
          )}
        </>
      )}

      {activeTab === 'orders' && (
        <OrdersPage
          orders={orders}
          onOpenTicket={() => setIsSupportOpen(true)}
          onRefreshOrders={loadData}
        />
      )}

      {activeTab === 'menu' && (
        <MenuPage
          user={user}
          customerProfile={customerProfile}
          onLogout={logout}
          onOpenTopUp={() => setIsTopUpOpen(true)}
          onOpenPayments={() => setIsBillingOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onGoToAdmin={user.role === 'admin' ? () => setIsAdminView(true) : undefined}
        />
      )}

      {/* Persistent Bottom Navigation (Fixed on mobile, elevated dock) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onChangeTab={handleTabChange}
        pendingOrdersCount={orders.filter(o => o.status === 'processing' || o.status === 'pending').length}
      />

      {/* Global Modals */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={() => {
          refreshProfile();
          setIsTopUpOpen(false);
          toast('success', 'Balance updated successfully!');
        }}
      />

      {/* Billing & Deposit History Modal */}
      {isBillingOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-zinc-950 border border-zinc-800 p-6 overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Payment & Recharge History</h3>
              <button
                onClick={() => setIsBillingOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <BillingView />
          </div>
        </div>
      )}

      {/* Support Tickets Modal */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-zinc-950 border border-zinc-800 p-6 overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Help & Inquiries Desk</h3>
              <button
                onClick={() => setIsSupportOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SupportTicketsView />
          </div>
        </div>
      )}

      {/* Account Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Account Settings</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.fullName || ''}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Email Address</label>
                <input
                  type="text"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Role / Permissions</label>
                <span className="inline-block px-2.5 py-1 rounded-lg bg-zinc-800 text-emerald-400 font-semibold uppercase text-[10px]">
                  {user?.role}
                </span>
              </div>
              <div className="pt-3 border-t border-zinc-800">
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    toast('info', 'Password change instructions sent to ' + user?.email);
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition"
                >
                  Request Password Reset Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-16">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl space-y-3 animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Notifications</h4>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Welcome to {BRANDING.BRAND_NAME}</span>
                  <span className="text-[10px] text-zinc-500">Just now</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Your sandbox environment is ready. Use the 3 bottom tabs to browse platforms, place orders, and review activity.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400">Meta API Live</span>
                  <span className="text-[10px] text-zinc-500">Active</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Platform integration active with 99.8% fulfillment reliability.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
